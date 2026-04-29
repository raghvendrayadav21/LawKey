import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { FileText, Image as ImageIcon, File, Upload, Lock } from 'lucide-react';

export default function DocumentVault({ deal, currentUserRole }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({
    fileName: '',
    fileType: 'PDF',
    notes: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [deal.id]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/vault/${deal.id}`);
      setDocuments(res.data);
    } catch (e) {
      console.error('Error fetching vault documents', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await api.post(`/vault/${deal.id}`, form);
      setForm({ fileName: '', fileType: 'PDF', notes: '' });
      fetchDocuments();
    } catch (e) {
      alert('Failed to log document');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF': return <FileText size={24} color="#EF4444" />;
      case 'IMAGE': return <ImageIcon size={24} color="#10B981" />;
      case 'DOCX': return <FileText size={24} color="#3B82F6" />;
      default: return <File size={24} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
        <Lock size={14} /> End-to-end encrypted metadata vault
      </div>

      <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Log New Document</h4>
        <form onSubmit={handleAddDocument} className="grid grid-cols-2 gap-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Document Name</label>
            <input 
              className="form-input" type="text" required
              value={form.fileName} onChange={e => setForm({...form, fileName: e.target.value})}
              placeholder="e.g. Identity Proof, Signed Contract"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>File Type</label>
            <select 
              className="form-input" 
              value={form.fileType} onChange={e => setForm({...form, fileType: e.target.value})}
            >
              <option value="PDF">PDF Document (.pdf)</option>
              <option value="DOCX">Word Document (.docx)</option>
              <option value="IMAGE">Image (.jpg, .png)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group col-span-2" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Notes / Description</label>
            <input 
              className="form-input" type="text" 
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any details about this document..."
            />
          </div>
          <div className="col-span-2" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUploading}>
              {isUploading ? 'Logging...' : <><Upload size={14}/> Log Document</>}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Vault Contents</h4>
        {loading ? (
          <p>Loading vault...</p>
        ) : documents.length === 0 ? (
          <div className="empty-state card-flat" style={{ padding: '2rem' }}>
            <Lock size={32} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--text-muted)' }} />
            <p>Vault is empty. Log documents shared via email or in person here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map(doc => (
              <div key={doc.id} className="card flex items-center justify-between" style={{ padding: '1rem' }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{doc.fileName}</strong>
                    <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Logged by {doc.uploadedByType === currentUserRole ? 'You' : (doc.uploadedByType === 'LAWYER' ? 'Lawyer' : 'Client')}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                    </div>
                    {doc.notes && <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>{doc.notes}</p>}
                  </div>
                </div>
                <span className="badge">{doc.fileType}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
