import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import { Clock, RefreshCw, Truck, Info, Plus, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import DetailEntryModal from "./DetailEntryModal";
import ImageModal from "./ImageModal";
import ManualEntryModal from "./ManualEntryModal";
import FormatDate from '../../../../utils/formatDate';
import api from "../../../../service/api";
import {
    translateEntryStatus,
    getEntryStatusBadgeColor,
    translateExitStatus,
    getExitStatusBadgeColor
} from '../../../../utils/decodeStatus';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "../../style.css";

const GateCard = ({
    title,
    title2,
    lane,
    isActive = true,
    autoRefresh: initialAutoRefresh = true,
    refreshTime = 10,
    onAutoRefreshToggle
}) => {
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [isDetailEntryModalOpen, setDetailEntryModalOpen] = useState(false);
    const [isManualEntryModalOpen, setManualEntryModalOpen] = useState(false);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [countdown, setCountdown] = useState(refreshTime);
    const [viewMode, setViewMode] = useState('transaction'); // 'transaction' or 'live'
    const [laneCameras, setLaneCameras] = useState([]);
    const [liveImageUrls, setLiveImageUrls] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
    const autoRefresh = initialAutoRefresh;

    const needsAttention =
        currentTransaction &&
        (
            (lane?.typeName?.includes('OUT') && currentTransaction.exitStatus !== 'SUCCESS') ||
            (!lane?.typeName?.includes('OUT') && currentTransaction.entryStatus !== 'SUCCESS')
        );

    // Fetch cameras associated with this lane
    useEffect(() => {
        const fetchCamerasForLane = async () => {
            if (lane?.id === undefined) return;
            try {
                const response = await api.get('/Camera/GetCameraList');
                if (response.data.success) {
                    const filteredCameras = response.data.data.filter(cam => cam.laneId === lane.id);
                    setLaneCameras(filteredCameras);
                }
            } catch (error) {
                console.error(`Error fetching cameras for lane ${lane.id}:`, error);
            }
        };
        fetchCamerasForLane();
    }, [lane]);

    // Handle live camera feed
    useEffect(() => {
        if (viewMode !== 'live' || !autoRefresh || laneCameras.length === 0) {
            // Clear live image URLs when not in live mode
            setLiveImageUrls({});
            return;
        }

        const captureAndRefresh = () => {
            const newUrls = {};
            laneCameras.forEach(camera => {
                api.post('/Camera/Capture', { cameraid: camera.id })
                    .then(response => {
                        if (response.data.success && response.data.data) {
                            const base64Data = response.data.data;
                            const imageUrl = `data:image/png;base64,${base64Data}`;
                            newUrls[camera.id] = imageUrl;
                            setLiveImageUrls(prev => ({ ...prev, ...newUrls }));
                        }
                    })
                    .catch(err => console.error(`Capture failed for cam ${camera.id}`, err));
            });
        };

        // Initial capture
        captureAndRefresh();

        // Random interval between 1-2 seconds
        const intervalId = setInterval(captureAndRefresh, Math.floor(Math.random() * 1000) + 1000);

        return () => clearInterval(intervalId); // Cleanup on exit
    }, [viewMode, autoRefresh, laneCameras]);

    useEffect(() => {
        const fetchTransaction = async (isInitial = false) => {
            try {
                if (isInitial) {
                    setIsInitialLoading(true);
                } else {
                    setIsLoading(true);
                }

                const response = await api.get(`/Transaction/gate/${title2}/last`);
                const transactionData = response.data.data;
                
                if (transactionData) {
                    // Check if this transaction has missing dispatch/plate data due to any exit status
                    if (transactionData.exitStatus && transactionData.exitStatus !== "SUCCESS" &&
                        (!transactionData.dispatchId || !transactionData.plateNumber)) {
                        try {
                            // Try to find a transaction with the same tagId that has complete data
                            const searchResponse = await api.get('/Transaction?rowsPerPage=1000');
                            if (searchResponse.data.success) {
                                const allTransactions = searchResponse.data.data;
                                
                                // Find a transaction with the same tagId that has complete entry data
                                const referenceTransaction = allTransactions.find(t =>
                                    t.tagId === transactionData.tagId &&
                                    t.dispatchId &&
                                    t.plateNumber &&
                                    t.entryStatus === "SUCCESS"
                                );
                                
                                if (referenceTransaction) {
                                    // Use the reference data for the missing fields
                                    const completeTransaction = {
                                        ...transactionData,
                                        dispatchId: referenceTransaction.dispatchId,
                                        plateNumber: referenceTransaction.plateNumber
                                    };
                                    setCurrentTransaction(completeTransaction);
                                } else {
                                    setCurrentTransaction(transactionData);
                                }
                            } else {
                                setCurrentTransaction(transactionData);
                            }
                        } catch (error) {
                            console.error("Error fetching reference transaction data:", error);
                            setCurrentTransaction(transactionData);
                        }
                    } else {
                        setCurrentTransaction(transactionData);
                    }
                } else {
                    setCurrentTransaction(null);
                }
                setCountdown(refreshTime);
            } catch (error) {
                console.error("Error fetching transaction:", error);
            } finally {
                setIsLoading(false);
                setIsInitialLoading(false);
            }
        };

        let fetchInterval;
        let countdownInterval;

        if (autoRefresh && isActive) {
            fetchTransaction(true);
            fetchInterval = setInterval(() => {
                fetchTransaction(false);
            }, refreshTime * 1000);
            countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        return refreshTime;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setCountdown(0);
            if (isInitialLoading && !currentTransaction) {
                fetchTransaction(true);
            }
        }

        return () => {
            clearInterval(fetchInterval);
            clearInterval(countdownInterval);
        };
    }, [autoRefresh, isActive, refreshTime, title2]);

    useEffect(() => {
        setCountdown(refreshTime);
    }, [refreshTime]);
    const handleDetailEntry = async () => {
        if (currentTransaction && !isDetailLoading) {
            setIsDetailLoading(true);
            swal({
                title: 'Fetching Details...',
                text: 'Please wait.',
                buttons: false,
                closeOnClickOutside: false,
                closeOnEsc: false,
                icon: 'info',
            });
            try {
                const response = await api.get(`/Transaction/${currentTransaction.id}`);
                if (response.data.success) {
                    const transactionDetails = response.data.data;
                    
                    // The detailed fetch might not include pictures, so we merge them from the currentTransaction
                    let finalData = {
                        ...transactionDetails,
                        pictures: currentTransaction.pictures || []
                    };
                    
                    // If the detailed data is missing dispatch/plate info, use the current transaction data
                    // which should already have the prefilled data from the main fetch
                    if (transactionDetails.exitStatus && transactionDetails.exitStatus !== "SUCCESS" &&
                        (!transactionDetails.dispatchId || !transactionDetails.plateNumber)) {
                        
                        finalData = {
                            ...finalData,
                            dispatchId: currentTransaction.dispatchId || transactionDetails.dispatchId,
                            plateNumber: currentTransaction.plateNumber || transactionDetails.plateNumber,
                            tagId: currentTransaction.tagId || transactionDetails.tagId
                        };
                    }
                    
                    setModalData(finalData);
                    setDetailEntryModalOpen(true);
                    swal.close();
                } else {
                    throw new Error(response.data.error || 'Failed to fetch details');
                }
            } catch (error) {
                swal.close();
                swal({
                    title: 'Error!',
                    text: 'Failed to fetch transaction details. Please try again.',
                    icon: 'error',
                });
            } finally {
                setIsDetailLoading(false);
            }
        }
    };
    const handleManualEntry = () => {
        setManualEntryModalOpen(true);
    };
    const handleManualEntrySave = async (entryData) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/Transaction/gate/${title2}/last`);
            setCurrentTransaction(response.data.data);
            setManualEntryModalOpen(false);
        } catch (error) {
            console.error("Error refreshing transaction after manual entry:", error);
            setManualEntryModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };
    const handleAutoRefreshToggle = () => {
        if (onAutoRefreshToggle) {
            onAutoRefreshToggle();
        }
    }
    const imageUrl = currentTransaction && currentTransaction.pictures && currentTransaction.pictures.length > 0
        ? `${apiUrl}/Picture/${currentTransaction.pictures[0].id}/file`
        : null;
    
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };
    const LoadingOverlay = ({ isInitial = false }) => (
        <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 ${isInitial ? 'rounded-lg' : 'rounded-none'}`}>
            <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">
                    {isInitial ? 'Loading transaction data...' : 'Refreshing...'}
                </p>
            </div>
        </div>
    );
    return (
        <>
        <style>{`.slick-arrow { background: black; opacity: 0.5; border-radius: 50%; z-index: 1; } .slick-arrow:before { color: white; }`}</style>
        <Card className={`w-full h-full relative ${needsAttention ? 'blinking-border' : ''}`}>
            {/* Show initial loading overlay */}
            {isInitialLoading && <LoadingOverlay isInitial={true} />}

            {/* Header */}
            <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <Truck className="w-5 h-5" />
                        <h2 className="text-lg">{title}</h2> - <h2 className="text-lg">{title2}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                Auto-refresh : {autoRefresh ? `${countdown}s` : 'Disabled'}
                                {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                            </span>
                            <Switch
                                checked={autoRefresh}
                                onCheckedChange={handleAutoRefreshToggle}
                                disabled={isLoading}
                            />
                        </div>
                        <Badge className={`${autoRefresh ? `bg-blue-600` : 'bg-gray-400'}`} variant={autoRefresh ? `default` : 'secondary'}>
                            {autoRefresh ? `Active` : 'Disabled'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 relative">
                {/* Show refresh loading overlay only on content */}
                {isLoading && !isInitialLoading && <LoadingOverlay />}

                {currentTransaction ? (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 space-y-2">
                             <div className="flex items-center gap-2">
                                <Button variant={viewMode === 'transaction' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setViewMode('transaction')}>
                                    Transaction Photos
                                </Button>
                                <Button variant={viewMode === 'live' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setViewMode('live')}>
                                    Live Camera
                                </Button>
                            </div>
                            <div className="h-48 bg-muted rounded-md border flex items-center justify-center">
                                {viewMode === 'transaction' && (
                                    currentTransaction.pictures && currentTransaction.pictures.length > 0 ? (
                                        <div className="w-full h-full">
                                            <Slider {...sliderSettings}>
                                                {currentTransaction.pictures.map(pic => (
                                                    <div key={pic.id}>
                                                        <img src={`${apiUrl}/Picture/${pic.id}/file`} alt="Transaction" className="w-full h-48 object-contain cursor-pointer" onClick={() => setImageModalOpen(true)} />
                                                    </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    ) : <p>No Transaction Image</p>
                                )}

                                {viewMode === 'live' && (
                                    laneCameras.length > 0 ? (
                                        <div className="w-full h-full">
                                            <Slider {...sliderSettings}>
                                                {laneCameras.map(cam => (
                                                     <div key={cam.id}>
                                                         {liveImageUrls[cam.id] ?
                                                             <img src={liveImageUrls[cam.id]} alt={`Live from ${cam.model}`} className="w-full h-48 object-contain" />
                                                             : <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
                                                         }
                                                     </div>
                                                ))}
                                            </Slider>
                                        </div>
                                    ) : <p>No Camera Assigned</p>
                                )}
                            </div>

                            {viewMode === 'transaction' && (
                                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded text-center">
                                    <FormatDate dateString={currentTransaction.pictures.length > 0 ? currentTransaction.pictures[0].dateTime : null} />
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-2/3">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-muted-foreground text-sm">Plate:</p>
                                    <p className="font-bold">{currentTransaction.plateNumber || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">RFID ID:</p>
                                    <p className="font-bold">{currentTransaction.tagId || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        {lane?.typeName?.includes('OUT') ? 'Exit Status:' : 'Entry Status:'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {lane?.typeName?.includes('OUT') ? (
                                            <Badge className={`px-2 py-1 text-xs font-medium border ${getExitStatusBadgeColor(currentTransaction.exitStatus)}`}>
                                                {translateExitStatus(currentTransaction.exitStatus)}
                                            </Badge>
                                        ) : (
                                            <Badge className={`px-2 py-1 text-xs font-medium border ${getEntryStatusBadgeColor(currentTransaction.entryStatus)}`}>
                                                {translateEntryStatus(currentTransaction.entryStatus)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Truck className="w-10 h-10 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">No transaction data</h3>
                        <p className="text-muted-foreground">Waiting for truck arrival at {title} - {title2}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                    <div className="flex mt-2 items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                            <FormatDate dateString={currentTransaction ? currentTransaction.dateTime : null} />
                        </span>
                    </div>
                </div>
                <div className={`grid grid-cols-1 gap-2 w-full`}>
                    {currentTransaction ? (
                        <>
                            <div className="flex gap-3 w-full">
                                    {/* For entry gates: show detail button as before */}
                                {/* For exit gates: show detail button for last exit data (clickable by ID) */}
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 w-full"
                                    onClick={handleDetailEntry}
                                    disabled={isLoading || isDetailLoading}
                                >
                                    <Info className="w-4 h-4 " />
                                    DETAIL
                                </Button>
                                <Button
                                    className="bg-brown-600 hover:bg-blue-700 w-full"
                                    onClick={handleManualEntry}
                                    disabled={isLoading}
                                >
                                    <Plus className="w-4 h-4" />
                                    {lane?.typeName?.includes('OUT') ? 'MANUAL EXIT' : 'MANUAL ENTRY'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button
                            className="col-span-2 bg-green-500 hover:bg-green-600"
                            onClick={handleManualEntry}
                            disabled={isLoading || isInitialLoading}
                        >
                            <Plus className="w-4 h-4" />
                            ADD MANUAL
                        </Button>
                    )}
                </div>
            </CardFooter>

            {/* Detail Entry Modal */}
            <DetailEntryModal
                lane={lane}
                gate={title}
                title2={title2}
                isOpen={isDetailEntryModalOpen}
                onClose={() => {
                    setDetailEntryModalOpen(false);
                    setIsDetailLoading(false);
                }}
                onSave={async (entryData) => {
                    setDetailEntryModalOpen(false);
                    setIsDetailLoading(false);
                }}
                initialData={modalData}
                autoRefresh={autoRefresh}
            />
            {/* Manual Entry Modal */}
            <ManualEntryModal
                lane={lane}
                gate={title}
                title2={title2}
                isOpen={isManualEntryModalOpen}
                onClose={() => setManualEntryModalOpen(false)}
                onSave={handleManualEntrySave}
                initialData={null}
                autoRefresh={autoRefresh}
            />

            {/* Image Modal */}
            <ImageModal
                transaction={currentTransaction}
                isOpen={isImageModalOpen}
                onClose={() => setImageModalOpen(false)}
                imageUrl={imageUrl}
            />
        </Card></>
    );
};

export default GateCard;