import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, X, ArrowLeft, Briefcase, ChevronRight,
  Calendar, Building2, ExternalLink, Loader2,
} from 'lucide-react';
import { collection, getDocs, setDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import AuthPrompt from '../components/AuthPrompt';

const COLUMNS = [
  { key: 'wishlist', label: 'Wishlist', color: 'bg-gray-100', textColor: 'text-gray-600', dot: 'bg-gray-400' },
  { key: 'applied', label: 'Applied', color: 'bg-blue-50', textColor: 'text-blue-700', dot: 'bg-blue-500' },
  { key: 'interview', label: 'Interview', color: 'bg-yellow-50', textColor: 'text-yellow-700', dot: 'bg-yellow-500' },
  { key: 'offer', label: 'Offer', color: 'bg-emerald-50', textColor: 'text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-50', textColor: 'text-red-600', dot: 'bg-red-400' },
];

const blank = () => ({
  id: `job_${Date.now()}`,
  company: '',
  role: '',
  location: '',
  url: '',
  appliedDate: new Date().toISOString().split('T')[0],
  notes: '',
  status: 'wishlist',
});

function JobCard({ job, onMove, onDelete, onClick }) {
  const col = COLUMNS.find(c => c.key === job.status) || COLUMNS[0];
  return (
    <div
      onClick={() => onClick(job)}
      className="bg-white rounded-xl border border-gray-200 p-3.5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{job.role || 'Untitled Role'}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            {job.company || 'Unknown Company'}
          </p>
          {job.appliedDate && (
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {job.appliedDate}
            </p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {/* Move arrows */}
      <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-gray-100">
        {COLUMNS.filter(c => c.key !== job.status).map(c => (
          <button
            key={c.key}
            onClick={(e) => { e.stopPropagation(); onMove(job.id, c.key); }}
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.color} ${c.textColor} hover:opacity-80 transition-opacity`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function JobModal({ job, onClose, onSave }) {
  const [form, setForm] = useState({ ...job });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{job.id ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Company</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Google" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Role</label>
              <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Remote / NYC" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Date Applied</label>
              <input type="date" value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Job URL</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://jobs.example.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
              {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Recruiter contact, salary range, follow-up date…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={() => onSave(form)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobTrackerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dbPath = () => collection(db, 'users', user.uid, 'jobTracker');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const q = query(dbPath(), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        // fallback: no ordering
        try {
          const snap = await getDocs(dbPath());
          setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveJob = async (form) => {
    if (!user) return;
    const j = { ...form, updatedAt: serverTimestamp(), createdAt: form.createdAt || serverTimestamp() };
    await setDoc(doc(db, 'users', user.uid, 'jobTracker', form.id), j);
    setJobs(prev => {
      const exists = prev.find(x => x.id === form.id);
      return exists ? prev.map(x => x.id === form.id ? form : x) : [form, ...prev];
    });
    setShowModal(false);
    setEditJob(null);
  };

  const moveJob = (id, status) => {
    const updated = jobs.map(j => j.id === id ? { ...j, status } : j);
    setJobs(updated);
    const j = updated.find(x => x.id === id);
    if (user && j) setDoc(doc(db, 'users', user.uid, 'jobTracker', id), { ...j, status, updatedAt: serverTimestamp() });
  };

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (user) await deleteDoc(doc(db, 'users', user.uid, 'jobTracker', id));
  };

  const openEdit = (job) => { setEditJob(job); setShowModal(true); };
  const openNew = () => { setEditJob(blank()); setShowModal(true); };

  if (!user) return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-sm text-gray-500">Track every application in one place</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4 opacity-40 pointer-events-none">
          {COLUMNS.map(col => (
            <div key={col.key} className="min-w-[200px]">
              <div className={`flex items-center gap-2 px-2 py-2 rounded-xl mb-3 ${col.color}`}>
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-xs font-bold ${col.textColor}`}>{col.label}</span>
              </div>
              <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
        <AuthPrompt />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-sm text-gray-500">Track every application in one place</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {COLUMNS.map(col => {
            const count = jobs.filter(j => j.status === col.key).length;
            return (
              <div key={col.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${col.color}`}>
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-xs font-semibold ${col.textColor}`}>{col.label}</span>
                <span className={`text-xs font-bold ${col.textColor}`}>{count}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
            <Briefcase className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Total: {jobs.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {COLUMNS.map(col => {
              const colJobs = jobs.filter(j => j.status === col.key);
              return (
                <div key={col.key} className="min-w-[200px]">
                  <div className={`flex items-center gap-2 px-2 py-2 rounded-xl mb-3 ${col.color}`}>
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-xs font-bold ${col.textColor}`}>{col.label}</span>
                    <span className={`text-[10px] ${col.textColor} opacity-60 ml-auto`}>{colJobs.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {colJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onMove={moveJob}
                        onDelete={deleteJob}
                        onClick={openEdit}
                      />
                    ))}
                    <button
                      onClick={openNew}
                      className="w-full flex items-center gap-1.5 text-gray-300 hover:text-gray-500 text-xs py-2 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 transition-colors justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && editJob && (
        <JobModal
          job={editJob}
          onClose={() => { setShowModal(false); setEditJob(null); }}
          onSave={saveJob}
        />
      )}
    </AppLayout>
  );
}
