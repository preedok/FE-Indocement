import React, { useState, useEffect } from "react";
import { User, Info, Plus } from "lucide-react";
import Swal from "sweetalert2";
import CustomTable from "../../../../components/specialized/CustomTable";
import useFetchUsers from "../hooks/useFetchUsers";
import useUserCrud from "../hooks/useUserCrud";
import ModalEditUser from "./ModalEditUser";
import api from "../../../../service/api"; // Import api langsung

const UserHeaderTable = () => {
  const { data: users, loading: loadingUsers, refetch } = useFetchUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { updateUser, deleteUser, createUser } = useUserCrud(refetch);

  const openEditModal = async (userId) => {
    console.log("Opening edit modal for user ID:", userId);

    setSelectedUserId(userId);
    setLoadingUser(true);
    setIsCreateMode(false);

    try {
      const response = await api.get(`/User/id?id=${userId}`);
      console.log("API Response:", response);

      if (response.data.success) {
        setSelectedUser(response.data.data);
        setIsModalOpen(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load user data.",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load user data: " + (error.message || "Unknown error"),
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const openCreateModal = () => {
    setIsCreateMode(true);
    setSelectedUserId(null);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setSelectedUser(null);
    setIsCreateMode(false);
  };

  const handleSaveUser = async (userData) => {
    let success = false;

    if (isCreateMode) {
      // Create new user
      success = await createUser(userData);
      if (success) {
        Swal.fire({
          icon: "success",
          title: "User created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
        // refetch is automatically called by useUserCrud
      } else {
        Swal.fire({
          icon: "error",
          title: "Creation failed",
          text: "Failed to create user.",
        });
      }
    } else {
      // Update existing user
      if (!selectedUserId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No user selected for update.",
        });
        return;
      }

      success = await updateUser(selectedUserId, userData);
      if (success) {
        Swal.fire({
          icon: "success",
          title: "User updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
        // refetch is automatically called by useUserCrud
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: "Failed to update user details.",
        });
      }
    }
  };

  const handleDeleteUser = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await deleteUser(id);
        if (success) {
          Swal.fire("Deleted!", "User has been deleted.", "success");
          // refetch is automatically called by useUserCrud
        } else {
          Swal.fire("Error!", "Failed to delete user.", "error");
        }
      }
    });
  };

  const columns = [
    { id: "username", label: "Username", minWidth: 150, align: "left" },
    { id: "fullname", label: "Full Name", minWidth: 120, align: "left" },
    {
      id: "role",
      label: "Role",
      minWidth: 120,
      align: "left",
    },
    {
      id: "active",
      label: "Status",
      minWidth: 120,
      align: "left",
      format: (value) => {
        if (!value) return '-';
        if (value === true) {
          return "Aktif";
        } else if (value === false) {
          return "Tidak Aktif"
        }
        return value;
      }
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 80,
      align: "center",
      format: (_, row) => (
        <div className="flex m-auto justify-center gap-2">
          <button
            onClick={() => openEditModal(row.userid || row.id)}
            disabled={loadingUser}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded-md flex items-center justify-center"
            aria-label={`Edit user ${row.username}`}
          >
            <Info size={16} className="mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteUser(row.userid || row.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center justify-center"
            aria-label={`Delete user ${row.username}`}
          >
            <Info size={16} className="mr-1" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-md mt-[-20px]">
            <User size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-[-20px]">
            User Settings
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New User
          </button>
        </div>
      </div>

      <CustomTable
        columns={columns}
        rows={users}
        loading={loadingUsers}
        page={0}
        rowsPerPage={5}
        handleChangePage={() => { }}
        handleChangeRowsPerPage={() => { }}
      />

      <ModalEditUser
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isCreateMode ? "Create New User" : "Edit User Details"}
        user={selectedUser}
        onSave={handleSaveUser}
        isCreateMode={isCreateMode}
      />
    </div>
  );
};

export default UserHeaderTable;