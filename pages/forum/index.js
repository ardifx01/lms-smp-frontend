import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';
import Link from 'next/link';

const ForumPage = ({ user }) => {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8000/api/forums', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setForums(response.data);
    } catch (err) {
      setError('Gagal mengambil data forum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  return (
    <Layout user={user}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Forum Diskusi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
        >
          + Mulai Topik Baru
        </button>
      </div>

      {loading && <p>Memuat daftar diskusi...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-2">
          {forums.length > 0 ? (
            forums.map((forum) => (
              <Link key={forum.id} href={`/forum/${forum.id}`} className="block p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{forum.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Dimulai oleh <span className="font-medium">{forum.creator.name}</span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <p>{forum.comments.length} Komentar</p>
                    <p>{new Date(forum.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            !loading && <p className="text-gray-500 text-center py-4">Belum ada topik diskusi. Jadilah yang pertama!</p>
          )}
        </div>
      </div>

      {showModal && (
        <FormBuatTopik
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchForums();
          }}
        />
      )}
    </Layout>
  );
};

const FormBuatTopik = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post('http://127.0.0.1:8000/api/forums', 
              { title, body }, 
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            onSuccess();
        } catch (err) {
            setError('Gagal membuat topik. Pastikan judul dan isi tidak kosong.');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Mulai Topik Diskusi Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Judul Topik" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded"/>
                    <textarea placeholder="Apa yang ingin Anda diskusikan?" value={body} onChange={e => setBody(e.target.value)} required className="w-full p-2 border rounded h-32"></textarea>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-400">{loading ? 'Menyimpan...' : 'Mulai Diskusi'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default withAuth(ForumPage);
