import env from '../config/env.js';
import { CATEGORIES, SEVERITIES, CATEGORY_TO_DEPARTMENT } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';

const AI_TIMEOUT_MS = 60_000;

export class AiUnavailableError extends ApiError {
  constructor(message) {
    super(503, message);
    this.isOperational = true;
  }
}

const SYSTEM_PROMPT = `You are CivicLens, an expert civic-issue triage engine for a municipal corporation.

Analyse the citizen complaint. It may be written in ANY language (English, Hindi, Marathi, Tamil, etc.) — understand it directly; the citizen must never be asked to translate.
If a photograph is attached, treat it as supporting evidence only.

CATEGORY — choose EXACTLY ONE:
- Roads: potholes, broken pavement, road debris, street/footpath damage
- Waste: overflowing bins, illegal dumping, garbage, sanitation issues
- Water: pipeline leaks, no water supply, contaminated water, water main bursts
- Electricity: streetlights, power cuts, exposed wires, transformer/pole issues
- Trees: fallen or damaged trees, overhanging branches, tree hazards
- Drainage: blocked or overflowing drains/sewers, stagnation, drain flooding

SEVERITY — choose EXACTLY ONE using this rubric, proportional to the evidence:
- Critical: immediate threat to human life or safety — exposed live wires, structural collapse risk, major utility burst flooding homes, landslide risk. RARE — do not inflate.
- High: significant public hazard or major service outage affecting many people — ward-level water cutoff, large blockages, fallen tree blocking a road.
- Medium: service degradation or localised hazard needing prompt attention — single streetlight out, slow drain, small leak, dangerous but contained.
- Low: minor/cosmetic issues and routine maintenance — small pothole, litter, cosmetic trimming.

RULES:
- Base the severity ONLY on evidence present in the text and image. Never invent details.
- reason: ONE plain-language sentence justifying the severity (max ~160 chars).
- department: MUST be exactly the mapped department for your chosen category.
- originalLanguage: the language of the complaint text (e.g. "English", "Hindi", "Marathi").
- confidence: your certainty as a number between 0 and 1.
- If the image is unclear or irrelevant, rely on the text and lower confidence.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    category: { type: 'STRING', enum: CATEGORIES },
    severity: { type: 'STRING', enum: SEVERITIES },
    reason: { type: 'STRING', description: 'One-sentence justification for the severity' },
    department: { type: 'STRING' },
    originalLanguage: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
  },
  required: ['category', 'severity', 'reason', 'department', 'originalLanguage', 'confidence'],
  propertyOrdering: ['category', 'severity', 'reason', 'department', 'originalLanguage', 'confidence'],
};

let genaiClient = null;

/**
 * Validates and normalises a raw Gemini JSON payload.
 * Throws ApiError(502) on any contract violation — never returns
 * fabricated or partially-valid analysis.
 */
export const validateAnalysis = (raw) => {
  if (!raw || typeof raw !== 'object') {
    throw new ApiError(502, 'AI returned an invalid response');
  }

  const category = String(raw.category || '').trim();
  const severity = String(raw.severity || '').trim();
  const reason = String(raw.reason || '').trim();
  const department = String(raw.department || '').trim();
  const originalLanguage = String(raw.originalLanguage || '').trim() || 'Unknown';
  let confidence = Number(raw.confidence);

  if (!CATEGORIES.includes(category)) {
    throw new ApiError(502, `AI returned invalid category: ${raw.category}`);
  }
  if (!SEVERITIES.includes(severity)) {
    throw new ApiError(502, `AI returned invalid severity: ${raw.severity}`);
  }
  if (!reason) {
    throw new ApiError(502, 'AI returned empty severity reasoning');
  }

  // Department is deterministic — derived from category, not trusted from AI.
  const mappedDepartment = CATEGORY_TO_DEPARTMENT[category];
  if (department && department !== mappedDepartment) {
    console.warn(`[ai] AI department "${department}" overridden by mapping → "${mappedDepartment}"`);
  }

  if (!Number.isFinite(confidence)) confidence = 0.5;
  confidence = Math.min(Math.max(confidence, 0), 1);

  return {
    category,
    severity,
    reason: reason.slice(0, 300),
    department: mappedDepartment,
    originalLanguage,
    confidence,
  };
};

/**
 * Analyses a complaint with Gemini (multimodal when an image is present).
 * Returns the validated analysis object or throws AiUnavailableError /
 * ApiError — callers must handle failure by routing to human review.
 */
export const analyzeComplaint = async ({ description, imageBuffer, imageMimeType }) => {
  if (!env.geminiApiKey) {
    throw new AiUnavailableError('GEMINI_API_KEY is not configured — AI triage unavailable');
  }

  const { GoogleGenAI } = await import('@google/genai');
  if (!genaiClient) {
    genaiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  const parts = [{ text: `${SYSTEM_PROMPT}\n\n---\nCITIZEN COMPLAINT:\n${description}` }];
  if (imageBuffer && imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBuffer.toString('base64'),
      },
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let lastError = null;

  // Up to 2 attempts — Gemini occasionally returns transient 503s under load.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await genaiClient.models.generateContent({
        model: env.geminiModel,
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
          abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
        },
      });

      const text = response?.text;
      if (!text) throw new ApiError(502, 'AI returned an empty response');

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Some models wrap JSON in markdown fences — strip and retry once.
        const cleaned = text.replace(/```(?:json)?/g, '').trim();
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          throw new ApiError(502, 'AI returned malformed JSON');
        }
      }

      return validateAnalysis(parsed);
    } catch (err) {
      lastError = err;
      const transient =
        err?.name === 'TimeoutError' ||
        err?.name === 'AbortError' ||
        err?.statusCode === 504 ||
        err?.statusCode === 502 ||
        /abort|timed?\s?out|high demand|UNAVAILABLE|503|overload/i.test(err?.message || '');
      if (!transient || attempt === 2) break;
      await sleep(2000);
    }
  }

  if (lastError?.statusCode === 504) throw lastError;
  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(502, `Gemini API error: ${lastError?.message || 'unknown error'}`);
};
