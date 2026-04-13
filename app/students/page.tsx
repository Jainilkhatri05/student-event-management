'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, PlusCircle, Loader2, CheckCircle, AlertCircle,
  GraduationCap, Mail, BookOpen, Trash2, Search
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Student } from '@/types';

const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#6366f1',
  'Electronics': '#06b6d4',
  'Mechanical': '#f59e0b',
  'Information Technology': '#a855f7',
  'Civil Engineering': '#10b981',
};

const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Information Technology',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getDeptColor(dept: string) {
  return DEPT_COLORS[dept] || '#6366f1';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) {
      setFormStatus({ type: 'error', msg: 'Name and email are required.' });
      return;
    }
    setSubmitting(true);
    setFormStatus(null);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormStatus({ type: 'success', msg: `${data.name} added successfully!` });
      setFormState({ name: '', email: '', department: '' });
      await fetchStudents();
      setTimeout(() => { setShowForm(false); setFormStatus(null); }, 1500);
    } catch (err) {
      setFormStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to add student.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const deptCounts = students.reduce<Record<string, number>>((acc, s) => {
    const d = s.department || 'Other';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
            <GraduationCap size={12} />
            <span>Student Directory</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient-primary">Students</h1>
          <p className="text-white/40 mt-1">{students.length} registered students across all departments</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          {showForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
        {Object.entries(deptCounts).slice(0, 4).map(([dept, count]) => (
          <div key={dept} className="glass rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getDeptColor(dept) }} />
            <div className="min-w-0">
              <div className="text-white font-bold text-lg leading-none">{count}</div>
              <div className="text-white/40 text-[10px] truncate">{dept}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-white/[0.03] backdrop-blur-sm overflow-hidden animate-fade-up">
          <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-600" />
          <form onSubmit={handleAddStudent} className="p-6">
            <h2 className="text-white font-bold text-base mb-4">Add New Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Arjun Mehta"
                  className="form-input"
                />
              </div>
              <div>
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. arjun@college.edu"
                  className="form-input"
                />
              </div>
              <div>
                <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Department</label>
                <select
                  value={formState.department}
                  onChange={(e) => setFormState((p) => ({ ...p, department: e.target.value }))}
                  className="form-input appearance-none"
                >
                  <option value="" className="bg-[#0f0f1a]">— Select —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="bg-[#0f0f1a]">{d}</option>
                  ))}
                </select>
              </div>
            </div>
            {formStatus && (
              <div className={`flex items-center gap-2 p-2.5 rounded-lg mb-3 text-sm border ${
                formStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {formStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {formStatus.msg}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" />Adding…</> : <><PlusCircle size={14} />Add Student</>}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search students by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-10 h-11"
        />
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student, i) => {
            const color = getDeptColor(student.department || '');
            return (
              <div
                key={student.student_id}
                className="glass rounded-xl p-4 flex items-center gap-4 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 group animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)`, border: `1px solid ${color}44` }}
                >
                  {getInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-white font-semibold text-sm truncate">{student.name}</h3>
                    <span className="text-white/30 text-[10px] shrink-0">#{student.student_id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                    <Mail size={10} />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={10} style={{ color }} />
                    <span className="text-[11px] font-medium" style={{ color }}>
                      {student.department || 'No department'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
