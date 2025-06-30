import { useState, useEffect, useCallback } from "react";
import api from "../../../../service/api";
import swal from "sweetalert";

export const useManualEntry = (initialData, onSave, onClose, isOpen, lane) => {
    const [dispatchId, setDispatchId] = useState("");
    const [tagId, setTagId] = useState("");
    const [name, setName] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const [reason, setReason] = useState("");
    const [saveError, setSaveError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [pendingExitTransactions, setPendingExitTransactions] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const resetForm = useCallback(() => {
        setDispatchId(initialData?.dispatchId || "");
        setTagId(initialData?.tagId || "");
        setName(initialData?.name || lane?.name || "");
        setPlateNumber(initialData?.plateNumber || "");
        setReason(initialData?.reason || "");
        setSaveError(null);
        setSelectedTransactionId('');
        setSelectedTransaction(null);
        setPendingExitTransactions([]);
    }, [initialData, lane]);

    const fetchPendingExitTransactions = async () => {
        setLoadingPending(true);
        try {
            const response = await api.get('/Transaction?rowsPerPage=1000');
            if (response.data.success) {
                // Filter transactions where exit status is not SUCCESS and order by exitStartTime desc
                const pendingExitTransactions = response.data.data
                    .filter(t => t.exitStatus !== 'SUCCESS')
                    .sort((a, b) => {
                        // Sort by exitStartTime descending (latest first)
                        // Handle null/undefined exitStartTime by putting them at the end
                        if (!a.exitStartTime && !b.exitStartTime) return 0;
                        if (!a.exitStartTime) return 1;
                        if (!b.exitStartTime) return -1;
                        return new Date(b.exitStartTime) - new Date(a.exitStartTime);
                    });
                
                setPendingExitTransactions(pendingExitTransactions);
                
                // Auto-select logic: prioritize latest transaction with same exit lane ID
                let selectedTransaction = null;
                
                // First, try to find the latest transaction with exitStartTime and same exit lane ID
                if (lane?.id) {
                    selectedTransaction = pendingExitTransactions.find(t =>
                        t.exitStartTime && t.exitLaneId === lane.id
                    );
                }
                
                // If no transaction found with same exit lane ID, fall back to latest with exitStartTime
                if (!selectedTransaction) {
                    selectedTransaction = pendingExitTransactions.find(t => t.exitStartTime);
                }
                
                if (selectedTransaction) {
                    setSelectedTransactionId(selectedTransaction.id);
                } else {
                    setSelectedTransactionId(''); // No selection if no exitStartTime data
                }
            }
        } catch (error) {
            console.error("Error fetching pending exit transactions:", error);
            swal({
                title: 'Warning!',
                text: 'Failed to load pending transactions.',
                icon: 'warning',
            });
        } finally {
            setLoadingPending(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setSaveError(null);
            resetForm();
            if (lane?.typeName?.includes('OUT')) {
                fetchPendingExitTransactions();
            }
        }
    }, [isOpen, lane, resetForm]);

    useEffect(() => {
        if (selectedTransactionId) {
            const tx = pendingExitTransactions.find(t => t.id === selectedTransactionId);
            setSelectedTransaction(tx || null);
        } else {
            setSelectedTransaction(null);
        }
    }, [selectedTransactionId, pendingExitTransactions]);

    const handleSave = async () => {
        setSaveError(null);
        setLoading(true);
        const isGateOut = lane?.typeName?.includes('OUT');

        const processSuccess = (successData, message) => {
            swal({
                title: 'Success!',
                text: message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            onSave(successData);
            onClose();

            // After 5 seconds, call the buzzer API
            setTimeout(() => {
                if (lane?.id) {
                    api.post('/Lane/TurnOnRedBuzzer', { laneid: lane.id })
                        .catch(err => console.error("Failed to turn on red buzzer", err));
                }
            }, 5000);
        };

        if (isGateOut) {
            if (!selectedTransactionId) {
                setSaveError('Please select a transaction to complete the exit.');
                setLoading(false);
                return;
            }
            try {
                // Send to gateevent endpoint, similar to manual entry
                await api.post(`/Transaction/gateevent`, {
                    dispatchid: selectedTransaction.dispatchId,
                    tagid: selectedTransaction.tagId,
                    name: lane?.name, // Name of the exit lane
                    isManual: true,
                    plateNumber: selectedTransaction.plateNumber,
                    reason: reason,
                });

                // Open portal after successful event processing
                if (lane?.id) {
                    await api.post('/Lane/OpenPortal', { laneid: lane.id });
                }

                processSuccess(selectedTransaction, 'Manual exit processed successfully. Portal opened.');
            } catch (error) {
                console.error("Error processing manual exit:", error);
                const errorMessage = error.response?.data?.message || 'Failed to process manual exit.';
                setSaveError(errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            // Original Gate In Logic
            if (!dispatchId || !name || !plateNumber) {
                setSaveError('Please fill in Dispatch ID, Gate Name, and Plate Number.');
                setLoading(false);
                return;
            }
            try {
                await api.post(`/Transaction/gateevent`, {
                    dispatchid: dispatchId,
                    tagid: tagId,
                    name: lane?.name || name,
                    isManual: true,
                    plateNumber: plateNumber,
                    reason: reason
                });
                // Open portal for gate in as well
                if (lane?.id) {
                    await api.post('/Lane/OpenPortal', { laneid: lane.id });
                }

                const successData = { dispatchId, tagId, name, plateNumber, reason };
                processSuccess(successData, 'Manual entry saved successfully. Portal opened.');

            } catch (error) {
                console.error("Error saving manual entry:", error);
                const errorMessage = error.response?.data?.message || 'Failed to save manual entry.';
                setSaveError(errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        dispatchId, setDispatchId,
        tagId, setTagId,
        name, setName,
        plateNumber, setPlateNumber,
        reason, setReason,
        handleSave,
        loading,
        saveError,
        setSaveError,
        pendingExitTransactions,
        loadingPending,
        selectedTransactionId,
        setSelectedTransactionId,
        selectedTransaction,
    };
};