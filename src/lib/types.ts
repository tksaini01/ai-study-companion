export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  fileName?: string;
  fileSize?: number;
  wordCount: number;
  pageCount?: number;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  topic?: string;
}

export interface MCQQuiz {
  id: string;
  noteId: string;
  noteTitle: string;
  title: string;
  difficulty: Difficulty;
  questions: MCQQuestion[];
  createdAt: number;
  timeLimitMinutes?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  noteId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: number;
  userAnswers: { [questionId: string]: number };
  timeSpentSeconds: number;
}

export type MasteryStatus = 'new' | 'learning' | 'mastered';

export interface Flashcard {
  id: string;
  noteId: string;
  front: string;
  back: string;
  hint?: string;
  topic?: string;
  mastery: MasteryStatus;
  lastReviewed?: number;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  noteId: string;
  noteTitle: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface KeyTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  explanation?: string;
}

export interface TopicExplanation {
  id: string;
  noteId: string;
  noteTitle: string;
  topic: string;
  overview: string;
  keyTakeaways: string[];
  eli5: string;
  mnemonics: string[];
  keyTerms: KeyTerm[];
  practiceQuestions: PracticeQuestion[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DashboardStats {
  totalNotes: number;
  totalFlashcards: number;
  masteredFlashcards: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  studyStreakDays: number;
  studyMinutesToday: number;
  recentActivity: {
    id: string;
    type: 'upload' | 'quiz' | 'flashcard' | 'explanation';
    title: string;
    timestamp: number;
    detail?: string;
  }[];
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface UserSettings {
  geminiApiKey: string;
  geminiModel: string;
  firebaseConfig?: FirebaseConfig;
  autoSaveCloud: boolean;
  dailyGoalFlashcards: number;
  dailyGoalQuizzes: number;
}
