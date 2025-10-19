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
import Roles from './pages/roles';
import Stores from './pages/stores';
import ThemeTest from './components/theme-test';
import ProductDetail from "../pages/detail";

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
        { path: 'roles', element: <Roles /> },
        { path: 'stores', element: <Stores /> },
        { path: 'settings', element: <Settings /> },
        { path: 'theme-test', element: <ThemeTest /> },
        { path: 'products/:id', element: <ProductDetail /> },
    ],
};

export default dashboardRoutes;