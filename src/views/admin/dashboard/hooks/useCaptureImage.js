// hooks/useCaptureImage.js
import { useState } from "react";
import api from "../../../../service/api";

export const useCaptureImage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const captureImage = async (cameraId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/Camera/Capture`, {
                cameraid: cameraId
            });
            return response.data.success; 
        } catch (err) {
            setError(err);
            return false; 
        } finally {
            setLoading(false);
        }
    };
    return { captureImage, loading, error };
};
