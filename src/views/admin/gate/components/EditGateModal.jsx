import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Swal from "sweetalert2";

const EditGateModal = ({ isOpen, onClose, gate, onSave }) => {
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        ipAddress: '',
        rfidIpAddress: '',
        adamIpAddress: '',
        type: 1,
        laneParameter: '',
        typeName: ''
    });
    useEffect(() => {
        if (gate) {
            setFormData({
                id: gate.id || null,
                name: gate.name || '',
                ipAddress: gate.ipAddress || '',
                rfidIpAddress: gate.rfidIpAddress || '',
                adamIpAddress: gate.adamIpAddress || '',
                type: gate.type || 1,
                laneParameter: gate.laneParameter || '',
                typeName: gate.typeName || ''
            });
        }
    }, [gate]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setFormData((prev) => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleSubmit = () => {
        if (!formData.name.trim()) {
            Swal.fire({ icon: "error", title: "Validation Error", text: "Name is required" });
            return;
        }
        if (!formData.ipAddress.trim()) {
            Swal.fire({ icon: "error", title: "Validation Error", text: "IP Address is required" });
            return;
        }
        onSave(formData);
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mt-5 mx-auto p-6 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">{formData.id ? "Edit Gate" : "Add New Gate"}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Gate name"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">IP Address</label>
                        <Input
                            id="ipAddress"
                            name="ipAddress"
                            value={formData.ipAddress}
                            onChange={handleChange}
                            placeholder="IP Address"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="rfidIpAddress" className="block text-sm font-medium text-gray-700">RFID IP Address</label>
                        <Input
                            id="rfidIpAddress"
                            name="rfidIpAddress"
                            value={formData.rfidIpAddress}
                            onChange={handleChange}
                            placeholder="RFID IP Address"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="adamIpAddress" className="block text-sm font-medium text-gray-700">Adam IP Address</label>
                        <Input
                            id="adamIpAddress"
                            name="adamIpAddress"
                            value={formData.adamIpAddress}
                            onChange={handleChange}
                            placeholder="Adam IP Address"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        >
                            <option value={1}>GATE IN</option>
                            <option value={2}>GATE OUT</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="laneParameter" className="block text-sm font-medium text-gray-700">Lane Parameter</label>
                        <Input
                            id="laneParameter"
                            name="laneParameter"
                            value={formData.laneParameter}
                            onChange={handleChange}
                            placeholder="Lane Parameter"
                            className="mt-1"
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="bg-blue-600 text-white" onClick={handleSubmit}>
                        {formData.id ? "Save Changes" : "Add Gate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditGateModal;

