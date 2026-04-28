import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Plus, IndianRupee, Edit2, Trash2, History, User, Settings, Bell, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionModal from '../components/TransactionModal';
import AnalyticsCharts from '../components/AnalyticsCharts';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchTransactions(parsedUser.id);
        fetchNotifications(parsedUser.id);
      } catch (e) {
        handleLogout();
      }
    } else {
      handleLogout();
    }
  }, []);

  const fetchNotifications = async (userId: number) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch(e) {}
  };

  const handleMarkAsRead = async (e: any, id: number) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5001/api/notifications/${id}/read`);
      fetchNotifications(user.id);
    } catch (e) {}
  };

  const fetchTransactions = async (userId: number) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/transactions/${userId}`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5001/api/transactions/${id}`);
        fetchTransactions(user.id);
        setRefreshKey(k => k + 1);
      } catch(e) {
        alert('Failed to delete');
      }
    }
  };

  const openAddModal = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
        <div>
          <h1 className="text-gradient">Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Welcome back, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          
          <button onClick={() => setShowNotifs(!showNotifs)} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', position: 'relative' }}>
            <Bell size={16} />
            {notifications.filter(n => !n.is_read).length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.filter(n => !n.is_read).length}</span>}
          </button>

          {showNotifs && (
            <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '110%', right: '0', width: '300px', zIndex: 100, padding: '16px' }}>
               <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Notifications</h4>
               {notifications.filter(n => !n.is_read).length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You're all caught up!</p> : (
                 <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {notifications.filter(n => !n.is_read).map(n => (
                     <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: n.is_read ? 'none' : '3px solid var(--accent-primary)', fontSize: '0.85rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                       <div>
                         <div style={{fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px'}}>{n.title}</div>
                         <div style={{opacity: 0.8}}>{n.message}</div>
                       </div>
                       {!n.is_read && (
                         <button onClick={(e) => handleMarkAsRead(e, n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                           <X size={14} />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          <button onClick={() => navigate('/history')} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <History size={16} />
            History
          </button>
          <button onClick={() => navigate('/reports')} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <FileText size={16} />
            Reports
          </button>
          <button onClick={() => navigate('/controls')} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <Settings size={16} />
            Controls
          </button>
          <button onClick={() => navigate('/profile')} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <User size={16} />
            Profile
          </button>
          <button onClick={handleLogout} className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Analytics Panel */}
      <AnalyticsCharts userId={user.id} refreshKey={refreshKey} />

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Quick Stats Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Recent Activity</h3>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No transactions found. Add one to get started!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {tx.source_or_description || tx.category?.name || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{tx.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      color: tx.transaction_type === 'income' ? 'var(--success)' : 'var(--text-primary)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {tx.transaction_type === 'income' ? '+' : '-'} <IndianRupee size={14} />{tx.amount}
                    </div>
                    <button onClick={() => openEditModal(tx)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={openAddModal} className="btn-primary" style={{ width: '100%', marginTop: '24px' }}>
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>
      
      {user && (
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userId={user.id} 
          transactionToEdit={selectedTx}
          onSuccess={() => { fetchTransactions(user.id); fetchNotifications(user.id); setRefreshKey(k => k + 1); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
