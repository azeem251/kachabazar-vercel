import React, { useEffect } from "react";
import {
  Container, Box, Typography, Button, FormControlLabel,
  RadioGroup, Radio, Divider, List, ListItem, ListItemText,
  IconButton, TextField, Avatar
} from "@mui/material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart } from "../../ReduxSlices/cartSlice";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../../utils/api';
const Checkout = () => {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useSelector((s) => s.cart.items);
  const authUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0;
  const discount = 0;
  const total = (subtotal + shippingCost - discount).toFixed(2);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      country: "",
      zip: "",
      paymentMethod: "Stripe"
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone is required"),
      street: Yup.string().required("Street is required"),
      city: Yup.string().required("City is required"),
      country: Yup.string().required("Country is required"),
      zip: Yup.string().required("ZIP is required"),
      paymentMethod: Yup.string().required("Select a payment method")
    }),
    onSubmit: async (values, { resetForm }) => {
      const shippingAddress = { ...values };
      delete shippingAddress.paymentMethod;

      
      if (cartItems.length === 0) {
        Swal.fire("Cart is empty!", "Please add items to cart before checkout.", "error");
        return;
      }

      try {
        if (values.paymentMethod === "COD") {
          await axios.post(`${BACKEND_URL}/api/order/confirm`, {
            items: cartItems,
           
            shippingAddress,
            paymentMethod: values.paymentMethod,
            total
          }, { withCredentials: true });

          Swal.fire("✅ Order Placed!", "Cash on Delivery selected.", "success");
          resetForm();
          navigate("/order-success");
        } else {
          const cardElement = elements.getElement(CardElement);
          if (!stripe || !elements || !cardElement) {
            Swal.fire("⚠️ Wait!", "Stripe not ready.", "warning");
            return;
          }

          const { data } = await axios.post(`${BACKEND_URL}/api/payment/create`, {
            items: cartItems,
          
            shippingAddress,
            paymentMethod: values.paymentMethod,
            total
          }, { withCredentials: true });

          const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${values.firstName} ${values.lastName}`,
                email: values.email
              }
            }
          });

          if (result.error) {
            Swal.fire("❌ Payment Failed!", result.error.message, "error");
          } else {
            await axios.post(`${BACKEND_URL}/api/order/confirm`, {
              items: cartItems,
            
              shippingAddress,
              paymentMethod: values.paymentMethod,
              total
            }, { withCredentials: true });

            Swal.fire("🎉 Payment Success!", "Your order has been placed.", "success");
            resetForm();
            navigate("/order-success");
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("❌ Error", err.response?.data?.message || "Something went wrong", "error");
      }
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (!res.data || !res.data.user) throw new Error("Not authenticated");
      } catch (err) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login to proceed to checkout",
          showConfirmButton: false
        });
        navigate("/auth/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        <Box sx={{ flex: 2, width: { xs: "100%", md: "60%" } }}>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant="h6" className="mb-3">Personal Details</Typography>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              {Object.keys(formik.initialValues).filter(f => f !== "paymentMethod").map((field) => (
                <TextField
                  key={field}
                  name={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formik.values[field]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched[field] && Boolean(formik.errors[field])}
                  helperText={formik.touched[field] && formik.errors[field]}
                  fullWidth
                />
              ))}
            </Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Payment Method</Typography>
            <RadioGroup
              row
              name="paymentMethod"
              value={formik.values.paymentMethod}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="Stripe" control={<Radio />} label="Stripe" />
              <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery" />
            </RadioGroup>
            {formik.touched.paymentMethod && formik.errors.paymentMethod && (
              <Typography color="error" fontSize="small">{formik.errors.paymentMethod}</Typography>
            )}
            {formik.values.paymentMethod === "Stripe" && (
              <Box sx={{ border: "1px solid #ccc", p: 2, mt: 2, borderRadius: 2 }}>
                <CardElement options={{ hidePostalCode: true }} />
              </Box>
            )}
            <Button variant="contained" type="submit" disabled={formik.values.paymentMethod === "Stripe" && !stripe} sx={{ mt: 3 }} fullWidth>
              Pay ₹{total}
            </Button>
          </form>
        </Box>

        <Box sx={{ flex: 1, width: { xs: "100%", md: "40%" }, border: "1px solid #ccc", p: 2 }}>
          <Typography variant="h6">Order Summary</Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
            <List>
              {cartItems.map((item, i) => (
                <ListItem key={i} alignItems="flex-start">
                  <Avatar src={item.image} alt={item.name} sx={{ width: 60, height: 60, mr: 2 }} />
                  {/* <ListItemText 
                    primary={<Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>}
                    secondary={<>
                      <Typography variant="body2">Item Price: ₹{item.price}</Typography>
                      <Typography variant="body2">Quantity: {item.quantity}</Typography>
                    </>}
                  /> */}

                  <ListItemText
  primary={item.name}
  secondary={`Item Price: ₹${item.price} | Quantity: ${item.quantity}`}
  secondaryTypographyProps={{ component: "div" }}
/>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography fontWeight="bold">₹{(item.price * item.quantity).toFixed(2)}</Typography>
                    <IconButton color="error" onClick={async () => {
                      try {
                        await axios.delete(`${BACKEND_URL}/api/cart/remove/${item.productId}`, { withCredentials: true });
                        dispatch(removeFromCart(item.productId));
                      } catch (err) {
                        console.error("Failed to delete from backend:", err);
                        Swal.fire("❌ Error", "Failed to remove item from server.", "error");
                      }
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography><strong>Subtotal:</strong></Typography>
            <Typography fontWeight="bold">₹{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography><strong>Shipping:</strong></Typography>
            <Typography fontWeight="bold">₹{shippingCost.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography><strong>Discount:</strong></Typography>
            <Typography fontWeight="bold">₹{discount.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold"><strong>TOTAL:</strong></Typography>
            <Typography fontWeight="bold">₹{total}</Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Checkout;
