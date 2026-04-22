import { useState } from 'react';
import api from '../api/axiosConfig';
import { FileText, Upload, Wand2, X, AlertCircle } from 'lucide-react';

export default function DocumentAnalyser() {
  const [documentText, setDocumentText] = useState('');
  const [summary, setSummary] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Only allow .txt files for direct upload
    if (!file.name.endsWith('.txt')) {
      alert('Only .txt files can be uploaded directly. For Word/PDF documents, please copy the text and paste it in the text area below.');
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocumentText(ev.target.result);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!documentText.trim()) return;
    setIsAnalyzing(true);
    setSummary('');
    try {
      const res = await api.post('/analysis/document', { documentText });
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('Error analyzing document: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: '1.25rem' }}
      >
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FileText size={18} color="white" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            AI Document Analyser
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Upload or paste any legal document for AI-powered analysis
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Upload Area */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="doc-upload"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              transition: 'border-color 0.3s, background 0.3s',
              background: 'var(--background-alt)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'var(--primary-light)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--background-alt)';
            }}
          >
            <Upload size={18} />
            {fileName ? (
              <span>
                <strong style={{ color: 'var(--text-main)' }}>{fileName}</strong> — Click to change
              </span>
            ) : (
              <span>Click to upload a plain text file (.txt)</span>
            )}
          </label>
          <input
            id="doc-upload"
            type="file"
            accept=".txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Divider */}
        <div
          className="flex items-center gap-2"
          style={{ margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          OR paste text from your Word / PDF document below
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Textarea */}
        <textarea
          className="form-input"
          style={{
            width: '100%',
            minHeight: 160,
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.6,
          }}
          placeholder="Open your Word/PDF document → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste here (Ctrl+V)"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !documentText.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isAnalyzing ? (
              <>
                <span
                  style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 size={15} /> Analyze Document
              </>
            )}
          </button>
          {documentText && (
            <button
              className="btn"
              onClick={() => { setDocumentText(''); setSummary(''); setFileName(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'var(--background-alt)', border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <p className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
          <AlertCircle size={12} />
          <em>AI analysis is for informational purposes only. Always consult a qualified lawyer.</em>
        </p>
      </div>

      {/* Results */}
      {summary && (
        <div className="ai-insight-card animate-slide-up" style={{ marginTop: '1.25rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>
              Document Analysis Report
            </h3>
          </div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: '0.925rem',
              color: 'var(--text-sub)',
            }}
          >
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
