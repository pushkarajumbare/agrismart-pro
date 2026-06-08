import React, { useState } from 'react';
import axios from 'axios';
import { Sprout, Award } from 'lucide-react';

const CropAdvisor = () => {
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState([]);

    const getRecommendations = async () => {
        setLoading(true);
        try {
            // ✅ Formatted payload data structure mapping back to Python rules
            const payload = {
                soil: { 
                    nitrogen: 65, 
                    phosphorus: 45, 
                    potassium: 60, 
                    moisture: 35 
                },
                weather: { 
                    temp: 24, 
                    humidity: 55 
                }
            };

            // Pointing to your Node.js endpoint acting as the API gateway route
            const response = await axios.post('http://localhost:5000/api/recommendations', payload);
            
            if (response.data && response.data.best_crops) {
                setCrops(response.data.best_crops);
            } else {
                alert("The AI server evaluated parameters successfully but found no high-yield matching crops.");
            }
        } catch (error) {
            console.error("Advisor request structural failure logged:", error);
            setCrops([
                {
                    name: 'Legumes (Beans)',
                    suitability: '82%',
                    reason: 'Offline fallback: resilient crop choice while the AI engine reconnects.'
                },
                {
                    name: 'Wheat',
                    suitability: '75%',
                    reason: 'Offline fallback: stable option for moderate soil and weather conditions.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '14px', color: '#666', marginTop: 0 }}>
                Synthesize NPK soil matrix readings with live atmospheric variables to compute high-yield agricultural recommendations.
            </p>

            <button
                onClick={getRecommendations}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#888' : '#1b4332',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <Sprout size={18} />
                {loading ? "Calculating Crop Yield Match..." : "⚡ Generate Crop Recommendations"}
            </button>

            {crops.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d6a4f', textTransform: 'uppercase' }}>
                        💡 Best options for current conditions:
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        {crops.map((crop, idx) => (
                            <div key={idx} style={{ padding: '12px', border: '1px solid #e1e8e5', borderRadius: '8px', background: '#fcfdfd', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ background: '#e8f5e9', padding: '6px', borderRadius: '50%' }}>
                                    <Award size={18} color="#2d6a4f" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '15px', color: '#1b4332' }}>{crop.name}</strong>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d6a4f', background: '#e8f5e9', padding: '2px 8px', borderRadius: '12px' }}>
                                            {crop.suitability} Match
                                        </span>
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                                        {crop.reason}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropAdvisor;
