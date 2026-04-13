'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, UserCheck, Loader2, CheckCircle, AlertCircle, Users, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Event, Student, Registration } from '@/types';

interface RegisterModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({ event, onClose, onSuccess }: RegisterModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!event) return;
    setLoadingData(true);
    try {
      const [studentsRes, regsRes] = await Promise.all([
        fetch('/api/students'),
        fetch(`/api/registrations?event_id=${event.event_id}`),
      ]);
      const studentsData = await studentsRes.json();
      const regsData = await regsRes.json();
      setStudents(studentsData);
      setRegistrations(regsData);
    } catch {
      setStatus({ type: 'error', message: 'Failed to load data.' });
    } finally {
      setLoadingData(false);
    }
  }, [event]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleRegister = async () => {
    if (!selectedStudentId || !event) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: Number(selectedStudentId), event_id: event.event_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Registration failed.' });
      } else {
        setStatus({ type: 'success', message: `Successfully registered for "${event.title}"!` });
        setSelectedStudentId('');
        await fetchData();
        onSuccess();
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const registeredIds = new Set(registrations.map((r) => r.student_id));
  const availableStudents = students.filter((s) => !registeredIds.has(s.student_id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f0f1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#06b6d4]" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Register for Event</h2>
            <p className="text-white/50 text-sm line-clamp-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event Info Strip */}
        <div className="mx-6 mb-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center">
            <span className="text-[8px] font-bold text-white/80 uppercase">{format(parseISO(event.event_date), 'MMM')}</span>
            <span className="text-base font-black text-white leading-none">{format(parseISO(event.event_date), 'dd')}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy · h:mm a')}</p>
            <p className="text-white/40 text-xs truncate">{event.location}</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
            <Users size={11} />
            {registrations.length}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Student selector */}
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all mb-4 appearance-none"
              >
                <option value="" className="bg-[#0f0f1a]">
                  {availableStudents.length === 0 ? 'All students registered' : '— Choose a student —'}
                </option>
                {availableStudents.map((s) => (
                  <option key={s.student_id} value={s.student_id} className="bg-[#0f0f1a]">
                    {s.name} · {s.department || 'N/A'}
                  </option>
                ))}
              </select>

              {/* Status message */}
              {status && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-4 text-sm border ${
                  status.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {status.message}
                </div>
              )}

              {/* Register button */}
              <button
                onClick={handleRegister}
                disabled={loading || !selectedStudentId}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" />Registering…</>
                ) : (
                  <><UserCheck size={15} />Confirm Registration</>
                )}
              </button>

              {/* Existing registrations */}
              {registrations.length > 0 && (
                <div className="mt-5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    Already Registered ({registrations.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {registrations.map((reg) => (
                      <div key={reg.registration_id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {(reg.student_name || 'U')[0]}
                        </div>
                        <span className="text-white/70 text-xs font-medium flex-1">{reg.student_name}</span>
                        <div className="flex items-center gap-1 text-white/30 text-[10px]">
                          <Clock size={9} />
                          {format(parseISO(reg.registered_at || new Date().toISOString()), 'MMM d')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
