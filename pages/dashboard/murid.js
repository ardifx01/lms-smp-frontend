import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';

// Komponen Ikon
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const MuridDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    axios.get('http://127.0.0.1:8000/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => {
      setDashboardData(response.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout user={user}><p>Memuat data...</p></Layout>;

  return (
    <Layout user={user}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Murid</h1>
      
      {/* Kartu Sambutan */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#00A9FF] p-6 rounded-xl shadow-lg mb-8 text-white">
        <h2 className="text-2xl font-bold">Selamat Datang, {user.name}!</h2>
        <p className="mt-1">Tetap semangat belajar, berikut adalah ringkasan aktivitasmu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tugas Belum Dikumpulkan */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tugas Belum Dikumpulkan</h3>
            <ul className="space-y-3">
              {dashboardData?.pending_assignments?.length > 0 ? (
                dashboardData.pending_assignments.map(tugas => (
                  <li key={tugas.id} className="flex items-center p-3 bg-yellow-100 rounded-md">
                    <div className="mr-3"><ExclamationIcon /></div>
                    <span className="text-yellow-800 font-medium">{tugas.title}</span>
                  </li>
                ))
              ) : (
                <div className="flex items-center p-3 bg-green-100 rounded-md">
                  <div className="mr-3"><CheckCircleIcon /></div>
                  <span className="text-green-800 font-medium">Tidak ada tugas yang perlu dikumpulkan. Kerja bagus!</span>
                </div>
              )}
            </ul>
          </div>
          
          {/* Nilai Terbaru */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nilai Terbaru</h3>
            <ul className="space-y-3">
              {dashboardData?.latest_grades?.length > 0 ? (
                dashboardData.latest_grades.map(nilai => (
                  <li key={nilai.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-700">{nilai.assignment?.title || 'Tugas Dihapus'}</p>
                      <p className="text-sm text-gray-500">Mata Pelajaran: {nilai.assignment?.subject?.name || 'N/A'}</p>
                    </div>
                    <span className="font-bold text-3xl text-[#00A9FF]">{nilai.grade}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Belum ada nilai yang diberikan.</p>
              )}
            </ul>
          </div>
        </div>
    </Layout>
  );
};

export default withAuth(MuridDashboard);

