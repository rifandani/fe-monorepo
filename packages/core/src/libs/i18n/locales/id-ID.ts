import type { LanguageMessages } from '@workspace/core/libs/i18n/init.js'

export default {
  // #region COMMON
  locale: 'id-ID',
  backTo: 'Kembali ke halaman {target}',
  errorMinLength: '{field} harus memiliki minimal {length} karakter',
  error: '{module} eror',
  theme: 'Tema',
  system: 'Sistem',
  light: 'Terang',
  dark: 'Gelap',
  add: 'Tambah',
  update: 'Ubah',
  remove: 'Hapus',
  empty: 'Data Kosong',
  unsavedChanges: 'Buang perubahan yang belum disimpan - anda yakin?',
  noPageContent: 'Tidak Ada Konten',
  unauthorized: 'Tidak diizinkan. Silakan masuk terlebih dahulu',
  authorized: 'Sudah Ada Akses',
  attention: 'Perhatian',
  language: 'Bahasa',
  account: 'Akun',
  profile: 'Profil',
  settings: 'Pengaturan',
  cancel: 'Batal',
  continue: 'Lanjutkan',
  reload: 'Muat ulang',
  appReady: 'Aplikasi siap digunakan secara offline',
  newContentAvailable:
    'Konten baru tersedia, klik tombol muat ulang untuk memperbarui',
  // #endregion COMMON

  // #region AUTH
  username: 'Username',
  usernamePlaceholder: 'Username anda...',
  password: 'Password',
  passwordPlaceholder: 'Password anda...',
  loginLoading: 'Sedang masuk...',
  login: 'Masuk',
  logout: 'Keluar',
  notFound: 'Tidak Ditemukan',
  gone: 'Maaf, kami tidak bisa menemukan halaman yang anda cari',
  welcome: 'Selamat Datang Kembali',
  noAccount: 'Tidak punya akun?',
  registerHere: 'Daftar disini',
  // #endregion AUTH

  // #region HOME
  title: 'Beranda',
  // #endregion HOME
} as const satisfies LanguageMessages
