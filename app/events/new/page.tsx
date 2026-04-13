'use client';

import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, MapPin, FileText, Hash, AlignLeft,
  Loader2, CheckCircle, ArrowLeft, Sparkles, Clock
} from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  location: string;
  organizer_id: string;
  event_date: Date | null;
}

const INITIAL: FormData = {
  title: '',
  description: '',
  location: '',
  organizer_id: '',
  event_date: null,
};

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((field: keyof FormData, value: string | Date | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.event_date) {
      setError('Please fill in Event Title, Location, and Date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          organizer_id: form.organizer_id ? Number(form.organizer_id) : null,
          event_date: form.event_date.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');

      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">
          <Sparkles size={12} />
          <span>New Event</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gradient-primary mb-2">
          Create an Event
        </h1>
        <p className="text-white/40">
          Add a new event to the system. It will appear instantly on the dashboard.
        </p>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        {/* Top gradient bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#06b6d4]" />

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Event Title */}
          <div>
            <label className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileText size={12} />
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. National Coding Hackathon 2026"
              className="form-input"
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
              <AlignLeft size={12} />
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the event — agenda, prizes, requirements…"
              rows={4}
              className="form-input resize-none"
            />
          </div>

          {/* Date Picker — full width, prominent */}
          <div>
            <label className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
              <CalendarDays size={12} />
              Event Date & Time <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={form.event_date}
                onChange={(date: Date | null) => handleChange('event_date', date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy · h:mm aa"
                minDate={new Date()}
                placeholderText="Select date and time…"
                className="form-input pr-10 w-full cursor-pointer"
                wrapperClassName="w-full"
                popperPlacement="bottom-start"
              />
              <Clock
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
            </div>
            {form.event_date && (
              <p className="mt-1.5 text-xs text-indigo-400 flex items-center gap-1">
                <CheckCircle size={11} />
                {form.event_date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Two columns: Location + Organizer ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                <MapPin size={12} />
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Main Auditorium, Block A"
                className="form-input"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                <Hash size={12} />
                Organizer Student ID
              </label>
              <input
                type="number"
                value={form.organizer_id}
                onChange={(e) => handleChange('organizer_id', e.target.value)}
                placeholder="e.g. 1"
                min={1}
                className="form-input"
              />
              <p className="mt-1 text-white/25 text-[11px]">Refers to a student_id in the Students table</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm relative overflow-hidden group"
            style={{
              background: success
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 0 30px rgba(99,102,241,0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {/* Shimmer overlay */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                transform: 'skewX(-20deg)',
              }}
            />
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Creating Event…</>
            ) : success ? (
              <><CheckCircle size={16} />Event Created! Redirecting…</>
            ) : (
              <><CalendarDays size={16} />Create Event</>
            )}
          </button>
        </form>
      </div>

      {/* Info note */}
      <p className="text-center text-white/25 text-xs mt-6">
        The new event will appear immediately on the dashboard once created.
      </p>
    </div>
  );
}
