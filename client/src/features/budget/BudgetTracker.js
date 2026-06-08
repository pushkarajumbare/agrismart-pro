import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, PlusCircle, Trash2 } from 'lucide-react';

const BudgetTracker = () => {
    const [expenses, setExpenses] = useState([]);
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');

    // Fetch expenses from the MongoDB backend
    const fetchExpenses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/budget/all');
            setExpenses(res.data);
        } catch (err) {
            console.error("Error fetching budget:", err);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!item || !amount) return;

        try {
            await axios.post('http://localhost:5000/api/budget/add', {
                description: item,
                amount: Number(amount)
            });
            setItem('');
            setAmount('');
            fetchExpenses(); // Refresh the list
        } catch (err) {
            alert("Make sure your Server and MongoDB are running!");
        }
    };
const total = Array.isArray(expenses) 
    ? expenses.reduce((acc, curr) => acc + curr.amount, 0) 
    : 0;

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1b4332', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign /> Budget Tracker
            </h2>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                <input 
                    placeholder="Expense (e.g. Urea)" 
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
                <button type="submit" style={{ background: '#2d6a4f', color: '#white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                    <PlusCircle color="white" />
                </button>
            </form>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {expenses.map((exp, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <span>{exp.description}</span>
                        <span style={{ fontWeight: 'bold' }}>₹{exp.amount}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #2d6a4f', display: 'flex', justifyContent: 'space-between' }}>
                <strong>Total Spending:</strong>
                <strong style={{ color: '#d90429', fontSize: '1.2rem' }}>₹{total}</strong>
            </div>
        </div>
    );
};

export default BudgetTracker;