
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/layout';
import HomePage from "./pages/home"
import NewsPage from "./pages/news"
import AboutPage from "./pages/about"
import LoginPage from "./pages/login"
import RegisterPage from './pages/register';
import StoresPage from "./pages/stores";
import ContactPage from "./pages/contact";
import NotFoundPage from "./pages/not-found";
import ProfilePage from "./pages/profile";
import ProfileAddress from "./pages/profile/ProfileAddress";
import ProfileOrders from "./pages/profile/ProfileOrders";
import ProfileChangePassword from "./pages/profile/ProfileChangePassword";
import AuthTestPage from "./pages/auth-test";

// Import protected routes
import { ProtectedRoute, AuthRoute } from './routes/ProtectedRoute';

import Detail from "./pages/detail"

import ProductList from './pages/products';

import Cart from './components/cart';
import CheckoutPage from './pages/checkout/CheckoutPage';
// Context
import { CartProvider } from './components/contexts/CartContext';
import FavoritesPage from './pages/favorites/FavoritesPage';
// Import dashboard routes
import dashboardRoutes from './dashboard/routes';
// Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Import React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



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

        // Routes chỉ cho phép user CHƯA đăng nhập
        {
          path: "login",
          element: (
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          )
        },
        {
          path: "register",
          element: (
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          )
        },

        // Routes chỉ cho phép user ĐÃ đăng nhập
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )
        },
        {
          path: "profile/address",
          element: (
            <ProtectedRoute>
              <ProfileAddress />
            </ProtectedRoute>
          )
        },
        {
          path: "profile/order",
          element: (
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          )
        },
        {
          path: "profile/changepassword",
          element: (
            <ProtectedRoute>
              <ProfileChangePassword />
            </ProtectedRoute>
          )
        },
        {
          path: "auth-test",
          element: (
            <ProtectedRoute>
              <AuthTestPage />
            </ProtectedRoute>
          )
        },



        { path: "products", element: <ProductList /> },



        { path: "detail/:id", element: <Detail /> },

        // Phần sản phẩm

  { path: "carts", element: <Cart /> },
  { path: "favorites", element: <FavoritesPage /> },
        { path: 'checkoutpage', element: <CheckoutPage /> },
      ]
    },

    // Dashboard routes
    dashboardRoutes,

    {
      path: "*",
      element: <NotFoundPage />,
    },
  ])


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
  )
}




export default App
