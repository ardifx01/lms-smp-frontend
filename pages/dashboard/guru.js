import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '../../components/withAuth';
import Layout from '../../components/Layout';

// Komponen Ikon sederhana
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

const GuruDashboard = ({ user }) => {
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Guru</h1>
      
      {/* Kartu Sambutan */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#00A9FF] p-6 rounded-xl shadow-lg mb-8 text-white">
        <h2 className="text-2xl font-bold">Selamat Datang, {user.name}!</h2>
        <p className="mt-1">Berikut adalah ringkasan aktivitas mengajar Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom Kiri untuk Materi & Tugas */}
        <div className="space-y-8">
          {/* Materi Terbaru */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Materi Terbaru</h3>
            <ul className="space-y-3">
              {dashboardData?.latest_materials?.length > 0 ? (
                dashboardData.latest_materials.map(materi => (
                  <li key={materi.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-[#00A9FF] p-2 rounded-lg mr-4"><BookIcon /></div>
                    <span>{materi.title}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Belum ada materi yang diupload.</p>
              )}
            </ul>
          </div>

          {/* Tugas Terbaru */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tugas Terbaru</h3>
            <ul className="space-y-3">
               {dashboardData?.latest_assignments?.length > 0 ? (
                dashboardData.latest_assignments.map(tugas => (
                  <li key={tugas.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-[#0F172A] p-2 rounded-lg mr-4"><ClipboardIcon /></div>
                    <span>{tugas.title}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Belum ada tugas yang dibuat.</p>
              )}
            </ul>
          </div>
        </div>
        
        {/* Kolom Kanan untuk Statistik */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Statistik Mengajar</h3>
            <div className="space-y-4">
                <div className="bg-[#0F172A] p-4 rounded-lg text-white">
                    <p className="font-semibold">Jumlah Kelas Diajar</p>
                    <p className="text-3xl font-bold">{dashboardData?.teaching_class_count || 0}</p>
                </div>
                {dashboardData?.is_homeroom_teacher && (
                    <div className="bg-[#00A9FF] p-4 rounded-lg text-white">
                        <p className="font-semibold">Anda adalah Wali Kelas</p>
                        <p className="text-2xl font-bold">{dashboardData.homeroom_class_name}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(GuruDashboard);

