import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import { storeImage } from '../services/uploadService.js';
import { analyzeComplaint } from '../services/aiService.js';
import { badRequest, notFoundError } from '../utils/ApiError.js';
import { SEVERITY_ORDER } from '../config/constants.js';

// Short-window duplicate guard: identical description + IP within 60s
// returns the existing ticket instead of creating a duplicate.
const DEDUPE_TTL_MS = 60 * 1000;
const recentSubmissions = new Map();

const dedupeKey = (description, ip) =>
  crypto.createHash('sha1').update(`${ip}|${description.trim().toLowerCase()}`).digest('hex');

const checkDuplicate = (key) => {
  const entry = recentSubmissions.get(key);
  if (entry && Date.now() - entry.ts < DEDUPE_TTL_MS) return entry.complaint;
  if (entry) recentSubmissions.delete(key);
  return null;
};

const rememberSubmission = (key, complaint) => {
  recentSubmissions.set(key, { ts: Date.now(), complaint });
  if (recentSubmissions.size > 1000) {
    const oldest = recentSubmissions.keys().next().value;
    recentSubmissions.delete(oldest);
  }
};

const byPriority = (a, b) => {
  const ra = a.severity ? SEVERITY_ORDER[a.severity] : 99;
  const rb = b.severity ? SEVERITY_ORDER[b.severity] : 99;
  if (ra !== rb) return ra - rb;
  return new Date(b.createdAt) - new Date(a.createdAt);
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createComplaint = async (req, res) => {
  const { description, originalLanguage, location } = req.body;
  const key = dedupeKey(description, req.ip || 'unknown');

  const existing = checkDuplicate(key);
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Duplicate submission detected — returning existing ticket',
      data: existing,
      duplicate: true,
    });
  }

  // Persist image bytes (local or Cloudinary). Buffer stays on req.file
  // and is passed to the AI service as multimodal evidence.
  const { url: imageUrl, publicId } = req.file
    ? await storeImage(req.file.buffer, req.file.mimetype)
    : { url: null, publicId: null };

  // AI triage: classify → severity → reason → deterministic department.
  // On any AI failure the ticket is still persisted as "Under Review"
  // for human triage — complaints are never lost or faked.
  let analysis = null;
  let reviewReason = null;
  try {
    analysis = await analyzeComplaint({
      description: description.trim(),
      imageBuffer: req.file?.buffer || null,
      imageMimeType: req.file?.mimetype || null,
    });
  } catch (err) {
    reviewReason = (err.message || 'AI analysis failed').slice(0, 300);
    console.warn(`[complaints] AI triage failed for new ticket → Under Review: ${reviewReason}`);
  }

  const complaint = await Complaint.create({
    description: description.trim(),
    location: location?.trim() || null,
    originalLanguage: analysis?.originalLanguage || originalLanguage || 'en',
    imageUrl,
    imagePublicId: publicId,
    category: analysis?.category || null,
    severity: analysis?.severity || null,
    reason: analysis?.reason || null,
    confidence: analysis?.confidence ?? null,
    department: analysis?.department || null,
    status: analysis ? 'Pending' : 'Under Review',
    reviewReason,
  });

  rememberSubmission(key, complaint);

  res.status(201).json({
    success: true,
    message: 'Complaint received and queued for triage',
    data: complaint,
  });
};

export const listComplaints = async (req, res) => {
  const { severity, category, status, department, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter = {};
  if (severity) filter.severity = severity;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (q && q.length <= 200) {
    const or = [
      { description: { $regex: escapeRegex(q), $options: 'i' } },
      { location: { $regex: escapeRegex(q), $options: 'i' } },
    ];
    if (mongoose.isValidObjectId(q)) or.push({ _id: q });
    filter.$or = or;
  }

  const all = await Complaint.find(filter).sort({ createdAt: -1 }).lean();
  all.sort(byPriority);

  const total = all.length;
  const data = all.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    success: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

export const getComplaintById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw notFoundError('Complaint not found');
  }
  const complaint = await Complaint.findById(id).lean();
  if (!complaint) throw notFoundError('Complaint not found');
  res.status(200).json({ success: true, data: complaint });
};

export const getStats = async (req, res) => {
  const [severityGroups, categoryGroups, statusGroups] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const bySeverity = {};
  severityGroups.forEach((g) => {
    if (g._id) bySeverity[g._id] = g.count;
  });

  const byCategory = {};
  categoryGroups.forEach((g) => {
    if (g._id) byCategory[g._id] = g.count;
  });

  const byStatus = {};
  statusGroups.forEach((g) => {
    if (g._id) byStatus[g._id] = g.count;
  });

  const total = await Complaint.countDocuments();

  res.status(200).json({
    success: true,
    data: { total, bySeverity, byCategory, byStatus },
  });
};
