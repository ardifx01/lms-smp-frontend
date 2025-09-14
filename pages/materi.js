import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../components/withAuth';
import Layout from '../components/Layout';

const MateriPage = ({ user }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // --- STATE BARU UNTUK PENCARIAN ---
  const [searchTerm, setSearchTerm] = useState('');

  // Fungsi untuk mengambil data materi, kini dengan parameter pencarian
  const fetchMaterials = async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8000/api/materials', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { search: searchQuery } // Kirim parameter search ke backend
      });
      setMaterials(response.data);
    } catch (err) {
      setError('Gagal mengambil data materi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect ini akan berjalan setiap kali searchTerm berubah
  // Debouncing: Memberi jeda sebelum melakukan pencarian agar tidak membebani server
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMaterials(searchTerm);
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Layout user={user}>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Materi Pembelajaran</h1>
        {user.role === 'guru' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-colors flex-shrink-0"
          >
            + Upload Materi Baru
          </button>
        )}
      </div>

      {/* --- INPUT FIELD PENCARIAN BARU --- */}
      <div className="mb-6">
          <input 
            type="text"
            placeholder="Cari judul materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
          />
      </div>


      {loading && <p>Memuat materi...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-4">
          {materials.length > 0 ? (
            materials.map((materi) => (
              <div key={materi.id} className="border-b pb-4 flex justify-between items-center last:border-b-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{materi.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelas: <span className="font-medium">{materi.class.name}</span> |
                    Mapel: <span className="font-medium">{materi.subject.name}</span>
                  </p>
                </div>
                <a
                  href={`http://127.0.0.1:8000/storage/${materi.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600"
                >
                  Download
                </a>
              </div>
            ))
          ) : (
            !loading && <p className="text-gray-500 text-center py-4">Materi tidak ditemukan atau belum tersedia.</p>
          )}
        </div>
      </div>

      {showModal && (
        <FormUploadMateri
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchMaterials();
          }}
        />
      )}
    </Layout>
  );
};

// ... Komponen FormUploadMateri tetap sama ...
const FormUploadMateri = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih file untuk diupload.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('class_id', classId);
    formData.append('subject_id', subjectId);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('http://127.0.0.1:8000/api/materials', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      onSuccess();
    } catch (err) {
      setError('Gagal mengupload materi. Pastikan semua field terisi benar.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Upload Materi Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Judul Materi" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded"/>
          <textarea placeholder="Deskripsi (opsional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded"></textarea>
          <input type="number" placeholder="ID Kelas (contoh: 1)" value={classId} onChange={e => setClassId(e.target.value)} required className="w-full p-2 border rounded"/>
          <input type="number" placeholder="ID Mapel (contoh: 1)" value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full p-2 border rounded"/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File (PDF, DOC, PPT, dll.)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-400">{loading ? 'Mengupload...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default withAuth(MateriPage);

