import { useState, useEffect } from 'react';
import api from "../../../../service/api";

const useCameraUpdate = (cameraId) => {
    const [camera, setCamera] = useState(null);
    const [loading, setLoading] = useState(true); // For initial fetch
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); // For update action

    useEffect(() => {
        const fetchCamera = async () => {
            try {
                const response = await api.get(`/Camera/${cameraId}`);
                setCamera(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching camera details:", err);
                setError(err.response?.data?.error || err.message || 'Failed to fetch camera details');
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchCamera();
        }
    }, [cameraId]);

    const updateCamera = async (formData) => {
        setIsUpdating(true);
        setError(null);
        try {
            const response = await api.put(`/Camera/${formData.id}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                return { success: true, error: null };
            } else {
                const errorMessage = response.data.error || 'Failed to update camera.';
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsUpdating(false);
        }
    };

    return { camera, loading, error, isUpdating, updateCamera };
};

export default useCameraUpdate;
