import axios from "axios"

const api = axios.create({
    // baseURL: 'https://wisenergy-backend.onrender.com',
    baseURL: 'http://192.168.1.8:10000',
    // baseURL: 'http://192.168.0.113:10000',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const register_push_token = async (uid, token) => {
    try {
        const response = await api.post(`/register-token`, { uid, token });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("❌ Failed to register push token:", error.message);
        return { success: false, message: error.response?.data?.detail || "Error saving token" };
    }
};

export const daily_ai_insights = async (userId, date) => {
    try {
        const response = await api.get(`/generate-recommendations/${userId}/${date}`)
        return response.data
    } catch (error) {
        return null
    }
}

export const predict_usage = async (userId, deviceId, applianceName) => {
    try {
        const response = await api.get(`/predict/${userId}/${deviceId}/${applianceName}`);
        const { daily, weekly } = response.data || {};

        // Transform daily (object -> array with label/value)
        const dailyPredictions = daily
            ? Object.entries(daily).map(([date, obj]) => ({
                date,                          // full date
                label: date.slice(5),          // e.g. "08-26"
                value: Number(obj.predicted_kWh.toFixed(2)),
            }))
            : [];

        // Transform weekly (array -> array with label/value)
        const weeklyPredictions = weekly
            ? weekly.map((w) => {
                const { year, month, week, data } = w;
                return {
                    weekKey: `W${week} (${month}/${year})`, // readable key
                    label: `W${week}-${month}`,                      // shorter chart label
                    value: Number(data.predicted_kWh.toFixed(2)),
                    timestamp: data.timestamp,
                };
            })
            : [];

        return {
            daily: dailyPredictions,
            weekly: weeklyPredictions,
        };
    } catch (error) {
        return null
    }
};

export const predict_totals = async (userId) => {
    try {
        const response = await api.get(`/predict/totals/${userId}`);
        const { daily, weekly } = response.data || {};

        // ---------- DAILY TOTALS ----------
        const dailyPredictions = daily
            ? Object.entries(daily).map(([date, obj]) => ({
                date,
                label: date.slice(5),
                value: Number(obj.predicted_kWh?.toFixed(2) || 0),
            }))
            : [];

        // ---------- WEEKLY TOTALS ----------
        const weeklyPredictions = weekly
            ? weekly.map((w) => {
                const { year, month, week, data } = w;
                return {
                    weekKey: `W${week} (${month}/${year})`,
                    label: `W${week}-${month}`, // 👈 add month suffix to make unique
                    value: Number(data.predicted_kWh?.toFixed(2) || 0),
                    timestamp: data.timestamp || null,
                };
            })
            : [];
        console.log("Weekly: ", weeklyPredictions);

        return {
            daily: dailyPredictions,
            weekly: weeklyPredictions,
        };
    } catch (error) {
        console.error("Error fetching total predictions:", error);
        return null;
    }
};


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

export const verify_otp = async (email, code) => {
    try {
        const response = await api.post(`/verify-otp`, {
            email,
            code
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || "OTP verification failed"
        };
    }
};

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
