import { type RouteObject } from 'react-router-dom';
import DashboardLayout from './layout';

// Import dashboard main page
import Dashboard from './index';

// Import dashboard pages
import Settings from './pages/settings';
import Products from './pages/products';
import Customers from './pages/customers';
import Categories from './pages/categories';
import Orders from './pages/orders';
import Promotions from './pages/promotions';
import Roles from './pages/roles';
import Stores from './pages/stores';
import ThemeTest from './components/theme-test';

const dashboardRoutes: RouteObject = {
    path: 'dashboard',
    element: <DashboardLayout />,
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
    ],
};

export default dashboardRoutes;