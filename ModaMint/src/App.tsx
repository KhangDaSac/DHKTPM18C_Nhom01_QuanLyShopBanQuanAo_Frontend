
import './App.css'
import { BrowserRouter, createBrowserRouter, Link, Route, RouterProvider, Routes } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import Login from './pages/login';
import Register from './pages/register';
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

// Import protected routes
import { ProtectedRoute, AuthRoute } from './routes/ProtectedRoute';

import Detail from "./pages/detail"

// Import dashboard routes
import dashboardRoutes from './dashboard/routes';

// Import React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import ProductList from './pages/product/ProductList';



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


        { path: "products", element: <ProductList /> },


        { path: "detail/:id", element: <Detail /> },
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
    <>
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
    </>
  )
}




export default App
