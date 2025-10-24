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
import Favorites from "./pages/Favorites";
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
import WalletSetup from "./pages/wallet/WalletSetup";
import WithdrawPage from "./pages/wallet/Withdraw";
import WalletSettings from "./pages/wallet/Settings";
import Account from "./pages/account/Account";
import AccountDashboard from "./pages/account/Dashboard";
import Discovery from "./pages/account/Discovery";
import TokenDetail from "./pages/account/TokenDetail";
import AllTransactions from "./pages/account/AllTransactions";
import BuyTokens from "./pages/account/tokens/Buy";
import SellTokens from "./pages/account/tokens/Sell";
import SendTokens from "./pages/account/tokens/Send";
import SwapTokens from "./pages/account/tokens/Swap";
import WithdrawFunds from "./pages/account/wallet/Withdraw";
import FundWallet from "./pages/account/wallet/Fund";
import PropertyManagement from "./pages/property/Management";
import EventSimulator from "./pages/property/EventSimulator";
import PropertyView from "./pages/property/PropertyView";
import PropertyEdit from "./pages/property/PropertyEdit";
import TokenizeProperty from "./pages/property/Tokenize";
import Proposals from "./pages/property/Proposals";
import Profile from "./pages/settings/Profile";
import Notifications from "./pages/settings/Notifications";
import Security from "./pages/settings/Security";
import SystemDocumentation from "./pages/SystemDocumentation";
import Chat from "./pages/chat/Chat";
import ChatRoom from "./pages/chat/ChatRoom";
import RegisterProperty from "./pages/properties/RegisterProperty";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import RiskDisclosure from "./pages/legal/RiskDisclosure";
import Regulatory from "./pages/legal/Regulatory";
import EquityTokenizationTerms from "./pages/legal/EquityTokenizationTerms";
import DebtTokenizationTerms from "./pages/legal/DebtTokenizationTerms";
import RevenueTokenizationTerms from "./pages/legal/RevenueTokenizationTerms";
import SupportCenter from "./pages/support/SupportCenter";
import HowItWorks from "./pages/HowItWorks";
import AboutUs from "./pages/AboutUs";
import SecurityPage from "./pages/Security";
import VerifyDocument from "./pages/VerifyDocument";
import PitchDeck from "./pages/pitch/PitchDeck";
import AllNotifications from "./pages/AllNotifications";
import AllActivities from "./pages/AllActivities";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import RouteGuard from "./components/auth/RouteGuard";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "./pages/NotFound";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster />
        <SpeedInsights />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes (with main layout) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Landing />} />
              <Route path="/browse" element={<BrowseProperties />} />
              <Route path="/browse/:id" element={<PropertyDetails />} />
              <Route path="/browse/:id/invest" element={<InvestmentFlow />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/pitch" element={<PitchDeck />} />
            <Route path="/verify/:documentNumber" element={<VerifyDocument />} />
              {/* Onboarding routes */}
              <Route path="/onboarding/welcome" element={<Welcome />} />
              <Route
                path="/onboarding/profile-setup"
                element={<ProfileSetup />}
              />
              {/* KYC routes */}
              <Route path="/kyc/start" element={<KYCStart />} />
              <Route path="/kyc/document-type" element={<DocumentType />} />
              <Route path="/kyc/upload-id" element={<UploadID />} />
              <Route path="/kyc/selfie" element={<Selfie />} />
              <Route path="/kyc/address" element={<Address />} />
              <Route path="/kyc/review" element={<Review />} />
              <Route path="/kyc/status" element={<KYCStatus />} />

              {/* Authenticated routes (MainLayout) */}
              <Route element={<RouteGuard />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route
                  path="/portfolio/:tokenizationId"
                  element={<PortfolioDetail />}
                />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<AllNotifications />} />
                <Route path="/activities" element={<AllActivities />} />
                <Route path="/wallet/setup" element={<WalletSetup />} />
                <Route path="/wallet/withdraw" element={<WithdrawPage />} />
                <Route path="/wallet/settings" element={<WalletSettings />} />
                <Route path="/account" element={<Account />}>
                  <Route index element={<AccountDashboard />} />
                  <Route path="dashboard" element={<AccountDashboard />} />
                  <Route path="transactions" element={<AllTransactions />} />
                  <Route path="discovery" element={<Discovery />} />
                  <Route path="discovery/:tokenId" element={<TokenDetail />} />
                  <Route path="tokens/buy" element={<BuyTokens />} />
                  <Route path="tokens/sell" element={<SellTokens />} />
                  <Route path="tokens/send" element={<SendTokens />} />
                  <Route path="tokens/swap" element={<SwapTokens />} />
                  <Route path="wallet/withdraw" element={<WithdrawFunds />} />
                  <Route path="wallet/fund" element={<FundWallet />} />
                </Route>
                <Route
                  path="/property/management"
                  element={<PropertyManagement />}
                />
                <Route path="/property/events" element={<EventSimulator />} />
                <Route
                  path="/property/:propertyId/view"
                  element={<PropertyView />}
                />
                <Route
                  path="/property/:propertyId/edit"
                  element={<PropertyEdit />}
                />
                <Route
                  path="/property/:propertyId/tokenize"
                  element={<TokenizeProperty />}
                />
                <Route
                  path="/properties/:propertyId/governance"
                  element={<Proposals />}
                />
                <Route
                  path="/properties/register"
                  element={<RegisterProperty />}
                />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:roomId" element={<ChatRoom />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route
                  path="/settings/notifications"
                  element={<Notifications />}
                />
                <Route path="/settings/security" element={<Security />} />
                <Route path="/system-docs" element={<SystemDocumentation />} />
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

            {/* Legal and Support Routes */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/risk-disclosure" element={<RiskDisclosure />} />
            <Route path="/regulatory" element={<Regulatory />} />
            <Route path="/legal/equity-tokenization-terms" element={<EquityTokenizationTerms />} />
            <Route path="/legal/debt-tokenization-terms" element={<DebtTokenizationTerms />} />
            <Route path="/legal/revenue-tokenization-terms" element={<RevenueTokenizationTerms />} />
            <Route path="/support" element={<SupportCenter />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;