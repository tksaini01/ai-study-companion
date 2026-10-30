'use client';

import React from 'react';
import {
  FileText,
  HelpCircle,
  Layers,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';
import { DashboardStats, StudyNote, MCQQuiz, FlashcardDeck, QuizAttempt } from '@/lib/types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  stats: DashboardStats;
  notes: StudyNote[];
  quizzes: MCQQuiz[];
  decks: FlashcardDeck[];
  attempts: QuizAttempt[];
  activeNote: StudyNote | null;
  onNavigate: (tab: NavTab) => void;
  onSelectNote: (note: StudyNote) => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  notes,
  quizzes,
  decks,
  attempts,
  activeNote,
  onNavigate,
  onSelectNote,
  onOpenUpload,
}) => {
  const masteryPercentage =
    stats.totalFlashcards > 0
      ? Math.round((stats.masteredFlashcards / stats.totalFlashcards) * 100)
      : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Welcome back, Scholar</span>
            <span style={{ fontSize: '1.8rem' }}>👋</span>
          </h1>
          <p className="page-subtitle">
            Here is your AI-assisted learning synthesis and study progress overview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onOpenUpload} className="btn btn-secondary">
            <FileText size={16} />
            <span>Upload Notes</span>
          </button>
          <button onClick={() => onNavigate('mcq')} className="btn btn-primary">
            <Zap size={16} />
            <span>Start Quick Quiz</span>
          </button>
        </div>
      </div>

      {/* Hero Active Note Banner */}
      {activeNote && (
        <div className="quick-action-banner">
          <div className="banner-content">
            <div className="banner-badge">
              <Sparkles size={14} />
              <span>ACTIVE STUDY MATERIAL</span>
            </div>
            <h2 className="banner-title">{activeNote.title}</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.92rem', marginBottom: '18px' }}>
              {activeNote.summary ||
                `Extracted document with ${activeNote.wordCount} words. Ready for instant AI synthesis, flashcards, and exam-grade quizzes.`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => onNavigate('mcq')} className="btn btn-primary btn-sm">
                <HelpCircle size={15} />
                <span>Practice MCQs</span>
              </button>
              <button onClick={() => onNavigate('flashcards')} className="btn btn-secondary btn-sm">
                <Layers size={15} />
                <span>Review Flashcards</span>
              </button>
              <button onClick={() => onNavigate('explanation')} className="btn btn-secondary btn-sm">
                <BookOpen size={15} />
                <span>Deep Dive Concepts</span>
              </button>
              <button onClick={() => onNavigate('tutor')} className="btn btn-cyan btn-sm">
                <Sparkles size={15} />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: '180px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
              Estimated Read
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
              {Math.max(1, Math.round(activeNote.wordCount / 200))} min
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              {activeNote.wordCount} words analyzed
            </div>
          </div>
        </div>
      )}

      {/* Stat Grid */}
      <div className="stat-grid">
        {/* Notes Stat */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Study Notes</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <FileText size={19} />
            </div>
          </div>
          <div className="stat-value">{stats.totalNotes}</div>
          <div className="stat-footer">
            <span style={{ color: '#34d399', fontWeight: 600 }}>Active</span>
            <span>indexed documents</span>
          </div>
        </div>

        {/* Flashcards Mastered Stat */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Flashcard Mastery</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Layers size={19} />
            </div>
          </div>
          <div className="stat-value">{masteryPercentage}%</div>
          <div className="stat-footer">
            <span style={{ color: '#34d399', fontWeight: 600 }}>{stats.masteredFlashcards}</span>
            <span>of {stats.totalFlashcards} cards mastered</span>
          </div>
        </div>

        {/* Average Quiz Score Stat */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Average Quiz Score</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Award size={19} />
            </div>
          </div>
          <div className="stat-value">
            {stats.totalQuizzesTaken > 0 ? `${stats.averageQuizScore}%` : '—'}
          </div>
          <div className="stat-footer">
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>{stats.totalQuizzesTaken}</span>
            <span>quizzes completed</span>
          </div>
        </div>

        {/* Study Streak Stat */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Study Streak</span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="stat-value">{stats.studyStreakDays} Days</div>
          <div className="stat-footer">
            <span style={{ color: '#f87171', fontWeight: 600 }}>Daily active</span>
            <span>learner habit</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Notes & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Column: Recent Notes Library */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: '#818cf8' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Recent Study Materials</h3>
            </div>
            <button
              onClick={() => onNavigate('notes')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background:
                    activeNote?.id === note.id
                      ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border:
                    activeNote?.id === note.id
                      ? '1px solid rgba(99, 102, 241, 0.4)'
                      : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.92rem', marginBottom: '4px' }}>
                    {note.title}
                  </div>
                  {activeNote?.id === note.id && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(99, 102, 241, 0.25)',
                        color: '#a5b4fc',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-subtle)', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span>{note.wordCount} words</span>
                  <span>•</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#06b6d4' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Recent Study Activity</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              Live Log
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-subtle)' }}>
                No recent activity recorded yet. Upload notes or take a quiz to get started!
              </div>
            ) : (
              stats.recentActivity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background:
                        act.type === 'quiz'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : act.type === 'flashcard'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : act.type === 'upload'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(6, 182, 212, 0.15)',
                      color:
                        act.type === 'quiz'
                          ? '#fbbf24'
                          : act.type === 'flashcard'
                          ? '#34d399'
                          : act.type === 'upload'
                          ? '#818cf8'
                          : '#22d3ee',
                    }}
                  >
                    {act.type === 'quiz' && <HelpCircle size={16} />}
                    {act.type === 'flashcard' && <Layers size={16} />}
                    {act.type === 'upload' && <FileText size={16} />}
                    {act.type === 'explanation' && <BookOpen size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {act.title}
                    </div>
                    {act.detail && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        {act.detail}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(act.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
