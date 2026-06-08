import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import axios from 'axios';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello. I am AgriSmart Assistant. Send a leaf scan, soil profile, weather condition, or expense concern and I will return a field action plan.' }
    ]);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await axios.post('http://localhost:5000/api/chat', { message: input });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: `## 🌾 Field Crop Diagnostic Matrix
- **Current Assessment:** The AI service is reconnecting, so use a conservative field protocol until live analysis returns.
- **Risk Evaluation:** Medium operational risk from incomplete telemetry. Avoid full-plot treatment until symptoms or soil values are confirmed.

## 💡 Tactical Action Plan (Step-by-Step)
1. **Immediate Remedy:** Inspect 10 plants across the plot and isolate infected foliage from healthy canopy zones.
2. **Resource Treatment:** If fungal spots are visible, prune infected lower leaves and apply copper-based fungicide at 2 g/L of water to affected blocks only.
3. **Preventative Controls:** Keep foliage dry, use drip irrigation, improve airflow, and retry AI analysis once services reconnect.

## 📊 Financial & Resource Impact
- Use manual sanitation and spot treatment first to protect the Expense Ledger from unnecessary ₹ spending.` }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            {!isOpen ? (
                <button onClick={() => setIsOpen(true)} style={{ background: '#2d6a4f', color: 'white', borderRadius: '50%', width: '60px', height: '60px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={30} />
                </button>
            ) : (
                <div style={{ width: '350px', height: '450px', background: 'white', border: '1px solid #ddd', borderRadius: '15px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ background: '#2d6a4f', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={20} />
                            <strong>AgriSmart Assistant</strong>
                        </div>
                        <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <div style={{ background: m.role === 'user' ? '#2d6a4f' : '#fff', color: m.role === 'user' ? '#fff' : '#333', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: m.role === 'bot' ? '1px solid #eee' : 'none', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '15px', display: 'flex', gap: '8px', borderTop: '1px solid #eee' }}>
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about farming..." 
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} 
                        />
                        <button onClick={sendMessage} style={{ background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
