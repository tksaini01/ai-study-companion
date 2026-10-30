import {
  StudyNote,
  MCQQuiz,
  FlashcardDeck,
  TopicExplanation,
  QuizAttempt,
  DashboardStats,
  UserSettings,
  MasteryStatus
} from './types';
import {
  SAMPLE_NOTES,
  SAMPLE_QUIZZES,
  SAMPLE_FLASHCARD_DECKS,
  SAMPLE_EXPLANATIONS,
  SAMPLE_ATTEMPTS
} from './sampleData';

const KEYS = {
  NOTES: 'ai_study_notes',
  QUIZZES: 'ai_study_quizzes',
  DECKS: 'ai_study_flashcard_decks',
  EXPLANATIONS: 'ai_study_explanations',
  ATTEMPTS: 'ai_study_attempts',
  SETTINGS: 'ai_study_settings',
  LAST_ACTIVE: 'ai_study_last_active',
  STREAK: 'ai_study_streak',
};

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  autoSaveCloud: false,
  dailyGoalFlashcards: 10,
  dailyGoalQuizzes: 2,
};

export class StudyStorage {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- INITIALIZATION ---
  public static init(): void {
    if (!this.isBrowser()) return;

    if (!localStorage.getItem(KEYS.NOTES)) {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(SAMPLE_NOTES));
    }
    if (!localStorage.getItem(KEYS.QUIZZES)) {
      localStorage.setItem(KEYS.QUIZZES, JSON.stringify(SAMPLE_QUIZZES));
    }
    if (!localStorage.getItem(KEYS.DECKS)) {
      localStorage.setItem(KEYS.DECKS, JSON.stringify(SAMPLE_FLASHCARD_DECKS));
    }
    if (!localStorage.getItem(KEYS.EXPLANATIONS)) {
      localStorage.setItem(KEYS.EXPLANATIONS, JSON.stringify(SAMPLE_EXPLANATIONS));
    }
    if (!localStorage.getItem(KEYS.ATTEMPTS)) {
      localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(SAMPLE_ATTEMPTS));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }

    this.updateStreak();
  }

  public static resetToSampleData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(KEYS.NOTES, JSON.stringify(SAMPLE_NOTES));
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(SAMPLE_QUIZZES));
    localStorage.setItem(KEYS.DECKS, JSON.stringify(SAMPLE_FLASHCARD_DECKS));
    localStorage.setItem(KEYS.EXPLANATIONS, JSON.stringify(SAMPLE_EXPLANATIONS));
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(SAMPLE_ATTEMPTS));
  }

  public static clearAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(KEYS.NOTES, JSON.stringify([]));
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify([]));
    localStorage.setItem(KEYS.DECKS, JSON.stringify([]));
    localStorage.setItem(KEYS.EXPLANATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify([]));
  }

  // --- NOTES ---
  public static getNotes(): StudyNote[] {
    if (!this.isBrowser()) return SAMPLE_NOTES;
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      return data ? JSON.parse(data) : SAMPLE_NOTES;
    } catch {
      return SAMPLE_NOTES;
    }
  }

  public static saveNote(note: StudyNote): void {
    if (!this.isBrowser()) return;
    const notes = this.getNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.unshift(note);
    }
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  }

  public static deleteNote(noteId: string): void {
    if (!this.isBrowser()) return;
    const notes = this.getNotes().filter((n) => n.id !== noteId);
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));

    // Also filter quizzes and decks
    const quizzes = this.getQuizzes().filter((q) => q.noteId !== noteId);
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));

    const decks = this.getDecks().filter((d) => d.noteId !== noteId);
    localStorage.setItem(KEYS.DECKS, JSON.stringify(decks));
  }

  // --- QUIZZES ---
  public static getQuizzes(): MCQQuiz[] {
    if (!this.isBrowser()) return SAMPLE_QUIZZES;
    try {
      const data = localStorage.getItem(KEYS.QUIZZES);
      return data ? JSON.parse(data) : SAMPLE_QUIZZES;
    } catch {
      return SAMPLE_QUIZZES;
    }
  }

  public static saveQuiz(quiz: MCQQuiz): void {
    if (!this.isBrowser()) return;
    const quizzes = this.getQuizzes();
    const index = quizzes.findIndex((q) => q.id === quiz.id);
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.unshift(quiz);
    }
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  }

  // --- ATTEMPTS ---
  public static getAttempts(): QuizAttempt[] {
    if (!this.isBrowser()) return SAMPLE_ATTEMPTS;
    try {
      const data = localStorage.getItem(KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : SAMPLE_ATTEMPTS;
    } catch {
      return SAMPLE_ATTEMPTS;
    }
  }

  public static recordAttempt(attempt: QuizAttempt): void {
    if (!this.isBrowser()) return;
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
    this.updateStreak();
  }

  // --- FLASHCARDS ---
  public static getDecks(): FlashcardDeck[] {
    if (!this.isBrowser()) return SAMPLE_FLASHCARD_DECKS;
    try {
      const data = localStorage.getItem(KEYS.DECKS);
      return data ? JSON.parse(data) : SAMPLE_FLASHCARD_DECKS;
    } catch {
      return SAMPLE_FLASHCARD_DECKS;
    }
  }

  public static saveDeck(deck: FlashcardDeck): void {
    if (!this.isBrowser()) return;
    const decks = this.getDecks();
    const index = decks.findIndex((d) => d.id === deck.id);
    if (index >= 0) {
      decks[index] = deck;
    } else {
      decks.unshift(deck);
    }
    localStorage.setItem(KEYS.DECKS, JSON.stringify(decks));
  }

  public static updateCardMastery(deckId: string, cardId: string, mastery: MasteryStatus): void {
    if (!this.isBrowser()) return;
    const decks = this.getDecks();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) return;

    card.mastery = mastery;
    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewed = Date.now();

    this.saveDeck(deck);
    this.updateStreak();
  }

  // --- TOPIC EXPLANATIONS ---
  public static getExplanations(): TopicExplanation[] {
    if (!this.isBrowser()) return SAMPLE_EXPLANATIONS;
    try {
      const data = localStorage.getItem(KEYS.EXPLANATIONS);
      return data ? JSON.parse(data) : SAMPLE_EXPLANATIONS;
    } catch {
      return SAMPLE_EXPLANATIONS;
    }
  }

  public static saveExplanation(explanation: TopicExplanation): void {
    if (!this.isBrowser()) return;
    const explanations = this.getExplanations();
    const index = explanations.findIndex((e) => e.id === explanation.id);
    if (index >= 0) {
      explanations[index] = explanation;
    } else {
      explanations.unshift(explanation);
    }
    localStorage.setItem(KEYS.EXPLANATIONS, JSON.stringify(explanations));
  }

  // --- SETTINGS ---
  public static getSettings(): UserSettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: Partial<UserSettings>): void {
    if (!this.isBrowser()) return;
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  }

  // --- STREAK & STATS ---
  private static updateStreak(): void {
    if (!this.isBrowser()) return;
    const lastActiveStr = localStorage.getItem(KEYS.LAST_ACTIVE);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    let streak = parseInt(localStorage.getItem(KEYS.STREAK) || '1', 10);

    if (lastActiveStr) {
      const lastDate = new Date(lastActiveStr);
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    localStorage.setItem(KEYS.LAST_ACTIVE, todayStr);
    localStorage.setItem(KEYS.STREAK, streak.toString());
  }

  public static getDashboardStats(): DashboardStats {
    const notes = this.getNotes();
    const decks = this.getDecks();
    const attempts = this.getAttempts();
    const explanations = this.getExplanations();

    let totalCards = 0;
    let masteredCards = 0;
    decks.forEach((deck) => {
      deck.cards.forEach((card) => {
        totalCards += 1;
        if (card.mastery === 'mastered') {
          masteredCards += 1;
        }
      });
    });

    const totalQuizzes = attempts.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalQuizzes)
      : 0;

    let streak = 1;
    if (this.isBrowser()) {
      streak = parseInt(localStorage.getItem(KEYS.STREAK) || '3', 10);
    }

    // Build recent activities
    const activities: DashboardStats['recentActivity'] = [];

    attempts.slice(0, 3).forEach((att) => {
      activities.push({
        id: att.id,
        type: 'quiz',
        title: `Completed ${att.quizTitle}`,
        timestamp: att.date,
        detail: `Scored ${att.score}/${att.totalQuestions} (${att.percentage}%)`
      });
    });

    decks.slice(0, 2).forEach((deck) => {
      activities.push({
        id: deck.id,
        type: 'flashcard',
        title: `Reviewed Deck: ${deck.title}`,
        timestamp: deck.createdAt,
        detail: `${deck.cards.length} cards`
      });
    });

    notes.slice(0, 2).forEach((note) => {
      activities.push({
        id: note.id,
        type: 'upload',
        title: `Added Note: ${note.title}`,
        timestamp: note.createdAt,
        detail: `${note.wordCount} words`
      });
    });

    explanations.slice(0, 2).forEach((exp) => {
      activities.push({
        id: exp.id,
        type: 'explanation',
        title: `Generated Deep Dive: ${exp.topic}`,
        timestamp: exp.createdAt
      });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return {
      totalNotes: notes.length,
      totalFlashcards: totalCards,
      masteredFlashcards: masteredCards,
      totalQuizzesTaken: totalQuizzes,
      averageQuizScore: avgScore,
      studyStreakDays: streak,
      studyMinutesToday: 35 + totalQuizzes * 5,
      recentActivity: activities.slice(0, 6)
    };
  }
}
