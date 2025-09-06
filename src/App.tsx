import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./components/LoginPage";
import ModeSelectionPage from "./components/ModeSelectionPage";
import StartShiftReport from "./components/StartShiftReport";
import StartShiftReport40NQ from "./components/StartShiftReport40NQ";
import EndShiftReport from "./components/EndShiftReport";
import EndShiftReport40NQ from "./components/EndShiftReport40NQ";
import EndShiftReport35NBK from "./components/EndShiftReport35NBK";
import StartShiftReport35NBK from "./components/StartShiftReport35NBK";
import BranchReportDashboard from "./components/BranchReportDashboard";
import HN35Dashboard from "./components/HN35Dashboard";
import HN40Dashboard from "./components/HN40Dashboard";
import CenterDashboard from "./components/CenterDashboard";
import AccountManagementPage from "./components/AccountManagementPage";
import AccountSettingsPage from "./components/AccountSettingsPage";
import AdminRPCDemo from "./components/AdminRPCDemo";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <ModeSelectionPage />
                </PrivateRoute>
              } />
              <Route path="/branch-dashboard" element={
                <PrivateRoute requireRole="manager">
                  <BranchReportDashboard />
                </PrivateRoute>
              } />
              <Route path="/HN35-dashboard" element={
                <PrivateRoute>
                  <HN35Dashboard />
                </PrivateRoute>
              } />
              <Route path="/HN40-dashboard" element={
                <PrivateRoute>
                  <HN40Dashboard />
                </PrivateRoute>
              } />
              <Route path="/Center-dashboard" element={
                <PrivateRoute>
                  <CenterDashboard />
                </PrivateRoute>
              } />
              <Route path="/start-shift" element={
                <PrivateRoute>
                  <StartShiftReport />
                </PrivateRoute>
              } />
              <Route path="/start-shift-40NQ" element={
                <PrivateRoute>
                  <StartShiftReport40NQ />
                </PrivateRoute>
              } />
              <Route path="/end-shift" element={
                <PrivateRoute>
                  <EndShiftReport />
                </PrivateRoute>
              } />
              <Route path="/end-shift-40NQ" element={
                <PrivateRoute>
                  <EndShiftReport40NQ />
                </PrivateRoute>
              } />
              <Route path="/end-shift-35NBK" element={
                <PrivateRoute>
                  <EndShiftReport35NBK />
                </PrivateRoute>
              } />
              <Route path="/start-shift-35NBK" element={
                <PrivateRoute>
                  <StartShiftReport35NBK />
                </PrivateRoute>
              } />
              <Route path="/account-management" element={
                <PrivateRoute requireRole="central">
                  <AccountManagementPage />
                </PrivateRoute>
              } />
              <Route path="/account-settings" element={
                <PrivateRoute>
                  <AccountSettingsPage />
                </PrivateRoute>
              } />
              <Route path="/admin-rpc-demo" element={
                <PrivateRoute requireRole="admin">
                  <AdminRPCDemo />
                </PrivateRoute>
              } />
              <Route path="/welcome" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
