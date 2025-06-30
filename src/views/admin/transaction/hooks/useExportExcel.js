import { useState } from 'react';
import api from '../../../../service/api';

const useExportExcel = () => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    const exportTransactionsToExcel = async (filters = {}) => {
        try {
            setExporting(true);
            setExportError(null);

            const params = new URLSearchParams();
            if (filters.dateFrom) {
                const formattedDateFrom = filters.dateFrom.replace(/-/g, '/');
                params.append('DateFrom', formattedDateFrom);
            }
            if (filters.dateTo) {
                const formattedDateTo = filters.dateTo.replace(/-/g, '/');
                params.append('DateTo', formattedDateTo);
            }
            if (filters.page) params.append('Page', filters.page);
            if (filters.row) params.append('Row', filters.row);
            const response = await api.get(`/Transaction/excel?${params.toString()}`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `transactions_${currentDate}.xlsx`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true, filename };

        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Export failed';

            setExportError(errorMessage);
            console.error('Export error:', error);

            return { success: false, error: errorMessage };
        } finally {
            setExporting(false);
        }
    };
    const exportAllTransactions = async (filters = {}) => {
        return await exportTransactionsToExcel({
            ...filters,
            page: 1,
            row: 10000
        });
    };
    const clearExportError = () => {
        setExportError(null);
    };
    return {
        exportTransactionsToExcel,
        exportAllTransactions,
        exporting,
        exportError,
        clearExportError
    };
};

export default useExportExcel;