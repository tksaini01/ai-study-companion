'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  HelpCircle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Tag,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { StudyNote, TopicExplanation } from '@/lib/types';
import { StudyStorage } from '@/lib/storage';
import { useToast } from './Toast';

interface TopicExplanationViewProps {
  activeNote: StudyNote | null;
  notes: StudyNote[];
  explanations: TopicExplanation[];
  onSaveExplanation: (explanation: TopicExplanation) => void;
}

export const TopicExplanationView: React.FC<TopicExplanationViewProps> = ({
  activeNote,
  notes,
  explanations,
  onSaveExplanation,
}) => {
  const { showToast } = useToast();

  const [currentExplanation, setCurrentExplanation] = useState<TopicExplanation | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [qIndex: number]: boolean }>({});

  useEffect(() => {
    if (activeNote) {
      const existing = explanations.find((e) => e.noteId === activeNote.id);
      if (existing) {
        setCurrentExplanation(existing);
      } else if (explanations.length > 0) {
        setCurrentExplanation(explanations[0]);
      }
    } else if (explanations.length > 0) {
      setCurrentExplanation(explanations[0]);
    }
  }, [activeNote]);

  const handleGenerate = async () => {
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
          action: 'explanation',
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
          topic: customTopic.trim() || activeNote.title,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.explanation) {
        throw new Error(data.error || 'Failed to generate explanation.');
      }

      const newExp: TopicExplanation = {
        ...data.explanation,
        id: `exp-${Date.now()}`,
        noteId: activeNote.id,
        createdAt: Date.now(),
      };

      onSaveExplanation(newExp);
      setCurrentExplanation(newExp);
      setRevealedAnswers({});
      setCustomTopic('');

      showToast(
        data.source === 'gemini'
          ? `Generated deep dive for "${newExp.topic}" with Gemini AI!`
          : `Generated deep dive via Smart Concept Extractor!`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Error generating explanation.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Lightbulb size={28} style={{ color: '#818cf8' }} />
            <span>AI Topic Explanations & Deep Dive</span>
          </h1>
          <p className="page-subtitle">
            Demystify complex subjects with intuitive real-world analogies, memory mnemonics, and structured breakdowns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {explanations.length > 0 && (
            <select
              value={currentExplanation?.id || ''}
              onChange={(e) => {
                const found = explanations.find((exp) => exp.id === e.target.value);
                if (found) {
                  setCurrentExplanation(found);
                  setRevealedAnswers({});
                }
              }}
              className="input-select"
              style={{ width: 'auto', minWidth: '220px' }}
            >
              {explanations.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.topic}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Generator Prompt Bar */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder={
                activeNote
                  ? `Enter specific concept (e.g. "Coffman Conditions") or leave blank for "${activeNote.title.slice(0, 30)}..."`
                  : 'Select an active note first...'
              }
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="input-text"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !activeNote}
            className="btn btn-primary"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Synthesizing Deep Dive...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Deep Dive</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Explanation Body */}
      {currentExplanation ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
          {/* Header Banner */}
          <div
            style={{
              padding: '28px 32px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              SOURCE: {currentExplanation.noteTitle}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              {currentExplanation.topic}
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-line' }}>
              {currentExplanation.overview}
            </p>
          </div>

          {/* ELI5 (Explain Like I'm 5) Analogy Card */}
          {currentExplanation.eli5 && (
            <div
              style={{
                padding: '24px 28px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Smile size={20} style={{ color: '#fbbf24' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#fef3c7' }}>Explain Like I&apos;m 5 (Intuitive Analogy)</h3>
              </div>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#fde68a' }}>
                {currentExplanation.eli5}
              </p>
            </div>
          )}

          {/* Key Takeaways */}
          {currentExplanation.keyTakeaways && currentExplanation.keyTakeaways.length > 0 && (
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Core Principles & Key Takeaways</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {currentExplanation.keyTakeaways.map((point, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memory Mnemonics */}
          {currentExplanation.mnemonics && currentExplanation.mnemonics.length > 0 && (
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Brain size={18} style={{ color: '#ec4899' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Memory Mnemonics & Exam Triggers</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentExplanation.mnemonics.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(236, 72, 153, 0.08)',
                      border: '1px solid rgba(236, 72, 153, 0.25)',
                      fontSize: '0.92rem',
                      color: '#fbcfe8',
                    }}
                  >
                    💡 {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Terminology Glossary */}
          {currentExplanation.keyTerms && currentExplanation.keyTerms.length > 0 && (
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <BookOpen size={18} style={{ color: '#06b6d4' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Key Terminology & Definitions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentExplanation.keyTerms.map((term, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>
                        {term.term}
                      </span>
                      {term.context && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: '#22d3ee',
                          }}
                        >
                          {term.context}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {term.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self-Check Practice Questions */}
          {currentExplanation.practiceQuestions && currentExplanation.practiceQuestions.length > 0 && (
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <HelpCircle size={18} style={{ color: '#818cf8' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Self-Check Conceptual Questions</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentExplanation.practiceQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: '12px' }}>
                      Q{idx + 1}: {q.question}
                    </div>

                    {revealedAnswers[idx] ? (
                      <div
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          fontSize: '0.9rem',
                          color: '#ecfdf5',
                          lineHeight: 1.6,
                        }}
                      >
                        <strong>Answer:</strong> {q.answer}
                        {q.explanation && (
                          <div style={{ marginTop: '6px', fontSize: '0.84rem', color: '#a7f3d0' }}>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <span>Reveal Answer</span>
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
          <Lightbulb size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3>No Topic Explanations Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>
            Select an active study note and click &quot;Generate Deep Dive&quot; to synthesize explanations, ELI5 analogies, and terminology!
          </p>
          <button onClick={handleGenerate} disabled={!activeNote} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate Deep Dive on Active Note</span>
          </button>
        </div>
      )}
    </div>
  );
};
