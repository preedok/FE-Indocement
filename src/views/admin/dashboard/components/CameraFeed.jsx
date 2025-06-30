import React, { useEffect } from 'react';
import { Video } from "lucide-react";
import api from "../../../../service/api";

export const CameraFeed = ({ streamUrl, loadingCamera, selectedGate, setStreamUrl, cameraId }) => {
    useEffect(() => {
        if (loadingCamera && cameraId) {
            const handleAutoCapture = async () => {
                try {
                    const response = await api.post('/Camera/Capture', { cameraid: cameraId });
                    console.log("Auto-capture successful:", response.data);
                } catch (error) {
                    console.error("Auto-capture failed:", error);
                    // Don't show error alert for auto-capture to avoid interrupting user experience
                }
            };

            handleAutoCapture();
        }
    }, [loadingCamera, cameraId]);
    if (loadingCamera) {
        return (
            <div className="bg-gray-800 rounded-md h-64 flex flex-col items-center justify-center">
                <Video className="w-10 h-10 text-white mb-4 animate-pulse" />
                <p className="text-white text-center">Loading camera...</p>
                <p className="text-gray-400 text-sm mt-2">Auto-capturing image...</p>
            </div>
        );
    }
    if (streamUrl) {
        return (
            <div className="bg-gray-800 rounded-md h-64 overflow-hidden">
                <iframe
                    src={streamUrl}
                    className="w-full h-full border-0"
                    title={`Camera feed for ${selectedGate}`}
                    onError={() => {
                        console.error("Failed to load camera stream");
                        setStreamUrl(null);
                    }}
                />
            </div>
        );
    }
    return (
        <div className="bg-gray-800 rounded-md h-64 flex flex-col items-center justify-center">
            <Video className="w-10 h-10 text-white mb-4" />
            <p className="text-white text-center">Camera feed for {selectedGate}</p>
            <p className="text-gray-400 text-sm mt-2">No stream available</p>
        </div>
    );
};