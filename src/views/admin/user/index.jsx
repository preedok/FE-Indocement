import React, { useEffect, useState } from "react";
import UserHeaderTable from "./components/UserHeaderTable";
import ContentCard from "../../../components/specialized/CardContent";

const UserPage = () => {
  return (
    <section className="p-6 mx-5 mt-[70px] rounded-lg w-full">
      <ContentCard>
        <div className="py-5">
          <UserHeaderTable />
        </div>
      </ContentCard>
    </section>
  );
};

export default UserPage;