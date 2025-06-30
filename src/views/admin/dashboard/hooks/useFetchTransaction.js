import { useState, useEffect } from "react";
import api from "../../../../service/api";

export const useFetchTransaction = (laneName) => {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchTransaction = async () => {
            if (!laneName) return; 
            setLoading(true);
            try {
                const response = await api.get(`/Transaction/gate/${laneName}/last`);
                setTransaction(response.data.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [laneName]);
    return { transaction, loading, error };
};
