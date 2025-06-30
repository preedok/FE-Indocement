import { useState, useEffect, useCallback } from 'react';
import api from '../../../../service/api';

const useFetchGates = () => {
    const [gates, setGates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchGates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/Lane');
            if (response.data.success) {
                setGates(response.data.data);
                setError(null);
            } else {
                setError('Failed to fetch gates');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch gates');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchGates();
    }, [fetchGates]);
    return { gates, loading, error, refetch: fetchGates };
};

export default useFetchGates;

