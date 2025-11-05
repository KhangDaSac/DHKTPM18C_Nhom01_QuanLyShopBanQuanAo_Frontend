import { type RouteObject } from 'react-router-dom';
import DashboardLayout from './layout';
import { DashboardRoute } from '../routes/ProtectedRoute';

// Import dashboard pages
import Dashboard from './index';
import Settings from './pages/settings';
import Products from './pages/products';
import Customers from './pages/customers';
import Categories from './pages/categories';
import Orders from './pages/orders';
import Promotions from './pages/promotions';
import PercentagePromotions from './pages/promotions/percentage';
import FixedPromotions from './pages/promotions/fixed';
import Roles from './pages/roles';
import Stores from './pages/stores';
import ThemeTest from './components/theme-test';
import ProductDetail from "../pages/detail";
import AdminProfile from "./pages/profile";

const dashboardRoutes: RouteObject = {
    path: 'dashboard',
    element: (
        <DashboardRoute>
            <DashboardLayout />
        </DashboardRoute>
    ),
    children: [
        { index: true, element: <Dashboard /> },
        { path: 'products', element: <Products /> },
        { path: 'customers', element: <Customers /> },
        { path: 'categories', element: <Categories /> },
        { path: 'orders', element: <Orders /> },
        { path: 'promotions', element: <Promotions /> },
        { path: 'promotions/percentage', element: <PercentagePromotions /> },
        { path: 'promotions/fixed', element: <FixedPromotions /> },
        { path: 'roles', element: <Roles /> },
        { path: 'stores', element: <Stores /> },
        { path: 'settings', element: <Settings /> },
        { path: 'profile', element: <AdminProfile /> },
        { path: 'theme-test', element: <ThemeTest /> },
        { path: 'products/:id', element: <ProductDetail /> },
    ],
};

export default dashboardRoutes;