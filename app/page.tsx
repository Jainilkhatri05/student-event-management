'use client';

import { useState, useEffect, useCallback } from 'react';
import EventCard from '@/components/EventCard';
import RegisterModal from '@/components/RegisterModal';
import type { Event } from '@/types';
import { Search, SlidersHorizontal, CalendarDays, Sparkles, TrendingUp, Users, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (eventId: number) => {
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
  };

  const now = new Date();
  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const isUpcoming = new Date(e.event_date) >= now;
    if (filter === 'upcoming') return matchesSearch && isUpcoming;
    if (filter === 'past') return matchesSearch && !isUpcoming;
    return matchesSearch;
  });

  const totalRegistrations = events.reduce((sum, e) => sum + (e.registration_count || 0), 0);
  const upcomingCount = events.filter((e) => new Date(e.event_date) >= now).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero Header */}
      <div className="mb-10 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
          <Sparkles size={12} />
          <span>Student Event Management System</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-3 text-gradient-primary flex items-center gap-3">
          Upcoming Events
          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-tighter">MySQL Live</span>
        </h1>
        <p className="text-white/40 text-lg max-w-xl">
          Discover workshops, hackathons, sports events, and more. Register in one click.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
        {[
          { icon: CalendarDays, label: 'Total Events', value: events.length, color: '#6366f1' },
          { icon: TrendingUp, label: 'Upcoming', value: upcomingCount, color: '#a855f7' },
          { icon: Users, label: 'Registrations', value: totalRegistrations, color: '#06b6d4' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-white/40 text-xs font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up" style={{ animationDelay: '160ms' }}>
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search events, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 h-11"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 glass rounded-xl p-1 h-11">
          <SlidersHorizontal size={14} className="text-white/30 ml-2 mr-1" />
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Create CTA */}
        <Link
          href="/events/new"
          className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/20 whitespace-nowrap"
        >
          <LayoutGrid size={15} />
          New Event
        </Link>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <CalendarDays size={28} className="text-white/20" />
          </div>
          <h3 className="text-white/40 font-semibold text-lg mb-1">No events found</h3>
          <p className="text-white/20 text-sm mb-6">
            {search ? `No results for "${search}"` : 'Be the first to create an event'}
          </p>
          <Link
            href="/events/new"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity"
          >
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, i) => (
            <div
              key={event.event_id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <EventCard
                event={event}
                onRegister={setSelectedEvent}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {selectedEvent && (
        <RegisterModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={fetchEvents}
        />
      )}
    </div>
  );
}
