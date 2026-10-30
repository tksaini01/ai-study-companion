'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { NotesUploadView } from '@/components/NotesUploadView';
import { McqQuizView } from '@/components/McqQuizView';
import { FlashcardsView } from '@/components/FlashcardsView';
import { TopicExplanationView } from '@/components/TopicExplanationView';
import { AiTutorChatView } from '@/components/AiTutorChatView';
import { SettingsModal } from '@/components/SettingsModal';
import { StudyStorage } from '@/lib/storage';
import { FirebaseSyncService } from '@/lib/firebase';
import {
  StudyNote,
  MCQQuiz,
  FlashcardDeck,
  TopicExplanation,
  QuizAttempt,
  DashboardStats,
  MasteryStatus,
} from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function Home() {
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App State
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeNote, setActiveNote] = useState<StudyNote | null>(null);
  const [quizzes, setQuizzes] = useState<MCQQuiz[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [explanations, setExplanations] = useState<TopicExplanation[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalNotes: 0,
    totalFlashcards: 0,
    masteredFlashcards: 0,
    totalQuizzesTaken: 0,
    averageQuizScore: 0,
    studyStreakDays: 1,
    studyMinutesToday: 0,
    recentActivity: [],
  });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Load and refresh state from storage
  const refreshAllData = () => {
    StudyStorage.init();
    const loadedNotes = StudyStorage.getNotes();
    const loadedQuizzes = StudyStorage.getQuizzes();
    const loadedDecks = StudyStorage.getDecks();
    const loadedExplanations = StudyStorage.getExplanations();
    const loadedAttempts = StudyStorage.getAttempts();
    const loadedStats = StudyStorage.getDashboardStats();
    const settings = StudyStorage.getSettings();

    setNotes(loadedNotes);
    setQuizzes(loadedQuizzes);
    setDecks(loadedDecks);
    setExplanations(loadedExplanations);
    setAttempts(loadedAttempts);
    setStats(loadedStats);

    // Initialize or preserve active note
    if (loadedNotes.length > 0) {
      setActiveNote((prev) => {
        if (prev && loadedNotes.some((n) => n.id === prev.id)) {
          return loadedNotes.find((n) => n.id === prev.id) || loadedNotes[0];
        }
        return loadedNotes[0];
      });
    } else {
      setActiveNote(null);
    }

    setHasApiKey(Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 10));

    // Try initializing Firebase if configured
    if (settings.firebaseConfig && settings.firebaseConfig.apiKey) {
      const fbSuccess = FirebaseSyncService.init(settings.firebaseConfig);
      setIsFirebaseActive(fbSuccess);
    }
  };

  useEffect(() => {
    refreshAllData();
    setMounted(true);
  }, []);

  // Handlers
  const handleSaveNote = (note: StudyNote) => {
    StudyStorage.saveNote(note);
    FirebaseSyncService.syncNote(note);
    refreshAllData();
    setActiveNote(note);
  };

  const handleDeleteNote = (noteId: string) => {
    StudyStorage.deleteNote(noteId);
    FirebaseSyncService.deleteNote(noteId);
    refreshAllData();
  };

  const handleSaveQuiz = (quiz: MCQQuiz) => {
    StudyStorage.saveQuiz(quiz);
    refreshAllData();
  };

  const handleRecordAttempt = (attempt: QuizAttempt) => {
    StudyStorage.recordAttempt(attempt);
    refreshAllData();
  };

  const handleSaveDeck = (deck: FlashcardDeck) => {
    StudyStorage.saveDeck(deck);
    refreshAllData();
  };

  const handleUpdateCardMastery = (deckId: string, cardId: string, mastery: MasteryStatus) => {
    StudyStorage.updateCardMastery(deckId, cardId, mastery);
    refreshAllData();
  };

  const handleSaveExplanation = (exp: TopicExplanation) => {
    StudyStorage.saveExplanation(exp);
    refreshAllData();
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07090e', color: '#818cf8', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Initializing StudyPulse AI...</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Preparing intelligent active recall workspace</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        streakDays={stats.studyStreakDays}
        noteCount={notes.length}
        quizCount={quizzes.length}
        flashcardCount={decks.reduce((sum, d) => sum + d.cards.length, 0)}
        onOpenUpload={() => setCurrentTab('notes')}
      />

      {/* Main App Container */}
      <div className="app-main">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeNote={activeNote}
          notes={notes}
          onSelectNote={(note) => {
            setActiveNote(note);
            showToast(`Active study material set to "${note.title}"`, 'info');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasApiKey={hasApiKey}
          isFirebaseActive={isFirebaseActive}
        />

        {/* View Switcher Container */}
        <main className="page-container">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              notes={notes}
              quizzes={quizzes}
              decks={decks}
              attempts={attempts}
              activeNote={activeNote}
              onNavigate={setCurrentTab}
              onSelectNote={(note) => {
                setActiveNote(note);
                showToast(`Switched active note to "${note.title}"`, 'info');
              }}
              onOpenUpload={() => setCurrentTab('notes')}
            />
          )}

          {currentTab === 'notes' && (
            <NotesUploadView
              notes={notes}
              activeNote={activeNote}
              onSelectNote={setActiveNote}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'mcq' && (
            <McqQuizView
              activeNote={activeNote}
              notes={notes}
              quizzes={quizzes}
              onSaveQuiz={handleSaveQuiz}
              onRecordAttempt={handleRecordAttempt}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              activeNote={activeNote}
              notes={notes}
              decks={decks}
              onSaveDeck={handleSaveDeck}
              onUpdateCardMastery={handleUpdateCardMastery}
            />
          )}

          {currentTab === 'explanation' && (
            <TopicExplanationView
              activeNote={activeNote}
              notes={notes}
              explanations={explanations}
              onSaveExplanation={handleSaveExplanation}
            />
          )}

          {currentTab === 'tutor' && (
            <AiTutorChatView
              activeNote={activeNote}
              notes={notes}
            />
          )}
        </main>
      </div>

      {/* Settings & Key Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={refreshAllData}
      />
    </div>
  );
}
