import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import About from "../About";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home/Home";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminRoute from "../AdminRoute/AdminRoute";
import AdminUserDetails from "../pages/AdminUserDetails/AdminUserDetails";
import ForgetPassword from "../pages/ForgetPassword/ForgetPassword";
import ProductFormUpload from "../pages/ProductFormUpload/ProductFormUpload";
import ProductDetail from "../components/ProductDetail/ProductDetail";
import CategoryProduct from "../pages/CategoryProduct/CategoryProduct";
import Faq from "../pages/Faq/Faq";
import Contact from "../pages/Contact/Contact";
import PrivacyPolicy from "../components/PrivacyPolicy/PrivacyPolicy";
import TearmsCondition from "../components/TearmsCondition/TearmsCondition";

import Order from "../pages/order/Order";
import Checkout from "../pages/Checkout/Checkout";
import CheckoutWrapper from "../pages/Checkout/CheckoutWrapper";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import MyOrdersPage from "../pages/MyOrdersPage/MyOrdersPage";

import InvoiceRoutePage from "../pages/InvoiceRoutePage/InvoiceRoutePage";
// import Weather from "../pages/Weather/Weather";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "admin/dashboard",
                element: (
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                ),
                children: [
                    {
                        path: "user-details",
                        element: <AdminUserDetails />,
                    },
                    {
                        path: "upload-product",
                        element: <ProductFormUpload />,
                    },
                    {
                        path: "/admin/dashboard/orders",
                        element: <MyOrdersPage />
                    },
                    
                   

                ],
            },

            {
                path: "/",   // /Home
                element: <Home />
            },
            {
                path: "about",   // /about
                element: <About />
            },
            {
                path: "auth/login",   // /authlogin
                element: <Login />
            },
            {
                path: "auth/register",  // auth register
                element: <Register />
            },
            {
                path: "auth/forgot-password",
                element: <ForgetPassword />
            },
            {
                path: "/product/:name/:id",
                element: <ProductDetail />
            },
            {
                path: "/search",
                element: <CategoryProduct />
            },
            {
                path: "/faq",
                element: <Faq />
            },
            {
                path: "/contact",
                element: <Contact />
            },
            {
                path: "/privacy-policy",
                element: <PrivacyPolicy />
            },
            {
                path: "/terms-condition",
                element: <TearmsCondition />
            },
            {
                path:"/checkout",
                element:<CheckoutWrapper/>
            },
            {
                path:"/order-success",
                element:<OrderSuccess/>
            },
             {
                        path: "/order/:id",
                        element: <InvoiceRoutePage />
                    },
                    
        ]

    }
])

export default router