import React, { useState } from "react";
import { Camera, FileText, Info } from "lucide-react";
import CustomTable from "../../../../components/specialized/CustomTable";
import useFetchCameras from "../hooks/useFetchCameras";
import EditCameraModal from "./EditCameraModal"; 
import CreateCameraModal from "./CreateCameraModal";
import useFetchGates from "../hooks/useFetchGates";

const CameraHeaderTable = () => {
  const { cameras, loading, error, refetch } = useFetchCameras();
  const { gates, loading: loadingGates, error: errorGates } = useFetchGates();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState(null); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleOpenEditModal = (camera) => {
    setSelectedCameraId(camera.id);
    setIsDetailModalOpen(true);
  };
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const columns = [
    {
      id: "ipAddress",
      label: "IP Address",
      minWidth: 150,
      align: "left"
    },
    {
      id: "model",
      label: "Model",
      minWidth: 120,
      align: "left",
    },
    {
      id: "parameter",
      label: "Parameter",
      minWidth: 120,
      align: "left",
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 80,
      align: "center",
      format: (_, row) => (
        <div className="flex w-full gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="bg-blue-600 m-auto hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center justify-center"
          >
            <Info size={16} className="mr-1" /> Edit
          </button>
          {/* <button
            onClick={() => handleOpenEditModal(row)} 
            className="bg-red-600 m-auto hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center justify-center"
          >
            <Info size={16} className="mr-1" /> Delete
          </button> */}
        </div>
      )
    }
  ];
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const [selectedGateId, setSelectedGateId] = useState(null);
  const filteredCameras = selectedGateId
    ? cameras.filter(camera => camera.laneId === selectedGateId)
    : cameras;
  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-md mt-[-40px]">
            <Camera size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-[-40px]">Camera Settings</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            Add New Camera
          </button>
          <select
            onChange={(e) => setSelectedGateId(Number(e.target.value))}
            className="border rounded-md p-2"
          >
            <option value="">Filter by Gate</option>
            {gates.map(gate => (
              <option key={gate.id} value={gate.id}>
                {gate.type} - {gate.name} 
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <p>Loading cameras...</p>
      ) : error ? (
        <p>Error loading cameras: {error}</p>
      ) : (
        <CustomTable
          columns={columns}
          rows={filteredCameras}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}

      {/* Edit Camera Modal */}
      {selectedCameraId && (
        <EditCameraModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          cameraId={selectedCameraId} 
          onUpdateSuccess={refetch} 
        />
      )}
      <CreateCameraModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={refetch}
        gates={gates}
      />
    </div>
  );
};

export default CameraHeaderTable;
