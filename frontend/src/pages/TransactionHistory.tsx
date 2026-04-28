import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IndianRupee, ArrowLeft, Filter, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const TransactionHistory: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchData(parsedUser.id, false);
    }
  }, []);

  const fetchData = async (userId: number, includeDeleted: boolean) => {
    try {
      setLoadingToggle(true);
      const [txRes, catRes] = await Promise.all([
        // Active-only endpoint vs audit/all endpoint
        includeDeleted
          ? axios.get(`http://localhost:5001/api/reports/${userId}`)
          : axios.get(`http://localhost:5001/api/transactions/${userId}`),
        axios.get(`http://localhost:5001/api/categories/${userId}`)
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleToggleDeleted = () => {
    const next = !showDeleted;
    setShowDeleted(next);
    if (user) fetchData(user.id, next);
  };

  const getFilteredAndSortedTransactions = () => {
    let result = [...transactions];

    // If showing deleted, we can optionally keep or hide deleted based on their deleted_at
    // Already controlled by the API endpoint, but we still apply other filters
    if (filterType !== 'all') {
      result = result.filter(t => t.transaction_type === filterType);
    }
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category_id?.toString() === filterCategory);
    }
    if (startDate) {
      result = result.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(t => new Date(t.date) <= new Date(endDate));
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  };

  const displayedTransactions = getFilteredAndSortedTransactions();
  const deletedCount = displayedTransactions.filter(t => t.deleted_at !== null).length;
  const activeCount = displayedTransactions.filter(t => t.deleted_at === null).length;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Transaction History${showDeleted ? ' (including deleted)' : ''}`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  ${activeCount} active${showDeleted ? `, ${deletedCount} deleted` : ''}`, 14, 22);
    const tableColumn = ["Date", "Description", "Category", "Type", "Amount", ...(showDeleted ? ["Status"] : [])];
    const tableRows: any[] = [];
    displayedTransactions.forEach(t => {
      const row = [
        new Date(t.date).toLocaleDateString(),
        t.source_or_description || '',
        t.category?.name || 'General',
        t.transaction_type,
        `₹${Number(t.amount).toFixed(2)}`
      ];
      if (showDeleted) row.push(t.deleted_at ? 'Deleted' : 'Active');
      tableRows.push(row);
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 27,
      didParseCell: (data: any) => {
        if (showDeleted && data.column.index === 5 && data.cell.raw === 'Deleted') {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    });
    doc.save("Transaction_History.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(displayedTransactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.source_or_description,
      Category: t.category?.name || 'General',
      Type: t.transaction_type,
      Amount: Number(t.amount).toFixed(2),
      ...(showDeleted ? { Status: t.deleted_at ? 'Deleted' : 'Active' } : {})
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transaction_History.xlsx");
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-gradient">Transaction History</h1>
            {showDeleted && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
                Showing all records — <span style={{ color: 'var(--danger)' }}>{deletedCount} deleted</span> · <span style={{ color: 'var(--success)' }}>{activeCount} active</span>
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Show Deleted Toggle */}
          <button
            onClick={handleToggleDeleted}
            disabled={loadingToggle}
            className="btn-primary"
            style={{
              background: showDeleted ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
              color: showDeleted ? 'var(--danger)' : 'var(--text-secondary)',
              border: showDeleted ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
              fontSize: '0.85rem', padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: loadingToggle ? 0.6 : 1
            }}
          >
            {showDeleted ? <EyeOff size={14} /> : <Eye size={14} />}
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
          <button onClick={exportPDF} className="btn-primary" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', padding: '8px 16px' }}>
            <Download size={14}/> Export PDF
          </button>
          <button onClick={exportExcel} className="btn-primary" style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.85rem', padding: '8px 16px' }}>
            <Download size={14}/> Export Excel
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}><Filter size={14}/> Type</label>
          <select className="input-base" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category</label>
          <select className="input-base" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sort By</label>
          <select className="input-base" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Amount (High to Low)</option>
            <option value="amount_asc">Amount (Low to High)</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>From Date</label>
            <input type="date" className="input-base" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>To Date</label>
            <input type="date" className="input-base" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loadingToggle ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayedTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No transactions match your filters.</p>
            ) : (
              displayedTransactions.map(tx => {
                const isDeleted = tx.deleted_at !== null;
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: '14px', borderBottom: '1px solid var(--glass-border)',
                      opacity: isDeleted ? 0.6 : 1,
                      background: isDeleted ? 'rgba(239,68,68,0.04)' : 'transparent',
                      borderRadius: isDeleted ? 'var(--radius-sm)' : undefined,
                      padding: isDeleted ? '10px 12px' : '0 0 14px 0',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {/* Icon circle */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDeleted ? 'rgba(239,68,68,0.12)' : tx.transaction_type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: isDeleted ? 'var(--danger)' : tx.transaction_type === 'income' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {isDeleted ? <Trash2 size={17} /> : <IndianRupee size={17} />}
                      </div>
                      {/* Details */}
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: isDeleted ? 'line-through' : 'none' }}>
                          {tx.source_or_description || tx.category?.name || 'Transaction'}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{tx.category?.name || 'General'}</span>
                          <span>·</span>
                          <span>{tx.payment_method || 'Cash'}</span>
                          {isDeleted && (
                            <span style={{
                              background: 'rgba(239,68,68,0.15)', color: 'var(--danger)',
                              borderRadius: '20px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700
                            }}>
                              DELETED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Amount */}
                    <div style={{
                      color: isDeleted ? 'var(--text-secondary)' : tx.transaction_type === 'income' ? 'var(--success)' : 'var(--text-primary)',
                      fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '2px',
                      textDecoration: isDeleted ? 'line-through' : 'none'
                    }}>
                      {tx.transaction_type === 'income' ? '+' : '-'} <IndianRupee size={14} />{tx.amount}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
