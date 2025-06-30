import { useState, useEffect } from 'react';
import api from "../../../../service/api";
import swal from 'sweetalert';

export const useDetailEntry = (initialData, onSave, onClose) => {
    const [formData, setFormData] = useState({
        dispatchId: '',
        plateNumber: '',
        tagId: '',
        reason: ''
    });
    const [availableRfidTags, setAvailableRfidTags] = useState([]);
    const [loadingRfidTags, setLoadingRfidTags] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const fetchAvailableRfidTags = async () => {
        setLoadingRfidTags(true);
        try {
            const response = await api.get('/Transaction');
            const pendingTransactions = response.data.data.filter(transaction =>
                transaction.exitStatus === null && transaction.tagId
            );
            let rfidTags = pendingTransactions
                .map(transaction => transaction.tagId)
                .filter((tagId, index, self) =>
                    tagId && tagId !== "" && self.indexOf(tagId) === index
                );

            // If we have initialData with exitStatus that is not null and not SUCCESS,
            // ensure the current tagId is included in the available options
            if (initialData && initialData.exitStatus &&
                initialData.exitStatus !== null &&
                initialData.exitStatus !== "SUCCESS" &&
                initialData.tagId &&
                !rfidTags.includes(initialData.tagId)) {
                rfidTags = [initialData.tagId, ...rfidTags];
            }

            setAvailableRfidTags(rfidTags);
        } catch (error) {
            console.error("Failed to fetch available RFID tags:", error);
            swal({
                title: 'Warning!',
                text: 'Failed to load available RFID tags.',
                icon: 'warning',
            });
        } finally {
            setLoadingRfidTags(false);
        }
    };
    useEffect(() => {
        if (initialData) {
            setFormData({
                dispatchId: initialData.dispatchId || '',
                plateNumber: initialData.plateNumber || '',
                tagId: initialData.tagId || '',
                reason: initialData.reason || ''
            });
            
            // Always fetch available RFID tags, but for exit status transactions that are not SUCCESS,
            // we should ensure the current tagId is included in the available options
            fetchAvailableRfidTags();
        }
    }, [initialData]);
    const handleSave = async () => {
        setLoading(true);
        setSaveError(null);
        try {
            // Determine if we are updating an entry or an exit based on the current transaction state
            const isExitUpdate = initialData?.exitStatus && initialData.exitStatus !== 'SUCCESS';
            const newStatus = isExitUpdate
                ? 'EXIT_COMPLETED_AWAITING_MANUAL_DATA'
                : 'ENTRY_COMPLETED_AWAITING_MANUAL_DATA';

            const manualDataResponse = await api.post(`/Transaction/${initialData.id}/manualdata`, {
                dispatchId: formData.dispatchId,
                plateNumber: formData.plateNumber,
                tagid: formData.tagId, // API expects `tagid`
                newStatus,
                reason: formData.reason,
            });

            const laneId = isExitUpdate ? initialData.exitLaneId : initialData.entryLaneId;

            swal({
                title: 'Success!',
                text: 'Manual data saved successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            if (laneId) {
                api.post('/Lane/OpenPortal', { laneid: laneId })
                    .then(() => {
                        console.log("Portal opened automatically after saving manual data");
                        setTimeout(() => {
                            api.post('/Lane/TurnOnRedBuzzer', { laneid: laneId })
                                .catch(err => console.error("Failed to turn on red buzzer", err));
                        }, 5000);
                    })
                    .catch(portalError => {
                        console.error("Failed to open portal automatically:", portalError);
                    });
            }
            
            onSave(manualDataResponse.data);
            onClose();
            return true; // Indicate success
        } catch (error) {
            console.error("Error saving manual entry:", error);
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

            setSaveError(errorMessage);
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    };
    return {
        formData,
        setFormData,
        availableRfidTags,
        loadingRfidTags,
        handleSave,
        loading,
        saveError,
        setSaveError
    };
};