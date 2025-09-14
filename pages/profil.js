import { useState } from 'react';
import axios from 'axios';
import withAuth from '../components/withAuth';
import Layout from '../components/Layout';

const ProfilPage = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (photo) {
      formData.append('photo', photo);
    }
    // Tambahkan password hanya jika diisi
    if (currentPassword && newPassword) {
      formData.append('current_password', currentPassword);
      formData.append('password', newPassword);
      formData.append('password_confirmation', confirmPassword);
    }
    // Method POST tapi kita "menipu" seolah-olah PUT untuk file upload
    formData.append('_method', 'POST'); 
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('http://127.0.0.1:8000/api/profile', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage(response.data.message);
      // Perbarui data user di localStorage agar header ikut berubah
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      setUser(response.data.user); // Update state lokal
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Saya</h1>
      <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Foto Profil */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <img 
              src={photoPreview || (user.profile_photo_path ? `http://127.0.0.1:8000/storage/${user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name}&background=random`)} 
              alt="Foto Profil" 
              className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-gray-200"
            />
            <label className="cursor-pointer mt-4 inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
              Ubah Foto
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>
        
        {/* Kolom Kanan: Form Biodata & Password */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Informasi Biodata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Alamat Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-md"/>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Ubah Password</h2>
            <div className="space-y-4">
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Password Saat Ini" className="w-full p-2 border rounded-md"/>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password Baru" className="w-full p-2 border rounded-md"/>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Password Baru" className="w-full p-2 border rounded-md"/>
            </div>
          </div>
          
          {/* Tombol Simpan & Pesan Status */}
          <div className="flex items-center justify-end space-x-4">
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default withAuth(ProfilPage);
