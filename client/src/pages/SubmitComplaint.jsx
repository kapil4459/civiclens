import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Languages, MapPin, Send, ImagePlus, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import ErrorState from '../components/ui/ErrorState';
import { submitComplaint } from '../api/complaints';
import { CATEGORIES } from '../constants';

const MIN_LENGTH = 10;
const MAX_LENGTH = 5000;
const MAX_IMAGE_MB = 8;

const LANGUAGES = [
  { value: '', label: 'Auto-detect language' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
  { value: 'Bengali', label: 'বাংলা (Bengali)' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { value: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { value: 'Urdu', label: 'اردو (Urdu)' },
];

const PROCESSING_STAGES = [
  'Receiving complaint…',
  'Analysing complaint with AI…',
  'Generating priority ticket…',
  'Saving complaint…',
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hintedCategory = CATEGORIES.find((c) => c.value === searchParams.get('category'));
  const fileInputRef = useRef(null);

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!submitting) {
      setStageIndex(0);
      return;
    }
    const timer = setInterval(() => setStageIndex((i) => Math.min(i + 1, PROCESSING_STAGES.length - 1)), 4500);
    return () => clearInterval(timer);
  }, [submitting]);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    setErrors((prev) => ({ ...prev, photo: undefined }));
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image file (JPG, PNG, WEBP, GIF).' }));
      return;
    }
    if (selected.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: `Image must be under ${MAX_IMAGE_MB} MB.` }));
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const next = {};
    const trimmed = description.trim();
    if (trimmed.length < MIN_LENGTH) next.description = `Please describe the issue in at least ${MIN_LENGTH} characters.`;
    else if (trimmed.length > MAX_LENGTH) next.description = `Description must be under ${MAX_LENGTH.toLocaleString()} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      if (location.trim()) formData.append('location', location.trim());
      if (language) formData.append('originalLanguage', language);
      if (file) formData.append('photo', file);

      const { data } = await submitComplaint(formData);
      navigate('/success', { state: { complaint: data?.data, duplicate: data?.duplicate } });
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-black dark:text-ink">Report a Civic Issue</h1>
        <p className="mt-2 text-black dark:text-sub">
          Describe the problem below — AI will classify it, assess urgency and route it to the right department.
        </p>
        {hintedCategory && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs text-cyan">
            <CheckCircle2 className="h-3.5 w-3.5" /> Reporting under: {hintedCategory.label} — AI will confirm
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8" noValidate>
        <Textarea
          label="Describe the problem"
          placeholder="Describe the problem, its location and any important details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={6}
          maxLength={MAX_LENGTH + 50}
          disabled={submitting}
        />
        <div className="-mt-3 flex items-center justify-between">
          <p className="text-xs text-black dark:text-sub">You can submit your complaint in English or a supported regional language.</p>
          <p className={`text-xs ${description.length > MAX_LENGTH ? 'text-red-600 dark:text-red-400' : 'text-sub'}`}>
            {description.length.toLocaleString()}/{MAX_LENGTH.toLocaleString()}
          </p>
        </div>

        <Input
          label={
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-sub" /> Location / area
            </span>
          }
          placeholder="e.g. MG Road near City Bus Stand"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={300}
          disabled={submitting}
        />

        <div className="relative">
          <Languages className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sub" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={submitting}
            className="field appearance-none pl-10"
            aria-label="Complaint language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="bg-card">{l.label}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-black dark:text-ink">
            Upload Photos <span className="text-black dark:text-sub">(Optional)</span>
          </span>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-xl border border-line object-cover" />
              <button
                type="button"
                onClick={clearFile}
                disabled={submitting}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white shadow disabled:opacity-50"
                aria-label="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-card2/50 px-6 py-10 text-sub transition hover:border-cyan/50 hover:text-ink disabled:opacity-50"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm text-black dark:text-ink">Click to upload a photo of the issue</span>
              <span className="text-xs text-black dark:text-sub">JPG, PNG, WEBP or GIF · max {MAX_IMAGE_MB} MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
          {errors.photo && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.photo}
            </p>
          )}
        </div>

        {submitError && <ErrorState message={submitError} />}

        <div className="flex items-center justify-between border-t border-line pt-5">
          <div className="hidden text-xs text-black dark:text-sub sm:block">
            {submitting ? (
              <span className="flex items-center gap-2 text-blue">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue" />
                {PROCESSING_STAGES[stageIndex]}
              </span>
            ) : 'No personal data required — describe and submit.'}
          </div>
          <Button type="submit" size="lg" loading={submitting} disabled={submitting} icon={Send} className="ml-auto">
            {submitting ? PROCESSING_STAGES[stageIndex] : 'Submit Complaint'}
          </Button>
        </div>
      </form>
    </div>
  );
}
