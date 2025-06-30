import { useState, useCallback } from 'react';
import api from '@/service/api';

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [lanes, setLanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = async (filters = {}, suppressUIUpdate = false) => {
    try {
      if (!suppressUIUpdate) {
        setLoading(true);
        setError(null);
      }

      const response = await api.get('/Transaction', { params: filters });

      if (response.data.success) {
        const { data, totalPages } = response.data;
        const transactionList = data || [];
        
        setTransactions(transactionList);

        // Since the API doesn't consistently provide totalPages, we provide a fallback.
        // If we have data, we assume at least one page exists. This prevents the table from
        // showing "No Data" when rows are actually present.
        const effectiveTotalPages = typeof totalPages !== 'undefined' ? totalPages : (transactionList.length > 0 ? 1 : 0);
        setTotalPages(effectiveTotalPages);
        
        setCurrentPage(filters.page || 1);
        return transactionList;
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      if (!suppressUIUpdate) {
        setError(err.message);
        console.error('Error fetching transactions', err);
      }
      return [];
    } finally {
      if (!suppressUIUpdate) {
        setLoading(false);
      }
    }
  };

  const fetchLanes = async () => {
    try {
      const response = await api.get('/Lane');
      if (response.data.success) {
        setLanes(response.data.data);
      } else {
        throw new Error('Failed to fetch lanes');
      }
    } catch (err) {
      console.error('Error fetching lanes', err);
    }
  };

  const fetchTransactionDetail = async (transactionId) => {
    try {
      const response = await api.get(`/Transaction/${transactionId}`);

      if (response.data.success) {
        // Directly return the data from the API to ensure all properties are included.
        // Add a fallback for the pictures array to prevent errors.
        const transactionData = response.data.data;
        transactionData.pictures = transactionData.pictures || [];
        return transactionData;
      } else {
        throw new Error('Failed to fetch transaction detail');
      }
    } catch (err) {
      console.error('Error fetching transaction details', err);
      throw err;
    }
  };

  const resetTransactions = () => {
    setTransactions([]);
    setTotalPages(0);
    setCurrentPage(1);
  };

  return {
    transactions,
    lanes,
    loading,
    error,
    totalPages,
    currentPage,
    fetchTransactions,
    fetchLanes,
    resetTransactions,
    fetchTransactionDetail,
  };
};

export default useTransactions;