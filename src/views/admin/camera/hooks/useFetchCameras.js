import { useState, useEffect } from 'react';
import api from "../../../../service/api";

const useFetchCameras = () => {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchCameras = async () => {
        setLoading(true);
        try {
            const response = await api.get('/Camera/GetCameraList');
            if (response.data.success) {
                setCameras(response.data.data);
            } else {
                setError('Failed to fetch cameras');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCameras();
    }, []);
    return { cameras, loading, error, refetch: fetchCameras };
};

export default useFetchCameras;
