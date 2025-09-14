import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import withAuth from '../components/withAuth';
import Layout from '../components/Layout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const NilaiPage = ({ user }) => {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [homeroomClassId, setHomeroomClassId] = useState(null); // State untuk ID kelas

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    axios.get('http://127.0.0.1:8000/api/grades', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => {
      setGrades(response.data);

      // Logika untuk menemukan ID kelas jika user adalah wali kelas
      if (user.role === 'guru' && response.data) {
        const subjects = Object.keys(response.data);
        if (subjects.length > 0) {
          const firstSubjectSubmissions = response.data[subjects[0]];
          if (firstSubjectSubmissions.length > 0) {
            // Ambil class_id dari data submission pertama (semua harusnya dari kelas yang sama)
            const classId = firstSubjectSubmissions[0].assignment.class_id;
            setHomeroomClassId(classId);
          }
        }
      }
      setLoading(false);
    });
  }, [user.role]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Grafik Rata-rata Nilai per Mata Pelajaran' },
    },
  };

  // Fungsi untuk menyiapkan data untuk grafik
  const generateChartData = () => {
    if (!grades) return { labels: [], datasets: [] };
    
    const labels = Object.keys(grades);
    const averageGrades = labels.map(subject => {
        const submissions = grades[subject];
        const total = submissions.reduce((sum, sub) => sum + sub.grade, 0);
        return total / submissions.length;
    });

    return {
        labels,
        datasets: [{
            label: 'Rata-rata Nilai',
            data: averageGrades,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
        }]
    }
  };

  return (
    <Layout user={user}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Rekap Nilai</h1>
        {/* Tombol Ekspor PDF hanya untuk Wali Kelas */}
        {user.role === 'guru' && homeroomClassId && (
          <a 
            href={`http://127.0.0.1:8000/api/export/grades/${homeroomClassId}`} 
            target="_blank" 
            rel="noreferrer"
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 shadow-md transition-colors"
          >
            Export ke PDF
          </a>
        )}
      </div>

      {loading ? <p>Memuat data nilai...</p> : (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <Bar options={chartOptions} data={generateChartData()} />
          </div>
          
          <div className="space-y-6">
            {grades && Object.entries(grades).map(([subject, submissions]) => (
              <div key={subject} className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">{subject}</h2>
                <ul>
                  {submissions.map(sub => (
                    <li key={sub.id} className="flex justify-between items-center border-b py-2 last:border-b-0">
                       {user.role === 'guru' && <span className="w-1/3">{sub.student.name}</span>}
                       <span className={user.role === 'guru' ? 'w-1/3' : 'w-2/3'}>{sub.assignment.title}</span>
                       <span className="font-bold text-lg">{sub.grade}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {Object.keys(grades || {}).length === 0 && (
                <p className="text-center text-gray-500">Belum ada data nilai yang tersedia.</p>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default withAuth(NilaiPage);

