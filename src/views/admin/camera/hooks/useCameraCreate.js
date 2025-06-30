import { useState } from 'react';
import api from "../../../../service/api"; 

const useCameraCreate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createCamera = async (cameraData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/Camera', cameraData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setLoading(false);
                return { success: true, error: null };
            }
            // Handle cases where API returns success: false
            const errorMessage = response.data.error || 'Failed to create camera.';
            setError(errorMessage);
            setLoading(false);
            return { success: false, error: errorMessage };
        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    return { createCamera, loading, error };
};

export default useCameraCreate;