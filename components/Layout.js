import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Impor komponen Image dari Next.js

const Layout = ({ user, children }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.replace('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: `/dashboard/${user.role}` },
    { name: 'Materi', path: '/materi' },
    { name: 'Tugas', path: '/tugas' },
    { name: 'Nilai', path: '/nilai' },
    { name: 'Forum', path: '/forum' },
    { name: 'Profil', path: '/profil' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar untuk Navigasi */}
      {/* Warna diubah menjadi biru tua sesuai logo */}
      <aside className="w-64 bg-[#0F172A] text-gray-300 p-5 hidden md:flex flex-col">
        <div className="flex items-center justify-center mb-10">
          {/* Ganti teks dengan komponen Image */}
          <Image
            src="/logoo.png" // Path ke logo di folder public
            alt="Logo SMP Digital"
            width={150} // Sesuaikan ukurannya
            height={150}
          />
        </div>
        <nav className="flex-1">
          <ul>
            {navLinks.map((link) => (
              <li key={link.name} className="mb-3">
                <Link
                  href={link.path}
                  className={`block p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors ${
                    // Warna link aktif diubah menjadi biru muda
                    router.pathname.startsWith(link.path) ? 'bg-[#00A9FF] text-white' : ''
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 capitalize">{user.role} View</h1>
          <div>
            <span className="text-gray-700 mr-4">Halo, {user.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

