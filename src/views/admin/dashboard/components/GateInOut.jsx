import React, { useState, useEffect } from "react";
import { Truck, Settings, RefreshCw } from "lucide-react";
import GateCard from "./GateCard";
import ConfigureGatesModal from "./ConfigureGatesModal";
import { useFetchLane } from "../hooks/useFetchLane";
import api from "../../../../service/api";

const GateInOut = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { lanes, loading: loadingLanes, error: errorLanes } = useFetchLane();
  const [gateConfig, setGateConfig] = useState([]);
  const [isAutoRefreshAll, setIsAutoRefreshAll] = useState(true);
  useEffect(() => {
    if (lanes.length > 0 && gateConfig.length === 0) {
      const initialConfig = lanes.map(lane => ({
        typeName: lane.typeName || `GATE ${lane.id}`,
        name: lane.name || `GATE ${lane.id}`,
        autoRefresh: true,
        interval: 10
      }));
      setGateConfig(initialConfig);
    }
  }, [lanes, gateConfig.length]);
  useEffect(() => {
    // Sync the master toggle state whenever gateConfig changes
    if (gateConfig.length > 0) {
      const allOn = gateConfig.every(gate => gate.autoRefresh);
      setIsAutoRefreshAll(allOn);
    }
  }, [gateConfig]);
  const handleSaveGateConfig = (updatedGates) => {
    setGateConfig(updatedGates);
  };
  const handleAutoRefreshToggle = (gateName) => {
    setGateConfig(prevConfig =>
      prevConfig.map(gate =>
        gate.name === gateName
          ? { ...gate, autoRefresh: !gate.autoRefresh }
          : gate
      )
    );
  };

  const handleToggleAllAutoRefresh = () => {
    const newStatus = !isAutoRefreshAll;
    setGateConfig(prevConfig =>
      prevConfig.map(gate => ({ ...gate, autoRefresh: newStatus }))
    );
  };
  const sortedLanes = [...lanes].sort((a, b) => {
    if (a.typeName === "GATE IN" && b.typeName !== "GATE IN") return -1;
    if (b.typeName === "GATE IN" && a.typeName !== "GATE IN") return 1;
    return 0;
  });
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-md mt-[-40px]">
                <Truck size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mt-[-40px]">Gate Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded transition duration-200"
                onClick={handleToggleAllAutoRefresh}
              >
                <RefreshCw size={18} />
                <span>{isAutoRefreshAll ? 'Disable All Refresh' : 'Enable All Refresh'}</span>
              </button>
              <button
                className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded transition duration-200"
                onClick={() => setIsConfigModalOpen(true)}
              >
                <Settings size={18} />
                <span>Configure Gates</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingLanes ? (
          <div className="text-center py-12">Loading lanes...</div>
        ) : errorLanes ? (
          <div className="text-center py-12 text-red-600">
            Error loading lanes: {errorLanes.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedLanes.map((lane) => {
              const gateConfigItem = gateConfig.find(gate => gate.name === lane.name) || {
                autoRefresh: true,
                interval: 10
              };

              return (
                <GateCard
                  key={lane.id}
                  title={lane.typeName || `GATE ${lane.id}`}
                  title2={lane.name || `GATE ${lane.id}`}
                  lane={lane}
                  isActive={true}
                  autoRefresh={gateConfigItem.autoRefresh}
                  refreshTime={gateConfigItem.interval}
                  onAutoRefreshToggle={() => handleAutoRefreshToggle(lane.name)}
                />
              );
            })}
          </div>
        )}
      </div>

      <ConfigureGatesModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveGateConfig}
        gateConfig={gateConfig}
      />
    </div>
  );
};

export default GateInOut;