import React, { useEffect, useState } from "react";
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Box, Pagination
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BACKEND_URL } from '../../utils/api';
const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/order/my-orders`, {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load orders", "error");
      navigate("/auth/login");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" className="mb-2" gutterBottom>
        My Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Order Time</strong></TableCell>
              <TableCell><strong>Method</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(-6)}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>
                  <span style={{
                    color: "white",
                    backgroundColor: order.paymentMethod === "COD" ? "#10b981" : "#3b82f6",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "13px"
                  }}>
                    {order.paymentMethod === "COD" ? "Pending" : "Paid"}
                  </span>
                </TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {orders.length > ordersPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default MyOrdersPage;
