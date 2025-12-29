
import React from 'react';
// Force HMR
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetail from './pages/PropertyDetail';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ComparePage from './pages/ComparePage';
import ServicesPage from './pages/ServicesPage';
import RuzziAIPage from './pages/RuzziAIPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Protected Route Component using Context
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useApp();

  // While loading, show nothing or a spinner to prevent premature redirection
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/propiedades" element={<Layout><PropertiesPage /></Layout>} />
        <Route path="/propiedad/:id" element={<Layout><PropertyDetail /></Layout>} />
        <Route path="/servicios" element={<Layout><ServicesPage /></Layout>} />
        <Route path="/nosotros" element={<Layout><AboutPage /></Layout>} />
        <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
        <Route path="/comparar" element={<Layout><ComparePage /></Layout>} />
        <Route path="/ruzzi-ai" element={<Layout><RuzziAIPage /></Layout>} />
        <Route path="/privacidad" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terminos" element={<Layout><TermsPage /></Layout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
