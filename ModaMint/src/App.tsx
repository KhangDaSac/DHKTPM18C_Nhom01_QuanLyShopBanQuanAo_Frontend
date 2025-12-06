import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import { RootLayout } from "./components/layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Context
import { CartProvider } from "./contexts/CartContext";

// Pages
import HomePage from "./pages/home";
import NewsPage from "./pages/news";
import AboutPage from "./pages/about";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import StoresPage from "./pages/stores";
import ContactPage from "./pages/contact";
import NotFoundPage from "./pages/not-found";
import ProfilePage from "./pages/profile";
import ProfileAddress from "./pages/profile/ProfileAddress";
import ProfileOrders from "./pages/profile/ProfileOrders";
import ProfileChangePassword from "./pages/profile/ProfileChangePassword";
import AuthTestPage from "./pages/auth-test";
import SearchPage from './pages/search';

import Detail from "./pages/detail";
import ProductList from "./pages/products";
import CartPage from "./pages/cart";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import OrderSuccessPage from "./pages/order-success";
import GoogleAuthCallback from "./pages/google-auth-callback";

// Routes
import { ProtectedRoute, AuthRoute } from './routes/ProtectedRoute';
import dashboardRoutes from './dashboard/routes';
import CheckoutPage from './pages/checkout';
import OrderDetailPage from './pages/order-detail';



function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "news", element: <NewsPage /> },
        { path: "about", element: <AboutPage /> },
        { path: "stores", element: <StoresPage /> },
        { path: "contact", element: <ContactPage /> },
        { path: "detail", element: <Detail /> },

        // Routes chỉ cho phép user CHƯA đăng nhập
        {
          path: "login",
          element: (
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          ),
        },
        {
          path: "register",
          element: (
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          ),
        },
        {
          path: "auth/google",
          element: <GoogleAuthCallback />,
        },

        // Routes chỉ cho phép user ĐÃ đăng nhập
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile/address",
          element: (
            <ProtectedRoute>
              <ProfileAddress />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile/order",
          element: (
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile/changepassword",
          element: (
            <ProtectedRoute>
              <ProfileChangePassword />
            </ProtectedRoute>
          ),
        },
        {
          path: "auth-test",
          element: (
            <ProtectedRoute>
              <AuthTestPage />
            </ProtectedRoute>
          ),
        },

        // Product listing & gender/slug routes
        { path: "products", element: <ProductList /> },
        { path: "search", element: <SearchPage /> },
        { path: "nam/:slug", element: <ProductList /> },
        { path: "nu/:slug", element: <ProductList /> },
        { path: "carts", element: <CartPage /> },

        { path: "detail/:id", element: <Detail /> },

        // Phần sản phẩm

        { path: "favorites", element: <FavoritesPage /> },
        { path: 'checkoutpage', element: <CheckoutPage /> },
        { path: 'order-success/:orderId', element: <OrderSuccessPage /> },
        {path: '/profile/order/:id', element: <OrderDetailPage/>},
      ]
    },

    // Dashboard routes
    dashboardRoutes,

    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  return (
    <ErrorBoundary>
      <CartProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
