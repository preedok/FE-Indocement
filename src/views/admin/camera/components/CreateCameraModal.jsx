import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCameraCreate from '../hooks/useCameraCreate';
import useFetchGates from '../hooks/useFetchGates';

const CreateCameraModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const { createCamera, loading: createLoading, error: createError } = useCameraCreate();
    const { gates, loading: gatesLoading, error: gatesError } = useFetchGates();
    const [formData, setFormData] = useState({
        laneId: '',
        ipAddress: '',
        model: '',
        parameter: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await createCamera(formData);
        if (result.success) {
            // Reset form
            setFormData({
                laneId: '',
                ipAddress: '',
                model: '',
                parameter: '',
            });
            if (onCreateSuccess) {
                onCreateSuccess();
            }
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Create New Camera</DialogTitle>
                </DialogHeader>

                {(createError || gatesError) && (
                    <div className="my-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                        <strong>Error:</strong> {createError || gatesError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="py-4">
                    <div className="mb-4">
                        <label htmlFor="laneId" className="block text-sm font-medium text-gray-700 mb-1">
                            Gate
                        </label>
                        <select
                            id="laneId"
                            name="laneId"
                            value={formData.laneId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a Gate</option>
                            {gates.map(gate => (
                                <option key={gate.id} value={gate.id}>
                                    {gate.type} - {gate.name}
                                </option>
                            ))}
                        </select>
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={createLoading || gatesLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className='bg-blue-600 text-white'
                            disabled={createLoading || gatesLoading}
                        >
                            {createLoading ? 'Creating...' : 'Create Camera'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCameraModal;