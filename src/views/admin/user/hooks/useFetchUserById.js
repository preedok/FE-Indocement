// useFetchUserById.js - Hook asli tetap seperti ini (tidak diubah)
import { useEffect, useState } from "react";
import api from "../../../../service/api";

const useFetchUserById = (userId) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/User/id?id=${userId}`);

                if (response.data.success) {
                    setUser(response.data.data);
                    setError(null);
                } else {
                    setError("Failed to fetch user");
                    setUser(null);
                }
            } catch (err) {
                setError(err.message || "Failed to fetch user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        } else {
            setUser(null);
            setError(null);
            setLoading(false);
        }
    }, [userId]);

    return { user, loading, error };
};

export default useFetchUserById;