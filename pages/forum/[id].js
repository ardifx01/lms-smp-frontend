import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';

const DetailForumPage = ({ user }) => {
  const router = useRouter();
  const { id: forumId } = router.query;

  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form komentar
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(''); // <-- STATE BARU UNTUK ERROR KOMENTAR

  const fetchForumDetail = async () => {
    if (!forumId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/forums/${forumId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setForum(response.data);
    } catch (err) {
      setError('Gagal mengambil detail forum. Pastikan URL benar dan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) { // Pastikan router sudah siap sebelum fetch data
        fetchForumDetail();
    }
  }, [router.isReady, forumId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setCommentError(''); // <-- Hapus error lama saat submit baru

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`http://127.0.0.1:8000/api/forums/${forumId}/comments`, 
        { body: newComment }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNewComment('');
      fetchForumDetail(); // Ambil ulang data untuk menampilkan komentar baru
    } catch (err) {
      // --- PERBAIKAN DI SINI ---
      // Ganti alert() dengan state error
      setCommentError('Gagal mengirim komentar. Coba lagi.');
      console.error("Comment submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Layout user={user}><p>Memuat diskusi...</p></Layout>;
  if (error) return <Layout user={user}><p className="text-red-500">{error}</p></Layout>;

  return (
    <Layout user={user}>
      {forum && (
        <div>
          {/* Topik Utama */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{forum.title}</h1>
            <p className="text-sm text-gray-500 mt-2">
              Oleh <span className="font-medium">{forum.creator.name}</span> pada {new Date(forum.created_at).toLocaleString('id-ID')}
            </p>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{forum.body}</p>
          </div>

          {/* Daftar Komentar */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Komentar ({forum.comments.length})</h2>
          <div className="space-y-4">
            {forum.comments.map(comment => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">{comment.body}</p>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  - <span className="font-semibold">{comment.creator.name}</span>, {new Date(comment.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            ))}
             {forum.comments.length === 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-center text-gray-500">Jadilah yang pertama berkomentar!</p>
                </div>
             )}
          </div>

          {/* Form Tambah Komentar */}
          <div className="mt-8">
            <form onSubmit={handleCommentSubmit} className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-semibold mb-2">Tinggalkan Komentar</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis balasan Anda di sini..."
                required
                className="w-full p-2 border rounded h-24"
              />
              {/* --- TAMPILKAN ERROR DI SINI --- */}
              {commentError && <p className="text-sm text-red-600 mt-2">{commentError}</p>}
              <div className="text-right mt-2">
                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                  {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default withAuth(DetailForumPage);

