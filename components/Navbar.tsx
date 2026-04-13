'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, Users, PlusCircle, Zap } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events/new', label: 'Create Event', icon: PlusCircle },
  { href: '/students', label: 'Students', icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/60 transition-shadow duration-300">
              <CalendarDays size={16} className="text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">EventSphere</span>
            <span className="block text-[10px] text-purple-400/70 font-medium tracking-widest uppercase leading-none">Student Portal</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-inner'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon size={15} className={isActive ? 'text-purple-400' : ''} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Zap size={12} className="text-yellow-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </nav>
  );
}
