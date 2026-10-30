'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Bot,
  Flame,
  Sparkles,
  X,
  Plus
} from 'lucide-react';

export type NavTab = 'dashboard' | 'notes' | 'mcq' | 'flashcards' | 'explanation' | 'tutor';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  noteCount: number;
  quizCount: number;
  flashcardCount: number;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  streakDays,
  noteCount,
  quizCount,
  flashcardCount,
  onOpenUpload
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; counter?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { tab: 'notes', label: 'Notes Library', icon: <FileText size={19} />, counter: noteCount },
    { tab: 'mcq', label: 'Quiz Arena', icon: <HelpCircle size={19} />, counter: quizCount },
    { tab: 'flashcards', label: 'Flashcards', icon: <Layers size={19} />, counter: flashcardCount },
    { tab: 'explanation', label: 'Topic Explanations', icon: <Lightbulb size={19} /> },
    { tab: 'tutor', label: 'AI Study Tutor', icon: <Bot size={19} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon-wrapper">
            <Sparkles size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">StudyPulse</span>
              <span className="brand-badge">AI</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Intelligent Companion
            </span>
          </div>
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ marginLeft: 'auto' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 14px 0' }}>
          <button
            onClick={() => {
              onOpenUpload();
              if (isOpen) onClose();
            }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={16} />
            <span>Upload Notes</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Study Workspace</div>
          {navItems.map((item) => (
            <div
              key={item.tab}
              onClick={() => {
                onSelectTab(item.tab);
                if (isOpen) onClose();
              }}
              className={`nav-link ${currentTab === item.tab ? 'active' : ''}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {typeof item.counter === 'number' && item.counter > 0 && (
                <span className="nav-counter">{item.counter}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="streak-card">
            <div className="streak-flame">🔥</div>
            <div>
              <div className="streak-title">{streakDays} Day Streak!</div>
              <div className="streak-subtitle">Keep up the daily momentum</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
