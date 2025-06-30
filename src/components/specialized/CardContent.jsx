import React, { useState, useEffect } from "react";
const CardContent = ({ children }) => {
    return (
        <>
            <div className="bg-white w-full h-full shadow-md p-4 mt-3 rounded-md sm:p-1 md:p-1 lg:p-2 xl:p-4">
                {children}
            </div>
        </>
    );
}

export default CardContent;
