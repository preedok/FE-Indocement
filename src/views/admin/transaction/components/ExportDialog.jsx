import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatUTCDateString } from "../../../../utils/formatDate";
import { FileText, Download, Calendar, Filter } from "lucide-react";

const ExportDialog = ({ isOpen, onClose, initialFilters = {}, transactions = [] }) => {
    const [exportDateFrom, setExportDateFrom] = useState(initialFilters.dateFrom || '');
    const [exportDateTo, setExportDateTo] = useState(initialFilters.dateTo || '');
    const [maxRows, setMaxRows] = useState('10000');
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');

    // Function to filter transactions based on criteria
    const filterTransactions = (data) => {
        let filtered = [...data];

        // Filter by date range
        if (exportDateFrom) {
            const fromDate = new Date(exportDateFrom);
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.dateTime || transaction.createdDate);
                return transactionDate >= fromDate;
            });
        }

        if (exportDateTo) {
            const toDate = new Date(exportDateTo);
            toDate.setHours(23, 59, 59, 999); // Include the entire end date
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.dateTime || transaction.createdDate);
                return transactionDate <= toDate;
            });
        }

        // Limit to max rows
        const maxRowsNum = parseInt(maxRows);
        if (maxRowsNum < filtered.length) {
            filtered = filtered.slice(0, maxRowsNum);
        }

        return filtered;
    };

    // Function to convert data to CSV format
    const convertToCSV = (data) => {
        if (data.length === 0) return '';

        // Define headers
        const headers = [
            'TAG ID',
            'Plate Number',
            'Date/Time',
            'Start Entry Time',
            'Finish Entry Time',
            'Entry Lane',
            'Entry Status',
            'Exit Lane',
            'Exit Status',
            'Created Date'
        ];

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                `"${row.tagId || '-'}"`,
                `"${row.plateNumber || '-'}"`,
                `"${row.dateTime ? formatUTCDateString(row.dateTime) : '-'}"`,
                `"${row.startEntryTime ? formatUTCDateString(row.startEntryTime, { year: undefined, month: undefined, day: undefined }) : '-'}"`,
                `"${row.finishEntryTime ? formatUTCDateString(row.finishEntryTime, { year: undefined, month: undefined, day: undefined }) : '-'}"`,
                `"${row.entryLaneId ? `Lane ${row.entryLaneId}` : '-'}"`,
                `"${row.entryStatus === 'ENTRY_COMPLETED_AWAITING_MANUAL_DATA' ? 'ENTRY COMPLETE' :
                    row.entryStatus === 'EXIT_COMPLETED_AWAITING_MANUAL_DATA' ? 'EXIT COMPLETE' :
                        row.entryStatus || '-'}"`,
                `"${row.exitLaneId ? `Lane ${row.exitLaneId}` : '-'}"`,
                `"${row.exitStatus === 'ENTRY_COMPLETED_AWAITING_MANUAL_DATA' ? 'ENTRY COMPLETE' :
                    row.exitStatus === 'EXIT_COMPLETED_AWAITING_MANUAL_DATA' ? 'EXIT COMPLETE' :
                        row.exitStatus || '-'}"`,
                `"${row.createdDate ? formatUTCDateString(row.createdDate) : '-'}"`
            ].join(','))
        ].join('\n');

        return csvContent;
    };

    // Function to download CSV as Excel-like file
    const downloadCSV = (csvContent, filename) => {
        // Add BOM for proper UTF-8 encoding in Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        setExporting(true);
        setExportError('');

        try {
            // Filter transactions based on criteria
            const filteredTransactions = filterTransactions(transactions);

            if (filteredTransactions.length === 0) {
                setExportError('No transactions found with the specified criteria.');
                setExporting(false);
                return;
            }

            // Convert to CSV
            const csvContent = convertToCSV(filteredTransactions);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `transactions_${timestamp}.csv`;

            // Download the file
            downloadCSV(csvContent, filename);

            // Close dialog after successful export
            setTimeout(() => {
                onClose();
                setExporting(false);
            }, 1000);

        } catch (error) {
            setExportError('Failed to export transactions. Please try again.');
            setExporting(false);
        }
    };

    const handleQuickDateRange = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        setExportDateFrom(startDate.toISOString().split('T')[0]);
        setExportDateTo(endDate.toISOString().split('T')[0]);
    };

    const clearExportError = () => {
        setExportError('');
    };

    // Calculate preview count
    const getPreviewCount = () => {
        const filtered = filterTransactions(transactions);
        return filtered.length;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] mt-5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Export Transactions to Excel
                    </DialogTitle>
                    <DialogDescription>
                        Configure your export settings and download the transaction data as a CSV file (Excel compatible).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Quick Date Range Buttons */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Quick Date Ranges</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickDateRange(0)}
                                className="text-xs"
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickDateRange(7)}
                                className="text-xs"
                            >
                                Last 7 Days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickDateRange(30)}
                                className="text-xs"
                            >
                                Last 30 Days
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickDateRange(90)}
                                className="text-xs"
                            >
                                Last 3 Months
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setExportDateFrom('');
                                    setExportDateTo('');
                                    clearExportError();
                                }}
                                className="text-xs"
                            >
                                Clear Dates
                            </Button>
                        </div>
                    </div>

                    {/* Date Range Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exportFromDate" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                From Date
                            </Label>
                            <Input
                                id="exportFromDate"
                                type="date"
                                value={exportDateFrom}
                                onChange={(e) => {
                                    setExportDateFrom(e.target.value);
                                    clearExportError();
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exportToDate" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                To Date
                            </Label>
                            <Input
                                id="exportToDate"
                                type="date"
                                value={exportDateTo}
                                onChange={(e) => {
                                    setExportDateTo(e.target.value);
                                    clearExportError();
                                }}
                            />
                        </div>
                    </div>

                    {/* Export Options */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxRows" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Maximum Rows to Export
                            </Label>
                            <Select value={maxRows} onValueChange={setMaxRows}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select max rows" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1000">1,000 rows</SelectItem>
                                    <SelectItem value="5000">5,000 rows</SelectItem>
                                    <SelectItem value="10000">10,000 rows</SelectItem>
                                    <SelectItem value="50000">50,000 rows</SelectItem>
                                    <SelectItem value="100000">All available data</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Export Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-medium text-sm">Export Summary:</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Date Range:</span>
                                    <span>
                                        {exportDateFrom && exportDateTo
                                            ? `${exportDateFrom} to ${exportDateTo}`
                                            : 'All dates'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Rows:</span>
                                    <Badge variant="secondary">{parseInt(maxRows).toLocaleString()}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Records to Export:</span>
                                    <Badge variant="outline">{getPreviewCount().toLocaleString()}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Format:</span>
                                    <Badge variant="outline">CSV (Excel compatible)</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {exportError && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <p className="text-sm text-red-800">{exportError}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={exporting}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exporting || getPreviewCount() === 0}>
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExportDialog;