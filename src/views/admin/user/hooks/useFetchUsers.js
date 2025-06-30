// useFetchUsers.js
import { useEffect, useState, useCallback } from "react";
import api from "../../../../service/api";

const useFetchUsers = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/User");
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError("Failed to fetch users");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        data,
        loading,
        error,
        refetch
    };
};

export default useFetchUsers;