import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Typography, CircularProgress } from "@mui/material";

const CustomTable = ({
  columns,
  loading,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumn, setSortColumn] = useState(columns[0]?.id || "");

  const handleSort = (columnId) => {
    const isAsc = sortColumn === columnId && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(columnId);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (a[sortColumn] > b[sortColumn]) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  className="font-bold"
                  style={{
                    minWidth: column.minWidth,
                    backgroundColor: "#F9FAFC",
                    color: "black",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={() => column.id !== "actions" && handleSort(column.id)}
                >
                  {column.label}
                  {sortColumn === column.id && column.id !== "actions"
                    ? sortDirection === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="left">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="left"
                  style={{ fontWeight: "bold" }}
                >
                  <SearchOffIcon
                    style={{
                      fontSize: 60,
                      color: "grey",
                      marginBottom: "16px",
                    }}
                  />
                  <Typography>
                    No Data Found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={rowIndex}
                    style={{
                      backgroundColor: rowIndex % 2 === 0 ? "#EEF5FF" : "white",
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ fontWeight: "bold" }}
                        >
                          {column.format
                            ? column.id === "actions"
                              ? column.format(value, row)
                              : column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default CustomTable;