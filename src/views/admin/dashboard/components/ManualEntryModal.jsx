import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useManualEntry } from '../hooks/useManualEntry';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatUTCDateString } from "../../../../utils/formatDate";
import api from "../../../../service/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";

const ManualEntryModal = ({ gate, isOpen, onClose, onSave, initialData, title2, autoRefresh, lane }) => {
    const [dispatchIdError, setDispatchIdError] = useState('');
    const {
        dispatchId, setDispatchId,
        tagId, setTagId,
        name, setName,
        plateNumber, setPlateNumber,
        reason, setReason,
        handleSave,
        saveError,
        setSaveError,
        pendingExitTransactions,
        loading,
        loadingPending,
        selectedTransactionId,
        setSelectedTransactionId,
        selectedTransaction
    } = useManualEntry(initialData, onSave, onClose, isOpen, lane);

    const [laneCameras, setLaneCameras] = useState([]);
    const [liveImageUrls, setLiveImageUrls] = useState({});
    const [loadingCameras, setLoadingCameras] = useState(false);

    useEffect(() => {
        if (isOpen && lane?.id) {
            const fetchCamerasForLane = async () => {
                setLoadingCameras(true);
                try {
                    const response = await api.get('/Camera/GetCameraList');
                    if (response.data.success) {
                        const filteredCameras = response.data.data.filter(cam => cam.laneId === lane.id);
                        setLaneCameras(filteredCameras);
                    }
                } catch (error) {
                    console.error(`Error fetching cameras for lane ${lane.id}:`, error);
                } finally {
                    setLoadingCameras(false);
                }
            };
            fetchCamerasForLane();
        } else {
            setLaneCameras([]);
        }
    }, [isOpen, lane]);

    useEffect(() => {
        if (!isOpen || laneCameras.length === 0) {
            setLiveImageUrls({});
            return;
        }

        const captureAndRefresh = () => {
            laneCameras.forEach(camera => {
                api.post('/Camera/Capture', { cameraid: camera.id })
                    .then(response => {
                        if (response.data.success && response.data.data) {
                            const base64Data = response.data.data;
                            const imageUrl = `data:image/png;base64,${base64Data}`;
                            setLiveImageUrls(prev => ({ ...prev, [camera.id]: imageUrl }));
                        }
                    }).catch(err => console.error(`Capture failed for cam ${camera.id}`, err));
            });
        };

        captureAndRefresh();
        const intervalId = setInterval(captureAndRefresh, 2000);

        return () => clearInterval(intervalId);
    }, [isOpen, laneCameras]);

    const handleDispatchIdChange = (e) => {
        const value = e.target.value;
        setDispatchId(value);
        if (dispatchIdError && value.trim()) {
            setDispatchIdError('');
        }
        if (saveError) setSaveError(null);
    };

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const entryImageUrl = selectedTransaction?.pictures?.[0]?.id
        ? `${apiUrl}/Picture/${selectedTransaction.pictures[0].id}/file`
        : null;

    const sliderSettings = {
        dots: true,
        infinite: laneCameras.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: laneCameras.length > 1,
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if(saveError) setSaveError(null);
    }

    const isGateOut = lane?.typeName?.includes('OUT');
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <style>{`.slick-arrow { background: black; opacity: 0.5; border-radius: 50%; z-index: 1; } .slick-arrow:before { color: white; }`}</style>
            <DialogContent className="max-w-4xl mt-[30px]">
                <DialogHeader>
                    <DialogTitle>{isGateOut ? 'New Manual Exit' : 'New Manual Entry'} - {title2}</DialogTitle>
                </DialogHeader>

                {isGateOut ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* LEFT COLUMN */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Live Camera</Label>
                                <div className="bg-gray-800 rounded-md h-48 border flex items-center justify-center">
                                    {loadingCameras ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                    ) : laneCameras.length > 0 ? (
                                        <div className="w-full h-full">
                                            <Slider {...sliderSettings}>
                                                {laneCameras.map(cam => (
                                                     <div key={cam.id}>
                                                         {liveImageUrls[cam.id] ?
                                                             <img src={liveImageUrls[cam.id]} alt={`Live from ${cam.model}`} className="w-full h-48 object-contain" />
                                                             : <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
                                                         }
                                                     </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    ) : (
                                        <p className="text-white text-sm">No Camera Assigned</p>
                                    )}
                                </div>
                            </div>

                            {selectedTransaction && (
                                <div className="space-y-2">
                                    <Label>Entry Photo</Label>
                                    <div className="bg-muted rounded-md flex items-center justify-center h-48 border">
                                        {entryImageUrl ? (
                                            <img src={entryImageUrl} alt="Entry Photo" className="max-h-full max-w-full object-contain rounded-md" />
                                        ) : (
                                            <p className="text-sm text-gray-500">No Entry Image Available</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4 flex flex-col">
                            <div>
                                <Label htmlFor="transaction">Transaction to Complete</Label>
                                <Select value={selectedTransactionId} onValueChange={(value) => { setSelectedTransactionId(value); setSaveError(null); }}>
                                    <SelectTrigger id="transaction">
                                        <SelectValue placeholder="Select a transaction..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingPending ? (
                                            <SelectItem value="loading" disabled>Loading transactions...</SelectItem>
                                        ) : pendingExitTransactions.length > 0 ? (
                                            pendingExitTransactions.map(tx => (
                                                <SelectItem key={tx.id} value={tx.id}>
                                                   {`Plate: ${tx.plateNumber || 'N/A'} | Exit Start: ${tx.exitStartTime ? formatUTCDateString(tx.exitStartTime, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'} | Status: ${tx.exitStatus || 'N/A'}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No pending transactions found.</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTransaction ? (
                                <div className="space-y-2">
                                    <Label>Entry Details</Label>
                                    <div className="border rounded-md p-3 space-y-1 bg-gray-50/50 text-sm overflow-y-auto" style={{ maxHeight: '12rem' }}>
                                        <div><strong>Plate Number:</strong> {selectedTransaction.plateNumber || 'N/A'}</div>
                                        <div><strong>Dispatch ID:</strong> {selectedTransaction.dispatchId || 'N/A'}</div>
                                        <div><strong>Tag ID:</strong> {selectedTransaction.tagId || 'N/A'}</div>
                                       <div><strong>Entry Time:</strong> {formatUTCDateString(selectedTransaction.startEntryTime, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                                       <div><strong>Exit Start Time:</strong> {selectedTransaction.exitStartTime ? formatUTCDateString(selectedTransaction.exitStartTime, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                                        <div><strong>Entry Lane:</strong> {selectedTransaction.entryLaneId || 'N/A'}</div>
                                        <div><strong>Entry Status:</strong> <span className="font-semibold text-green-600">{selectedTransaction.entryStatus}</span></div>
                                        <div><strong>Exit Status:</strong> <span className="font-semibold text-blue-600">{selectedTransaction.exitStatus || 'N/A'}</span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50 text-gray-500">
                                    <p>Select a transaction to view details.</p>
                                </div>
                            )}
                            
                            <div className="mt-auto">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Enter reason for manual exit..."
                                        value={reason}
                                        onChange={handleInputChange(setReason)}
                                        rows={selectedTransaction ? 3 : 10}
                                    />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label>Live Camera</Label>
                            <div className="bg-gray-800 rounded-md border flex items-center justify-center">
                                {loadingCameras ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                    </div>
                                ) : laneCameras.length > 0 ? (
                                    <div className="w-full">
                                        <Slider {...sliderSettings}>
                                            {laneCameras.map(cam => (
                                                <div key={cam.id}>
                                                    {liveImageUrls[cam.id] ? 
                                                        <img src={liveImageUrls[cam.id]} alt={`Live from ${cam.model}`} className="w-full object-contain" /> 
                                                        : <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
                                                    }
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                ) : (
                                    <p className="text-white text-sm p-12">No Camera Assigned</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                                <div>
                                    <Label htmlFor="dispatchId" className="flex items-center gap-1">
                                        Dispatch ID
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="dispatchId"
                                        placeholder="....."
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
                                    <Label htmlFor="tagId">RFID ID</Label>
                                    <Input
                                        id="tagId"
                                        placeholder="....."
                                        value={tagId}
                                        onChange={handleInputChange(setTagId)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="name">Gate Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="....."
                                        value={name}
                                        onChange={handleInputChange(setName)}
                                        disabled={!!lane?.name}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="plateNumber">Plate No</Label>
                                    <Input
                                        id="plateNumber"
                                        placeholder="....."
                                        value={plateNumber}
                                        onChange={handleInputChange(setPlateNumber)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Enter reason for manual entry..."
                                        value={reason}
                                        onChange={handleInputChange(setReason)}
                                        rows={7}
                                    />
                                </div>
                        </div>
                    </div>
                )}

                {saveError && (
                    <div className="bg-red-50 border border-red-200 text-sm text-red-800 p-3 rounded-lg mt-4">
                        <p className='font-bold'>Error:</p>
                        <p>{saveError}</p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className='bg-biru' onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isGateOut ? 'Save Exit' : 'Save Entry'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ManualEntryModal;