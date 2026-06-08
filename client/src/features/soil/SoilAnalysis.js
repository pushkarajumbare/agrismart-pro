import React, { useState } from 'react';
import axios from 'axios';
import { Beaker, CheckCircle } from 'lucide-react';

const SoilAnalysis = () => {
    const [formData, setFormData] = useState({ ph: '', nitrogen: '', phosphorus: '', potassium: '' });
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/soil/analyze', formData);
            setResult(res.data.recommendation);
        } catch (err) {
            alert("Error connecting to server!");
        }
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1b4332', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Beaker /> Soil Analysis
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
                <input type="number" placeholder="pH Level" onChange={(e)=>setFormData({...formData, ph: e.target.value})} style={inputStyle}/>
                <input type="number" placeholder="Nitrogen (N)" onChange={(e)=>setFormData({...formData, nitrogen: e.target.value})} style={inputStyle}/>
                <button type="submit" style={{ background: '#2d6a4f', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Analyze Soil
                </button>
            </form>

            {result && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#d8f3dc', borderRadius: '8px', borderLeft: '5px solid #2d6a4f' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={18}/> Recommendation:</strong>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };

export default SoilAnalysis;