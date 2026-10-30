'use client';

import React from 'react';
import { Menu, BookOpen, ChevronDown, Settings, Sparkles, CloudCheck, Database } from 'lucide-react';
import { StudyNote } from '@/lib/types';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeNote: StudyNote | null;
  notes: StudyNote[];
  onSelectNote: (note: StudyNote) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  isFirebaseActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeNote,
  notes,
  onSelectNote,
  onOpenSettings,
  hasApiKey,
  isFirebaseActive,
}) => {
  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button onClick={onToggleSidebar} className="mobile-menu-btn" aria-label="Toggle menu">
          <Menu size={22} />
        </button>

        {/* Note Switcher Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div className="active-note-selector" style={{ maxWidth: '340px' }}>
            <BookOpen size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <select
              value={activeNote?.id || ''}
              onChange={(e) => {
                const found = notes.find((n) => n.id === e.target.value);
                if (found) onSelectNote(found);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '280px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {notes.map((note) => (
                <option key={note.id} value={note.id} style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Gemini Engine Status Badge */}
        <div
          onClick={onOpenSettings}
          className={`api-status-badge ${hasApiKey ? '' : 'local'}`}
          title={hasApiKey ? 'Gemini 1.5/2.0 API Connected' : 'Running on Local Intelligent Engine. Click to configure Gemini API Key.'}
        >
          <span className="api-dot" />
          <span>{hasApiKey ? 'Gemini AI' : 'Smart Engine'}</span>
        </div>

        {/* Firebase Sync Indicator */}
        {isFirebaseActive && (
          <div
            onClick={onOpenSettings}
            className="api-status-badge"
            style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.3)' }}
            title="Firebase Cloud Sync Active"
          >
            <Database size={13} />
            <span>Firebase</span>
          </div>
        )}

        {/* Settings Action Button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary btn-icon"
          aria-label="Settings"
          title="Configure API Keys & Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
