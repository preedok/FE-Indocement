import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    translateEntryStatus,
    getEntryStatusBadgeColor,
    translateExitStatus,
    getExitStatusBadgeColor
} from "@/utils/decodeStatus";
import { formatUTCDateString } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper component for detail rows
const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <span className="text-sm font-medium text-right">{value || "-"}</span>
    </div>
);

const TransactionDetailModal = ({ isOpen, onClose, transaction, apiUrl, lanes }) => {
    const [activeTab, setActiveTab] = useState('entry');

    if (!transaction) return null;

    // Find lane names
    const entryLane = lanes?.find(l => l.id === transaction.entryLaneId);
    const exitLane = lanes?.find(l => l.id === transaction.exitLaneId);
    const entryLaneName = entryLane ? `${entryLane.typeName} - ${entryLane.name}` : (transaction.entryLaneId ? `Lane ${transaction.entryLaneId}` : '-');
    const exitLaneName = exitLane ? `${exitLane.typeName} - ${exitLane.name}` : (transaction.exitLaneId ? `Lane ${transaction.exitLaneId}` : '-');

    // Filter pictures based on lane IDs
    const entryPictures = transaction.pictures?.filter(p => p.laneId === transaction.entryLaneId) || [];
    const exitPictures = transaction.pictures?.filter(p => p.laneId === transaction.exitLaneId) || [];
    const picturesToShow = activeTab === 'entry' ? entryPictures : exitPictures;

    const settings = {
        dots: true,
        infinite: picturesToShow.length > 0,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: picturesToShow.length > 0,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Transaction Detail</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('entry')}
                                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'entry' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                            >
                                Entry Photos ({entryPictures.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('exit')}
                                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'exit' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}
                            >
                                Exit Photos ({exitPictures.length})
                            </button>
                        </div>
                        <div className="bg-gray-800 rounded-md h-96 overflow-hidden border">
                            {picturesToShow.length > 0 ? (
                                <Slider {...settings} key={activeTab}>
                                    {picturesToShow.map((pic) => (
                                        <div key={pic.id}>
                                            <img
                                                src={`${apiUrl}/Picture/${pic.id}/file`}
                                                alt={`Transaction Photo ${pic.id}`}
                                                className="w-full h-96 object-contain"
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-white">No {activeTab === 'entry' ? 'Entry' : 'Exit'} Pictures</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Details</h3>
                        <div className="space-y-3 rounded-md border p-4 bg-slate-50/50">
                            <DetailRow label="Dispatch ID" value={transaction.dispatchId} />
                            <DetailRow label="Plate Number" value={transaction.plateNumber} />
                            <DetailRow label="TAG ID" value={transaction.tagId} />
                            <DetailRow label="Date/Time" value={formatUTCDateString(transaction.dateTime)} />
                            <hr className="my-2" />
                            <DetailRow label="Entry Lane" value={entryLaneName} />
                            <DetailRow label="Start Entry" value={formatUTCDateString(transaction.startEntryTime)} />
                            <DetailRow label="Finish Entry" value={formatUTCDateString(transaction.finishEntryTime)} />
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm text-muted-foreground">Entry Status:</span>
                                <Badge className={`${getEntryStatusBadgeColor(transaction.entryStatus)}`}>
                                    {translateEntryStatus(transaction.entryStatus || "-")}
                                </Badge>
                            </div>
                            <hr className="my-2" />
                            <DetailRow label="Exit Lane" value={exitLaneName} />
                            <DetailRow label="Start Exit" value={formatUTCDateString(transaction.startExitTime)} />
                            <DetailRow label="Finish Exit" value={formatUTCDateString(transaction.finishExitTime)} />
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm text-muted-foreground">Exit Status:</span>
                                <Badge className={`${getExitStatusBadgeColor(transaction.exitStatus)}`}>
                                    {translateExitStatus(transaction.exitStatus || "-")}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionDetailModal;