import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import swal from 'sweetalert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDetailEntry } from '../hooks/useDetailEntry';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DetailEntryModal = ({ gate, title2, isOpen, onClose, onSave, initialData, autoRefresh, lane }) => {
    const [dispatchIdError, setDispatchIdError] = useState('');
    const {
        formData,
        setFormData,
        availableRfidTags,
        loadingRfidTags,
        handleSave,
        saveError,
        setSaveError,
        loading
    } = useDetailEntry(initialData, onSave, onClose);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (saveError) setSaveError(null);
        if (name === 'dispatchId' && value.trim()) setDispatchIdError('');
    };

    const handleSaveWithValidation = async () => {
        if (lane?.typeName?.includes('OUT')) {
            // Logic for manual exit data update
            const success = await handleSave();
            if (success) {
                swal({ title: 'Success!', text: 'Manual exit data updated.', icon: 'success' });
                onClose();
            }
        } else {
            // Original entry logic
            if (!formData.dispatchId || !formData.dispatchId.trim()) {
                setDispatchIdError('Dispatch ID is required');
                return;
            }
            setDispatchIdError('');
            handleSave();
        }
    };

    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const pictures = initialData?.pictures || [];
    const settings = {
        dots: true,
        infinite: pictures.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: pictures.length > 1,
    };
 
    const isGateOut = lane?.typeName?.includes('OUT');
    const isTransactionSuccess = isGateOut
        ? initialData?.exitStatus === 'SUCCESS'
        : initialData?.entryStatus === 'SUCCESS';

     return (
         <Dialog open={isOpen} onOpenChange={onClose}>
              <style>{`
                 .slick-arrow { background: black; border-radius: 50%; z-index: 1; } .slick-arrow:before { color: white; }
            `}</style>
            <DialogContent className="max-w-4xl mt-6">
                <DialogHeader>
                    <DialogTitle>{gate} - {title2}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Camera Feed</h3>
                            <Badge className={`${autoRefresh ? 'bg-biru' : 'bg-gray-400'}`}>{autoRefresh ? 'Auto-Refresh' : 'Manual'}</Badge>
                        </div>

                        <div className="bg-gray-800 rounded-md h-64 overflow-hidden border">
                            {pictures.length > 0 ? (
                                <Slider {...settings}>
                                    {pictures.map((pic) => (
                                        <div key={pic.id}>
                                            <img
                                                src={`${apiUrl}/Picture/${pic.id}/file`}
                                                alt={`Transaction Photo ${pic.id}`}
                                                className="w-full h-64 object-contain"
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-white">No Transaction Pictures</p>
                                </div>
                            )}
                        </div>

                        {initialData && (
                            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                                <div className="flex items-center gap-1.5 ">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
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
                        )}
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold">Details</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="dispatchId" className="flex items-center gap-1">
                                    Dispatch ID
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="dispatchId"
                                    placeholder="...."
                                    name="dispatchId"
                                    value={formData.dispatchId}
                                    onChange={handleChange}
                                    className={dispatchIdError ? 'border-red-500' : ''}
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
                                    name="plateNumber"
                                    value={formData.plateNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="rfidId">RFID ID</Label>
                                </div>
                                <Select
                                    value={formData.tagId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, tagId: value }))}
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
                                    name="reason"
                                    value={formData.reason}
                                    rows={10}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {saveError && (
                            <div className="bg-red-50 border border-red-200 text-sm text-red-800 p-3 rounded-lg mt-2">
                                <p className='font-bold'>Error:</p>
                                <p>{saveError}</p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                   {!isTransactionSuccess && (
                       <Button className='bg-biru' onClick={handleSaveWithValidation} disabled={loading}>
                                   {loading ? (
                                       <>
                                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                           Saving...
                                       </>
                                   ) : (
                                       'Save Changes'
                                   )}
                       </Button>
                   )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DetailEntryModal;