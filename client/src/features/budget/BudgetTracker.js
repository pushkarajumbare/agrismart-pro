import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { DollarSign, PlusCircle, Trash2 } from 'lucide-react';



const BudgetTracker = () => {
    const [expenses, setExpenses] = useState([]);
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch expenses from the backend
    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/budget/all`);
            // Ensure response data is an array before setting state
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setExpenses(data);
        } catch (err) {
            console.error("Error fetching budget:", err);
            setExpenses([]);
        }
    };

    useEffect(() => { 
        fetchExpenses(); 
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!item || !amount) return;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/budget/add`, {
                description: item,
                amount: Number(amount)
            });
            setItem('');
            setAmount('');
            fetchExpenses(); // Refresh the list
        } catch (err) {
            console.error("Error adding budget item:", err);
            alert("Failed to save expense. Make sure your server is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/budget/delete/${id}`);
            fetchExpenses();
        } catch (err) {
            console.error("Error deleting item:", err);
        }
    };

    const total = Array.isArray(expenses) 
        ? expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) 
        : 0;

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1b4332', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign /> Budget Tracker
            </h2>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                <input 
                    placeholder="Expense (e.g. Urea, Seeds)" 
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <input 
                    type="number" 
                    placeholder="Amount" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <PlusCircle color="white" size={20} />
                </button>
            </form>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {expenses.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '10px' }}>No expenses recorded yet.</p>
                ) : (
                    expenses.map((exp, index) => (
                        <div key={exp._id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                            <span>{exp.description}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 'bold' }}>₹{exp.amount}</span>
                                {exp._id && (
                                    <button 
                                        onClick={() => handleDelete(exp._id)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#d90429', padding: '2px' }}
                                        title="Delete expense"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #2d6a4f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Total Spending:</strong>
                <strong style={{ color: '#d90429', fontSize: '1.2rem' }}>₹{total}</strong>
            </div>
        </div>
    );
};

export default BudgetTracker;