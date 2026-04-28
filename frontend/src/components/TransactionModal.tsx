import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  transactionToEdit?: any;
  onSuccess: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, userId, transactionToEdit, onSuccess }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    transaction_type: 'expense',
    category_id: '',
    source_or_description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });
  const [loading, setLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setBalanceError('');
      if (transactionToEdit) {
        setFormData({
          amount: transactionToEdit.amount,
          transaction_type: transactionToEdit.transaction_type,
          category_id: transactionToEdit.category_id || '',
          source_or_description: transactionToEdit.source_or_description || '',
          date: transactionToEdit.date,
          payment_method: transactionToEdit.payment_method || ''
        });
      } else {
        setFormData({
          amount: '',
          transaction_type: 'expense',
          category_id: '',
          source_or_description: '',
          date: new Date().toISOString().split('T')[0],
          payment_method: ''
        });
      }
    }
  }, [isOpen, transactionToEdit]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/categories/${userId}`);
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError('');
    setLoading(true);
    try {
      // Balance guard — only block NEW expense submissions
      if (formData.transaction_type === 'expense' && !transactionToEdit) {
        const analyticsRes = await axios.get(`http://localhost:5001/api/analytics/${userId}`);
        const currentBalance = analyticsRes.data.totals.balance;
        if (parseFloat(formData.amount) > currentBalance) {
          setBalanceError(`Insufficient balance! Available: ₹${currentBalance.toFixed(2)}, You entered: ₹${parseFloat(formData.amount).toFixed(2)}`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        user_id: userId,
        category_id: formData.category_id || null
      };

      if (transactionToEdit) {
        await axios.put(`http://localhost:5001/api/transactions/${transactionToEdit.id}`, payload);
      } else {
        await axios.post('http://localhost:5001/api/transactions', payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Sticky header — X is always visible */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0 24px', flexShrink: 0 }}>
          <h2 className="text-gradient" style={{ margin: 0 }}>
            {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div style={{ padding: '20px 24px 24px 24px', overflowY: 'auto', flex: 1 }}>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-responsive">
             <button type="button" 
               className="btn-primary flex-1" 
               style={{ background: formData.transaction_type === 'expense' ? 'var(--danger)' : 'var(--bg-secondary)' }}
               onClick={() => setFormData({...formData, transaction_type: 'expense'})}>Expense</button>
             <button type="button" 
               className="btn-primary flex-1" 
               style={{ background: formData.transaction_type === 'income' ? 'var(--success)' : 'var(--bg-secondary)' }}
               onClick={() => setFormData({...formData, transaction_type: 'income'})}>Income</button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Amount (₹)</label>
            <input type="number" step="0.01" className="input-base" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
            <select className="input-base" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
              <option value="">None (General Income)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description / Source</label>
            <input type="text" className="input-base" required value={formData.source_or_description} onChange={e => setFormData({...formData, source_or_description: e.target.value})} />
          </div>

          <div className="flex-responsive">
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" className="input-base" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Payment Method</label>
              <input type="text" className="input-base" placeholder="e.g. UPI, Cash" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} />
            </div>
          </div>

          {balanceError && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#f87171',
              fontSize: '0.88rem',
              fontWeight: 500
            }}>
              ⚠️ {balanceError}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
        </div> {/* end scrollable body */}
      </div>
    </div>
  );
};

export default TransactionModal;
