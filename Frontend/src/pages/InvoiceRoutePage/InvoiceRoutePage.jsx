// src/pages/InvoiceRoutePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import InvoicePage from "./InvoiceRoutePage"; // Adjust path if needed
import InvoicePage from "../../components/InvoicePage/InvoicePage";
import Swal from "sweetalert2";
import { BACKEND_URL } from '../../utils/api';
const InvoiceRoutePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/order/${id}`, {
          withCredentials: true,
        });
        if (isMounted) setOrder(res.data);
      } catch (err) {
        if (isMounted) {
          Swal.fire("Error", "Order not found or unauthorized", "error").then(() => {
            navigate("/my-orders");
          });
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  return (
    <div className="p-4">
      {order ? (
        <InvoicePage order={order} />
      ) : (
        <div className="text-center text-gray-600 mt-20">Loading invoice...</div>
      )}
    </div>
  );
};

export default InvoiceRoutePage;
