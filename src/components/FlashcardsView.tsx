'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  RotateCw,
  Shuffle,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  BookOpen,
} from 'lucide-react';
import { StudyNote, FlashcardDeck, Flashcard, MasteryStatus } from '@/lib/types';
import { StudyStorage } from '@/lib/storage';
import { FirebaseSyncService } from '@/lib/firebase';
import { useToast } from './Toast';

interface FlashcardsViewProps {
  activeNote: StudyNote | null;
  notes: StudyNote[];
  decks: FlashcardDeck[];
  onSaveDeck: (deck: FlashcardDeck) => void;
  onUpdateCardMastery: (deckId: string, cardId: string, mastery: MasteryStatus) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  activeNote,
  notes,
  decks,
  onSaveDeck,
  onUpdateCardMastery,
}) => {
  const { showToast } = useToast();

  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterMastery, setFilterMastery] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardCount, setCardCount] = useState(8);

  // Load deck for active note or default
  useEffect(() => {
    if (activeNote) {
      const existing = decks.find((d) => d.noteId === activeNote.id);
      if (existing) {
        setCurrentDeck(existing);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowHint(false);
      } else if (decks.length > 0) {
        setCurrentDeck(decks[0]);
      }
    } else if (decks.length > 0) {
      setCurrentDeck(decks[0]);
    }
  }, [activeNote]);

  // Keyboard navigation (Space to flip, Left/Right to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const getFilteredCards = (): Flashcard[] => {
    if (!currentDeck) return [];
    if (filterMastery === 'mastered') {
      return currentDeck.cards.filter((c) => c.mastery === 'mastered');
    }
    if (filterMastery === 'unmastered') {
      return currentDeck.cards.filter((c) => c.mastery !== 'mastered');
    }
    return currentDeck.cards;
  };

  const filteredCards = getFilteredCards();
  const currentCard = filteredCards[currentCardIndex];

  const handleNextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleShuffle = () => {
    if (!currentDeck) return;
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    const updated = { ...currentDeck, cards: shuffled };
    setCurrentDeck(updated);
    onSaveDeck(updated);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    showToast('Cards shuffled randomly!', 'info');
  };

  const handleRateMastery = (mastery: MasteryStatus) => {
    if (!currentDeck || !currentCard) return;

    onUpdateCardMastery(currentDeck.id, currentCard.id, mastery);

    // Update in local state
    const updatedCards = currentDeck.cards.map((c) =>
      c.id === currentCard.id ? { ...c, mastery, reviewCount: (c.reviewCount || 0) + 1 } : c
    );
    const updatedDeck = { ...currentDeck, cards: updatedCards };
    setCurrentDeck(updatedDeck);

    // Check if entire deck mastered
    const masteredCount = updatedCards.filter((c) => c.mastery === 'mastered').length;
    if (masteredCount === updatedCards.length) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      });
      showToast('🎉 Congratulations! You have mastered all cards in this deck!', 'success');
    }

    // Auto advance
    if (currentCardIndex < filteredCards.length - 1) {
      setTimeout(() => {
        handleNextCard();
      }, 200);
    }
  };

  // Generate flashcards via Gemini API route
  const handleGenerateDeck = async () => {
    if (!activeNote) {
      showToast('Please select or upload a study note first.', 'error');
      return;
    }

    setIsGenerating(true);
    const settings = StudyStorage.getSettings();

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'flashcards',
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
          count: cardCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.cards) {
        throw new Error(data.error || 'Failed to generate flashcards.');
      }

      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        noteId: activeNote.id,
        noteTitle: activeNote.title,
        title: `${activeNote.title.slice(0, 35)} Flashcards`,
        cards: data.cards.map((c: any) => ({ ...c, noteId: activeNote.id })),
        createdAt: Date.now(),
      };

      onSaveDeck(newDeck);
      setCurrentDeck(newDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);

      // Cloud sync
      FirebaseSyncService.syncDeck(newDeck);

      showToast(
        data.source === 'gemini'
          ? `Created ${data.cards.length} flashcards with Gemini AI!`
          : `Created ${data.cards.length} flashcards via Smart Analyzer!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error generating flashcards.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalInDeck = currentDeck ? currentDeck.cards.length : 0;
  const masteredInDeck = currentDeck
    ? currentDeck.cards.filter((c) => c.mastery === 'mastered').length
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={28} style={{ color: '#818cf8' }} />
            <span>Interactive 3D Flashcards & Active Recall</span>
          </h1>
          <p className="page-subtitle">
            Flip cards to self-test, track spaced repetition mastery, and build persistent long-term memory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {decks.length > 0 && (
            <select
              value={currentDeck?.id || ''}
              onChange={(e) => {
                const found = decks.find((d) => d.id === e.target.value);
                if (found) {
                  setCurrentDeck(found);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setShowHint(false);
                }
              }}
              className="input-select"
              style={{ width: 'auto', minWidth: '220px' }}
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.cards.length} cards)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Generator & Filter Bar */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Filter options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Show:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => {
                  setFilterMastery('all');
                  setCurrentCardIndex(0);
                }}
                className={`btn btn-sm ${filterMastery === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                All ({totalInDeck})
              </button>
              <button
                onClick={() => {
                  setFilterMastery('unmastered');
                  setCurrentCardIndex(0);
                }}
                className={`btn btn-sm ${filterMastery === 'unmastered' ? 'btn-primary' : 'btn-outline'}`}
              >
                Still Learning ({totalInDeck - masteredInDeck})
              </button>
              <button
                onClick={() => {
                  setFilterMastery('mastered');
                  setCurrentCardIndex(0);
                }}
                className={`btn btn-sm ${filterMastery === 'mastered' ? 'btn-primary' : 'btn-outline'}`}
              >
                Mastered ({masteredInDeck})
              </button>
            </div>
          </div>

          {/* Quick Deck Generation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[6, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setCardCount(cnt)}
                  className={`btn btn-sm ${cardCount === cnt ? 'btn-primary' : 'btn-outline'}`}
                >
                  {cnt} Cards
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateDeck}
              disabled={isGenerating || !activeNote}
              className="btn btn-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing Cards...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate New Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Flashcard Deck Experience */}
      {currentDeck && filteredCards.length > 0 && currentCard ? (
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          {/* Deck Header & Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#818cf8' }}>
                Card {currentCardIndex + 1} of {filteredCards.length}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background:
                    currentCard.mastery === 'mastered'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : currentCard.mastery === 'learning'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(99, 102, 241, 0.2)',
                  color:
                    currentCard.mastery === 'mastered'
                      ? '#34d399'
                      : currentCard.mastery === 'learning'
                      ? '#fbbf24'
                      : '#a5b4fc',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {currentCard.mastery}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleShuffle}
                className="btn btn-outline btn-sm"
                title="Shuffle card order"
              >
                <Shuffle size={14} />
                <span>Shuffle</span>
              </button>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Spacebar to flip • Arrows to navigate
              </span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div
              style={{
                width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%`,
                height: '100%',
                background: 'var(--primary-gradient)',
                transition: 'width 0.25s ease',
              }}
            />
          </div>

          {/* 3D Flashcard Component */}
          <div className="flashcard-scene" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front Face */}
              <div className="flashcard-face flashcard-front">
                <div className="flashcard-header">
                  <span className="flashcard-topic">{currentCard.topic || 'Concept'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>FRONT</span>
                </div>

                <div className="flashcard-body">
                  <div className="flashcard-text">{currentCard.front}</div>
                  {currentCard.hint && showHint && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        fontSize: '0.85rem',
                        color: '#fde68a',
                      }}
                    >
                      💡 <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  )}
                </div>

                <div className="flashcard-footer" onClick={(e) => e.stopPropagation()}>
                  {currentCard.hint && !showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.76rem' }}
                    >
                      <Lightbulb size={13} style={{ color: '#fbbf24' }} />
                      <span>Show Hint</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', cursor: 'pointer' }} onClick={() => setIsFlipped(true)}>
                    <RotateCw size={14} />
                    <span>Click to reveal answer</span>
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div className="flashcard-face flashcard-back">
                <div className="flashcard-header">
                  <span className="flashcard-topic" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                    ANSWER / EXPLANATION
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>BACK</span>
                </div>

                <div className="flashcard-body">
                  <div className="flashcard-text" style={{ fontSize: '1.25rem', lineHeight: 1.6, textAlign: 'left', fontWeight: 500 }}>
                    {currentCard.back}
                  </div>
                </div>

                <div className="flashcard-footer" onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Reviewed {currentCard.reviewCount || 0} times
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', cursor: 'pointer' }} onClick={() => setIsFlipped(false)}>
                    <RotateCw size={14} />
                    <span>Click to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Recall Mastery Rating Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
            <button
              onClick={() => handleRateMastery('learning')}
              className="btn btn-secondary"
              style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
            >
              <AlertTriangle size={16} />
              <span>Need Practice</span>
            </button>

            <button
              onClick={() => handleRateMastery('learning')}
              className="btn btn-secondary"
              style={{ background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fde68a' }}
            >
              <span>Almost There</span>
            </button>

            <button
              onClick={() => handleRateMastery('mastered')}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              <CheckCircle size={16} />
              <span>Mastered!</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {/* Dots navigation */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '300px', padding: '4px' }}>
              {filteredCards.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCurrentCardIndex(idx);
                    setIsFlipped(false);
                    setShowHint(false);
                  }}
                  style={{
                    width: idx === currentCardIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    background:
                      idx === currentCardIndex
                        ? 'var(--primary)'
                        : c.mastery === 'mastered'
                        ? '#10b981'
                        : 'rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNextCard}
              disabled={currentCardIndex === filteredCards.length - 1}
              className="btn btn-secondary"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
          <Layers size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3>No Flashcards Available for this Filter</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>
            {filterMastery !== 'all'
              ? 'Try switching the filter to "All Cards" or generate a fresh deck!'
              : 'Select an active study note and generate a customized active recall deck!'}
          </p>
          <button onClick={handleGenerateDeck} disabled={!activeNote} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate Flashcards from Active Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
