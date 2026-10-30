'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  BookOpen,
  User,
  Loader2,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { StudyNote, ChatMessage } from '@/lib/types';
import { StudyStorage } from '@/lib/storage';
import { useToast } from './Toast';

interface AiTutorChatViewProps {
  activeNote: StudyNote | null;
  notes: StudyNote[];
}

export const AiTutorChatView: React.FC<AiTutorChatViewProps> = ({
  activeNote,
  notes,
}) => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `👋 Hello! I am your AI Study Companion. I have analyzed your study material. Ask me any question, ask for step-by-step math or logic explanations, analogies, or exam review questions!`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (!activeNote) {
      showToast('Please select or upload a study note first.', 'error');
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const settings = StudyStorage.getSettings();

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          apiKey: settings.geminiApiKey,
          model: settings.geminiModel,
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to retrieve response from AI tutor.');
      }

      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ I had trouble connecting to the AI: ${err.message || 'Please check your API key in Settings.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptChips = [
    'Explain the core mechanism in simple terms',
    'Give me an intuitive real-world analogy',
    'What are the common exam traps & pitfalls?',
    'Create 2 practice problems with solutions',
    'Summarize into 3 high-yield bullet points',
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bot size={28} style={{ color: '#818cf8' }} />
            <span>AI Study Tutor & Interactive Chat</span>
          </h1>
          <p className="page-subtitle">
            Ask clarifying questions, debug concepts, and request practice drills grounded directly in your uploaded notes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  role: 'assistant',
                  content: `Chat session refreshed. What would you like to review from "${activeNote?.title || 'your notes'}"?`,
                  timestamp: Date.now(),
                },
              ]);
              showToast('Chat history cleared.', 'info');
            }}
            className="btn btn-outline btn-sm"
          >
            <Trash2 size={14} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Active Material Grounding Banner */}
      {activeNote && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} style={{ color: '#818cf8' }} />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Grounded in active note: <strong style={{ color: '#fff' }}>{activeNote.title}</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#818cf8', fontWeight: 600 }}>
            {activeNote.wordCount} words loaded
          </span>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading || !activeNote}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', borderRadius: '9999px' }}
          >
            <Sparkles size={12} style={{ color: '#818cf8' }} />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Messages List */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.role}`}
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {msg.role === 'user' ? <User size={15} color="#fff" /> : <Bot size={15} color="#818cf8" />}
              </div>

              <div style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={15} color="#818cf8" />
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                AI Tutor is reasoning through your notes...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--bg-glass-heavy)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <input
            type="text"
            placeholder={
              activeNote
                ? `Ask anything about "${activeNote.title.slice(0, 30)}..."`
                : 'Select a note to start asking questions...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !activeNote}
            className="input-text"
            style={{ borderRadius: '9999px', padding: '12px 20px' }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading || !activeNote}
            className="btn btn-primary"
            style={{ borderRadius: '9999px', width: '44px', height: '44px', padding: 0 }}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
