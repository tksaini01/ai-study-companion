'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Award,
  Lightbulb,
  Sliders,
  Loader2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StudyNote, MCQQuiz, MCQQuestion, QuizAttempt, Difficulty } from '@/lib/types';
import { StudyStorage } from '@/lib/storage';
import { FirebaseSyncService } from '@/lib/firebase';
import { useToast } from './Toast';

interface McqQuizViewProps {
  activeNote: StudyNote | null;
  notes: StudyNote[];
  quizzes: MCQQuiz[];
  onSaveQuiz: (quiz: MCQQuiz) => void;
  onRecordAttempt: (attempt: QuizAttempt) => void;
  onOpenSettings: () => void;
}

export const McqQuizView: React.FC<McqQuizViewProps> = ({
  activeNote,
  notes,
  quizzes,
  onSaveQuiz,
  onRecordAttempt,
  onOpenSettings,
}) => {
  const { showToast } = useToast();

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState<MCQQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [checkedAnswers, setCheckedAnswers] = useState<{ [qId: string]: boolean }>({});
  const [revealedHints, setRevealedHints] = useState<{ [qId: string]: boolean }>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generator settings
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);

  // Initialize or pick latest quiz for active note
  useEffect(() => {
    if (activeNote) {
      const existing = quizzes.find((q) => q.noteId === activeNote.id);
      if (existing) {
        loadQuiz(existing);
      } else if (quizzes.length > 0) {
        loadQuiz(quizzes[0]);
      }
    } else if (quizzes.length > 0) {
      loadQuiz(quizzes[0]);
    }
  }, [activeNote]);

  const loadQuiz = (quiz: MCQQuiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setCheckedAnswers({});
    setRevealedHints({});
    setIsQuizComplete(false);
    setTimeRemainingSeconds((quiz.timeLimitMinutes || 10) * 60);
  };

  // Timer effect
  useEffect(() => {
    if (!currentQuiz || isQuizComplete) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuiz, isQuizComplete]);

  // Generate new quiz via /api/gemini route
  const handleGenerateQuiz = async () => {
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
          action: 'mcqs',
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
          count: questionCount,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.questions) {
        throw new Error(data.error || 'Failed to generate MCQs.');
      }

      const newQuiz: MCQQuiz = {
        id: `quiz-${Date.now()}`,
        noteId: activeNote.id,
        noteTitle: activeNote.title,
        title: `${activeNote.title.slice(0, 35)} ${difficulty.toUpperCase()} Quiz`,
        difficulty,
        questions: data.questions,
        createdAt: Date.now(),
        timeLimitMinutes: Math.max(5, Math.round(data.questions.length * 1.5)),
      };

      onSaveQuiz(newQuiz);
      loadQuiz(newQuiz);

      // Background cloud sync if enabled
      FirebaseSyncService.syncQuiz(newQuiz);

      showToast(
        data.source === 'gemini'
          ? `Generated ${data.questions.length} MCQs with Gemini AI!`
          : `Generated ${data.questions.length} MCQs via Smart Analyzer!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error generating quiz. Check settings.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (checkedAnswers[qId]) return; // already locked
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleCheckAnswer = (qId: string) => {
    if (selectedAnswers[qId] === undefined) {
      showToast('Please select an option first.', 'info');
      return;
    }
    setCheckedAnswers((prev) => ({ ...prev, [qId]: true }));
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;

    let score = 0;
    currentQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });

    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      noteId: currentQuiz.noteId,
      score,
      totalQuestions: total,
      percentage,
      date: Date.now(),
      userAnswers: selectedAnswers,
      timeSpentSeconds: (currentQuiz.timeLimitMinutes || 10) * 60 - timeRemainingSeconds,
    };

    onRecordAttempt(attempt);
    FirebaseSyncService.syncAttempt(attempt);
    setIsQuizComplete(true);

    // Celebratory confetti if score >= 70%
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#ec4899'],
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuiz ? currentQuestionIndex === currentQuiz.questions.length - 1 : false;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HelpCircle size={28} style={{ color: '#818cf8' }} />
            <span>Interactive MCQ Quiz Arena</span>
          </h1>
          <p className="page-subtitle">
            Test active recall and identify knowledge gaps with exam-style multiple choice questions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {quizzes.length > 0 && (
            <select
              value={currentQuiz?.id || ''}
              onChange={(e) => {
                const found = quizzes.find((q) => q.id === e.target.value);
                if (found) loadQuiz(found);
              }}
              className="input-select"
              style={{ width: 'auto', minWidth: '220px' }}
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.difficulty.toUpperCase()})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Generator Controls Panel */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-outline'}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Count:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`btn btn-sm ${questionCount === count ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={instantFeedback}
                onChange={(e) => setInstantFeedback(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span>Instant Explanations</span>
            </label>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !activeNote}
            className="btn btn-primary"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Crafting MCQs with AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate New Quiz from Note</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      {currentQuiz && !isQuizComplete && currentQuestion && (
        <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Quiz Header: Title, Progress & Timer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentQuiz.noteTitle}
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentQuiz.title}</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Timer Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: timeRemainingSeconds < 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: timeRemainingSeconds < 60 ? '#f87171' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Clock size={15} />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>

              {/* Progress Count */}
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '28px' }}>
            <div
              style={{
                width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
                height: '100%',
                background: 'var(--primary-gradient)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Question Box */}
          <div style={{ marginBottom: '24px' }}>
            {currentQuestion.topic && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  marginBottom: '12px',
                }}
              >
                Topic: {currentQuestion.topic}
              </span>
            )}
            <h3 style={{ fontSize: '1.25rem', lineHeight: 1.5, fontWeight: 700 }}>
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
              const isChecked = checkedAnswers[currentQuestion.id];
              const isCorrect = optIdx === currentQuestion.correctIndex;

              let optionClass = 'quiz-option';
              if (isSelected) optionClass += ' selected';
              if (isChecked) {
                if (isCorrect) optionClass += ' correct';
                else if (isSelected && !isCorrect) optionClass += ' incorrect';
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                  className={optionClass}
                >
                  <div className="quiz-option-letter">
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.94rem', paddingTop: '4px' }}>
                    {option}
                  </div>
                  {isChecked && isCorrect && (
                    <CheckCircle2 size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: '5px' }} />
                  )}
                  {isChecked && isSelected && !isCorrect && (
                    <XCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '5px' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint Card Toggle */}
          {currentQuestion.hint && !checkedAnswers[currentQuestion.id] && (
            <div style={{ marginBottom: '20px' }}>
              {!revealedHints[currentQuestion.id] ? (
                <button
                  onClick={() => setRevealedHints((prev) => ({ ...prev, [currentQuestion.id]: true }))}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Lightbulb size={14} style={{ color: '#fbbf24' }} />
                  <span>Reveal Conceptual Hint</span>
                </button>
              ) : (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.85rem',
                    color: '#fef3c7',
                  }}
                >
                  💡 <strong>Hint:</strong> {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* Detailed Explanation Panel (shown when checked) */}
          {checkedAnswers[currentQuestion.id] && (
            <div
              style={{
                marginBottom: '24px',
                padding: '18px 20px',
                borderRadius: '12px',
                background:
                  selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                border:
                  selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex ? (
                  <>
                    <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                    <span style={{ fontWeight: 700, color: '#34d399' }}>Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} style={{ color: '#f87171' }} />
                    <span style={{ fontWeight: 700, color: '#f87171' }}>
                      Incorrect. Correct option was {String.fromCharCode(65 + currentQuestion.correctIndex)}.
                    </span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              {instantFeedback && !checkedAnswers[currentQuestion.id] && (
                <button
                  onClick={() => handleCheckAnswer(currentQuestion.id)}
                  disabled={selectedAnswers[currentQuestion.id] === undefined}
                  className="btn btn-cyan"
                >
                  <CheckCircle2 size={16} />
                  <span>Check Answer</span>
                </button>
              )}

              {isLastQuestion ? (
                <button onClick={finishQuiz} className="btn btn-primary">
                  <Award size={16} />
                  <span>Finish & View Scorecard</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="btn btn-primary"
                >
                  <span>Next Question</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Completion & Scorecard Modal/Screen */}
      {currentQuiz && isQuizComplete && (
        <div className="glass-panel" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          {(() => {
            let correctCount = 0;
            currentQuiz.questions.forEach((q) => {
              if (selectedAnswers[q.id] === q.correctIndex) correctCount += 1;
            });
            const total = currentQuiz.questions.length;
            const percentage = Math.round((correctCount / total) * 100);
            const passed = percentage >= 60;

            return (
              <>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: passed ? '#34d399' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: passed ? '0 0 30px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  <Award size={42} />
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                  {percentage >= 90
                    ? 'Exceptional Mastery! 🌟'
                    : percentage >= 70
                    ? 'Great Job! Passing Score 🎉'
                    : 'Good Effort! Review Your Mistakes 📚'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
                  You scored <strong>{correctCount}</strong> out of <strong>{total}</strong> questions correct.
                </p>

                {/* Score Big Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    padding: '16px 36px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    marginBottom: '36px',
                  }}
                >
                  <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {percentage}%
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                    SCORE
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                  <button onClick={() => loadQuiz(currentQuiz)} className="btn btn-secondary">
                    <RotateCcw size={16} />
                    <span>Retake This Quiz</span>
                  </button>
                  <button onClick={handleGenerateQuiz} className="btn btn-primary">
                    <Sparkles size={16} />
                    <span>Generate New Quiz</span>
                  </button>
                </div>

                {/* Mistake & Explanation Review */}
                <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Detailed Answer Review</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {currentQuiz.questions.map((q, idx) => {
                      const userAns = selectedAnswers[q.id];
                      const isCorrect = userAns === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          style={{
                            padding: '18px',
                            borderRadius: '12px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            border: isCorrect ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                              {idx + 1}. {q.question}
                            </div>
                            {isCorrect ? (
                              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={16} /> Correct
                              </span>
                            ) : (
                              <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <XCircle size={16} /> Incorrect
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <div>Your Answer: {userAns !== undefined ? q.options[userAns] : 'Not answered'}</div>
                            {!isCorrect && (
                              <div style={{ color: '#34d399', fontWeight: 600 }}>
                                Correct Answer: {q.options[q.correctIndex]}
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                            💡 {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {!currentQuiz && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
          <HelpCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3>No Quizzes Available Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>
            Select an active study note and click &quot;Generate New Quiz from Note&quot; to begin!
          </p>
          <button onClick={handleGenerateQuiz} disabled={!activeNote} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate MCQs from Active Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
