/**
 * Panel admin KHB (dipindahkan dari proyek ChatBot-KHB).
 *
 * Di-mount pada `/admin/*` di dalam aplikasi landing page New-KHB-V3.
 * Semua rute internal memakai prefiks `/admin`; API tetap dilayani Express
 * di `server/` melalui proxy Vite `/api`.
 */
import { Routes, Route, Navigate } from 'react-router-dom';

import './styles/base.css';
import './styles/admin.css';
import './styles/auth.css';
import './styles/extras.css';
import './styles/embed.css';
import './styles/chat-layout.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPage from './pages/ForgotPage';
import ResetPage from './pages/ResetPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import WidgetPage from './pages/WidgetPage';
import WidgetChatPage from './pages/WidgetChatPage';
import EmbedChatPage from './pages/EmbedChatPage';
import StoreChatPage from './pages/StoreChatPage';
import SyaratPage from './pages/SyaratPage';
import PrivasiPage from './pages/PrivasiPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardPage from './pages/DashboardPage';
import GettingStartedPage from './pages/GettingStartedPage';
import ChatPage from './pages/ChatPage';
import ChatbotPage from './pages/ChatbotPage';
import ChannelListPage from './pages/ChannelListPage';
import ChannelCreatePage from './pages/ChannelCreatePage';
import ChannelEditPage from './pages/ChannelEditPage';
import ProductListPage from './pages/ProductListPage';
import ProductFormPage from './pages/ProductFormPage';
import KnowledgePage from './pages/KnowledgePage';
import KnowledgeBuilderPage from './pages/KnowledgeBuilderPage';
import CustomersPage from './pages/CustomersPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import EditProfilePage from './pages/EditProfilePage';
import IntegrasiPage from './pages/IntegrasiPage';

import AppLayout from './components/AppLayout';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Halaman publik milik chatbot (dipakai untuk embed di landing) */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route path="/admin/forgot" element={<ForgotPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPage />} />
      <Route path="/admin/reset" element={<ResetPage />} />
      <Route path="/admin/change-password" element={<ChangePasswordPage />} />
      <Route path="/admin/widget" element={<WidgetPage />} />
      <Route path="/admin/syarat" element={<SyaratPage />} />
      <Route path="/admin/privasi" element={<PrivasiPage />} />

      {/* Chat publik per organisasi */}
      <Route path="/admin/s/:slug" element={<StoreChatPage />} />
      <Route path="/admin/chat/:slug" element={<WidgetChatPage />} />
      <Route path="/admin/embed/:slug" element={<EmbedChatPage />} />

      {/* Panel admin */}
      <Route element={<AppLayout />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/getting-started" element={<GettingStartedPage />} />
        <Route path="/admin/chat" element={<ChatPage />} />
        <Route path="/admin/chatbot" element={<ChatbotPage />} />

        <Route path="/admin/channels" element={<ChannelListPage />} />
        <Route path="/admin/channels/new" element={<ChannelCreatePage />} />
        <Route path="/admin/channels/:channelId/edit" element={<ChannelEditPage />} />

        <Route path="/admin/products" element={<ProductListPage />} />
        <Route path="/admin/products/new" element={<ProductFormPage />} />
        <Route path="/admin/products/:productId/edit" element={<ProductFormPage />} />

        <Route path="/admin/knowledge-base" element={<KnowledgePage />} />
        <Route path="/admin/knowledge" element={<KnowledgeBuilderPage />} />
        <Route path="/admin/flows" element={<Navigate to="/admin/knowledge" replace />} />

        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/integrasi" element={<IntegrasiPage />} />
        <Route path="/admin/history" element={<HistoryPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/edit-profile" element={<EditProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
