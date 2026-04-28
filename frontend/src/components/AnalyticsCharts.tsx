import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, IndianRupee, Lightbulb } from 'lucide-react';

const COLORS = ['#8C82FC', '#4DB6AC', '#FF8A65', '#9575CD', '#F06292', '#81C784', '#64B5F6'];

interface AnalyticsProps {
  userId: number;
  refreshKey?: number;
}

const AnalyticsCharts: React.FC<AnalyticsProps> = ({ userId, refreshKey }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, refreshKey]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/analytics/${userId}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return null;

  const chartData = Object.keys(data.categoryBreakdown).map(key => ({
    name: key,
    value: data.categoryBreakdown[key]
  }));

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="flex-responsive" style={{ gap: '24px' }}>
        
        {/* Totals & Insights Panel */}
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', background: 'var(--accent-gradient)' }}>
            <h3 style={{ color: '#fff', marginBottom: '8px', opacity: 0.9 }}>Available Balance</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={32} /> {data.totals.balance.toFixed(2)}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', color: '#fff' }}>
              <div style={{ opacity: 0.8 }}>Income: +₹{data.totals.income.toFixed(2)}</div>
              <div style={{ opacity: 0.8 }}>Expenses: -₹{data.totals.expense.toFixed(2)}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} />
              UoH Smart Insights
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Because you are registered as a <strong>{data.insights.student_type}</strong>, we analyzed your categorized spending:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data.insights.messages || []).map((msg: string, idx: number) => (
                <div key={idx} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-secondary)' }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Panel */}
        <div className="flex-1 glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> Expense Breakdown
          </h3>
          {chartData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Log some expenses to see your chart.</p>
          ) : (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`₹${value}`, 'Amount']}
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsCharts;
