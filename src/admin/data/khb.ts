/* KHB data — contoh prototipe (ganti backend nanti) */

export interface CurrentUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  org: string;
  bio: string;
  role: string;
  initials: string;
}

export const currentUser: CurrentUser = {
  firstName: 'Admin',
  lastName: 'KHB',
  email: 'admin@khb.or.id',
  phone: '+62 812-3456-7890',
  org: 'Komunitas Halal Bandung',
  bio: 'Administrator Komunitas Halal Bandung.',
  role: 'Administrator',
  initials: 'A',
};

export const labels: Record<string, string> = {
  dashboard: 'Ringkasan',
  'getting-started': 'Panduan Mulai',
  chat: 'Chat Edukasi',
  chatbot: 'Chatbot AI',
  channels: 'Channels',
  'channels/new': 'Hubungkan Kanal',
  products: 'Produk',
  'products/new': 'Tambah Produk',
  'knowledge-base': 'Basis Pengetahuan',
  knowledge: 'Flow Builder',
  customers: 'Pelanggan',
  history: 'Riwayat Percakapan',
  notifications: 'Notifikasi',
  integrasi: 'Integrasi Web',
  settings: 'Pengaturan',
  'edit-profile': 'Edit Profil',
  'change-password': 'Ubah Kata Sandi',
};

