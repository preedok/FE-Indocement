import React from "react";
import ContentCard from "../../../components/specialized/CardContent";
import GateInOut from "./components/GateInOut";
const Dashboard = () => {
  return (
    <section className="p-6 mx-5 mt-[70px] rounded-lg w-full">
      <ContentCard>
        <GateInOut />
      </ContentCard>
    </section>
  );
};

export default Dashboard;
