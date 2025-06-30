import { useState, useEffect } from "react";
import api from "../../../../service/api"; 

export const useFetchLane = () => {
    const [lanes, setLanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchLanes = async () => {
            try {
                const response = await api.get("/Lane");
                setLanes(response.data.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLanes();
    }, []);
    return { lanes, loading, error };
};
