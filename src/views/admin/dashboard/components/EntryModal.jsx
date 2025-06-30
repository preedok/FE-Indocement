import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCamera } from '../hooks/useCamera';
import { useDetailEntry } from '../hooks/useDetailEntry';
import { CameraFeed } from './CameraFeed';

const EntryModal = ({ gate, title2, isOpen, onClose, onSave, initialData, autoRefresh }) => {
    const [dispatchIdError, setDispatchIdError] = useState('');
    const {
        cameraData,
        streamUrl,
        loadingCamera,
        availableCameras,
        cameraId,
        setCameraId,
        setStreamUrl
    } = useCamera(isOpen, initialData);
    const {
        dispatchId,
        setDispatchId,
        plateNo,
        setPlateNo,
        rfidId,
        setRfidId,
        reason,
        setReason,
        availableRfidTags,
        loadingRfidTags,
        fetchAvailableRfidTags,
        handleSave
    } = useDetailEntry(initialData, onSave, onClose);
    const handleDispatchIdChange = (e) => {
        const value = e.target.value;
        setDispatchId(value);
        if (dispatchIdError && value.trim()) {
            setDispatchIdError('');
        }
    };
    const handleSaveWithValidation = () => {
        if (!dispatchId || !dispatchId.trim()) {
            setDispatchIdError('Dispatch ID is required');
            return;
        }

        setDispatchIdError('');
        handleSave();
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl mt-6">
                <DialogHeader>
                    <DialogTitle>{gate} - {title2}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Camera Feed</h3>
                            <Badge className={`${autoRefresh ? `bg-biru` : 'bg-blue-gray-200'}`} variant={autoRefresh ? `default` : 'secondary'}>
                                {autoRefresh ? `Active` : 'Disabled'}
                            </Badge>
                        </div>

                        <CameraFeed
                            streamUrl={streamUrl}
                            loadingCamera={loadingCamera}
                            setStreamUrl={setStreamUrl}
                            cameraId={cameraId}
                        />

                        <div className="flex justify-end items-center">
                            <div className="flex items-center gap-2">
                                <Label>Camera ID:</Label>
                                <Select value={cameraId} onValueChange={setCameraId}>
                                    <SelectTrigger className="w-80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCameras.map((camera) => (
                                            <SelectItem key={camera.id} value={camera.id.toString()}>
                                                Camera {camera.id} ({camera.model})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {cameraData && (
                            <>
                                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                                    <div className="flex items-center gap-1.5 ">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-medium text-slate-700">Camera Info</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-100">
                                            <span className="text-xs text-slate-600">IP</span>
                                            <span className="text-xs font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                                {cameraData.ipAddress}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-100">
                                            <span className="text-xs text-slate-600">Model</span>
                                            <span className="text-xs text-slate-800 font-medium">
                                                {cameraData.model}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-100">
                                            <span className="text-xs text-slate-600">Lane ID</span>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                {cameraData.laneId}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                                    <div className="flex items-center gap-1.5 ">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-medium text-slate-700">Status Info</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-100">
                                            <span className="text-xs text-slate-600">Entry Status</span>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                {initialData.entryStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-slate-100">
                                            <span className="text-xs text-slate-600">Exit Status</span>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                {initialData.exitStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold"> Details</h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="dispatchId" className="flex items-center gap-1">
                                    Dispatch ID
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="dispatchId"
                                    placeholder="...."
                                    value={dispatchId}
                                    onChange={handleDispatchIdChange}
                                    className={dispatchIdError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                                    required
                                />
                                {dispatchIdError && (
                                    <p className="text-sm text-red-500 mt-1">{dispatchIdError}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="plateNo">Plate No</Label>
                                <Input
                                    id="plateNo"
                                    placeholder="e.g. B 1234 XYZ"
                                    value={plateNo}
                                    onChange={(e) => setPlateNo(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="rfidId">RFID ID</Label>
                                </div>
                                <Select
                                    value={rfidId}
                                    onValueChange={setRfidId}
                                    disabled
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingRfidTags ? "Loading RFID tags..." : "Select RFID tag"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRfidTags.map((tagId) => (
                                            <div className="flex gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                    RFID
                                                </Badge>
                                                <SelectItem key={tagId} value={tagId}>
                                                    {tagId}
                                                </SelectItem>
                                            </div>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Enter reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={10}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className='bg-biru' onClick={handleSaveWithValidation}>
                        Save 
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EntryModal;