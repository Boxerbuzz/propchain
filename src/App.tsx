import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetails from "./pages/PropertyDetails";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/browse" element={<BrowseProperties />} />
            <Route path="/browse/:id" element={<PropertyDetails />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/verify-phone" element={<VerifyPhone />} />
            <Route path="/onboarding/welcome" element={<Welcome />} />
            <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
            <Route path="/kyc/start" element={<KYCStart />} />
            <Route path="/kyc/document-type" element={<DocumentType />} />
            <Route path="/kyc/upload-id" element={<UploadID />} />
            <Route path="/kyc/selfie" element={<Selfie />} />
            <Route path="/kyc/address" element={<Address />} />
            <Route path="/kyc/review" element={<Review />} />
            <Route path="/kyc/status" element={<KYCStatus />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet/setup" element={<WalletSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
