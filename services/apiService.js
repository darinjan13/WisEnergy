import axios from "axios"

const api = axios.create({
    baseURL: 'https://wisenergy-backend.onrender.com',
    // baseURL: 'http://192.168.1.5:10000',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const predidct_daily = async (userId, deviceId, appliance_name) => {
    try {
        const response = await api.get(`/predict/${userId}/${deviceId}/${appliance_name}`)
        return response.data.predictions;
    } catch (error) {
        return null
    }
}

export const generate_otp = async (email) => {
    try {
        const response = await api.post(`/generate-otp`, {
            email
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
