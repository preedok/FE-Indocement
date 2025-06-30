import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCameraUpdate from '../hooks/useCameraUpdate'; 
import Swal from 'sweetalert2'; 

const EditCameraModal = ({ isOpen, onClose, cameraId, onUpdateSuccess }) => {
    const { camera, loading, error, isUpdating, updateCamera } = useCameraUpdate(cameraId); 
    const [formData, setFormData] = useState({
        id: null,
        laneId: '',
        ipAddress: '',
        model: '',
        parameter: '',
    });

    useEffect(() => {
        if (camera) {
            setFormData(camera);
        }
    }, [camera]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        const result = await updateCamera(formData);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Camera updated successfully!',
                timer: 1500,
                showConfirmButton: false,
            });
            onUpdateSuccess(); 
            onClose(); 
        }
    };

    if (loading) return <p>Loading camera details...</p>;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Edit Camera</DialogTitle>
                </DialogHeader>

                {error && (
                    <div className="my-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="py-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="laneId">Lane ID</label>
                        <Input
                            id="laneId"
                            name="laneId"
                            value={formData.laneId}
                            onChange={handleChange}
                            placeholder="Enter Lane ID"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="ipAddress">IP Address</label>
                        <Input
                            id="ipAddress"
                            name="ipAddress"
                            value={formData.ipAddress}
                            onChange={handleChange}
                            placeholder="Enter IP Address"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="model">Model</label>
                        <Input
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Enter Camera Model"
                            className="mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="parameter">Parameter</label>
                        <Input
                            id="parameter"
                            name="parameter"
                            value={formData.parameter}
                            onChange={handleChange}
                            placeholder="Enter Camera Parameter"
                            className="mt-1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isUpdating}
                    >
                        Close
                    </Button>
                    <Button 
                        className='bg-blue-600 text-white' 
                        onClick={handleUpdate} 
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCameraModal;
