import axios from 'axios';

const API_URL = 'http://localhost:5000/api/weather'; // ✅ Points to YOUR server

export const getWeatherData = async (city) => {
    try {
        const response = await axios.get(`${API_URL}/${city}`);
        return response.data;
    } catch (error) {
        throw error; // This triggers the "City not found" alert in your Card
    }
};