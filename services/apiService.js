import axios from "axios"

const api = axios.create({
    // baseURL: 'https://wisenergy-backend.onrender.com',
    baseURL: 'http://192.168.1.7:10000',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const daily_ai_insights = async (userId, date) => {
    try {
        const response = await api.get(`/generate-recommendations/${userId}/${date}`)
        return response.data
    } catch (error) {
        return null
    }
}

export const predidct_daily = async (userId, deviceId, appliance_name) => {
    try {
        const response = await api.get(`/predict/${userId}/${deviceId}/${appliance_name}`)
        return response.data.predictions;
    } catch (error) {
        return null
    }
}

export const generate_otp = async (email, userVerification) => {
    try {
        const response = await api.post(`/generate-otp`, {
            email, userVerification
        })
        return { success: true, message: response.data.message };
    } catch (error) {
        return { success: false, message: error.response.data.detail };
    }
}

export const reset_password = async (email, password) => {
    try {
        const response = await api.post(`/reset-password`, {
            email,
            new_password: password
        })
        return { success: true, message: response.data.message }
    } catch (error) {
        return { success: false, message: error.response.data.detail };
    }
}
