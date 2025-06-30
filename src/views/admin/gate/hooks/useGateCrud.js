import { useState } from 'react';
import api from '../../../../service/api';
import swal from "sweetalert";

const useGateCrud = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createGate = async (gateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/Lane', gateData);
            if (response.data.success) {
                setLoading(false);
                return true;
            } else {
                throw new Error('Failed to create gate');
            }
        } catch (error) {
            setLoading(false);
            console.error("Error saving manual entry:", error);

            // Handle different error scenarios
            let errorMessage = 'Failed to save manual entry. Please try again.';
            let errorTitle = 'Error!';

            if (error.response?.status === 400) {
                errorTitle = 'Validation Error!';
                errorMessage = error.response.data?.error || error.response.data?.message || 'Invalid data provided.';
            } else if (error.response?.status === 401) {
                errorTitle = 'Unauthorized!';
                errorMessage = 'You are not authorized to perform this action.';
            } else if (error.response?.status === 403) {
                errorTitle = 'Forbidden!';
                errorMessage = 'Access denied. You do not have permission.';
            } else if (error.response?.status === 404) {
                errorTitle = 'Not Found!';
                errorMessage = 'The requested resource was not found.';
            } else if (error.response?.status === 500) {
                errorTitle = 'Server Error!';
                errorMessage = 'Internal server error. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            swal({
                title: errorTitle,
                text: errorMessage,
                icon: 'error',
            });
        }
    };
    const updateGate = async (id, gateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.put(`/Lane/${id}`, gateData);
            if (response.data.success) {
                setLoading(false);
                return true;
            } else {
                throw new Error('Failed to update gate');
            }
        } catch (error) {
           
            setLoading(false);
            console.error("Error saving manual entry:", error);

            // Handle different error scenarios
            let errorMessage = 'Failed to save manual entry. Please try again.';
            let errorTitle = 'Error!';

            if (error.response?.status === 400) {
                errorTitle = 'Validation Error!';
                errorMessage = error.response.data?.error || error.response.data?.message || 'Invalid data provided.';
            } else if (error.response?.status === 401) {
                errorTitle = 'Unauthorized!';
                errorMessage = 'You are not authorized to perform this action.';
            } else if (error.response?.status === 403) {
                errorTitle = 'Forbidden!';
                errorMessage = 'Access denied. You do not have permission.';
            } else if (error.response?.status === 404) {
                errorTitle = 'Not Found!';
                errorMessage = 'The requested resource was not found.';
            } else if (error.response?.status === 500) {
                errorTitle = 'Server Error!';
                errorMessage = 'Internal server error. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            swal({
                title: errorTitle,
                text: errorMessage,
                icon: 'error',
            });
        }
    };
    const deleteGate = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.delete(`/Lane/${id}`);
            if (response.data.success) {
                setLoading(false);
                return true;
            } else {
                throw new Error('Failed to delete gate');
            }
        } catch (error) {
          
            setLoading(false);
            console.error("Error saving manual entry:", error);

            // Handle different error scenarios
            let errorMessage = 'Failed to save manual entry. Please try again.';
            let errorTitle = 'Error!';

            if (error.response?.status === 400) {
                errorTitle = 'Validation Error!';
                errorMessage = error.response.data?.error || error.response.data?.message || 'Invalid data provided.';
            } else if (error.response?.status === 401) {
                errorTitle = 'Unauthorized!';
                errorMessage = 'You are not authorized to perform this action.';
            } else if (error.response?.status === 403) {
                errorTitle = 'Forbidden!';
                errorMessage = 'Access denied. You do not have permission.';
            } else if (error.response?.status === 404) {
                errorTitle = 'Not Found!';
                errorMessage = 'The requested resource was not found.';
            } else if (error.response?.status === 500) {
                errorTitle = 'Server Error!';
                errorMessage = 'Internal server error. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            swal({
                title: errorTitle,
                text: errorMessage,
                icon: 'error',
            });
        }
    };
    return { loading, error, createGate, updateGate, deleteGate };
};

export default useGateCrud;

