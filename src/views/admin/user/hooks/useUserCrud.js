import { useState } from 'react';
import api from '../../../../service/api';

const useUserCrud = (onSuccess) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateUser = async (userId, userData) => {
        setLoading(true);
        setError(null);
        try {
            // Use the correct endpoint for updating user
            const response = await api.post('/User/Update', {
                userid: userId,
                username: userData.username,
                fullname: userData.fullname,
                role: userData.role || [],
                password: userData.password || undefined, // Only send password if provided
                active: userData.active
            });

            if (response.data.success) {
                setLoading(false);
                // Trigger data refresh
                if (onSuccess) onSuccess();
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to update user');
            }
        } catch (err) {
            console.error('Update user error:', err);
            setError(err.message || 'Failed to update user');
            setLoading(false);
            return false;
        }
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/User/${userId}`);
            if (response.data.success) {
                setLoading(false);
                // Trigger data refresh
                if (onSuccess) onSuccess();
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Delete user error:', err);
            setError(err.message || 'Failed to delete user');
            setLoading(false);
            return false;
        }
    };

    const createUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            // Use the correct endpoint for creating user
            const response = await api.post('/User', {
                userid: userData.userid || 0,
                username: userData.username,
                fullname: userData.fullname,
                role: userData.role || [],
                password: userData.password,
                active: userData.active
            });

            if (response.data.success) {
                setLoading(false);
                // Trigger data refresh
                if (onSuccess) onSuccess();
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to create user');
            }
        } catch (err) {
            console.error('Create user error:', err);
            setError(err.message || 'Failed to create user');
            setLoading(false);
            return false;
        }
    };

    return {
        loading,
        error,
        updateUser,
        deleteUser,
        createUser
    };
};

export default useUserCrud;