
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
import NotFoundPage from "./pages/not-found"
import Detail from "./pages/detail"

// Import dashboard routes
import dashboardRoutes from './dashboard/routes';


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
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
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
    </>
  )
}




export default App
