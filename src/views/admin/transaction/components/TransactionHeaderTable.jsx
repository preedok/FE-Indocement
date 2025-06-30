import React, { useState, useEffect } from "react";
import {
  Printer,
  FileText,
  Search,
  RotateCcw,
  Info,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomTable from "../../../../components/specialized/CustomTable";
import TransactionDetailModal from "./TransactionDetailModal";
import useTransactions from "../hooks/useTransaction";
import { formatUTCDateString, formatGMT7DateTime } from "../../../../utils/formatDate";
import ExportDialog from "./ExportDialog";

const TransactionHistoryTable = () => {
  const {
    transactions,
    lanes,
    loading,
    error,
    totalPages,
    currentPage,
    fetchTransactions,
    fetchLanes,
    resetTransactions,
    fetchTransactionDetail
  } = useTransactions();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedLaneId, setSelectedLaneId] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    fetchLanes();
    handleApplyFilter();
  }, []);
  const handleOpenDetailModal = async (transactionId) => {
    try {
      const transactionDetail = await fetchTransactionDetail(transactionId);
      setSelectedTransaction(transactionDetail);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    }
  };
  const createData = (transaction) => {
    const finishEntryTime = transaction.finishEntryTime;
    const finishExitTime = transaction.finishExitTime;
    const dateTime = transaction.dateTime;
    const calculateLoadingTimeDuration = (finishEntryTime, finishExitTime, dateTime) => {
      const entry = new Date(finishEntryTime);
      let exit = finishExitTime ? new Date(finishExitTime) : (dateTime ? new Date(dateTime) : new Date());
      const durationMs = exit - entry;

      if (durationMs < 0) return '-';
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
      let durationText = `(${hours} h) (${minutes} m) (${seconds} s)`;
      if (!finishExitTime) {
        durationText += " truck masih di lapangan";
      }
      return durationText;
    };
    return {
      ...transaction,
      loadingTimeDuration: calculateLoadingTimeDuration(finishEntryTime, finishExitTime, dateTime)
    };
  };
  const preparedTransactions = transactions.map(createData);
  const columns = [
    {
      id: "tagId",
      label: "TAG ID",
      minWidth: 120,
      align: "left",
      format: (value) => value || '-'
    },
    {
      id: "plateNumber",
      label: "Plate Number",
      minWidth: 160,
      align: "left",
      format: (value) => value || '-'
    },
    {
      id: "dateTime",
      label: "Date/Time",
      minWidth: 200,
      align: "left",
      format: (value) => formatGMT7DateTime(value)
    },
    {
      id: "startEntryTime",
      label: "Start Entry Time",
      minWidth: 200,
      align: "left",
      format: (value) => formatGMT7DateTime(value)
    },
    {
      id: "finishEntryTime",
      label: "Finish Entry Time",
      minWidth: 200,
      align: "left",
      format: (value) => formatGMT7DateTime(value)
    },
    {
      id: "entryLaneId",
      label: "Entry Lane",
      minWidth: 120,
      align: "center",
      format: (value) => {
        if (value == null) return '-';
        return <Badge variant="outline">Lane {value}</Badge>;
      }
    },
    {
      id: "entryStatus",
      label: "Entry Status",
      minWidth: 50,
      align: "left",
      format: (value) => {
        if (!value) return '-';
        if (value === "ENTRY_COMPLETED_AWAITING_MANUAL_DATA") {
          return "ENTRY COMPLETE";
        } else if (value === "EXIT_COMPLETED_AWAITING_MANUAL_DATA") {
          return "EXIT COMPLETE"
        }
        return value;
      }
    },
    {
      id: "startExitTime",
      label: "Start Exit Time",
      minWidth: 200,
      align: "left",
      format: (value) => value ? formatGMT7DateTime(value) : '-'
    },
    {
      id: "finishExitTime",
      label: "Finish Exit Time",
      minWidth: 200,
      align: "left",
      format: (value) => value ? formatGMT7DateTime(value) : '-'
    },
    {
      id: "exitStatus",
      label: "Exit Status",
      minWidth: 220,
      align: "left",
      format: (value) => {
        if (!value) return '-';
        if (value === "ENTRY_COMPLETED_AWAITING_MANUAL_DATA") {
          return "ENTRY COMPLETE";
        } else if (value === "EXIT_COMPLETED_AWAITING_MANUAL_DATA") {
          return "EXIT COMPLETE"
        }
        return value;
      }
    },
    {
      id: "exitLaneId",
      label: "Exit Lane",
      minWidth: 120,
      align: "center",
      format: (value) => {
        if (value == null) return '-';
        return <Badge variant="outline">Lane {value}</Badge>;
      }
    },
    {
      id: "createdDate",
      label: "Created Date",
      minWidth: 200,
      align: "left",
      format: (value) => formatGMT7DateTime(value)
    },
    {
      id: "loadingTimeDuration",
      label: "Loading Truck",
      minWidth: 200,
      align: "left",
      format: (value) => value || '-'
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 120,
      align: "center",
      format: (_, row) => (
        <Button
          onClick={() => handleOpenDetailModal(row.id)}
          size="sm"
          className="flex items-center justify-center m-auto"
        >
          <Info size={16} className="mr-1" />
          Detail
        </Button>
      )
    }
  ];
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    handleApplyFilter(newPage + 1);
  };
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    handleApplyFilter(1, newRowsPerPage);
  };
  const handleApplyFilter = async (pageNum = 1, rowsNum = rowsPerPage) => {
    const filters = {
      page: pageNum,
      rowsPerPage: rowsNum,
    };

    if (fromDate) {
      filters.dateFrom = fromDate;
    }
    if (toDate) {
      filters.dateTo = toDate;
    }
    if (plateNumber.trim()) {
      filters.plateNumber = plateNumber.trim();
    }
    if (selectedLaneId) {
      filters.laneId = selectedLaneId;
    }

    await fetchTransactions(filters);
  };
  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setPlateNumber("");
    setSelectedLaneId("");
    setPage(0);
    resetTransactions();
    fetchTransactions({
      page: 1,
      rowsPerPage: rowsPerPage
    });
  };
  const fetchAllTransactionsForExport = async () => {
    try {
      const filters = {
        page: 1,
        rowsPerPage: 100000,
      };

      if (fromDate) {
        filters.dateFrom = fromDate;
      }
      if (toDate) {
        filters.dateTo = toDate;
      }
      if (plateNumber.trim()) {
        filters.plateNumber = plateNumber.trim();
      }
      if (selectedLaneId) {
        filters.laneId = selectedLaneId;
      }
      const result = await fetchTransactions(filters, true);
      return result || transactions;
    } catch (error) {
      console.error('Error fetching all transactions for export:', error);
      return transactions;
    }
  };
  const handleExport = async () => {
    const exportTransactions = await fetchAllTransactionsForExport();
    setAllTransactions(exportTransactions);
    setIsExportDialogOpen(true);
  };
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const exportTransactions = await fetchAllTransactionsForExport();

      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(18);
      doc.text('Transaction Report', 14, 22);
      let yPos = 35;
      doc.setFontSize(10);

      if (fromDate || toDate) {
        const dateRange = `Date Range: ${fromDate || 'Start'} to ${toDate || 'End'}`;
        doc.text(dateRange, 14, yPos);
        yPos += 5;
      }

      if (plateNumber) {
        doc.text(`Plate Number: ${plateNumber}`, 14, yPos);
        yPos += 5;
      }

      if (selectedLaneId) {
        const selectedLane = lanes.find(lane => lane.id.toString() === selectedLaneId);
        const laneText = selectedLane ? `${selectedLane.typeName} - ${selectedLane.laneParameter}` : `Lane ID: ${selectedLaneId}`;
        doc.text(`Lane: ${laneText}`, 14, yPos);
        yPos += 5;
      }

      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos);
      doc.text(`Total Records: ${exportTransactions.length}`, 14, yPos + 5);

      const tableColumns = [
        'TAG ID',
        'Plate Number',
        'Date/Time',
        'Start Entry',
        'Finish Entry',
        'Entry Lane',
        'Entry Status',
        'Finish Exit',
        'Exit Lane',
        'Exit Status',
        'Loading Truck',
        'Created Date'
      ];

      const tableRows = exportTransactions.map(transaction => [
        transaction?.tagId || '-',
        transaction?.plateNumber || '-',
        transaction?.dateTime ? formatUTCDateString(transaction.dateTime, { month: '2-digit' }) : '-',
        transaction?.startEntryTime ? formatUTCDateString(transaction.startEntryTime, { year: undefined, month: undefined, day: undefined }) : '-',
        transaction?.finishEntryTime ? formatUTCDateString(transaction.finishEntryTime, { year: undefined, month: undefined, day: undefined }) : '-',
        transaction?.entryLaneId ? `Lane ${transaction.entryLaneId}` : '-',
        transaction?.entryStatus === "ENTRY_COMPLETED_AWAITING_MANUAL_DATA" ? "ENTRY COMPLETE" :
          transaction?.entryStatus === "EXIT_COMPLETED_AWAITING_MANUAL_DATA" ? "EXIT COMPLETE" :
            transaction?.entryStatus || '-',
        transaction?.finishExitTime ? formatUTCDateString(transaction.finishExitTime, { year: undefined, month: undefined, day: undefined }) : '-',
        transaction?.exitLaneId ? `Lane ${transaction.exitLaneId}` : '-',
        transaction?.exitStatus === "ENTRY_COMPLETED_AWAITING_MANUAL_DATA" ? "ENTRY COMPLETE" :
          transaction?.exitStatus === "EXIT_COMPLETED_AWAITING_MANUAL_DATA" ? "EXIT COMPLETE" :
            transaction?.exitStatus || '-',
        calculateLoadingTruck(transaction?.finishEntryTime, transaction?.finishExitTime),
        transaction?.createdDate ? formatUTCDateString(transaction.createdDate, { month: '2-digit' }) : '-'
      ]);

      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: yPos + 15,
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 22 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 22 },
          7: { cellWidth: 18 },
          8: { cellWidth: 18 },
          9: { cellWidth: 22 },
          10: { cellWidth: 25 }, // Loading Truck column
          11: { cellWidth: 22 },
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text('Page ' + data.pageNumber + ' of ' + pageCount, 14, pageHeight - 10);
        }
      });
      const fileName = `transaction-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  const handlePrint = () => {
    const printContent = document.getElementById('printableContent');
    if (!printContent) {
      console.error("Element with ID 'printableContent' not found.");
      return;
    }

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = `
        <div style="margin: 20px;">
            <h1 style="text-align: center;">Transaction Data</h1>
            ${printContents}
        </div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-md mt-[-40px]">
            <FileText size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-[-40px]">Transaction</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error loading transactions: {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Plate No</Label>
              <Input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. B 1234 XYZ"
              />
            </div>
            <div className="space-y-2">
              <Label>Gate</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedLaneId}
                onChange={(e) => setSelectedLaneId(e.target.value)}
              >
                <option value="">All Lanes</option>
                {lanes.map((lane) => (
                  <option key={lane.id} value={lane.id.toString()}>
                    {lane.typeName} - {lane.laneParameter}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex mt-4 space-x-2">
            <Button
              onClick={() => handleApplyFilter(1, rowsPerPage)}
              disabled={loading}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Apply Filter'}
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilter}
              disabled={loading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="printableContent">
        <CustomTable
          columns={columns}
          rows={preparedTransactions}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          totalCount={totalPages * rowsPerPage}
        />
      </div>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        apiUrl={apiUrl}
        lanes={lanes}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        initialFilters={{
          dateFrom: fromDate,
          dateTo: toDate,
          laneId: selectedLaneId
        }}
        transactions={allTransactions.length > 0 ? allTransactions : transactions}
      />
    </div>
  );
};

export default TransactionHistoryTable;