import React, { useEffect, useState } from "react";
import CameraHeaderTable from "./components/CameraHeaderTable";
import ContentCard from "../../../components/specialized/CardContent";

const UserPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  return (
    <section className="p-6 mx-5 mt-[70px] rounded-lg w-full">
      <ContentCard>
        <div className="py-5">
          <CameraHeaderTable/>
        </div>
      </ContentCard>
    </section>
  );
};

export default UserPage;