import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseConfig, StudyNote, MCQQuiz, FlashcardDeck, QuizAttempt } from './types';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export class FirebaseSyncService {
  /**
   * Initializes Firebase using config or environment variables
   */
  public static init(customConfig?: FirebaseConfig): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const config = customConfig || {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      };

      if (!config.apiKey || !config.projectId) {
        return false;
      }

      if (getApps().length > 0) {
        appInstance = getApp();
      } else {
        appInstance = initializeApp(config);
      }

      firestoreInstance = getFirestore(appInstance);
      storageInstance = getStorage(appInstance);
      return true;
    } catch (err) {
      console.warn('Firebase initialization error:', err);
      return false;
    }
  }

  public static isConfigured(): boolean {
    return firestoreInstance !== null;
  }

  /**
   * Test Firebase connection
   */
  public static async testConnection(config: FirebaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.apiKey || !config.projectId) {
        return { success: false, message: 'API Key and Project ID are required.' };
      }

      const tempApp = initializeApp(config, `test-app-${Date.now()}`);
      const db = getFirestore(tempApp);
      // Quick ping test
      await getDocs(collection(db, '_connection_test'));
      return { success: true, message: 'Connected successfully to Firebase Firestore!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to Firebase.' };
    }
  }

  /**
   * Sync a note to Firestore
   */
  public static async syncNote(note: StudyNote): Promise<boolean> {
    if (!firestoreInstance) return false;
    try {
      const noteRef = doc(firestoreInstance, 'study_notes', note.id);
      await setDoc(noteRef, note, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase note sync error:', err);
      return false;
    }
  }

  /**
   * Delete note from Firestore
   */
  public static async deleteNote(noteId: string): Promise<boolean> {
    if (!firestoreInstance) return false;
    try {
      await deleteDoc(doc(firestoreInstance, 'study_notes', noteId));
      return true;
    } catch (err) {
      console.warn('Firebase delete note error:', err);
      return false;
    }
  }

  /**
   * Upload PDF to Firebase Storage and get download URL
   */
  public static async uploadPdfFile(file: File): Promise<string | null> {
    if (!storageInstance) return null;
    try {
      const fileRef = ref(storageInstance, `notes/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase PDF upload error:', err);
      return null;
    }
  }

  /**
   * Sync a Quiz to Firestore
   */
  public static async syncQuiz(quiz: MCQQuiz): Promise<boolean> {
    if (!firestoreInstance) return false;
    try {
      await setDoc(doc(firestoreInstance, 'quizzes', quiz.id), quiz, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase quiz sync error:', err);
      return false;
    }
  }

  /**
   * Sync a Flashcard Deck to Firestore
   */
  public static async syncDeck(deck: FlashcardDeck): Promise<boolean> {
    if (!firestoreInstance) return false;
    try {
      await setDoc(doc(firestoreInstance, 'decks', deck.id), deck, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firebase deck sync error:', err);
      return false;
    }
  }

  /**
   * Record a quiz attempt in Firestore
   */
  public static async syncAttempt(attempt: QuizAttempt): Promise<boolean> {
    if (!firestoreInstance) return false;
    try {
      await setDoc(doc(firestoreInstance, 'attempts', attempt.id), attempt);
      return true;
    } catch (err) {
      console.warn('Firebase attempt sync error:', err);
      return false;
    }
  }
}
