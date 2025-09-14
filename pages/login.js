import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
// Komponen 'Image' dari Next.js dihapus untuk sementara untuk mengatasi error kompilasi.
// Kita akan menggunakan tag <img> standar.

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: email,
        password: password,
      });

      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      if (userRole === 'guru') {
        router.replace('/dashboard/guru');
      } else if (userRole === 'murid') {
        router.replace('/dashboard/murid');
      } else {
        setError('Peran pengguna tidak dikenali.');
      }

    } catch (err) {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        {/* Menggunakan tag <img> standar */}
        <div className="flex justify-center">
          <img
            src="/logoo.png"
            alt="Logo SMP Digital"
            style={{ width: '180px', height: 'auto' }} // Ukuran diatur dengan style
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang Kembali
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Silakan masuk ke akun Anda
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-[#00A9FF] focus:border-[#00A9FF]"
              placeholder="anda@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-[#00A9FF] focus:border-[#00A9FF]"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-[#0F172A] rounded-md shadow-sm hover:bg-gray-800 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A9FF]"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

