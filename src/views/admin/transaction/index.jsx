import React, { useEffect, useState } from "react";
import TransactionHeaderTable from "./components/TransactionHeaderTable";
import ContentCard from "../../../components/specialized/CardContent";

const TransactionPage = () => {
  return (
    <section className="p-6 mx-5 mt-[70px] rounded-lg w-full">
      <ContentCard>
        <div className="py-5">
          <TransactionHeaderTable />
        </div>
      </ContentCard>
    </section>
  );
};

export default TransactionPage;