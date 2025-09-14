import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../components/withAuth';
import Layout from '../components/Layout';
import Link from 'next/link';

const TugasPage = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8000/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAssignments(response.data);
    } catch (err) {
      setError('Gagal mengambil data tugas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenSubmitModal = (tugas) => {
    setSelectedTugas(tugas);
    setShowSubmitModal(true);
  };

  return (
    <Layout user={user}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Tugas</h1>
        {user.role === 'guru' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
          >
            + Buat Tugas Baru
          </button>
        )}
      </div>

      {loading && <p>Memuat daftar tugas...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((tugas) => (
              <div key={tugas.id} className="border-b pb-4 flex justify-between items-center last:border-b-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tugas.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Batas Waktu: <span className="font-medium">{new Date(tugas.due_date).toLocaleDateString('id-ID')}</span>
                  </p>
                </div>
                {user.role === 'guru' ? (
                  <Link 
                    href={`/tugas/${tugas.id}`}
                    className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm hover:bg-gray-600 cursor-pointer"
                  >
                    Lihat Pengumpulan
                  </Link>
                ) : (
                  tugas.submissions && tugas.submissions.length > 0 ? (
                    <span className="px-4 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                      ✓ Sudah Dikumpulkan
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleOpenSubmitModal(tugas)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600"
                    >
                      Kumpulkan Tugas
                    </button>
                  )
                )}
              </div>
            ))
          ) : (
            !loading && <p className="text-gray-500 text-center py-4">Belum ada tugas yang diberikan.</p>
          )}
        </div>
      </div>

      {/* Modal-modal ditempatkan di sini */}
      {showCreateModal && ( <FormBuatTugas onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchAssignments(); }} /> )}
      {showSubmitModal && selectedTugas && ( <FormKumpulTugas tugas={selectedTugas} onClose={() => setShowSubmitModal(false)} onSuccess={() => { setShowSubmitModal(false); fetchAssignments(); }} /> )}
    </Layout>
  );
};

const FormBuatTugas = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/assignments', {
                title, description, class_id: classId, subject_id: subjectId, due_date: dueDate,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            onSuccess();
        } catch (err) { setError('Gagal membuat tugas. Pastikan semua field terisi benar.');
        } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Buat Tugas Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Judul Tugas" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded"/>
                    <textarea placeholder="Deskripsi Tugas" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded h-24"></textarea>
                    <input type="number" placeholder="ID Kelas (contoh: 1)" value={classId} onChange={e => setClassId(e.target.value)} required className="w-full p-2 border rounded"/>
                    <input type="number" placeholder="ID Mapel (contoh: 1)" value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full p-2 border rounded"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 border rounded"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-400">{loading ? 'Menyimpan...' : 'Buat Tugas'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const FormKumpulTugas = ({ tugas, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Silakan pilih file untuk diupload.'); return; }
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`http://127.0.0.1:8000/api/assignments/${tugas.id}/submissions`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data', }
      });
      onSuccess();
    } catch (err) { setError('Gagal mengupload tugas. Coba lagi.'); console.error(err);
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Kumpulkan Tugas</h2>
        <p className="text-gray-600 mb-6">Untuk tugas: <span className="font-semibold">{tugas.title}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File Jawaban Anda</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-400">{loading ? 'Mengupload...' : 'Kumpulkan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(TugasPage);
