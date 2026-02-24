import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RouteGuard from "@/components/RouteGuard";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import SignUpPage from "@/pages/SignUp";
import MyStorePage from "@/pages/MyStore";
import DashboardPage from "@/pages/Dashboard";
import POSPage from "@/pages/POS";
import ProductsPage from "@/pages/Products";
import InventoryPage from "@/pages/Inventory";
import PurchaseOrdersPage from "@/pages/PurchaseOrders";
import AdjustmentsPage from "@/pages/Adjustments";
import CategoriesPage from "@/pages/Categories";
import ReportsPage from "@/pages/Reports";
import UsersPage from "@/pages/Users";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: ('ADMIN' | 'MANAGER' | 'CASHIER')[] }) => (
  <RouteGuard roles={roles}>
    <AppLayout>{children}</AppLayout>
  </RouteGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/my-store" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><MyStorePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'CASHIER']}><POSPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><ProductsPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><InventoryPage /></ProtectedRoute>} />
            <Route path="/purchase-orders" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><PurchaseOrdersPage /></ProtectedRoute>} />
            <Route path="/adjustments" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><AdjustmentsPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
