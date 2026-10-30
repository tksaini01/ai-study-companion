'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Layers,
  Lightbulb,
  Bot,
  Search,
  Eye,
  Plus,
  Loader2,
  Tag,
  BookOpen,
} from 'lucide-react';
import { StudyNote } from '@/lib/types';
import { SAMPLE_NOTES } from '@/lib/sampleData';
import { useToast } from './Toast';
import { NavTab } from './Sidebar';

interface NotesUploadViewProps {
  notes: StudyNote[];
  activeNote: StudyNote | null;
  onSelectNote: (note: StudyNote) => void;
  onSaveNote: (note: StudyNote) => void;
  onDeleteNote: (noteId: string) => void;
  onNavigate: (tab: NavTab) => void;
}

export const NotesUploadView: React.FC<NotesUploadViewProps> = ({
  notes,
  activeNote,
  onSelectNote,
  onSaveNote,
  onDeleteNote,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualTags, setManualTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle PDF upload to /api/parse-pdf
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.toLowerCase().includes('pdf')) {
      showToast('Please upload a valid PDF document (.pdf)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('File size exceeds the 25MB limit.', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      // Generate a title based on filename
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Create new note
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: cleanTitle,
        content: data.text,
        summary: `Imported PDF (${data.pageCount || 1} pages, ${data.wordCount} words)`,
        tags: ['Uploaded PDF', 'Lecture Notes'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        wordCount: data.wordCount,
        pageCount: data.pageCount,
      };

      onSaveNote(newNote);
      onSelectNote(newNote);
      showToast(`Successfully parsed "${file.name}" (${data.wordCount} words, ${data.pageCount} pages)!`, 'success');
    } catch (err: any) {
      console.error('PDF upload/parse error:', err);
      showToast(err.message || 'Error parsing PDF. Please verify file integrity.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSave = () => {
    if (!manualTitle.trim()) {
      showToast('Please provide a title for your study notes.', 'error');
      return;
    }
    if (!manualContent.trim()) {
      showToast('Please paste or write your note content.', 'error');
      return;
    }

    const words = manualContent.split(/\s+/).filter(Boolean).length;
    const tags = manualTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: manualTitle.trim(),
      content: manualContent.trim(),
      summary: `Manually added notes (${words} words)`,
      tags: tags.length > 0 ? tags : ['Study Material'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: words,
    };

    onSaveNote(newNote);
    onSelectNote(newNote);
    setManualTitle('');
    setManualContent('');
    setManualTags('');
    setShowManualEditor(false);
    showToast('Study notes created and saved to library!', 'success');
  };

  const handleLoadSample = (sample: StudyNote) => {
    const clone: StudyNote = {
      ...sample,
      id: `note-sample-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveNote(clone);
    onSelectNote(clone);
    showToast(`Loaded sample notes: "${clone.title}"`, 'success');
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={28} style={{ color: '#818cf8' }} />
            <span>Study Notes & Document Ingestion</span>
          </h1>
          <p className="page-subtitle">
            Upload PDF lecture slides, textbooks, or research papers. The AI will parse, structure, and ready them for active learning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowManualEditor(!showManualEditor)}
            className="btn btn-secondary"
          >
            <Plus size={16} />
            <span>{showManualEditor ? 'Close Editor' : 'Type / Paste Notes'}</span>
          </button>
        </div>
      </div>

      {/* PDF Upload Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleFileUpload(files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: '28px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload(files[0]);
            }
          }}
        />

        <div className="dropzone-icon">
          {isUploading ? (
            <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <UploadCloud size={32} />
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
            {isUploading ? 'Extracting text and structure from PDF...' : 'Drop your PDF notes here, or browse files'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Supports lecture slides, course syllabi, chapters & study guides (PDF up to 20MB)
          </p>
        </div>

        {/* Quick Sample Notes Ingestion Pills */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            Or load a ready sample:
          </span>
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <Sparkles size={12} style={{ color: '#818cf8' }} />
              <span>{sample.tags[0] || sample.title.slice(0, 15)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Note Editor Accordion */}
      {showManualEditor && (
        <div className="glass-panel" style={{ marginBottom: '28px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Plus size={18} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Create / Paste Study Notes</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Document Title
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems & Consensus Algorithms"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="input-text"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Raft, Paxos"
                value={manualTags}
                onChange={(e) => setManualTags(e.target.value)}
                className="input-text"
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Note Content
            </label>
            <textarea
              rows={8}
              placeholder="Paste your lecture notes, summaries, textbook sections, or key formulas here..."
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              className="input-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setShowManualEditor(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleManualSave} className="btn btn-primary">
              <CheckCircle2 size={16} />
              Save to Library
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column View: Notes List & Active Note Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '24px' }}>
        {/* Left Column: Notes List */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: '#818cf8' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Library ({notes.length})</h3>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
            />
            <input
              type="text"
              placeholder="Search documents or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            />
          </div>

          {/* List of Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.88rem' }}>
                No notes matching your search.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background:
                      activeNote?.id === note.id
                        ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border:
                      activeNote?.id === note.id
                        ? '1px solid rgba(99, 102, 241, 0.45)'
                        : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.3 }}>
                      {note.title}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${note.title}"?`)) {
                          onDeleteNote(note.id);
                          showToast('Note removed from library.', 'info');
                        }
                      }}
                      className="btn btn-outline btn-icon"
                      style={{ width: '26px', height: '26px', color: 'var(--text-subtle)' }}
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span>{note.wordCount} words</span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Note Inspector */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeNote ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
                      ACTIVE NOTE
                    </span>
                    {activeNote.fileName && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Source: {activeNote.fileName}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{activeNote.title}</h2>
                </div>

                {/* AI Generation Quick Actions for this Note */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button onClick={() => onNavigate('mcq')} className="btn btn-primary btn-sm">
                    <HelpCircle size={14} />
                    <span>Generate MCQs</span>
                  </button>
                  <button onClick={() => onNavigate('flashcards')} className="btn btn-secondary btn-sm">
                    <Layers size={14} />
                    <span>Flashcards</span>
                  </button>
                  <button onClick={() => onNavigate('explanation')} className="btn btn-secondary btn-sm">
                    <Lightbulb size={14} />
                    <span>Deep Dive</span>
                  </button>
                  <button onClick={() => onNavigate('tutor')} className="btn btn-cyan btn-sm">
                    <Bot size={14} />
                    <span>Ask Tutor</span>
                  </button>
                </div>
              </div>

              {/* Tag Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <Tag size={14} style={{ color: 'var(--text-subtle)' }} />
                {activeNote.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#cbd5e1',
                    }}
                  >
                    #{t}
                  </span>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                  {activeNote.wordCount} words • ~{Math.max(1, Math.round(activeNote.wordCount / 200))} min read
                </span>
              </div>

              {/* Full Content Preview Container */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(9, 13, 22, 0.6)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  lineHeight: 1.7,
                  fontSize: '0.92rem',
                  color: '#cbd5e1',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {activeNote.content}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3>No Study Note Selected</h3>
              <p style={{ marginTop: '8px' }}>
                Upload a PDF document or choose a note from the library on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
