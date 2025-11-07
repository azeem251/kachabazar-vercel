import React, { useEffect } from "react";
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  updateCartItemPrice,
  setCartItems,
} from "../../ReduxSlices/cartSlice";
import { BACKEND_URL } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ open, onClose, focusTargetRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth)
  const handleDrawerClose = () => {
    onClose(); // यह drawer बंद करेगा
    setTimeout(() => {
      focusTargetRef?.current?.focus(); // drawer के बाहर focus भेजो
    }, 150);
  };
  // ✅ Load cart from backend
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/cart`, { withCredentials: true })
      .then((res) => {
        dispatch(setCartItems(res.data.items || []));
      })
      .catch((err) => console.error("Fetch cart failed", err));
  }, [dispatch]);

  // ✅ Update quantity and price in backend
  const updateQuantity = async (productId, quantity, unitPrice) => {
    try {
      const updatedPrice = unitPrice * quantity;

      await axios.put(
        `${BACKEND_URL}/api/cart/update`,
        {
          productId,
          quantity,
          price: updatedPrice,
        },
        { withCredentials: true }
      );

      // ✅ update Redux price after API call
      dispatch(updateCartItemPrice({ productId, newQuantity: quantity, newPrice: updatedPrice }));
    } catch (err) {
      console.error("Update quantity/price failed", err);
    }
  };

  const handleIncrement = (productId, quantity, unitPrice) => {
    dispatch(incrementQuantity(productId));
    updateQuantity(productId, quantity + 1, unitPrice);
  };

  const handleDecrement = (productId, quantity, unitPrice) => {
    if (quantity > 1) {
      dispatch(decrementQuantity(productId));
      updateQuantity(productId, quantity - 1, unitPrice);
    }
  };

  const handleRemove = async (productId) => {
    if (!productId) {
      console.error("Invalid productId:", productId);
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/cart/remove/${productId}`,
        { withCredentials: true }
      );

      // ✅ Option 1: Remove from Redux (must be correctly implemented)
      dispatch(removeFromCart(productId));

      // ✅ Option 2 (recommended): Fetch fresh cart from backend api/cart
      // const res = await axios.get(`${BACKEND_URL}/api/cart`, {
      //   withCredentials: true,
      // });
      // dispatch(setCartItems(res.data.items || []));

      console.log("Item removed and cart updated");
    } catch (err) {
      console.error("Remove item failed", err?.response?.data || err.message);
    }
  };
  useEffect(() => {
    if (user?.user) {
      axios.get(`${BACKEND_URL}/api/cart`, { withCredentials: true })
        .then(res => {
          dispatch(setCartItems(res.data.items || []));
        })
        .catch(err => {
          console.error("Failed to fetch cart", err);
          dispatch(setCartItems([])); // fallback to empty
        });
    } else {
      dispatch(setCartItems([])); // clear cart if not logged in
    }
  }, [user]);


  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price, 0)
    .toFixed(2);

  return (
   <Drawer
  anchor="right"
  open={open}
  onClose={onClose}
  ModalProps={{
    keepMounted: true,       // Prevent unmounting
    disableEnforceFocus: false, // Focus stays in drawer
  }}
>
      <Box sx={{ width: 400, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, bgcolor: "#f0f4ff" }}>
          <Typography variant="h6" fontWeight="bold">
            <ShoppingCartIcon sx={{ mr: 1 }} /> Shopping Cart
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Items */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {cartItems.length === 0 ? (
            <Typography textAlign="center" mt={5} color="gray">
              <img
                src="https://img.freepik.com/free-vector/supermarket-shopping-cart-concept-illustration_114360-22408.jpg"
                alt="Empty Cart"
                style={{ width: 200, display: "block", margin: "0 auto" }}
              />
              <strong className="text-red-600">Cart is empty.</strong>
            </Typography>
          ) : (
            cartItems.map((item, index) => {
              const productId = item.productId || item.id || item._id || `temp-${index}`;
              const unitPrice = item.price / item.quantity;

              return (
                <Box
                  key={`${productId}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    p: 1,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12, objectFit: "cover" }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight="bold" fontSize={14}>
                      {item.name}
                    </Typography>
                    <Typography fontSize={13} color="gray">
                      ₹{(unitPrice * item.quantity).toFixed(2)}
                    </Typography>
                    <Box sx={{ mt: 1, display: "flex", width: "90px", alignItems: "center", border: "1px solid #ccc", borderRadius: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleDecrement(productId, item.quantity, unitPrice)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography px={1}>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleIncrement(productId, item.quantity, unitPrice)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <IconButton onClick={() => handleRemove(productId)} sx={{ color: "red" }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: "1px solid #ccc" }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#10b981",
              textTransform: "none",
              p: 1,
              fontWeight: "bold",
              "&:hover": { bgcolor: "#0e9e6e" },
            }}
            onClick={()=>{
              navigate("/checkout"),
              onClose()
            }}
          >
            Proceed To Checkout
          </Button>
          <Typography
            sx={{
              position: "absolute",
              right: 24,
              bottom: 22,
              bgcolor: "white",
              px: 1,
              borderRadius: 1,
              fontWeight: "bold",
            }}
          >
            ₹{totalPrice}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
