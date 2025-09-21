import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetails from "./pages/PropertyDetails";
import InvestmentFlow from "./pages/InvestmentFlow";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyPhone from "./pages/auth/VerifyPhone";
import Welcome from "./pages/onboarding/Welcome";
import ProfileSetup from "./pages/onboarding/ProfileSetup";
import KYCStart from "./pages/kyc/Start";
import DocumentType from "./pages/kyc/DocumentType";
import UploadID from "./pages/kyc/UploadID";
import Selfie from "./pages/kyc/Selfie";
import Address from "./pages/kyc/Address";
import Review from "./pages/kyc/Review";
import KYCStatus from "./pages/kyc/Status";
import Dashboard from "./pages/Dashboard";
import WalletSetup from "./pages/wallet/Setup";
import WalletDashboard from "./pages/wallet/Dashboard";
import PropertyManagement from "./pages/property/Management";
import Profile from "./pages/settings/Profile";
import Notifications from "./pages/settings/Notifications";
import Security from "./pages/settings/Security";
import Chat from "./pages/chat/Chat";
import ChatRoom from "./pages/chat/ChatRoom";
import CreateWallet from "./pages/wallet/Create";
import ConnectWallet from "./pages/wallet/Connect";
import FundWallet from "./pages/wallet/Fund";
import WalletSettings from "./pages/wallet/Settings";
import RegisterProperty from "./pages/properties/Register";
import UploadDocs from "./pages/properties/UploadDocs";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes (with main layout) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Landing />} />
              <Route path="/browse" element={<BrowseProperties />} />
              <Route path="/browse/:id" element={<PropertyDetails />} />
              <Route path="/browse/:id/invest" element={<InvestmentFlow />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:tokenizationId" element={<PortfolioDetail />} />
              {/* Onboarding routes */}
              <Route path="/onboarding/welcome" element={<Welcome />} />
              <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
              {/* KYC routes */}
              <Route path="/kyc/start" element={<KYCStart />} />
              <Route path="/kyc/document-type" element={<DocumentType />} />
              <Route path="/kyc/upload-id" element={<UploadID />} />
              <Route path="/kyc/selfie" element={<Selfie />} />
              <Route path="/kyc/address" element={<Address />} />
              <Route path="/kyc/review" element={<Review />} />
              <Route path="/kyc/status" element={<KYCStatus />} />

              {/* Authenticated routes (MainLayout) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet/setup" element={<WalletSetup />} />
                <Route path="/wallet/dashboard" element={<WalletDashboard />} />
                <Route path="/wallet/create" element={<CreateWallet />} />
                <Route path="/wallet/connect" element={<ConnectWallet />} />
                <Route path="/wallet/fund" element={<FundWallet />} />
                <Route path="/wallet/settings" element={<WalletSettings />} />
                <Route path="/property/management" element={<PropertyManagement />} />
                <Route path="/properties/register" element={<RegisterProperty />} />
                <Route path="/properties/upload-docs" element={<UploadDocs />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:roomId" element={<ChatRoom />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route path="/settings/notifications" element={<Notifications />} />
                <Route path="/settings/security" element={<Security />} />
              </Route>
            </Route>

            {/* Auth routes (AuthLayout) */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="verify-phone" element={<VerifyPhone />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;