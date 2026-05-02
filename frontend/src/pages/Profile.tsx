import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, ArrowLeft, Plus, Trash2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    id: '', name: '', course: '', student_type: 'hosteller',
    hostel_name: '', semester: '', phone_number: '',
    email: '', registration_number: '', scholarship_amount: '',
    profile_image: '', profile_image_base64: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserId(parsedUser.id);
      
      setFormData({
        id: parsedUser.id,
        name: parsedUser.name || '',
        course: parsedUser.course || '',
        student_type: parsedUser.student_type || 'hosteller',
        hostel_name: parsedUser.hostel_name || '',
        semester: parsedUser.semester || '',
        phone_number: parsedUser.phone_number || '',
        email: parsedUser.email || '',
        registration_number: parsedUser.registration_number || '',
        scholarship_amount: parsedUser.scholarship_amount || '',
        profile_image: parsedUser.profile_image || '',
        profile_image_base64: ''
      });

      axios.get(`http://localhost:5001/api/categories/${parsedUser.id}`)
        .then(res => setCategories(res.data))
        .catch(err => console.error("Failed to fetch categories", err));
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.put(`http://localhost:5001/api/users/${userId}`, formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image_base64: reader.result as string, profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newCategory.name.trim()) return;
    try {
      await axios.post('http://localhost:5001/api/categories', {
        name: newCategory.name,
        type: 'custom',
        user_id: userId
      });
      setNewCategory({ name: '' });
      const res = await axios.get(`http://localhost:5001/api/categories/${userId}`);
      setCategories(res.data);
    } catch (e) { alert('Error creating category'); }
  };

  const handleDeleteCategory = async (catId: number) => {
    if(!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/categories/${catId}`);
      const res = await axios.get(`http://localhost:5001/api/categories/${userId}`);
      setCategories(res.data);
    } catch (e) { alert('Failed to delete category'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-gradient">My Profile</h1>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--danger)' }}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '30px' }}>
        {message && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
        {/* Profile image preview + Local Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              border: '2px solid var(--glass-border)',
              background: 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative'
            }}>
              {formData.profile_image
                ? <img src={formData.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '2rem' }}>👤</span>
              }
              <div style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.5)', width: '100%', textAlign: 'center', fontSize: '0.6rem', padding: '2px 0', color: 'white' }}>Edit</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                Choose Image
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Select a local photo to upload as your profile picture.</p>
            </div>
          </div>

          <div className="flex-responsive">
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="input-base" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input type="text" className="input-base" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            </div>
          </div>

          <div className="flex-responsive">
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Course</label>
              <input type="text" className="input-base" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Semester</label>
              <input type="number" className="input-base" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Scholarship / Monthly Aid Amount (₹)</label>
              <input type="number" className="input-base" value={formData.scholarship_amount} onChange={e => setFormData({...formData, scholarship_amount: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div className="flex-responsive">
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Student Type</label>
              <select className="input-base" value={formData.student_type} onChange={e => setFormData({...formData, student_type: e.target.value})}>
                <option value="hosteller">Hosteller</option>
                <option value="day_scholar">Day Scholar</option>
              </select>
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hostel Name</label>
              <input type="text" className="input-base" disabled={formData.student_type !== 'hosteller'} value={formData.student_type === 'hosteller' ? formData.hostel_name : ''} onChange={e => setFormData({...formData, hostel_name: e.target.value})} />
            </div>
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
             <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Account Details (Read Only)</h4>
             <div className="flex-responsive">
               <div className="flex-1">
                 <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
                 <input type="text" className="input-base" disabled value={formData.email} />
               </div>
               <div className="flex-1">
                 <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Reg. Number</label>
                 <input type="text" className="input-base" disabled value={formData.registration_number} />
               </div>
             </div>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginTop: '30px' }}>
         <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Custom Categories</h3>
         <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Create your own personalized categories to track spending dynamically across the app.</p>
         
         <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <input type="text" className="input-base" placeholder="Enter custom category name (e.g., Zomato, Lab Supplies)" required value={newCategory.name} onChange={e => setNewCategory({ name: e.target.value })} style={{ flex: 1 }} />
            <button type="submit" className="btn-primary"><Plus size={16}/> Create Category</button>
         </form>

         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {categories.map(c => (
              <div key={c.id} style={{ padding: '8px 16px', background: c.type === 'custom' ? 'var(--accent-gradient)' : 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {c.name} {c.type === 'predefined' && <span style={{opacity:0.5, fontSize:'0.7rem'}}>(Default)</span>}
                  <button onClick={() => handleDeleteCategory(c.id)} style={{background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', padding: 0, display:'flex'}}>
                    <Trash2 size={12} />
                  </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Profile;
