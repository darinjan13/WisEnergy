import axios from "axios"

const api = axios.create({
    baseURL: 'https://wisenergy-backend.onrender.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const predidct_daily = async (userId, deviceId, appliance_name) => {
    try {
        const response = await api.get(`/predict/${userId}/${deviceId}/${appliance_name}`)
        return Number(response.data);
    } catch (error) {
        return null
    }
}