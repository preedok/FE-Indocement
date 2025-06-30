import { useState, useEffect } from 'react';
import api from "../../../../service/api";

const useFetchGates = () => {
    const [gates, setGates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGates = async () => {
        setLoading(true);
        try {
            const response = await api.get('/Lane/lookup');
            if (response.data.success) {
                setGates(response.data.data);
            } else {
                setError('Failed to fetch gates');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGates();
    }, []);

    return { gates, loading, error };
};

export default useFetchGates;
