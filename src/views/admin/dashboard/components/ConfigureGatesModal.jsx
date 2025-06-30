import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFetchLane } from '../hooks/useFetchLane';

const ConfigureGatesModal = ({ isOpen, onClose, onSave, gateConfig = [] }) => {
    const { lanes, loading, error } = useFetchLane();
    const [localGateConfig, setLocalGateConfig] = useState([]);
    useEffect(() => {
        if (isOpen) {
            if (gateConfig.length > 0) {
                setLocalGateConfig([...gateConfig]);
            } else if (lanes.length > 0) {
                const gates = lanes.map(lane => ({
                    typeName: lane.typeName || `GATE ${lane.id}`,
                    name: lane.name || `GATE ${lane.id}`,
                    autoRefresh: true,
                    interval: 10
                }));
                setLocalGateConfig(gates);
            }
        }
    }, [isOpen, gateConfig, lanes]);

    const handleToggleAutoRefresh = (index) => {
        const updatedGates = [...localGateConfig];
        updatedGates[index].autoRefresh = !updatedGates[index].autoRefresh;
        setLocalGateConfig(updatedGates);
    };

    const handleIntervalChange = (index, value) => {
        const updatedGates = [...localGateConfig];
        updatedGates[index].interval = value;
        setLocalGateConfig(updatedGates);
    };

    const handleSave = () => {
        onSave(localGateConfig);
        onClose();
    };
    const handleClose = () => {

        if (gateConfig.length > 0) {
            setLocalGateConfig([...gateConfig]);
        }
        onClose();
    };
    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center py-8">
                        Loading...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center py-8 text-red-600">
                        Error fetching lanes: {error.message}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    const sortedGates = [...localGateConfig].sort((a, b) => {
        if (a.typeName === "GATE IN" && b.typeName !== "GATE IN") return -1;
        if (b.typeName === "GATE IN" && a.typeName !== "GATE IN") return 1;
        return 0;
    });
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Configure Gates</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left pb-4 font-medium">Gate Name</th>
                                    <th className="text-left pb-4 font-medium">Auto-Refresh</th>
                                    <th className="text-left pb-4 font-medium">Interval (seconds)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedGates.map((gate, index) => {
                                    // Find original index for proper state management
                                    const originalIndex = localGateConfig.findIndex(g => g.name === gate.name);

                                    return (
                                        <tr key={gate.name} className="border-b">
                                            <td className="py-4">{gate.typeName} - {gate.name}</td>
                                            <td className="py-4">
                                                <Switch
                                                    checked={gate.autoRefresh}
                                                    onCheckedChange={() => handleToggleAutoRefresh(originalIndex)}
                                                />
                                            </td>
                                            <td className="py-4">
                                                <Input
                                                    type="number"
                                                    value={gate.interval}
                                                    onChange={(e) => handleIntervalChange(originalIndex, parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    className="w-20"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button className='bg-biru' onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfigureGatesModal;