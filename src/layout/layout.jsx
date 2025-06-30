import React, { useState } from "react";
import Sidebar from "../components/specialized/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex h-screen bg-[#EEF5FF]">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex-1 ${isSidebarOpen ? "sm:ml-52 transition-all duration-500 ease-out" : "sm:ml-9 transition-all duration-500 ease-out"} flex flex-col mt-[-20px] overflow-hidden p-2 overflow-y-auto`}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
