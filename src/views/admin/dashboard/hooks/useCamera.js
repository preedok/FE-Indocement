// hooks/useCamera.js
import { useState, useEffect } from 'react';
import api from "../../../../service/api";
import swal from "sweetalert";

export const useCamera = (isOpen, initialData) => {
    const [cameraData, setCameraData] = useState(null);
    const [streamUrl, setStreamUrl] = useState(null);
    const [loadingCamera, setLoadingCamera] = useState(false);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [cameraId, setCameraId] = useState("1");
    useEffect(() => {
        if (isOpen && initialData?.id) {
            fetchCameraDataFromTransaction();
            fetchAllCameras();
        }
    }, [isOpen, initialData]);
    useEffect(() => {
        if (cameraId && availableCameras.length > 0) {
            fetchSpecificCamera(cameraId);
        }
    }, [cameraId, availableCameras]);
    const fetchAllCameras = async () => {
        try {
            const response = await api.get('/Camera/GetCameraList');
            if (response.data.success) {
                setAvailableCameras(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };
    const fetchCameraDataFromTransaction = async () => {
        if (!initialData?.id) return;
        setLoadingCamera(true);

        try {
            const transactionResponse = await api.get(`/Transaction/${initialData.id}`);
            if (!transactionResponse.data.success) {
                throw new Error('Failed to fetch transaction data');
            }

            const transactionData = transactionResponse.data.data;
            const entryLaneId = transactionData.entryLaneId;

            if (entryLaneId === null || entryLaneId === undefined) {
                console.warn('No entryLaneId found in transaction data');
                return;
            }

            const camerasResponse = await api.get('/Camera/GetCameraList');
            if (!camerasResponse.data.success) {
                throw new Error('Failed to fetch cameras data');
            }

            const matchingCamera = camerasResponse.data.data.find(
                camera => camera.laneId === entryLaneId
            );

            if (matchingCamera) {
                setCameraId(matchingCamera.id.toString());
                await fetchSpecificCamera(matchingCamera.id);
            } else {
                if (camerasResponse.data.data.length > 0) {
                    const fallbackCamera = camerasResponse.data.data[0];
                    setCameraId(fallbackCamera.id.toString());
                    await fetchSpecificCamera(fallbackCamera.id);
                }
            }
        } catch (error) {
            swal({
                title: 'Error!',
                text: 'Failed to load camera data from transaction.',
                icon: 'error',
            });
        } finally {
            setLoadingCamera(false);
        }
    };
    const fetchSpecificCamera = async (camId) => {
        try {
            const response = await api.get(`/Camera/${camId}`);
            if (response.data.success) {
                const camera = response.data.data;
                setCameraData(camera);
                if (camera.parameter) {
                    const paramParts = camera.parameter.split(';');
                    if (paramParts.length >= 3) {
                        const urlTemplate = paramParts[0];
                        const username = paramParts[1];
                        const password = paramParts[2];
                        const finalUrl = urlTemplate.replace('{0}', camera.ipAddress);
                        setStreamUrl(finalUrl);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching specific camera:", error);
        }
    };
    return {
        cameraData,
        streamUrl,
        loadingCamera,
        availableCameras,
        cameraId,
        setCameraId,
        setStreamUrl
    };
};