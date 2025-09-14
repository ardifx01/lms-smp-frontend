import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Ini adalah "Higher-Order Component" (HOC).
// Tugasnya adalah "membungkus" komponen halaman lain untuk memberikan
// fungsionalitas tambahan, yaitu pengecekan status login.

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user_data');

      // Jika tidak ada token atau data user di browser,
      // paksa kembali ke halaman login.
      if (!token || !user) {
        router.replace('/login');
      } else {
        // Jika ada, simpan data user dan izinkan akses.
        setUserData(JSON.parse(user));
        setLoading(false);
      }
    }, []);

    // Sambil menunggu proses pengecekan, tampilkan pesan loading.
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <p className="text-lg text-gray-600">Memverifikasi sesi Anda...</p>
        </div>
      );
    }

    // Jika sudah terverifikasi, tampilkan halaman yang diminta.
    // Kita juga "mengoper" data user ke halaman tersebut sebagai props.
    return <WrappedComponent {...props} user={userData} />;
  };
};

export default withAuth;

