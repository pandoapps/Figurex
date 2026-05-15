import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import ParticipantLayout from './components/layout/ParticipantLayout';
import AdminLayout from './components/layout/AdminLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Market from './pages/Market';
import Checkout from './pages/Checkout';
import DashboardHome from './pages/participant/DashboardHome';
import MyAds from './pages/participant/MyAds';
import MyPurchases from './pages/participant/MyPurchases';
import MySales from './pages/participant/MySales';
import MyTickets from './pages/participant/MyTickets';
import Profile from './pages/participant/Profile';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAds from './pages/admin/ManageAds';
import ManageTeams from './pages/admin/ManageTeams';
import ManagePlayers from './pages/admin/ManagePlayers';
import ConfigAsaas from './pages/admin/ConfigAsaas';
import ConfigEvolution from './pages/admin/ConfigEvolution';
import ConfigFretenet from './pages/admin/ConfigFretenet';
import SalesHistory from './pages/admin/SalesHistory';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass px-8 py-6 flex items-center gap-4">
          <span className="w-5 h-5 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#b0bec5]">Carregando a Figurex...</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/mercado" element={<Market />} />

        <Route
          path="/checkout/:adId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/painel"
          element={
            <ProtectedRoute>
              <ParticipantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="anuncios" element={<MyAds />} />
          <Route path="compras" element={<MyPurchases />} />
          <Route path="vendas" element={<MySales />} />
          <Route path="chamados" element={<MyTickets />} />
          <Route path="perfil" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="usuarios" element={<ManageUsers />} />
          <Route path="anuncios" element={<ManageAds />} />
          <Route path="selecoes" element={<ManageTeams />} />
          <Route path="jogadores" element={<ManagePlayers />} />
          <Route path="asaas" element={<ConfigAsaas />} />
          <Route path="fretenet" element={<ConfigFretenet />} />
          <Route path="whatsapp" element={<ConfigEvolution />} />
          <Route path="vendas" element={<SalesHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
