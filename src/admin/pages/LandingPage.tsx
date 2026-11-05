import { useNavigate } from 'react-router-dom';
export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
<div className="landing-page" id="landing-page">

    {/*NAVBAR*/}
    <nav className="lp-nav" id="lp-nav">
      <div className="lp-nav-progress"><span id="lp-progress-fill"></span></div>
      <div className="lp-nav-inner">
        <a className="lp-logo" href="#">
          <div className="lp-logo-mark">
            <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <path d="M22 4 36 9.5v11C36 29.8 30 35.3 22 38.8 14 35.3 8 29.8 8 20.5v-11L22 4Z" fill="currentColor" opacity=".22"/>
              <path d="m13.5 22 5.2 5.1 11-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="lp-logo-text">
            <span className="lp-logo-name">komunitas<em>halal</em></span>
            <span className="lp-logo-sub">BANDUNG</span>
          </div>
        </a>
        <div className="lp-nav-links">
          <a href="#fitur" className="lp-nav-link">Fitur</a>
          <a href="#cara-kerja" className="lp-nav-link">Cara Kerja</a>
          
          <a href="#faq" className="lp-nav-link">FAQ</a>
        </div>
        <div className="lp-nav-actions">
          <button onClick={() => navigate('/admin/login')} className="lp-btn-ghost" id="lp-login-btn">Masuk</button>
          <button onClick={() => navigate('/admin/register')} className="lp-btn-primary" id="lp-register-btn">
            Daftar Gratis
            <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <button className="lp-nav-mobile-toggle" id="lp-mobile-toggle" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/*Mobile menu*/}
      <div className="lp-mobile-menu hidden" id="lp-mobile-menu">
        <a href="#fitur" className="lp-mobile-link">Fitur</a>
        <a href="#cara-kerja" className="lp-mobile-link">Cara Kerja</a>
        
        <a href="#faq" className="lp-mobile-link">FAQ</a>
        <div className="lp-mobile-actions">
          <button onClick={() => navigate('/admin/login')} className="lp-btn-ghost lp-btn-full" id="lp-login-btn-m">Masuk</button>
          <button onClick={() => navigate('/admin/register')} className="lp-btn-primary lp-btn-full" id="lp-register-btn-m">Daftar Gratis</button>
        </div>
      </div>
    </nav>

    {/*HERO SECTION*/}
    <section className="lp-hero" id="beranda">
      <div className="lp-hero-bg">
        <div className="lp-hero-orb lp-orb-1"></div>
        <div className="lp-hero-orb lp-orb-2"></div>
        <div className="lp-hero-orb lp-orb-3"></div>
        <div className="lp-grid-overlay"></div>
      </div>
      <div className="lp-hero-glow" id="lp-hero-glow"></div>
      <div className="lp-container">
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot"></span>
            AI Asisten Halal Pertama untuk UMKM Indonesia
          </div>
          <h1 className="lp-hero-title">
            <span className="lp-title-line">Sertifikasi Halal</span>
            <span className="lp-title-line"><span className="lp-title-gradient">Lebih Mudah</span></span>
            <span className="lp-title-line">dengan AI</span>
          </h1>
          <p className="lp-hero-rotator">Jawaban instan untuk <strong id="lp-typing">self declare</strong><span className="lp-typing-caret"></span></p>
          <p className="lp-hero-desc">
            Asisten cerdas berbasis knowledge base resmi BPJPH. Tanya apa saja seputar halal dan dapatkan jawaban akurat secara instan — gratis untuk semua UMKM.
          </p>
          <div className="lp-hero-cta">
            <button onClick={() => navigate('/admin/register')} className="lp-btn-hero-primary lp-btn-glow" id="lp-hero-cta-main">
              <svg viewBox="0 0 20 20" fill="none"><path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              Mulai Chat Sekarang — Gratis
            </button>
            <button onClick={() => navigate('/admin/widget')} className="lp-btn-hero-secondary" id="lp-hero-cta-demo">
              <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7.5l5 2.5-5 2.5V7.5z" fill="currentColor"/></svg>
              Lihat Demo
            </button>
          </div>
          <div className="lp-hero-social">
            <div className="lp-avatar-stack">
              <div className="lp-avatar-item" style={{background:'#86efac',color:'#15803d'}}>RA</div>
              <div className="lp-avatar-item" style={{background:'#93c5fd',color:'#1d4ed8'}}>DP</div>
              <div className="lp-avatar-item" style={{background:'#fca5a5',color:'#dc2626'}}>SW</div>
              <div className="lp-avatar-item" style={{background:'#c4b5fd',color:'#7c3aed'}}>FN</div>
              <div className="lp-avatar-item" style={{background:'#fde68a',color:'#92400e'}}>+</div>
            </div>
            <p><strong>847+ pelaku UMKM</strong> sudah bergabung bulan ini</p>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-chat-mockup">
            <div className="lp-chat-header">
              <div className="lp-chat-avatar">
                <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <strong>Asisten Halal KHB</strong>
                <span><i></i> Online</span>
              </div>
            </div>
            <div className="lp-chat-messages">
              <div className="lp-chat-msg bot">
                <div className="lp-msg-bubble">
                  Assalamu'alaikum! Saya siap membantu pertanyaan seputar <strong>sertifikasi halal</strong> dan edukasi halal lainnya. 👋
                </div>
                <span className="lp-msg-time">10:24</span>
              </div>
              <div className="lp-chat-msg user">
                <div className="lp-msg-bubble">Bagaimana cara daftar sertifikat halal untuk UMKM saya?</div>
                <span className="lp-msg-time">10:25</span>
              </div>
              <div className="lp-chat-msg bot">
                <div className="lp-msg-bubble">
                  Untuk memulai, buat akun di <strong>SIHALAL</strong>, lalu pilih jalur yang sesuai. UMK bisa menggunakan jalur <strong>self declare</strong> yang lebih cepat dan gratis! ✅
                </div>
                <span className="lp-msg-time">10:25</span>
              </div>
              <div className="lp-chat-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="lp-chat-input">
              <span>Tulis pertanyaan seputar halal...</span>
              <button>
                <svg viewBox="0 0 20 20" fill="none"><path d="M4 10l12-6-6 12V10H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
          {/*Floating cards*/}
          <div className="lp-float-card lp-fc-1">
            <div className="lp-fc-icon">✦</div>
            <div>
              <strong>Sertifikasi Approved</strong>
              <span>Self Declare · UMKM</span>
            </div>
          </div>
          <div className="lp-float-card lp-fc-2">
            <div className="lp-fc-icon green">↗</div>
            <div>
              <strong>96.4%</strong>
              <span>Tingkat Respons AI</span>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-hero-fade"></div>
    </section>

    {/*STATS*/}
    <section className="lp-stats-wrap">
      <div className="lp-stats-bar">
        <div className="lp-container">
          <div className="lp-stats-inner">
            <div className="lp-stat-item">
              <strong>1.284+</strong>
              <span>Percakapan</span>
            </div>
            <div className="lp-stat-sep"></div>
            <div className="lp-stat-item">
              <strong>847</strong>
              <span>Pengguna Aktif</span>
            </div>
            <div className="lp-stat-sep"></div>
            <div className="lp-stat-item">
              <strong>38</strong>
              <span>Dokumen BPJPH</span>
            </div>
            <div className="lp-stat-sep"></div>
            <div className="lp-stat-item">
              <strong>96.4%</strong>
              <span>Akurasi Jawaban</span>
            </div>
            <div className="lp-stat-sep"></div>
            <div className="lp-stat-item">
              <strong>Gratis</strong>
              <span>Untuk Semua UMKM</span>
            </div>
          </div>
        </div>
      </div>
      {/*Marquee ticker*/}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          <span>✦ Sertifikasi Halal</span><span>✦ Self Declare Gratis</span><span>✦ 38 Dokumen BPJPH</span><span>✦ 1.284+ Percakapan</span><span>✦ 847 UMKM Terbantu</span><span>✦ Respons &lt; 2 Detik</span>
          <span>✦ Sertifikasi Halal</span><span>✦ Self Declare Gratis</span><span>✦ 38 Dokumen BPJPH</span><span>✦ 1.284+ Percakapan</span><span>✦ 847 UMKM Terbantu</span><span>✦ Respons &lt; 2 Detik</span>
        </div>
      </div>
    </section>

    {/*FEATURES SECTION*/}
    <section className="lp-section" id="fitur">
      <div className="lp-container">
        <div className="lp-section-header">
          <div className="lp-section-badge">FITUR UNGGULAN</div>
          <h2 className="lp-section-title">Semua yang Anda butuhkan untuk halal</h2>
          <p className="lp-section-desc">Platform edukasi halal terlengkap dengan teknologi AI yang memahami konteks pertanyaan UMKM Indonesia.</p>
        </div>
        <div className="lp-features-grid">
          <div className="lp-feature-card lp-feature-main">
            <div className="lp-feature-icon grad lp-fi-grad-green">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 5h18a1 1 0 011 1v10a1 1 0 01-1 1H7l-5 3V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </div>
            <h3>AI Chat Edukasi Halal</h3>
            <p>Tanya jawab interaktif tentang sertifikasi halal, self declare, dokumen, bahan kritis, dan proses BPJPH secara real-time.</p>
            <ul className="lp-feature-list">
              <li>Jawaban berbasis dokumen resmi BPJPH</li>
              <li>Topik populer tersedia siap pakai</li>
              <li>Respons cepat kurang dari 2 detik</li>
            </ul>
          </div>
          <div className="lp-feature-card lp-feature-wide">
            <div className="lp-feature-icon grad lp-fi-grad-blue">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <h3>Knowledge Base Terkurasi</h3>
            <p>38+ dokumen resmi dari BPJPH, regulasi Jaminan Produk Halal, dan panduan KHB selalu diperbarui.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon grad lp-fi-grad-amber">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </div>
            <h3>Panduan Self Declare</h3>
            <p>Panduan lengkap sertifikasi halal jalur self declare khusus untuk usaha mikro dan kecil secara gratis.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon lp-fi-purple">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <h3>Riwayat &amp; Monitoring</h3>
            <p>Pantau semua percakapan, analitik pengguna, dan performa chatbot dalam satu dashboard terintegrasi.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon grad lp-fi-grad-lime">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v7c0 5.8-3.8 9.1-7 10.8C8.8 21.1 5 17.8 5 12V5l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3>Verifikasi Dokumen Halal</h3>
            <p>Cek kelengkapan dokumen sertifikasi sebelum mengajukan ke BPJPH dengan checklist otomatis.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon lp-fi-pink">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <h3>Komunitas UMKM Halal</h3>
            <p>Bergabung dengan 847+ pelaku UMKM yang sudah terbantu dalam proses sertifikasi halal di Bandung dan sekitarnya.</p>
          </div>
        </div>
      </div>
    </section>

    {/*HOW IT WORKS*/}
    <section className="lp-section lp-section-alt" id="cara-kerja">
      <div className="lp-container">
        <div className="lp-section-header">
          <div className="lp-section-badge">CARA KERJA</div>
          <h2 className="lp-section-title">Mulai dalam 3 langkah mudah</h2>
          <p className="lp-section-desc">Tidak perlu instalasi atau konfigurasi rumit. Langsung tanya dan dapatkan jawaban.</p>
        </div>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-content">
              <div className="lp-step-icon">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <h3>Daftar Akun Gratis</h3>
              <p>Buat akun dalam hitungan menit. Cukup isi nama, email, dan kata sandi. Tidak perlu kartu kredit.</p>
            </div>
            <div className="lp-step-line"></div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-content">
              <div className="lp-step-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 5h18a1 1 0 011 1v10a1 1 0 01-1 1H7l-5 3V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              </div>
              <h3>Ajukan Pertanyaan</h3>
              <p>Ketik pertanyaan seputar halal Anda — dari sertifikasi, self declare, dokumen, hingga bahan kritis.</p>
            </div>
            <div className="lp-step-line"></div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-content">
              <div className="lp-step-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Dapatkan Jawaban Akurat</h3>
              <p>AI kami memberikan jawaban berdasarkan dokumen resmi BPJPH dan panduan KHB yang selalu diperbarui.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/*FAQ*/}
    <section className="lp-section lp-section-alt" id="faq">
      <div className="lp-container">
        <div className="lp-section-header">
          <div className="lp-section-badge">FAQ</div>
          <h2 className="lp-section-title">Pertanyaan yang sering diajukan</h2>
          <p className="lp-section-desc">Temukan jawaban atas pertanyaan umum tentang platform KHB.</p>
        </div>
        <div className="lp-faq-wrap">
          <div className="lp-faq-list">
            <div className="lp-faq-item">
              <button className="lp-faq-q" aria-expanded="false">
                Apakah platform ini benar-benar gratis?
                <svg className="lp-faq-arrow" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div className="lp-faq-a">Ya! Platform KHB sepenuhnya gratis untuk semua pelaku UMKM. Tidak ada biaya tersembunyi, tidak perlu kartu kredit. Cukup daftar dan mulai gunakan.</div>
            </div>
            <div className="lp-faq-item">
              <button className="lp-faq-q" aria-expanded="false">
                Dari mana sumber jawaban chatbot ini?
                <svg className="lp-faq-arrow" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div className="lp-faq-a">Chatbot kami menggunakan knowledge base yang dikurasi dari dokumen resmi BPJPH, Undang-Undang Jaminan Produk Halal, dan panduan yang dikelola oleh tim Komunitas Halal Bandung. Semua jawaban bersifat edukatif.</div>
            </div>
            <div className="lp-faq-item">
              <button className="lp-faq-q" aria-expanded="false">
                Apakah jawaban AI ini bisa dijadikan acuan resmi?
                <svg className="lp-faq-arrow" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div className="lp-faq-a">Jawaban AI bersifat <strong>edukatif</strong> dan informatif. Untuk keputusan resmi dan proses pengajuan, selalu rujuk ke BPJPH langsung atau konsultasikan dengan Pendamping PPH terdekat.</div>
            </div>
            <div className="lp-faq-item">
              <button className="lp-faq-q" aria-expanded="false">
                Apa itu jalur self declare?
                <svg className="lp-faq-arrow" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div className="lp-faq-a">Jalur self declare adalah skema sertifikasi halal gratis yang diperuntukkan bagi pelaku usaha mikro dan kecil dengan produk berisiko rendah dan bahan yang sudah terpastikan kehalalannya. Proses didampingi oleh Pendamping PPH.</div>
            </div>
            <div className="lp-faq-item">
              <button className="lp-faq-q" aria-expanded="false">
                Apakah tersedia versi mobile?
                <svg className="lp-faq-arrow" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div className="lp-faq-a">Platform KHB sudah responsif dan bisa diakses dengan nyaman dari smartphone, tablet, maupun desktop tanpa perlu instalasi aplikasi tambahan.</div>
            </div>
          </div>
          <div className="lp-faq-cta">
            <div className="lp-faq-cta-inner">
              <div className="lp-faq-cta-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 5h18a1 1 0 011 1v10a1 1 0 01-1 1H7l-5 3V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              </div>
              <h3>Masih ada pertanyaan?</h3>
              <p>Tanyakan langsung ke asisten AI kami — tersedia 24/7 untuk membantu Anda.</p>
              <button onClick={() => navigate('/admin/widget')} className="lp-btn-primary lp-btn-full" id="lp-faq-chat-btn">Tanya Asisten AI Sekarang</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/*CTA SECTION*/}
    <section className="lp-cta-section">
      <div className="lp-cta-bg">
        <div className="lp-cta-orb lp-cta-orb-1"></div>
        <div className="lp-cta-orb lp-cta-orb-2"></div>
      </div>
      <div className="lp-container">
        <div className="lp-cta-content">
          <div className="lp-cta-badge">MULAI SEKARANG</div>
          <h2 className="lp-cta-title">Siap memulai perjalanan halal Anda?</h2>
          <p className="lp-cta-desc">Bergabung dengan 847+ pelaku UMKM yang sudah terbantu. Gratis, mudah, dan terpercaya.</p>
          <div className="lp-cta-actions">
            <button onClick={() => navigate('/admin/register')} className="lp-btn-cta-primary lp-btn-glow-cta" id="lp-cta-register">
              Daftar Gratis Sekarang
              <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => navigate('/admin/login')} className="lp-btn-cta-secondary" id="lp-cta-login">Sudah punya akun? Masuk</button>
          </div>
          <div className="lp-cta-trust">
            <span>✦ Gratis selamanya untuk UMKM</span>
            <span>✦ Data aman & terenkripsi</span>
            <span>✦ Berbasis regulasi BPJPH resmi</span>
          </div>
        </div>
      </div>
    </section>

    {/*FOOTER*/}
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <a className="lp-logo lp-logo-img-wrap" href="#" aria-label="Komunitas Halal Bandung">
              <img src="/pics/KHB Chat Bubble Logo.png" alt="Komunitas Halal Bandung" className="lp-footer-logo-img" />
            </a>
            <p>Asisten edukasi halal berbasis AI untuk mendukung UMKM Indonesia dalam proses sertifikasi halal.</p>
            <div className="lp-footer-social">
              <a href="https://halalbandung.com" target="_blank" rel="noreferrer" className="lp-social-link" aria-label="Website KHB">
                <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3c-2 2-3 4.5-3 7s1 5 3 7M10 3c2 2 3 4.5 3 7s-1 5-3 7M3 10h14" stroke="currentColor" strokeWidth="1.4"/></svg>
              </a>
            </div>
          </div>
          <div className="lp-footer-col">
            <h4>Platform</h4>
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#" id="lp-footer-login" onClick={(e) => { e.preventDefault(); navigate('/admin/login'); }}>Masuk</a>
            <a href="#" id="lp-footer-register" onClick={(e) => { e.preventDefault(); navigate('/admin/register'); }}>Daftar</a>
          </div>
          <div className="lp-footer-col">
            <h4>Sumber Halal</h4>
            <a href="https://halal.go.id" target="_blank" rel="noreferrer">BPJPH</a>
            <a href="https://sihalal.halal.go.id" target="_blank" rel="noreferrer">SIHALAL</a>
            <a href="https://halalbandung.com" target="_blank" rel="noreferrer">KHB Website</a>
          </div>
          <div className="lp-footer-col">
            <h4>Legal</h4>
            <a href="/admin/syarat">Syarat & Ketentuan</a>
            <a href="/admin/privasi">Kebijakan Privasi</a>
            <a href="/syarat#disclaimer-ai">Disclaimer AI</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2025 Komunitas Halal Bandung. Hak cipta dilindungi.</span>
          <span>Chatbot edukasi halal · Versi prototipe · Data demo</span>
        </div>
      </div>
    </footer>

  </div>{/*/landing-page*/}
    </>
  );
}
