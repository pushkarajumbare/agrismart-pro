import React, { useState } from 'react';
import { getWeatherData } from '../../services/weatherService';
import { CloudSun, MapPin, Wind, Droplets } from 'lucide-react';

const WeatherCard = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);

    const handleSearch = async () => {
        if(!city) return;
        try {
            const data = await getWeatherData(city);
            setWeather(data);
        } catch (err) {
            alert("City not found!");
        }
    };

    return (
        <div style={{ padding: '20px', borderRadius: '15px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                    placeholder="Enter City (e.g. Mumbai)" 
                    onChange={(e) => setCity(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
                />
                <button onClick={handleSearch} style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>Search</button>
            </div>

            {weather && (
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: '5px 0' }}><MapPin size={18} /> {weather.name}</h3>
                    <h1 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#2d6a4f' }}>{Math.round(weather.main.temp)}°C</h1>
                    <p style={{ textTransform: 'capitalize', color: '#666' }}><CloudSun /> {weather.weather[0].description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <span><Droplets size={16} /> {weather.main.humidity}%</span>
                        <span><Wind size={16} /> {weather.wind.speed} m/s</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCard;