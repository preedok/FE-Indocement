import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ModalEditUser = ({ isOpen, onClose, title, user, onSave, isCreateMode = false }) => {
    const [formData, setFormData] = useState({
        userid: 0,
        username: "",
        fullname: "",
        role: [],
        password: "",
        active: true,
    });

    const [loading, setLoading] = useState(false);

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (isOpen) {
            if (isCreateMode) {
                // Reset form for new user creation
                setFormData({
                    userid: 0,
                    username: "",
                    fullname: "",
                    role: [],
                    password: "",
                    active: true,
                });
            } else if (user) {
                console.log("Setting form data with user:", user); // Debug log
                setFormData({
                    userid: user.userid || user.id || 0,
                    username: user.username || "",
                    fullname: user.fullname || "",
                    role: Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []),
                    password: "", // Always empty for security
                    active: Boolean(user.active),
                });
            }
        } else if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                userid: 0,
                username: "",
                fullname: "",
                role: [],
                password: "",
                active: true,
            });
        }
    }, [isOpen, user, isCreateMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => {
            const newData = { ...prev };

            if (type === "checkbox") {
                newData[name] = checked;
            } else if (name === "role") {
                // Handle role as single selection, store as array for API compatibility
                newData[name] = value ? [value] : [];
            } else {
                newData[name] = value;
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.fullname.trim()) {
            alert("Username and Full Name are required!");
            return;
        }

        if (isCreateMode && !formData.password.trim()) {
            alert("Password is required for new users!");
            return;
        }

        setLoading(true);

        try {
            // Prepare data for submission
            const submitData = {
                userid: formData.userid,
                username: formData.username.trim(),
                fullname: formData.fullname.trim(),
                role: Array.isArray(formData.role) ? formData.role : [],
                active: formData.active
            };

            // Only include password if it's provided (for updates) or if it's create mode
            if (isCreateMode || formData.password.trim()) {
                submitData.password = formData.password;
            }

            console.log("Submitting data:", submitData); // Debug log
            await onSave(submitData);
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-white rounded-lg shadow-lg p-6">
                <DialogHeader>
                    <DialogTitle>{title || (isCreateMode ? "Create User" : "Edit User")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Username <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="fullname"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="fullname"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={Array.isArray(formData.role) && formData.role.length > 0 ? formData.role[0] : ""}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a role</option>
                            <option value="Administrator">Administrator</option>
                            <option value="Operator">Operator</option>
                            <option value="Guest">Guest</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password {isCreateMode && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={isCreateMode}
                            disabled={loading}
                            className="w-full"
                            placeholder={isCreateMode ? "Enter password" : "Leave empty to keep current password"}
                        />
                        {!isCreateMode && (
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to keep current password
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            disabled={loading}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="active"
                            className="text-sm font-medium text-gray-700"
                        >
                            Active User
                        </label>
                    </div>

                    <DialogFooter className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : (isCreateMode ? "Create User" : "Save Changes")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ModalEditUser;