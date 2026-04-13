'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Users, Trash2, UserPlus, Clock, ChevronRight } from 'lucide-react';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onRegister: (event: Event) => void;
  onDelete: (eventId: number) => void;
}

// Color palette for cards - cycles through neon accent combos
const cardAccents = [
  { from: '#6366f1', to: '#a855f7', glow: 'rgba(99,102,241,0.15)', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { from: '#06b6d4', to: '#6366f1', glow: 'rgba(6,182,212,0.15)', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { from: '#a855f7', to: '#ec4899', glow: 'rgba(168,85,247,0.15)', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { from: '#10b981', to: '#06b6d4', glow: 'rgba(16,185,129,0.15)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.15)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { from: '#ec4899', to: '#f59e0b', glow: 'rgba(236,72,153,0.15)', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
];

export default function EventCard({ event, onRegister, onDelete }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const accent = cardAccents[event.event_id % cardAccents.length];
  const eventDate = parseISO(event.event_date);
  const isUpcoming = eventDate > new Date();

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    await onDelete(event.event_id);
  };

  return (
    <div
      className="relative group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
      style={{
        boxShadow: hovered ? `0 20px 60px ${accent.glow}, 0 0 0 1px rgba(255,255,255,0.05)` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top gradient bar */}
      <div
        className="h-1 w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
      />

      {/* Subtle gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent.glow} 0%, transparent 60%)` }}
      />

      <div className="p-6 flex flex-col flex-1 relative z-10">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${isUpcoming ? accent.badge : 'bg-white/5 text-white/30 border-white/10'}`}>
            {isUpcoming ? '🟢 Upcoming' : '⚫ Past'}
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Date display — prominently styled */}
        <div className="flex items-start gap-4 mb-4">
          {/* Calendar icon block */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border border-white/10 bg-white/5"
            style={{ boxShadow: `0 0 20px ${accent.glow}` }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none"
              style={{ color: accent.from }}>
              {format(eventDate, 'MMM')}
            </span>
            <span className="text-2xl font-black text-white leading-none">
              {format(eventDate, 'dd')}
            </span>
            <span className="text-[9px] text-white/40 font-medium">
              {format(eventDate, 'yyyy')}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight line-clamp-2 mb-1">
              {event.title}
            </h3>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock size={11} />
              <span>{format(eventDate, 'EEEE, h:mm a')}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {event.description}
        </p>

        {/* Meta info */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Calendar size={12} className="flex-shrink-0" style={{ color: accent.from }} />
            <span className="truncate">{format(eventDate, 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <MapPin size={12} className="flex-shrink-0" style={{ color: accent.from }} />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Users size={12} className="flex-shrink-0" style={{ color: accent.from }} />
            <span>
              {event.registration_count} registered
              {event.organizer_name ? ` · Org: ${event.organizer_name}` : ''}
            </span>
          </div>
        </div>

        {/* Register button */}
        <button
          onClick={() => onRegister(event)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg active:scale-95 group/btn"
          style={{
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            boxShadow: `0 0 20px ${accent.glow}`,
          }}
        >
          <UserPlus size={15} />
          Register Now
          <ChevronRight size={14} className="opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
