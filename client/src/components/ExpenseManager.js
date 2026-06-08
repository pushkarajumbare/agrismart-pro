import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Tag, PlusCircle, Trash2 } from 'lucide-react';

const ExpenseManager = ({ expenses: savedExpenses = [], onExpensesChange }) => {
    const [expenses, setExpenses] = useState(savedExpenses);

    useEffect(() => {
        setExpenses(savedExpenses);
    }, [savedExpenses]);

    const updateExpenses = (nextExpenses) => {
        setExpenses(nextExpenses);
        if (onExpensesChange) {
            onExpensesChange(nextExpenses);
        }
    };

    // Form States
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('Fertilizers');
    const [newAmount, setNewAmount] = useState('');
    const [newMonth, setNewMonth] = useState('Jan');
    const [newBudget, setNewBudget] = useState('');

    // 2. Handle Form Submission
    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newItem || !newAmount) return alert("Please fill out the item name and amount!");

        const addedItem = {
            id: Date.now(), // Unique ID
            item: newItem,
            category: newCategory,
            amount: parseFloat(newAmount),
            month: newMonth,
            budgetLimit: newBudget ? parseFloat(newBudget) : parseFloat(newAmount) * 1.2, // Default fallback limit
            location: 'Main Farm Field',
            date: new Date().toLocaleDateString()
        };

        updateExpenses([addedItem, ...expenses]);
        
        // Reset only the name and amount text inputs
        setNewItem('');
        setNewAmount('');
        setNewBudget('');
    };

    // 3. Handle Delete Item
    const handleDeleteExpense = (id) => {
        updateExpenses(expenses.filter(exp => exp.id !== id));
    };

    // 4. Calculations Logic
    const stats = useMemo(() => {
        let total = 0;
        let highestItem = { item: 'None', amount: 0 };
        const categoryMap = {};
        const monthlyMap = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0 }; // Pre-load months for consistency
        const warnings = [];

        expenses.forEach(exp => {
            const amount = Number(exp.amount) || 0;
            total += amount;

            if (amount > highestItem.amount) {
                highestItem = { ...exp, amount };
            }

            const category = exp.category || 'General';
            const month = exp.month || 'Jan';
            const budgetLimit = Number(exp.budgetLimit) || amount * 1.2;

            categoryMap[category] = (categoryMap[category] || 0) + amount;
            monthlyMap[month] = (monthlyMap[month] || 0) + amount;

            if (amount > budgetLimit) {
                warnings.push(`⚠ ${exp.item} cost (₹${exp.amount}) exceeded budget limit of ₹${exp.budgetLimit}!`);
            }
        });

        const chartData = Object.keys(monthlyMap).map(month => ({
            name: month,
            Spending: monthlyMap[month]
        })).filter(item => item.Spending > 0 || ['Jan', 'Feb', 'Mar'].includes(item.name)); // keeps view clean

        return { total, highestItem, categoryMap, chartData, warnings };
    }, [expenses]);

    return (
        <div style={{ padding: '25px', background: '#f4f7f6', borderRadius: '16px', margin: '20px 0', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2d6a4f', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 AgriSmart Farm Expense Tracker
            </h2>

            {/* --- 1. ADD NEW EXPENSE FORM --- */}
            <form onSubmit={handleAddExpense} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PlusCircle size={18} color="#2d6a4f"/> Add New Farm Record
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Item Name</label>
                        <input type="text" placeholder="e.g. Bio-Pesticide" value={newItem} onChange={e => setNewItem(e.target.value)} style={{ width: '90%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ minWidth: '130px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Category</label>
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}>
                            <option>Fertilizers</option>
                            <option>Seeds</option>
                            <option>Equipment</option>
                            <option>Pesticides</option>
                            <option>Fuel</option>
                        </select>
                    </div>

                    <div style={{ width: '110px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                        <input type="number" placeholder="4500" value={newAmount} onChange={e => setNewAmount(e.target.value)} style={{ width: '90%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ width: '110px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Budget Limit (₹)</label>
                        <input type="number" placeholder="4000" value={newBudget} onChange={e => setNewBudget(e.target.value)} style={{ width: '90%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ width: '90px' }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Month</label>
                        <select value={newMonth} onChange={e => setNewMonth(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}>
                            <option>Jan</option><option>Feb</option><option>Mar</option>
                            <option>Apr</option><option>May</option><option>Jun</option>
                        </select>
                    </div>

                    <button type="submit" style={{ background: '#2d6a4f', color: 'white', border: 'none', padding: '11px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Add Entry
                    </button>
                </div>
            </form>

            {/* --- 2. ALERT TRACKER --- */}
            {stats.warnings.length > 0 && (
                <div style={{ background: '#fff3cd', borderLeft: '5px solid #ffc107', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#856404', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={20} /> Smart Budget Warning System
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '14px' }}>
                        {stats.warnings.map((warn, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{warn}</li>)}
                    </ul>
                </div>
            )}

            {/* --- 3. DASHBOARD METRICS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} color="#2d6a4f"/> Total Seasonal Investment</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2d6a4f', marginTop: '6px' }}>₹{stats.total}</div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} color="#dc3545"/> Most Expensive Purchase</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.highestItem.item}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>₹{stats.highestItem.amount}</div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={16} color="#495057"/> Heavy Sector</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#495057', marginTop: '6px' }}>
                        {Object.keys(stats.categoryMap).length > 0 ? Object.keys(stats.categoryMap).reduce((a, b) => stats.categoryMap[a] > stats.categoryMap[b] ? a : b) : 'None'}
                    </div>
                </div>
            </div>

            {/* --- 4. DATA VISUALIZATIONS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} color="#2d6a4f"/> Monthly History</h4>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`₹${value}`, 'Spending']} />
                                <Bar dataKey="Spending" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Sector Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {Object.entries(stats.categoryMap).map(([category, val]) => (
                            <div key={category}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                    <span style={{ color: '#555' }}>{category}</span>
                                    <span style={{ fontWeight: 'bold', color: '#2d6a4f' }}>₹{val}</span>
                                </div>
                                <div style={{ width: '100%', height: '7px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${stats.total > 0 ? (val / stats.total) * 100 : 0}%`, height: '100%', background: '#2d6a4f' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 5. LOG ENTRY HISTORY TABLE (With Delete Option) --- */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Detailed Records Log</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                                <th style={{ padding: '10px' }}>Item</th>
                                <th style={{ padding: '10px' }}>Category</th>
                                <th style={{ padding: '10px' }}>Month</th>
                                <th style={{ padding: '10px' }}>Cost</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '18px 10px', color: '#888', textAlign: 'center' }}>
                                        No expense records saved for this account yet.
                                    </td>
                                </tr>
                            )}
                            {expenses.map((exp) => (
                                <tr key={exp.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>{exp.item}</td>
                                    <td style={{ padding: '12px 10px' }}><span style={{ background: '#f0f4f1', color: '#2d6a4f', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>{exp.category || 'General'}</span></td>
                                    <td style={{ padding: '12px 10px', color: '#666' }}>{exp.month || 'Jan'}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 'bold', color: exp.amount > exp.budgetLimit ? '#dc3545' : '#333' }}>₹{exp.amount}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#dc3545'} onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ExpenseManager;
