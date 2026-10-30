'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Database, RotateCcw, Check, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { UserSettings, FirebaseConfig } from '@/lib/types';
import { StudyStorage } from '@/lib/storage';
import { FirebaseSyncService } from '@/lib/firebase';
import { useToast } from './Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const { showToast } = useToast();
  const currentSettings = StudyStorage.getSettings();

  const [apiKey, setApiKey] = useState(currentSettings.geminiApiKey || '');
  const [model, setModel] = useState(currentSettings.geminiModel || 'gemini-1.5-flash');
  const [fbApiKey, setFbApiKey] = useState(currentSettings.firebaseConfig?.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(currentSettings.firebaseConfig?.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(currentSettings.firebaseConfig?.storageBucket || '');

  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestStatus, setGeminiTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [isTestingFb, setIsTestingFb] = useState(false);
  const [fbTestStatus, setFbTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    if (!apiKey || apiKey.trim().length < 10) {
      setGeminiTestStatus({ success: false, message: 'Please enter a valid Gemini API key.' });
      return;
    }
    setIsTestingGemini(true);
    setGeminiTestStatus(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-key', apiKey: apiKey.trim(), model }),
      });
      const data = await res.json();
      setGeminiTestStatus(data);
      if (data.success) {
        showToast('Gemini API key is valid and working!', 'success');
      } else {
        showToast(data.message || 'Gemini authentication failed', 'error');
      }
    } catch (err: any) {
      setGeminiTestStatus({ success: false, message: err.message || 'Network error' });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleTestFirebase = async () => {
    if (!fbApiKey || !fbProjectId) {
      setFbTestStatus({ success: false, message: 'Firebase API Key and Project ID are required.' });
      return;
    }
    setIsTestingFb(true);
    setFbTestStatus(null);
    try {
      const testConfig: FirebaseConfig = {
        apiKey: fbApiKey.trim(),
        projectId: fbProjectId.trim(),
        storageBucket: fbStorageBucket.trim(),
        authDomain: `${fbProjectId.trim()}.firebaseapp.com`,
        messagingSenderId: '',
        appId: '',
      };
      const result = await FirebaseSyncService.testConnection(testConfig);
      setFbTestStatus(result);
      if (result.success) {
        showToast('Connected to Firebase Firestore!', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      setFbTestStatus({ success: false, message: err.message || 'Connection error' });
    } finally {
      setIsTestingFb(false);
    }
  };

  const handleSave = () => {
    const updated: Partial<UserSettings> = {
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      firebaseConfig: fbApiKey && fbProjectId ? {
        apiKey: fbApiKey.trim(),
        projectId: fbProjectId.trim(),
        storageBucket: fbStorageBucket.trim(),
        authDomain: `${fbProjectId.trim()}.firebaseapp.com`,
        messagingSenderId: '',
        appId: '',
      } : undefined,
    };

    StudyStorage.saveSettings(updated);
    if (updated.firebaseConfig) {
      FirebaseSyncService.init(updated.firebaseConfig);
    }
    showToast('Settings saved successfully!', 'success');
    onSettingsSaved();
    onClose();
  };

  const handleResetData = () => {
    if (confirm('Reset your study library back to the preloaded sample notes, quizzes, and decks?')) {
      StudyStorage.resetToSampleData();
      showToast('Sample study materials restored!', 'success');
      onSettingsSaved();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#fff" />
            </div>
            <div>
              <h3>AI & Service Settings</h3>
              <p style={{ fontSize: '0.82rem' }}>Configure Gemini AI API and Firebase cloud sync</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Gemini API Section */}
        <div style={{ marginBottom: '24px', padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={16} style={{ color: '#818cf8' }} />
            <h4 style={{ fontSize: '1rem', color: '#f1f5f9' }}>Google Gemini AI</h4>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-text"
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px', display: 'block' }}>
              Stored securely in your local browser session. If omitted, the app automatically runs on the built-in intelligent extractor engine.
            </span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-select"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra fast & recommended)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-gen reasoning)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex analysis)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTestGemini}
              disabled={isTestingGemini}
              className="btn btn-secondary btn-sm"
            >
              {isTestingGemini ? 'Testing connection...' : 'Test Gemini Key'}
            </button>
            {geminiTestStatus && (
              <span style={{ fontSize: '0.8rem', color: geminiTestStatus.success ? '#34d399' : '#f87171' }}>
                {geminiTestStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Firebase Section */}
        <div style={{ marginBottom: '24px', padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Database size={16} style={{ color: '#06b6d4' }} />
            <h4 style={{ fontSize: '1rem', color: '#f1f5f9' }}>Firebase Cloud Sync (Optional)</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Firebase API Key
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                className="input-text"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Project ID
              </label>
              <input
                type="text"
                placeholder="my-study-app"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                className="input-text"
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Storage Bucket
            </label>
            <input
              type="text"
              placeholder="my-study-app.appspot.com"
              value={fbStorageBucket}
              onChange={(e) => setFbStorageBucket(e.target.value)}
              className="input-text"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleTestFirebase}
              disabled={isTestingFb}
              className="btn btn-secondary btn-sm"
            >
              {isTestingFb ? 'Testing...' : 'Test Firebase'}
            </button>
            {fbTestStatus && (
              <span style={{ fontSize: '0.8rem', color: fbTestStatus.success ? '#34d399' : '#f87171' }}>
                {fbTestStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Data Reset & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <button
            onClick={handleResetData}
            className="btn btn-outline btn-sm"
            style={{ color: '#94a3b8' }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo Library</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Check size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
