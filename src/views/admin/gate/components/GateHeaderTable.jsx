import React, { useState } from "react";
import { Lock, FileText, Info } from "lucide-react";
import CustomTable from "../../../../components/specialized/CustomTable";
import Swal from "sweetalert2";

import useFetchGates from "../hooks/useFetchGates";
import useGateCrud from "../hooks/useGateCrud";
import EditGateModal from "./EditGateModal";

const GateHeaderTable = () => {
  const { gates, loading, error, refetch } = useFetchGates();
  const { createGate, updateGate, deleteGate, loading: crudLoading } = useGateCrud();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState(null);
  const handleOpenEditModal = (gate = null) => {
    setSelectedGate(gate);
    setIsDetailModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedGate(null);
  };
  const handleSaveGate = async (gateData) => {
    let success = false;
    if (gateData.id) {
      success = await updateGate(gateData.id, gateData);
    } else {
      success = await createGate(gateData);
    }

    if (success) {
      Swal.fire({
        icon: "success",
        title: `Gate ${gateData.id ? "updated" : "created"} successfully!`,
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
      handleCloseModal();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${gateData.id ? "update" : "create"} gate.`,
      });
    }
  };
  const handleDeleteGate = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const success = await deleteGate(id);
      if (success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Gate was deleted successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        refetch();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete gate.",
        });
      }
    }
  };
  const columns = [
    { id: "name", label: "Gate Name", minWidth: 150, align: "left" },
    { id: "ipAddress", label: "IP Address", minWidth: 120, align: "left" },
    { id: "typeName", label: "Type", minWidth: 120, align: "left" },
    {
      id: "actions",
      label: "Actions",
      minWidth: 120,
      align: "center",
      format: (_, row) => (
        <div className="flex gap-2 justify-center w-full">
          <button
            onClick={() => handleOpenEditModal(row)}
            disabled={crudLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center justify-center"
            aria-label={`Edit gate ${row.name}`}
          >
            <Info size={16} className="mr-1" /> Edit
          </button>
          <button
            onClick={() => handleDeleteGate(row.id)}
            disabled={crudLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center justify-center"
            aria-label={`Delete gate ${row.name}`}
          >
            <Info size={16} className="mr-1" /> Delete
          </button>
        </div>
      ),
    }
  ];
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-md mt-[-40px]">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-[-40px]">Gate Settings</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEditModal(null)}
            className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            Add New Gate
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <p className="text-red-600 mb-4" role="alert">
          Error loading gates: {error}
        </p>
      )}

      {/* Table Section */}
      <CustomTable
        columns={columns}
        rows={gates}
        loading={loading || crudLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />

      {/* Edit Gate Modal */}
      {isDetailModalOpen && (
        <EditGateModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          gate={selectedGate}
          onSave={handleSaveGate}
        />
      )}
    </div>
  );
};

export default GateHeaderTable;

