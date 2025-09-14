import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';

const DetailTugasPage = ({ user }) => {
  const router = useRouter();
  const { id: assignmentId } = router.query; // Ambil ID tugas dari URL

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk modal penilaian
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Fungsi untuk mengambil data detail tugas & submission dari backend
  const fetchAssignmentDetail = async () => {
    if (!assignmentId) return; // Jangan fetch jika ID belum siap
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/assignments/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAssignment(response.data);
    } catch (err) {
      setError('Gagal mengambil detail tugas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetail();
  }, [assignmentId]); // Jalankan ulang jika ID dari URL berubah

  const handleOpenGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setShowGradeModal(true);
  };

  return (
    <Layout user={user}>
      {loading && <p>Memuat detail tugas...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {assignment && (
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{assignment.title}</h1>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
          <hr className="my-6" />

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Pengumpulan</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="space-y-4">
              {assignment.submissions?.length > 0 ? (
                assignment.submissions.map(submission => (
                  <div key={submission.id} className="border-b pb-4 flex justify-between items-center last:border-b-0">
                    <div>
                      <p className="font-semibold text-lg">{submission.student.name}</p>
                      <a 
                        href={`http://127.0.0.1:8000/storage/${submission.file_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Download Jawaban
                      </a>
                    </div>
                    {submission.grade ? (
                      <div className="text-center">
                          <p className="text-sm text-gray-500">Nilai</p>
                          <p className="font-bold text-2xl text-green-600">{submission.grade}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenGradeModal(submission)}
                        className="bg-green-500 text-white px-4 py-1 rounded-full text-sm hover:bg-green-600"
                      >
                        Beri Nilai
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada murid yang mengumpulkan tugas ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Memberi Nilai */}
      {showGradeModal && selectedSubmission && (
        <FormBeriNilai
          submission={selectedSubmission}
          onClose={() => setShowGradeModal(false)}
          onSuccess={() => {
            setShowGradeModal(false);
            fetchAssignmentDetail(); // Ambil ulang data untuk update nilai
          }}
        />
      )}
    </Layout>
  );
};

// Komponen Form untuk Memberi Nilai
const FormBeriNilai = ({ submission, onClose, onSuccess }) => {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`http://127.0.0.1:8000/api/submissions/${submission.id}`, {
                grade,
                feedback,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            onSuccess();
        } catch (err) {
            setError('Gagal menyimpan nilai.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-2">Beri Nilai</h2>
                <p className="text-gray-600 mb-6">Untuk: <span className="font-semibold">{submission.student.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="number" min="0" max="100" placeholder="Nilai (0-100)" value={grade} onChange={e => setGrade(e.target.value)} required className="w-full p-2 border rounded"/>
                    <textarea placeholder="Feedback (opsional)" value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-2 border rounded h-24"></textarea>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-400">{loading ? 'Menyimpan...' : 'Simpan Nilai'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default withAuth(DetailTugasPage);
