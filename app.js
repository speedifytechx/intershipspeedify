// Speedify Tech X Internship Portal - Core Application Logic

// --- STATE MANAGEMENT ---
const DEFAULT_STATE = {
  users: [
    { id: "usr_1", username: "speedifytechx", password: "MNNPS2772007", fullName: "Dr. Sarah Jenkins", role: "mentor", email: "speedifytechx@gmail.com", department: "Engineering", designation: "Lead Mentor", joinedDate: "2025-01-10" }
  ],
  attendance: [],
  reports: [],
  tasks: [],
  projects: [],
  resources: [],
  payments: [],
  applications: [],
  config: { firebase: null, sheetsWebhook: "https://script.google.com/macros/s/AKfycbz6Uvo2mIaYAN8EYGA44pFTQr-dspXs7HIMvJFQMGMUnrkB7p__pjfvhvGYILqlQf_u/exec" }
};

// State and Session Init
const STATE_VERSION = "5";
const SHEETS_WEBHOOK = "https://script.google.com/macros/s/AKfycbz6Uvo2mIaYAN8EYGA44pFTQr-dspXs7HIMvJFQMGMUnrkB7p__pjfvhvGYILqlQf_u/exec";
let appState = JSON.parse(localStorage.getItem('speedify_portal_state'));
if (!appState) {
  // First ever load — seed defaults
  appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  localStorage.setItem('speedify_portal_state', JSON.stringify(appState));
  localStorage.setItem('speedify_portal_version', STATE_VERSION);
} else if (localStorage.getItem('speedify_portal_version') !== STATE_VERSION) {
  // Version changed — preserve real registered users, wipe all example/demo data
  const realUsers = appState.users.filter(u => u.role !== 'mentor');
  const mentorRecord = appState.users.find(u => u.role === 'mentor');
  const freshMentor = JSON.parse(JSON.stringify(DEFAULT_STATE.users[0]));
  if (mentorRecord) {
    // Keep existing mentor but update credentials to latest
    freshMentor.id = mentorRecord.id;
  }
  appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  appState.users = [freshMentor, ...realUsers.filter(u =>
    // Only keep users that were registered via Firebase (have a non-usr_ id) or were real registrations
    !['usr_2','usr_3'].includes(u.id)
  )];
  localStorage.setItem('speedify_portal_state', JSON.stringify(appState));
  localStorage.setItem('speedify_portal_version', STATE_VERSION);
}
// Always ensure the webhook URL is set (even for returning users with old state)
if (!appState.config) appState.config = {};
if (!appState.config.sheetsWebhook) {
  appState.config.sheetsWebhook = SHEETS_WEBHOOK;
  localStorage.setItem('speedify_portal_state', JSON.stringify(appState));
}
let currentSession = JSON.parse(sessionStorage.getItem('speedify_portal_session')) || { currentUser: null };
const sessionBlobs = {};

function saveState() {
  try {
    localStorage.setItem('speedify_portal_state', JSON.stringify(appState));
  } catch(e) {
    // localStorage quota exceeded — strip large video base64 data and retry
    const stripped = JSON.parse(JSON.stringify(appState));
    stripped.resources = stripped.resources.map(r => r.url && r.url.startsWith('data:video') ? {...r, url: r.linkUrl || ''} : r);
    try { localStorage.setItem('speedify_portal_state', JSON.stringify(stripped)); appState = stripped; } catch(e2) { console.warn('Storage full, some data may not persist.'); }
  }
}
function saveSession() { sessionStorage.setItem('speedify_portal_session', JSON.stringify(currentSession)); }

// --- FIREBASE CONFIG ---
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAE7UBdFiSM6cDKkb5gsfUp_mQ-akP6qzc",
  authDomain:        "intership-bee53.firebaseapp.com",
  projectId:         "intership-bee53",
  storageBucket:     "intership-bee53.firebasestorage.app",
  messagingSenderId: "7938936972",
  appId:             "1:7938936972:web:a35806ac1db8879993eba9",
  measurementId:     "G-ERJL916RKG"
};

// --- FIREBASE GLOBALS ---
let firebaseApp      = null;
let firebaseAuth     = null;
let firebaseDb       = null;
let isFirebaseActive = false;

async function initFirebase() {
  // Wait up to 5s for the Firebase module in index.html to finish
  for (let i = 0; i < 50; i++) {
    if (window.__firebaseReady) break;
    await new Promise(r => setTimeout(r, 100));
  }

  if (window.__firebaseReady && window.__firebaseAuth && window.__firebaseDb) {
    firebaseApp      = window.__firebaseApp;
    firebaseAuth     = window.__firebaseAuth;
    firebaseDb       = window.__firebaseDb;
    isFirebaseActive = true;
    console.log("✅ Firebase connected (Auth + Firestore + Analytics)");
  } else {
    console.warn("⚠️ Firebase not ready — running in local-only mode");
    isFirebaseActive = false;
  }
}

// Boot: init Firebase first, then start the router
initFirebase().then(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
});

// --- UTILITIES ---
function generateId(prefix = 'id') { return `${prefix}_${Math.random().toString(36).substr(2, 9)}`; }

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-triangle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><div class="toast-message">${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

// Modal Managers
const modalContainer = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function showModal(title, bodyHtml) {
  if (!modalContainer) return;
  modalTitle.innerText = title;
  modalBody.innerHTML = bodyHtml;
  modalContainer.classList.add('active');
}
function closeModal() {
  if (!modalContainer) return;
  modalContainer.classList.remove('active');
  const video = modalBody.querySelector('video');
  if (video) video.pause();
}
// Expose to window for inline onclick handlers (needed with type="module")
window.closeModal  = closeModal;
window.showToast   = showToast;
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalContainer) { modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); }); }

// --- ROUTER ---
function initRouter() { window.addEventListener('hashchange', handleRoute); handleRoute(); }
function navigateTo(hash) { window.location.hash = hash; }
window.navigateTo = navigateTo;

function handleRoute() {
  const hash = window.location.hash || '#home';
  const viewContainer = document.getElementById('view-container');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (!viewContainer) return;

  // Cancel particle animation when leaving home
  if (window._homeParticleAnim) { cancelAnimationFrame(window._homeParticleAnim); window._homeParticleAnim = null; }

  // Public routes — no auth needed
  if (hash === '#home') {
    sidebar.classList.add('hidden');
    mainContent.classList.add('full-width');
    mainContent.classList.remove('shifted');
    renderHomeView(viewContainer); return;
  }
  if (hash === '#apply') {
    sidebar.classList.add('hidden'); mainContent.classList.add('full-width'); mainContent.classList.remove('shifted');
    renderApplyView(viewContainer); return;
  }

  // Auth gating
  if (!currentSession.currentUser && hash !== '#login' && hash !== '#register') { navigateTo('#home'); return; }
  if (currentSession.currentUser && (hash === '#login' || hash === '#register')) { navigateTo('#portal'); return; }

  // Always hide sidebar — no dashboard tabs anymore
  sidebar.classList.add('hidden');
  mainContent.classList.add('full-width');
  mainContent.classList.remove('shifted');

  if (hash === '#login') renderLoginView(viewContainer);
  else if (hash === '#register') renderRegisterView(viewContainer);
  else if (hash === '#portal') {
    if (!currentSession.currentUser) { navigateTo('#login'); return; }
    if (currentSession.currentUser.role === 'mentor') renderMentorPortal(viewContainer);
    else renderStudentPortal(viewContainer);
  } else { viewContainer.innerHTML = `<div class="glass-card" style="max-width:500px;margin:60px auto;"><h2>404 - Page Not Found</h2></div>`; }
}

function updateSidebarUI() {
  const user = currentSession.currentUser;
  const navAvatar = document.getElementById('nav-avatar');
  const navUserName = document.getElementById('nav-user-name');
  const navUserRole = document.getElementById('nav-user-role');
  const sidebarMenu = document.getElementById('sidebar-menu');
  if (!user || !sidebarMenu) return;
  navAvatar.innerText = user.fullName.charAt(0).toUpperCase();
  navUserName.innerText = user.fullName;
  navUserRole.innerText = user.role === 'mentor' ? 'Staff / Mentor' : 'Tech X Intern';
  if (user.role === 'mentor') {
    sidebarMenu.innerHTML = `
      <li><a class="nav-item active" data-tab="mentor-home"><i class="fa-solid fa-house"></i><span>My Profile</span></a></li>
      <li><a class="nav-item" data-tab="mentor-analytics"><i class="fa-solid fa-chart-line"></i><span>Analytics Dashboard</span></a></li>
      <li><a class="nav-item" data-tab="mentor-tracker"><i class="fa-solid fa-clock-rotate-left"></i><span>Intern Work Tracker</span></a></li>
      <li><a class="nav-item" data-tab="mentor-review"><i class="fa-solid fa-clipboard-check"></i><span>Review Reports</span></a></li>
      <li><a class="nav-item" data-tab="mentor-resources"><i class="fa-solid fa-photo-film"></i><span>Resource Board</span></a></li>
      <li><a class="nav-item" data-tab="mentor-tasks"><i class="fa-solid fa-list-check"></i><span>Assign Tasks</span></a></li>
      <li><a class="nav-item" data-tab="mentor-payments"><i class="fa-solid fa-wallet"></i><span>Stipend Payments</span></a></li>
      <li><a class="nav-item" data-tab="mentor-students"><i class="fa-solid fa-graduation-cap"></i><span>Intern Directory</span></a></li>
      <li><a class="nav-item" data-tab="mentor-applications"><i class="fa-solid fa-table-cells"></i><span>Applications Sheet</span></a></li>
      <li><a class="nav-item" data-tab="mentor-exports"><i class="fa-solid fa-download"></i><span>Export Data</span></a></li>`;
  } else {
    sidebarMenu.innerHTML = `
      <li><a class="nav-item active" data-tab="student-home"><i class="fa-solid fa-house"></i><span>My Profile</span></a></li>
      <li><a class="nav-item" data-tab="student-overview"><i class="fa-solid fa-gauge"></i><span>Overview</span></a></li>
      <li><a class="nav-item" data-tab="student-report"><i class="fa-solid fa-file-pen"></i><span>Submit Report</span></a></li>
      <li><a class="nav-item" data-tab="student-project"><i class="fa-solid fa-code-branch"></i><span>Submit Project</span></a></li>
      <li><a class="nav-item" data-tab="student-tasks"><i class="fa-solid fa-tasks"></i><span>My Tasks</span></a></li>
      <li><a class="nav-item" data-tab="student-videos"><i class="fa-solid fa-play-circle"></i><span>Training Videos</span></a></li>
      <li><a class="nav-item" data-tab="student-history"><i class="fa-solid fa-history"></i><span>Work History</span></a></li>`;
  }
  const navItems = sidebarMenu.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(ni => ni.classList.remove('active'));
      item.classList.add('active');
      switchTab(item.getAttribute('data-tab'));
    });
  });
}

function switchTab(tabId) {
  const tabs = document.querySelectorAll('.dashboard-tab');
  tabs.forEach(tab => {
    if (tab.id === tabId) { tab.style.display = 'block'; tab.classList.add('fade-in'); }
    else { tab.style.display = 'none'; tab.classList.remove('fade-in'); }
  });
  if (tabId === 'mentor-analytics') setTimeout(initAnalyticsCharts, 100);
  // Refresh videos every time the tab is opened so new uploads appear immediately
  if (tabId === 'student-videos') {
    const fresh = localStorage.getItem('speedify_portal_state');
    if (fresh) { try { appState = JSON.parse(fresh); } catch(e) {} }
    if (typeof populateStudentVideosGlobal === 'function') populateStudentVideosGlobal();
  }
}

// Log Out
document.getElementById('btn-logout').addEventListener('click', () => {
  currentSession.currentUser = null; saveSession();
  showToast("Logged out successfully.", "info"); navigateTo('#login');
});

// --- RENDERERS ---

// 0. HOME / LANDING VIEW
function renderHomeView(container) {
  container.innerHTML = `
  <div class="home-page">
    <!-- Particle Canvas Background -->
    <canvas id="home-particles-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>

    <!-- NAVBAR -->
    <nav class="home-nav">
      <div class="home-nav-brand">
        <img src="logo.jpeg" alt="Speedify Tech X" class="home-nav-logo">
        <span>Speedify <span class="home-accent">Tech X</span></span>
      </div>
      <div class="home-nav-actions">
        <a href="#login" onclick="navigateTo('#login')" class="home-btn-login">Login</a>
        <a href="#apply" onclick="navigateTo('#apply')" class="home-btn-cta">Get Started <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </nav>

    <!-- HERO -->
    <section class="home-hero">
      <div class="home-grid-bg"></div>
      <div class="home-hero-left">
        <div class="home-badge"><i class="fa-solid fa-rocket"></i> Shape your future with us</div>
        <h1 class="home-title">Accelerate Your Career<br><span class="home-accent">with Speedify Tech X</span></h1>
        <p class="home-desc">Step into the world of tech with our elite internship program. Gain real-world experience, build a stellar portfolio, and land your dream job.</p>
        <div class="home-cta-row">
          <a href="#apply" onclick="navigateTo('#apply')" class="home-btn-primary">Create Account <i class="fa-solid fa-arrow-right"></i></a>
          <a href="#domains-sec" class="home-btn-secondary">Explore Domains</a>
        </div>
        <div class="home-trust">
          <span><i class="fa-solid fa-circle-check"></i> Real Projects</span>
          <span><i class="fa-solid fa-circle-check"></i> Mentorship</span>
          <span><i class="fa-solid fa-circle-check"></i> Certification</span>
        </div>
        <div class="home-rating"><span class="home-stars">★★★★★</span> <strong>4.9/5</strong> from 500+ students</div>
      </div>
      <div class="home-hero-right">
        <div class="home-logo-ring">
          <div class="home-ring-anim"></div>
          <div class="home-logo-card"><img src="logo.jpeg" alt="Speedify Tech X"></div>
        </div>
        <div class="home-float home-float-tl"><i class="fa-solid fa-code-merge"></i><div><strong>Code Merged</strong><span>Just now</span></div></div>
        <div class="home-float home-float-br"><i class="fa-solid fa-certificate"></i><div><strong>Certified</strong><span>Top 1% Intern</span></div></div>
        <div class="home-float home-float-bl"><i class="fa-solid fa-briefcase"></i><div><strong>Offer Received</strong><span>Tech Innovators Inc.</span></div></div>
      </div>
    </section>

    <!-- MSME -->
    <div class="home-msme">
      <div class="home-msme-left">
        <div class="home-msme-icon"><i class="fa-solid fa-circle-check"></i></div>
        <div><strong>MSME Registered Company</strong><p>Certified by Ministry of Micro, Small & Medium Enterprises, Government of India</p></div>
      </div>
      <div class="home-msme-right">
        <img src="msme.jpg" alt="MSME Certificate" class="home-msme-img">
      </div>
    </div>

    <!-- STATS -->
    <div class="home-stats">
      <div class="home-stat"><span class="home-stat-num">500<sup>+</sup></span><span>Students Trained</span></div>
      <div class="home-stat"><span class="home-stat-num">50<sup>+</sup></span><span>Partner Companies</span></div>
      <div class="home-stat"><span class="home-stat-num">95<sup>%</sup></span><span>Placement Rate</span></div>
      <div class="home-stat"><span class="home-stat-num">10<sup>+</sup></span><span>Tech Domains</span></div>
    </div>

    <!-- DOMAINS -->
    <section class="home-section" id="domains-sec">
      <div class="home-section-header"><h2>Explore <span class="home-accent">Domains</span></h2><p>Master the skills that matter. Choose a path and become an expert.</p></div>
      <div class="home-domains">
        <div class="home-domain-card"><div class="hd-icon cyan"><i class="fa-solid fa-code"></i></div><h3>Web Development</h3><p>HTML, CSS, JavaScript, React, Node.js</p></div>
        <div class="home-domain-card"><div class="hd-icon purple"><i class="fa-solid fa-layer-group"></i></div><h3>Full Stack Development</h3><p>React, Node.js, Databases, REST APIs</p></div>
        <div class="home-domain-card"><div class="hd-icon red"><i class="fa-solid fa-robot"></i></div><h3>AI & Machine Learning</h3><p>Neural Networks, Deep Learning, Python</p></div>
        <div class="home-domain-card"><div class="hd-icon green"><i class="fa-solid fa-shield-halved"></i></div><h3>Cyber Security</h3><p>Ethical Hacking, Network Security, VAPT</p></div>
        <div class="home-domain-card"><div class="hd-icon pink"><i class="fa-solid fa-gamepad"></i></div><h3>Game Development</h3><p>Unity, Unreal, Game Design, C#</p></div>
        <div class="home-domain-card"><div class="hd-icon blue"><i class="fa-solid fa-palette"></i></div><h3>UI/UX Design</h3><p>Figma, Adobe XD, Wireframing</p></div>
        <div class="home-domain-card"><div class="hd-icon cyan"><i class="fa-solid fa-mobile-screen"></i></div><h3>Mobile Development</h3><p>Flutter, React Native, Android, iOS</p></div>
      </div>
    </section>

    <!-- WHY CHOOSE -->
    <section class="home-section home-why-bg">
      <div class="home-section-header"><h2>Why Choose <span class="home-accent">Speedify Tech X?</span></h2><p>We don't just teach. We prepare you for the real world.</p></div>
      <div class="home-why">
        <div class="home-why-card"><div class="hw-icon"><i class="fa-solid fa-diagram-project"></i></div><h3>Real-World Projects</h3><p>Work on actual client projects, solve real problems, and build a portfolio that stands out to recruiters.</p></div>
        <div class="home-why-card"><div class="hw-icon"><i class="fa-solid fa-user-graduate"></i></div><h3>Expert Mentors</h3><p>Learn directly from industry veterans who have built scalable systems at top tech companies.</p></div>
        <div class="home-why-card"><div class="hw-icon"><i class="fa-solid fa-award"></i></div><h3>Verified Certificate</h3><p>Earn a recognized certificate backed by partner organizations that recruiters actually value.</p></div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="home-section">
      <div class="home-cta-banner">
        <h2>Ready to transform your career?</h2>
        <p>Join thousands of students who have launched their careers with us.</p>
        <a href="#apply" onclick="navigateTo('#apply')" class="home-btn-primary" style="display:inline-flex;margin-top:8px;">Start Your Application <i class="fa-solid fa-arrow-right"></i></a>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="home-section">
      <div class="home-section-header"><h2>Get In <span class="home-accent">Touch</span></h2></div>
      <div class="home-contact">
        <div class="home-contact-card">
          <div class="hc-icon"><i class="fa-solid fa-envelope"></i></div>
          <h3>Email Us</h3><p>Drop us a line anytime</p>
          <a href="mailto:speedifytechx@gmail.com" class="hc-link">speedifytechx@gmail.com</a>
        </div>
        <div class="home-contact-card">
          <div class="hc-icon"><i class="fa-solid fa-phone"></i></div>
          <h3>Call Us</h3><p>Mon-Fri from 9am to 6pm</p>
          <a href="tel:+918610535231" class="hc-link">+91 8610535231</a>
        </div>
      </div>
      <div class="hc-msme-wrap">
        <div class="hc-msme-bar">
          <div class="hc-msme-img-wrap"><img src="msme.jpg" alt="MSME Certificate" class="hc-msme-img"></div>
          <div class="hc-msme-text">
            <strong>MSME Registered</strong>
            <span>Ministry of MSME, Govt. of India</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="hf-footer">
      <div class="hf-footer-main">
        <div class="hf-footer-brand-col">
          <div class="hf-footer-brand">
            <img src="logo.jpeg" alt="Speedify Tech X" class="hf-footer-logo">
            <span class="hf-footer-brand-name">Speedify <span class="home-accent">Tech X</span></span>
          </div>
          <p class="hf-footer-brand-desc">Empowering the next generation of tech leaders through immersive, project-based internships.</p>
          <div class="hf-footer-socials">
            <a href="https://www.instagram.com/speedifytechx?igsh=OW5lcGgxejd1MXJq" target="_blank" class="hf-footer-social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          </div>
        </div>
        <div class="hf-footer-links-col">
          <h4 class="hf-footer-col-title">Quick Links</h4>
          <ul class="hf-footer-link-list">
            <li><a href="#home" onclick="navigateTo('#home')">Home</a></li>
            <li><a href="#domains-sec">Domains</a></li>
            <li><a href="#login" onclick="navigateTo('#login')">Portal Login</a></li>
            <li><a href="#apply" onclick="navigateTo('#apply')">Apply Now</a></li>
          </ul>
        </div>
        <div class="hf-footer-links-col">
          <h4 class="hf-footer-col-title">Legal</h4>
          <ul class="hf-footer-link-list">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="hf-footer-bottom">
        <p>© 2026 Speedify Tech X. All rights reserved.</p>
        <p class="hf-footer-made-with">Made with <i class="fa-solid fa-heart hf-footer-heart"></i> for students</p>
      </div>
    </footer>

  </div>`;

  // Particle background animation
  (function initParticles() {
    const canvas = document.getElementById('home-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const COLORS = ['rgba(139,92,246,', 'rgba(0,242,254,', 'rgba(167,139,250,'];
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1
    }));
    let animId;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.12 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    window._homeParticleAnim = animId;
    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  })();
}

// 1. PUBLIC APPLY VIEW
function renderApplyView(container) {
  container.innerHTML = `
  <div style="max-width:780px;margin:40px auto;padding:0 16px 60px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:36px;">
      <img src="logo.jpeg" alt="Speedify Logo" class="login-logo-img">
      <h1 style="font-size:26px;font-weight:700;margin-bottom:6px;">Internship Application Form</h1>
      <p style="color:var(--text-secondary);font-size:14px;">Fill in all details — your responses will be recorded in our database.</p>
      <a href="#home" onclick="navigateTo('#home')" style="display:inline-block;margin-top:12px;font-size:13px;color:var(--accent-cyan);text-decoration:none;"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
    </div>

    <div class="glass-card fade-in" style="padding:32px;">

      <!-- Section: Personal Info -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(0,242,254,0.1);display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-user" style="color:var(--accent-cyan);font-size:14px;"></i>
        </div>
        <h3 style="font-size:15px;font-weight:700;">Personal Information</h3>
      </div>
      <form id="form-apply">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">Full Name <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="text" id="apply-name" placeholder="e.g. Ravi Kumar" required style="padding-left:16px;">
          </div>
          <div>
            <label class="form-label">Email Address <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="email" id="apply-email" placeholder="ravi@gmail.com" required style="padding-left:16px;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">Phone Number <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="tel" id="apply-phone" placeholder="+91 98765 43210" required style="padding-left:16px;">
          </div>
          <div>
            <label class="form-label">City / Location <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="text" id="apply-city" placeholder="e.g. Chennai, Tamil Nadu" required style="padding-left:16px;">
          </div>
        </div>

        <!-- Section: Academic Info -->
        <div style="display:flex;align-items:center;gap:10px;margin:24px 0 20px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(155,81,224,0.1);display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-graduation-cap" style="color:var(--accent-purple);font-size:14px;"></i>
          </div>
          <h3 style="font-size:15px;font-weight:700;">Academic Details</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">University / College <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="text" id="apply-uni" placeholder="e.g. Anna University" required style="padding-left:16px;">
          </div>
          <div>
            <label class="form-label">Degree & Branch <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="text" id="apply-degree" placeholder="e.g. B.Tech Computer Science" required style="padding-left:16px;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">Year of Study <span style="color:var(--danger);">*</span></label>
            <select class="form-control" id="apply-year" required style="padding-left:16px;background-image:none;">
              <option value="">-- Select Year --</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>Final Year / Graduated</option>
            </select>
          </div>
          <div>
            <label class="form-label">Graduation Year <span style="color:var(--danger);">*</span></label>
            <input class="form-control" type="text" id="apply-grad-year" placeholder="e.g. 2026" required style="padding-left:16px;">
          </div>
        </div>

        <!-- Section: Internship Details -->
        <div style="display:flex;align-items:center;gap:10px;margin:24px 0 20px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-briefcase" style="color:var(--success);font-size:14px;"></i>
          </div>
          <h3 style="font-size:15px;font-weight:700;">Internship Preferences</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">Preferred Domain <span style="color:var(--danger);">*</span></label>
            <select class="form-control" id="apply-role" required style="padding-left:16px;background-image:none;">
              <option value="">-- Select Domain --</option>
              <option>Web Development</option>
              <option>Full Stack Development</option>
              <option>Mobile App Development</option>
              <option>UI/UX Design</option>
              <option>AI & Machine Learning</option>
              <option>Cyber Security</option>
              <option>Game Development</option>
              <option>Data Analytics</option>
            </select>
          </div>
          <div>
            <label class="form-label">Internship Mode <span style="color:var(--danger);">*</span></label>
            <select class="form-control" id="apply-mode" required style="padding-left:16px;background-image:none;">
              <option value="">-- Select Mode --</option>
              <option>Remote</option>
              <option>On-site (Chennai)</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div>
            <label class="form-label">Available Duration</label>
            <select class="form-control" id="apply-duration" style="padding-left:16px;background-image:none;">
              <option value="">-- Select Duration --</option>
              <option>1 Month</option>
              <option>2 Months</option>
              <option>3 Months</option>
              <option>6 Months</option>
            </select>
          </div>
          <div>
            <label class="form-label">LinkedIn Profile</label>
            <input class="form-control" type="url" id="apply-linkedin" placeholder="https://linkedin.com/in/yourname" style="padding-left:16px;">
          </div>
        </div>

        <!-- Section: About -->
        <div style="display:flex;align-items:center;gap:10px;margin:24px 0 20px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-pen-to-square" style="color:var(--warning);font-size:14px;"></i>
          </div>
          <h3 style="font-size:15px;font-weight:700;">About You</h3>
        </div>
        <div style="margin-bottom:18px;">
          <label class="form-label">Why do you want to join Speedify Tech X? <span style="color:var(--danger);">*</span></label>
          <textarea class="form-control" id="apply-why" placeholder="Tell us your motivation, goals, and what you hope to achieve..." required style="min-height:100px;padding:12px 16px;"></textarea>
        </div>
        <div style="margin-bottom:28px;">
          <label class="form-label">Any prior skills or experience? <span style="color:var(--text-muted);font-size:11px;">(optional)</span></label>
          <textarea class="form-control" id="apply-skills" placeholder="e.g. HTML/CSS basics, Python beginner, completed a React course..." style="min-height:80px;padding:12px 16px;"></textarea>
        </div>

        <!-- Consent -->
        <div style="background:rgba(0,242,254,0.03);border:1px solid rgba(0,242,254,0.12);border-radius:10px;padding:14px 16px;margin-bottom:24px;font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
          <i class="fa-solid fa-shield-check" style="color:var(--accent-cyan);margin-right:6px;"></i>
          By submitting this form, you consent to Speedify Tech X collecting and storing your details for the purpose of internship selection. Your data will not be shared with third parties.
        </div>

        <button class="btn btn-primary btn-full" type="submit" style="padding:14px;font-size:15px;">
          <span>Submit Application</span>
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>`;

  document.getElementById('form-apply').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Submitting...</span>';

    const appData = {
      id:           generateId('app'),
      fullName:     document.getElementById('apply-name').value.trim(),
      email:        document.getElementById('apply-email').value.trim(),
      phone:        document.getElementById('apply-phone').value.trim(),
      city:         document.getElementById('apply-city').value.trim(),
      university:   document.getElementById('apply-uni').value.trim(),
      degree:       document.getElementById('apply-degree').value.trim(),
      yearOfStudy:  document.getElementById('apply-year').value,
      gradYear:     document.getElementById('apply-grad-year').value.trim(),
      role:         document.getElementById('apply-role').value,
      mode:         document.getElementById('apply-mode').value,
      duration:     document.getElementById('apply-duration').value,
      linkedin:     document.getElementById('apply-linkedin').value.trim(),
      whyJoin:      document.getElementById('apply-why').value.trim(),
      skills:       document.getElementById('apply-skills').value.trim(),
      status:       'Review',
      appliedAt:    new Date().toISOString()
    };

    // 1. Save locally
    appState.applications.push(appData);
    saveState();

    // 2. Send to Google Sheets webhook
    const webhookUrl = (appState.config && appState.config.sheetsWebhook) || SHEETS_WEBHOOK;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData)
        });
        console.log('Sent to Google Sheets');
      } catch (err) {
        console.warn('Google Sheets webhook failed:', err);
      }
    }

    // 3. Save to Firestore
    if (firebaseDb) {
      try {
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await addDoc(collection(firebaseDb, "applications"), appData);
      } catch (err) {
        console.warn("Firestore write failed:", err);
      }
    }

    btn.disabled = false;
    btn.innerHTML = '<span>Submit Application</span><i class="fa-solid fa-paper-plane"></i>';

    // Show success screen
    container.innerHTML = `
    <div style="max-width:500px;margin:80px auto;padding:0 20px;text-align:center;">
      <div class="glass-card fade-in" style="padding:48px 32px;">
        <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.12);border:2px solid var(--success);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
          <i class="fa-solid fa-circle-check" style="font-size:32px;color:var(--success);"></i>
        </div>
        <h2 style="font-size:22px;font-weight:800;margin-bottom:10px;">Application Submitted!</h2>
        <p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin-bottom:8px;">
          Thank you, <strong>${appData.fullName}</strong>! Your application for <strong>${appData.role}</strong> has been received.
        </p>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:28px;">
          We'll review it and reach out to <strong>${appData.email}</strong> within 2–3 business days.
        </p>
        <div style="background:rgba(0,242,254,0.05);border:1px solid rgba(0,242,254,0.15);border-radius:10px;padding:14px;margin-bottom:28px;font-size:13px;text-align:left;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Name</span><strong>${appData.fullName}</strong></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Domain</span><strong>${appData.role}</strong></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:var(--text-muted);">Status</span><span class="badge badge-pending"><i class="fa-solid fa-hourglass-half"></i> Under Review</span></div>
        </div>
        <button class="btn btn-primary" onclick="navigateTo('#home')" style="width:100%;">
          <i class="fa-solid fa-house"></i> Back to Home
        </button>
      </div>
    </div>`;
  });
}

// 2. LOGIN VIEW
function renderLoginView(container) {
  container.innerHTML = `
  <div class="auth-wrapper">
    <div class="glass-card auth-card fade-in">
      <div class="auth-header">
        <img src="logo.jpeg" alt="Speedify Logo" class="login-logo-img">
        <h2>Speedify Tech X</h2>
        <p>Internship Management Portal</p>
        <span class="badge ${isFirebaseActive ? 'badge-approved' : 'badge-pending'}" style="font-size:8px;margin-top:6px;">
          <i class="fa-solid ${isFirebaseActive ? 'fa-fire' : 'fa-database'}"></i>
          ${isFirebaseActive ? 'Live Firebase Auth' : 'Local Mock Auth'}
        </span>
      </div>
      <form id="form-login">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-container">
            <input class="form-control" type="email" id="login-username" placeholder="your@email.com" required autocomplete="email">
            <i class="fa-solid fa-envelope"></i>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-container">
            <input class="form-control" type="password" id="login-password" placeholder="Enter password" required autocomplete="current-password">
            <i class="fa-solid fa-lock"></i>
          </div>
        </div>
        <button class="btn btn-primary btn-full" type="submit">
          <span>Sign In</span><i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </form>
      <div class="auth-footer">
        Don't have an account? <a href="#register">Register here</a>
        <div style="margin-top:12px;">Applying for Internship? <a href="#apply" style="color:var(--accent-purple);">Apply Now</a></div>
        <div style="margin-top:8px;"><a href="landing.html" style="color:var(--text-muted);font-size:12px;"><i class="fa-solid fa-house"></i> Back to Home</a></div>
      </div>
    </div>
  </div>`;
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailVal    = document.getElementById('login-username').value.trim();
    const passwordVal = document.getElementById('login-password').value;

    // Always check local users first (covers mentor and pre-seeded accounts)
    const localUser = appState.users.find(u =>
      (u.username.toLowerCase() === emailVal.toLowerCase() ||
       u.email.toLowerCase()    === emailVal.toLowerCase()) &&
      u.password === passwordVal
    );
    if (localUser) {
      currentSession.currentUser = { id: localUser.id, username: localUser.username, fullName: localUser.fullName, role: localUser.role, email: localUser.email };
      saveSession(); showToast(`Welcome back, ${localUser.fullName}!`, "success"); navigateTo('#portal');
      return;
    }

    // If no local match, try Firebase for student accounts registered via Firebase Auth
    if (isFirebaseActive && firebaseAuth) {
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Signing in...</span>';
      try {
        const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, emailVal, passwordVal);
        const fbUser = userCredential.user;

        // Match to local user record or create one
        let localUserObj = appState.users.find(u => u.email.toLowerCase() === fbUser.email.toLowerCase());
        if (!localUserObj) {
          localUserObj = {
            id: fbUser.uid,
            username: fbUser.email.split('@')[0],
            fullName: fbUser.displayName || fbUser.email.split('@')[0],
            role: "student",
            email: fbUser.email,
            joinedDate: new Date().toISOString().split('T')[0]
          };
          appState.users.push(localUserObj); saveState();
        }
        currentSession.currentUser = localUserObj; saveSession();
        showToast(`Welcome back, ${localUserObj.fullName}!`, "success");
        navigateTo('#portal');
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span><i class="fa-solid fa-right-from-bracket"></i>';
        const msg =
          err.code === 'auth/invalid-credential'  ||
          err.code === 'auth/user-not-found'       ||
          err.code === 'auth/wrong-password'
            ? "Invalid email or password."
            : err.code === 'auth/too-many-requests'
            ? "Too many attempts. Try again later."
            : `Auth error: ${err.message}`;
        showToast(msg, "error");
      }
    } else {
      showToast("Invalid email or password.", "error");
    }
  });
}

// 3. REGISTER VIEW
function renderRegisterView(container) {
  container.innerHTML = `
  <div class="auth-wrapper">
    <div class="glass-card auth-card fade-in">
      <div class="auth-header"><img src="logo.jpeg" alt="Speedify Logo" class="login-logo-img"><h2>Create Account</h2><p>Register as a student intern</p></div>
      <form id="form-register">
        <div class="form-group"><label class="form-label">Full Name</label><div class="input-container"><input class="form-control" type="text" id="reg-name" placeholder="John Doe" required><i class="fa-solid fa-id-card"></i></div></div>
        <div class="form-group"><label class="form-label">Email Address</label><div class="input-container"><input class="form-control" type="email" id="reg-email" placeholder="john.doe@gmail.com" required autocomplete="email"><i class="fa-solid fa-envelope"></i></div></div>
        <div class="form-group"><label class="form-label">Username</label><div class="input-container"><input class="form-control" type="text" id="reg-username" placeholder="johndoe12" required autocomplete="username"><i class="fa-solid fa-user"></i></div></div>
        <div class="form-group" id="cohort-group"><label class="form-label">Cohort / Team</label><div class="input-container"><input class="form-control" type="text" id="reg-cohort" placeholder="e.g. Web Dev Cohort A"><i class="fa-solid fa-users-rectangle"></i></div></div>
        <div class="form-group"><label class="form-label">Password</label><div class="input-container"><input class="form-control" type="password" id="reg-password" placeholder="Create strong password" required autocomplete="new-password"><i class="fa-solid fa-lock"></i></div></div>
        <button class="btn btn-primary btn-full" type="submit"><span>Register Now</span><i class="fa-solid fa-user-plus"></i></button>
      </form>
      <div class="auth-footer">Already registered? <a href="#login">Sign In</a></div>
    </div>
  </div>`;
  let selectedRole = 'student';
  const cohortGroup = document.getElementById('cohort-group');
  document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const cohort = document.getElementById('reg-cohort').value.trim() || 'N/A';
    const password = document.getElementById('reg-password').value;
    if (appState.users.some(u => u.username.toLowerCase() === username || u.email.toLowerCase() === email.toLowerCase())) { showToast("Username or Email already registered.", "error"); return; }
    if (isFirebaseActive && firebaseAuth) {
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Creating account...</span>';
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const newUser = { id: userCredential.user.uid, username, fullName, role: selectedRole, email, joinedDate: new Date().toISOString().split('T')[0], hourlyRate: 15 };
        if (selectedRole === 'student') newUser.cohort = cohort;
        appState.users.push(newUser); saveState();
        showToast("Account created successfully!", "success"); navigateTo('#login');
      } catch (err) {
        btn.disabled = false; btn.innerHTML = '<span>Register Now</span><i class="fa-solid fa-user-plus"></i>';
        const msg = err.code === 'auth/email-already-in-use' ? "This email is already registered in Firebase." : `Registration error: ${err.message}`;
        showToast(msg, "error");
      }
    } else {
      const newUser = { id: generateId('usr'), username, password, fullName, role: selectedRole, email, joinedDate: new Date().toISOString().split('T')[0], hourlyRate: 15 };
      if (selectedRole === 'student') newUser.cohort = cohort;
      appState.users.push(newUser); saveState();
      showToast("Registration successful!", "success"); navigateTo('#login');    }
  });
}

// ── NEW PORTAL: STUDENT ──────────────────────────────────────────────────────
function renderStudentPortal(container) {
  const freshState = localStorage.getItem('speedify_portal_state');
  if (freshState) { try { appState = JSON.parse(freshState); } catch(e) {} }
  const user = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;

  // Domain detection from cohort
  const domainMap = {
    'web':  { icon: 'fa-globe',         color: '#00f2fe', bg: 'rgba(0,242,254,0.1)',   label: 'Web Development',       desc: 'HTML, CSS, JavaScript, React, Node.js' },
    'app':  { icon: 'fa-mobile-screen', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'App Development',       desc: 'Flutter, React Native, Android, iOS' },
    'ui':   { icon: 'fa-palette',       color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  label: 'UI/UX Design',          desc: 'Figma, Adobe XD, Wireframing' },
    'full': { icon: 'fa-layer-group',   color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', label: 'Full Stack Development', desc: 'React, Node.js, Databases, REST APIs' },
  };
  const cohortLower = (user.cohort || '').toLowerCase();
  let domain = null;
  if (cohortLower.includes('web') && !cohortLower.includes('full')) domain = domainMap['web'];
  else if (cohortLower.includes('app') || cohortLower.includes('mobile')) domain = domainMap['app'];
  else if (cohortLower.includes('ui') || cohortLower.includes('ux') || cohortLower.includes('design')) domain = domainMap['ui'];
  else if (cohortLower.includes('full') || cohortLower.includes('stack')) domain = domainMap['full'];

  // Find matching application by email
  const app = appState.applications.find(a => a.email && a.email.toLowerCase() === (user.email || '').toLowerCase());

  const statusBadge = (s) => {
    const map = { 'Review': ['badge-pending','fa-hourglass-half'], 'Approved': ['badge-approved','fa-circle-check'], 'Rejected': ['badge-rejected','fa-times-circle'] };
    const [cls, ic] = map[s] || ['badge-pending','fa-circle-dot'];
    return `<span class="badge ${cls}"><i class="fa-solid ${ic}"></i> ${s}</span>`;
  };

  const domainCardHtml = domain
    ? `<div style="display:flex;align-items:center;gap:16px;padding:20px;background:${domain.bg};border:1px solid ${domain.color}33;border-radius:14px;">
        <div style="width:56px;height:56px;border-radius:14px;background:${domain.bg};border:1px solid ${domain.color}44;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid ${domain.icon}" style="font-size:24px;color:${domain.color};"></i>
        </div>
        <div><h3 style="font-size:18px;font-weight:800;margin-bottom:4px;">${domain.label}</h3>
        <p style="color:var(--text-muted);font-size:13px;">${domain.desc}</p></div>
      </div>`
    : `<p style="color:var(--text-muted);font-size:13px;padding:16px;">No domain assigned yet. Your cohort will be set by the mentor.</p>`;

  const appCardHtml = app
    ? `<div class="glass-card" style="padding:28px;margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-size:16px;font-weight:700;"><i class="fa-solid fa-file-lines" style="color:var(--accent-cyan);margin-right:8px;"></i>Your Application</h3>
          ${statusBadge(app.status)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:13.5px;">
          <div><span style="color:var(--text-muted);">Full Name</span><p style="font-weight:600;margin-top:3px;">${app.fullName}</p></div>
          <div><span style="color:var(--text-muted);">Email</span><p style="font-weight:600;margin-top:3px;">${app.email}</p></div>
          <div><span style="color:var(--text-muted);">Phone</span><p style="font-weight:600;margin-top:3px;">${app.phone || '—'}</p></div>
          <div><span style="color:var(--text-muted);">University</span><p style="font-weight:600;margin-top:3px;">${app.university || '—'}</p></div>
          <div><span style="color:var(--text-muted);">Applied For</span><p style="font-weight:600;margin-top:3px;">${app.role}</p></div>
          <div><span style="color:var(--text-muted);">Applied On</span><p style="font-weight:600;margin-top:3px;">${new Date(app.appliedAt).toLocaleDateString()}</p></div>
        </div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
          <p style="font-size:12px;color:var(--text-muted);">
            ${app.status === 'Review' ? '<i class="fa-solid fa-clock" style="color:var(--warning);margin-right:6px;"></i>Your application is under review. We\'ll contact you via email.' : ''}
            ${app.status === 'Approved' ? '<i class="fa-solid fa-circle-check" style="color:var(--success);margin-right:6px;"></i>Congratulations! Your application has been approved.' : ''}
            ${app.status === 'Rejected' ? '<i class="fa-solid fa-times-circle" style="color:var(--danger);margin-right:6px;"></i>Your application was not selected this cycle.' : ''}
          </p>
        </div>
      </div>`
    : `<div class="glass-card" style="padding:28px;margin-top:20px;text-align:center;">
        <i class="fa-solid fa-file-circle-question" style="font-size:36px;color:var(--text-muted);margin-bottom:14px;display:block;"></i>
        <h3 style="font-size:15px;font-weight:600;margin-bottom:8px;">No Application Found</h3>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px;">We couldn't find an application linked to your email address.</p>
        <button class="btn btn-primary" onclick="navigateTo('#apply')"><i class="fa-solid fa-paper-plane"></i> Apply Now</button>
      </div>`;

  container.innerHTML = `
  <div style="max-width:760px;margin:40px auto;padding:0 20px;">
    <!-- Top bar -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="logo.jpeg" alt="Speedify" style="width:40px;height:40px;border-radius:10px;background:#fff;object-fit:contain;">
        <div>
          <div style="font-size:18px;font-weight:700;">Speedify <span style="color:var(--accent-cyan);">Tech X</span></div>
          <div style="font-size:11px;color:var(--text-muted);">Internship Portal</div>
        </div>
      </div>
      <button class="btn btn-secondary" id="portal-logout-btn" style="font-size:13px;">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>

    <!-- Welcome card -->
    <div class="glass-card fade-in" style="padding:32px;margin-bottom:0;">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px;">
        <div class="profile-avatar-large" style="width:64px;height:64px;font-size:26px;margin:0;">${user.fullName.charAt(0).toUpperCase()}</div>
        <div>
          <h1 style="font-size:24px;font-weight:800;margin-bottom:4px;">Welcome, ${user.fullName}!</h1>
          <p style="color:var(--text-muted);font-size:13px;"><i class="fa-solid fa-envelope" style="margin-right:6px;"></i>${user.email}</p>
          <span class="badge badge-approved" style="font-size:11px;margin-top:8px;display:inline-flex;"><i class="fa-solid fa-bolt"></i> Tech X Intern</span>
        </div>
      </div>

      <!-- Domain -->
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:12px;"><i class="fa-solid fa-layer-group" style="color:var(--accent-cyan);margin-right:8px;"></i>Your Domain</h3>
      ${domainCardHtml}
    </div>

    <!-- Application -->
    ${appCardHtml}

    <div style="text-align:center;margin-top:28px;">
      <a href="#home" onclick="navigateTo('#home')" style="font-size:13px;color:var(--text-muted);text-decoration:none;"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
    </div>
  </div>`;

  document.getElementById('portal-logout-btn').addEventListener('click', () => {
    currentSession.currentUser = null; saveSession();
    showToast("Logged out.", "info"); navigateTo('#login');
  });
}

// ── NEW PORTAL: MENTOR ──────────────────────────────────────────────────────
function renderMentorPortal(container) {
  const freshState = localStorage.getItem('speedify_portal_state');
  if (freshState) { try { appState = JSON.parse(freshState); } catch(e) {} }
  const user = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;
  const apps = appState.applications;
  const students = appState.users.filter(u => u.role === 'student');

  const statusBadge = (s) => {
    const map = { 'Review': ['badge-pending','fa-hourglass-half'], 'Approved': ['badge-approved','fa-circle-check'], 'Rejected': ['badge-rejected','fa-times-circle'] };
    const [cls, ic] = map[s] || ['badge-pending','fa-circle-dot'];
    return `<span class="badge ${cls}"><i class="fa-solid ${ic}"></i> ${s}</span>`;
  };

  container.innerHTML = `
  <div style="max-width:900px;margin:40px auto;padding:0 20px;">
    <!-- Top bar -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="logo.jpeg" alt="Speedify" style="width:40px;height:40px;border-radius:10px;background:#fff;object-fit:contain;">
        <div>
          <div style="font-size:18px;font-weight:700;">Speedify <span style="color:var(--accent-cyan);">Tech X</span></div>
          <div style="font-size:11px;color:var(--text-muted);">Admin Portal</div>
        </div>
      </div>
      <button class="btn btn-secondary" id="portal-logout-btn" style="font-size:13px;">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>

    <!-- Welcome -->
    <div class="glass-card fade-in" style="padding:28px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:18px;">
        <div class="profile-avatar-large" style="width:64px;height:64px;font-size:26px;margin:0;background:linear-gradient(135deg,#7c3aed,#a78bfa);">${user.fullName.charAt(0).toUpperCase()}</div>
        <div>
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">Welcome, ${user.fullName}!</h1>
          <p style="color:var(--text-muted);font-size:13px;">${user.designation || 'Lead Mentor'} &nbsp;·&nbsp; ${user.department || 'Engineering'}</p>
          <span class="badge" style="font-size:11px;margin-top:8px;display:inline-flex;background:rgba(155,81,224,0.12);color:var(--accent-purple);border:1px solid rgba(155,81,224,0.3);">
            <i class="fa-solid fa-shield-halved"></i> Staff Administrator
          </span>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
      <div class="glass-card" style="padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:var(--accent-cyan);">${apps.length}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Total Applications</div>
      </div>
      <div class="glass-card" style="padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:var(--warning);">${apps.filter(a=>a.status==='Review').length}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Under Review</div>
      </div>
      <div class="glass-card" style="padding:20px;text-align:center;">
        <div style="font-size:30px;font-weight:900;color:var(--success);">${students.length}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Registered Interns</div>
      </div>
    </div>

    <!-- Google Sheets Webhook Config -->
    <div class="glass-card" style="padding:24px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;border:1px solid rgba(16,185,129,0.2);">
          <i class="fa-solid fa-table" style="color:var(--success);font-size:15px;"></i>
        </div>
        <div>
          <h3 style="font-size:15px;font-weight:700;">Google Sheets Webhook</h3>
          <p style="font-size:12px;color:var(--text-muted);">Applications will be auto-sent to your Google Sheet on submission</p>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <input class="form-control" type="url" id="sheets-webhook-input" placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
          value="${(appState.config && appState.config.sheetsWebhook) || ''}"
          style="padding-left:16px;flex:1;font-size:13px;">
        <button class="btn btn-primary" id="btn-save-webhook" style="white-space:nowrap;">
          <i class="fa-solid fa-floppy-disk"></i> Save
        </button>
      </div>
      <div style="margin-top:12px;background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;font-size:12px;color:var(--text-muted);line-height:1.7;">
        <strong style="color:var(--text-secondary);">How to set up:</strong><br>
        1. Open <a href="https://script.google.com" target="_blank" style="color:var(--accent-cyan);">script.google.com</a> → New Project<br>
        2. Paste the Apps Script code (see below), click <strong>Deploy → New Deployment → Web App</strong><br>
        3. Set access to <strong>"Anyone"</strong>, copy the Web App URL and paste it above<br>
        <button onclick="showGASModal()" class="btn btn-secondary" style="margin-top:8px;font-size:11px;padding:5px 12px;">
          <i class="fa-solid fa-code"></i> View Apps Script Code
        </button>
      </div>
    </div>

    <!-- Applications list -->
    <div class="glass-card" style="padding:28px;" id="admin-apps-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <h3 style="font-size:16px;font-weight:700;"><i class="fa-solid fa-table-cells" style="color:var(--accent-cyan);margin-right:8px;"></i>All Applications</h3>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-secondary" id="btn-export-apps-csv" style="font-size:12px;padding:8px 14px;">
            <i class="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button class="btn btn-secondary" id="btn-resync-sheets" style="font-size:12px;padding:8px 14px;">
            <i class="fa-solid fa-rotate"></i> Re-sync to Sheets
          </button>
        </div>
      </div>
      <div id="admin-apps-inner">
        <p style="text-align:center;color:var(--text-muted);padding:32px;">Loading...</p>
      </div>
    </div>

    <div style="text-align:center;margin-top:28px;margin-bottom:40px;">
      <a href="#home" onclick="navigateTo('#home')" style="font-size:13px;color:var(--text-muted);text-decoration:none;"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
    </div>
  </div>`;

  document.getElementById('portal-logout-btn').addEventListener('click', () => {
    currentSession.currentUser = null; saveSession();
    showToast("Logged out.", "info"); navigateTo('#login');
  });

  // Save webhook URL
  const btnSaveWebhook = document.getElementById('btn-save-webhook');
  if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener('click', () => {
      const url = document.getElementById('sheets-webhook-input').value.trim();
      if (!appState.config) appState.config = {};
      appState.config.sheetsWebhook = url;
      saveState();
      showToast(url ? 'Webhook URL saved! New applications will sync to Google Sheets.' : 'Webhook URL cleared.', 'success');
    });
  }

  // Show Apps Script code modal
  window.showGASModal = function() {
    const SHEET_ID = '1gfEBO6NecgUSvuLJsPn5GdnpdHntRJplK8sGbyz8vvw';
    const code = `// Speedify Tech X — Google Sheets Integration
// Spreadsheet ID is hardcoded — no need to link manually

var SPREADSHEET_ID = "${SHEET_ID}";

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Applications");
    if (!sheet) {
      sheet = ss.insertSheet("Applications");
      sheet.appendRow(["S.No","ID","Full Name","Email","Phone","City",
        "University","Degree","Year of Study","Grad Year",
        "Domain","Mode","Duration","LinkedIn",
        "Why Join","Skills","Status","Applied At"]);
      var header = sheet.getRange(1, 1, 1, 18);
      header.setBackground("#1a1a2e");
      header.setFontColor("#00f2fe");
      header.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    var data = JSON.parse(e.postData.contents);
    var sno = sheet.getLastRow(); // row 1 = header, so sno starts at 1
    sheet.appendRow([
      sno,
      data.id          || "",
      data.fullName    || "",
      data.email       || "",
      data.phone       || "",
      data.city        || "",
      data.university  || "",
      data.degree      || "",
      data.yearOfStudy || "",
      data.gradYear    || "",
      data.role        || "",
      data.mode        || "",
      data.duration    || "",
      data.linkedin    || "",
      data.whyJoin     || "",
      data.skills      || "",
      data.status      || "Review",
      data.appliedAt   || new Date().toISOString()
    ]);
    sheet.autoResizeColumns(1, 18);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("Connected: " + ss.getName());
}`;
    showModal('Google Apps Script Code', '<p style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px;">Copy this into your Google Apps Script project (Code.gs):</p><pre style="background:rgba(0,0,0,0.4);padding:16px;border-radius:8px;font-size:11.5px;overflow-x:auto;white-space:pre-wrap;color:#a5f3fc;line-height:1.6;">' + code.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre><button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="navigator.clipboard.writeText(document.querySelector(\'.modal-body pre\').innerText);showToast(\'Copied!\',\'success\')"><i class="fa-solid fa-copy"></i> Copy Code</button>');
  };
    }
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.id, data.fullName, data.email, data.phone, data.city,
      data.university, data.degree, data.yearOfStudy, data.gradYear,
      data.role, data.mode, data.duration, data.linkedin,
      data.whyJoin, data.skills, data.status, data.appliedAt
    ]);
    return ContentService.createTextOutput(JSON.stringify({status:"ok"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:"error",message:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    showModal('Google Apps Script Code', '<p style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px;">Copy this code into your Google Apps Script project:</p><pre style="background:rgba(0,0,0,0.4);padding:16px;border-radius:8px;font-size:11.5px;overflow-x:auto;white-space:pre-wrap;color:#a5f3fc;line-height:1.6;">' + code.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre><button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="navigator.clipboard.writeText(`' + code.replace(/`/g,'\\`') + '`);showToast(\'Copied!\',\'success\')"><i class="fa-solid fa-copy"></i> Copy Code</button>');
  };

  // Export CSV
  const btnExportCsv = document.getElementById('btn-export-apps-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (apps.length === 0) { showToast('No applications to export.', 'info'); return; }
      const headers = ['ID','Full Name','Email','Phone','City','University','Degree','Year','Grad Year','Domain','Mode','Duration','LinkedIn','Why Join','Skills','Status','Applied At'];
      const rows = apps.map(a => [
        a.id, a.fullName, a.email, a.phone, a.city, a.university, a.degree,
        a.yearOfStudy, a.gradYear, a.role, a.mode, a.duration, a.linkedin,
        (a.whyJoin||'').replace(/,/g,' ').replace(/\n/g,' '),
        (a.skills||'').replace(/,/g,' ').replace(/\n/g,' '),
        a.status, a.appliedAt
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => '"'+(v||'')+'"').join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = 'speedify_applications_' + new Date().toISOString().split('T')[0] + '.csv';
      a.click(); URL.revokeObjectURL(url);
      showToast('CSV downloaded!', 'success');
    });
  }

  // Re-sync all applications to Google Sheets
  const btnResync = document.getElementById('btn-resync-sheets');
  if (btnResync) {
    btnResync.addEventListener('click', async () => {
      const webhookUrl = appState.config && appState.config.sheetsWebhook;
      if (!webhookUrl) { showToast('No webhook URL set. Add it above first.', 'error'); return; }
      if (apps.length === 0) { showToast('No applications to sync.', 'info'); return; }
      btnResync.disabled = true;
      btnResync.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
      let ok = 0;
      for (const a of apps) {
        try {
          await fetch(webhookUrl, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body: JSON.stringify(a) });
          ok++;
        } catch(err) { console.warn('Sync failed for', a.id, err); }
      }
      btnResync.disabled = false;
      btnResync.innerHTML = '<i class="fa-solid fa-rotate"></i> Re-sync to Sheets';
      showToast('Synced ' + ok + ' of ' + apps.length + ' applications to Google Sheets.', 'success');
    });
  }

  // Build applications table
  const adminAppsInner = document.getElementById('admin-apps-inner');
  if (adminAppsInner) {
    if (apps.length === 0) {
      adminAppsInner.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:32px;">No applications received yet.</p>';
    } else {
      let rows = '';
      apps.forEach(function(a) {
        const sel_r = a.status === 'Review'   ? 'selected' : '';
        const sel_a = a.status === 'Approved' ? 'selected' : '';
        const sel_j = a.status === 'Rejected' ? 'selected' : '';
        rows += '<tr>' +
          '<td><strong>' + a.fullName + '</strong><div style="font-size:11px;color:var(--text-muted);">' + (a.city||'') + '</div></td>' +
          '<td><div>' + a.email + '</div><div style="font-size:11px;color:var(--text-muted);">' + (a.phone||'') + '</div></td>' +
          '<td>' + a.role + '</td>' +
          '<td><div>' + (a.university||'—') + '</div><div style="font-size:11px;color:var(--text-muted);">' + (a.degree||'') + ' · ' + (a.yearOfStudy||'') + '</div></td>' +
          '<td>' + new Date(a.appliedAt).toLocaleDateString() + '</td>' +
          '<td>' + statusBadge(a.status) + '</td>' +
          '<td style="display:flex;gap:6px;align-items:center;">' +
          '<select class="form-control" style="padding:6px 8px;font-size:12px;width:110px;" onchange="updateAppStatus(\'' + a.id + '\', this.value)">' +
          '<option ' + sel_r + '>Review</option>' +
          '<option ' + sel_a + '>Approved</option>' +
          '<option ' + sel_j + '>Rejected</option>' +
          '</select>' +
          '<button class="btn btn-secondary" style="padding:5px 8px;font-size:11px;white-space:nowrap;" onclick="viewAppDetails(\'' + a.id + '\')">' +
          '<i class="fa-solid fa-eye"></i></button>' +
          '</td></tr>';
      });
      adminAppsInner.innerHTML = '<div class="table-responsive"><table class="custom-table"><thead><tr>' +
        '<th>Name</th><th>Email / Phone</th><th>Domain</th><th>College / Degree</th><th>Applied On</th><th>Status</th><th>Action</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }
  }
}

window.updateAppStatus = function(appId, newStatus) {
  const app = appState.applications.find(a => a.id === appId);
  if (!app) return;
  app.status = newStatus;
  saveState();
  showToast(`Application status updated to "${newStatus}".`, 'success');
};

// 4. STUDENT DASHBOARD
function renderStudentDashboard(container) {
  // Always reload latest state from localStorage so mentor changes are visible
  const freshState = localStorage.getItem('speedify_portal_state');
  if (freshState) { try { appState = JSON.parse(freshState); } catch(e) {} }
  const student = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = appState.attendance.find(a => a.userId === student.id && a.date === todayStr);
  let checkInTime = todaysAttendance ? todaysAttendance.clockIn : '';
  let checkOutTime = todaysAttendance ? todaysAttendance.clockOut : '';
  let isCheckedIn = !!checkInTime;
  let isCheckedOut = !!checkOutTime;

  const domainMap = {
    'web':  { icon: 'fa-globe',        color: '#00f2fe', bg: 'rgba(0,242,254,0.1)',   label: 'Web Development',      desc: 'HTML, CSS, JavaScript, React, Node.js' },
    'app':  { icon: 'fa-mobile-screen',color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'App Development',      desc: 'Flutter, React Native, Android, iOS' },
    'ui':   { icon: 'fa-palette',      color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  label: 'UI/UX Design',         desc: 'Figma, Adobe XD, Wireframing, Prototyping' },
    'full': { icon: 'fa-layer-group',  color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', label: 'Full Stack Development',desc: 'React, Node.js, Databases, REST APIs' },
  };
  const cohortLower = (student.cohort || '').toLowerCase();
  let matchedDomain = null;
  if (cohortLower.includes('web') && !cohortLower.includes('full')) matchedDomain = domainMap['web'];
  else if (cohortLower.includes('app') || cohortLower.includes('mobile')) matchedDomain = domainMap['app'];
  else if (cohortLower.includes('ui') || cohortLower.includes('ux') || cohortLower.includes('design')) matchedDomain = domainMap['ui'];
  else if (cohortLower.includes('full') || cohortLower.includes('stack')) matchedDomain = domainMap['full'];

  const domainDisplayHtml = matchedDomain
    ? '<div style="display:flex;align-items:center;gap:20px;">' +
      '<div style="width:64px;height:64px;border-radius:16px;background:' + matchedDomain.bg + ';border:1px solid ' + matchedDomain.color + '33;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
      '<i class="fa-solid ' + matchedDomain.icon + '" style="font-size:26px;color:' + matchedDomain.color + ';"></i></div>' +
      '<div><h2 style="font-size:22px;font-weight:800;margin-bottom:4px;">' + matchedDomain.label + '</h2>' +
      '<p style="color:var(--text-muted);font-size:13px;">' + matchedDomain.desc + '</p></div></div>'
    : '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">' +
      Object.values(domainMap).map(function(d) {
        return '<div style="background:' + d.bg + ';border:1px solid ' + d.color + '33;border-radius:12px;padding:16px;text-align:center;">' +
               '<i class="fa-solid ' + d.icon + '" style="font-size:22px;color:' + d.color + ';margin-bottom:8px;display:block;"></i>' +
               '<p style="font-size:13px;font-weight:700;">' + d.label + '</p></div>';
      }).join('') + '</div>';

  container.innerHTML = `
<!-- TAB HOME: STUDENT PROFILE CARD (shown on login) -->
<div id="student-home" class="dashboard-tab">
  <div class="view-header">
    <div class="view-title"><h1>Welcome, ${student.fullName.split(' ')[0]}!</h1><p>Your internship profile at Speedify Tech X.</p></div>
    <div class="badge badge-approved"><i class="fa-solid fa-bolt"></i> Speedify Intern</div>
  </div>
  <div style="display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start;">
    <!-- Profile card -->
    <div class="glass-card" style="padding:32px;text-align:center;">
      <div class="profile-avatar-large" style="margin:0 auto 16px;">${student.fullName.charAt(0).toUpperCase()}</div>
      <h2 style="font-size:20px;font-weight:700;margin-bottom:4px;">${student.fullName}</h2>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:6px;">Tech X Intern</p>
      <span class="badge badge-approved" style="font-size:11px;margin-bottom:20px;display:inline-flex;"><i class="fa-solid fa-circle-check"></i> Active Account</span>
      <div style="border-top:1px solid var(--border-color);padding-top:20px;text-align:left;display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-envelope" style="color:var(--accent-cyan);width:16px;"></i>
          <span style="color:var(--text-muted);">Email</span>
          <strong style="margin-left:auto;text-align:right;max-width:180px;overflow:hidden;text-overflow:ellipsis;">${student.email || 'N/A'}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-user" style="color:var(--accent-cyan);width:16px;"></i>
          <span style="color:var(--text-muted);">Username</span>
          <strong style="margin-left:auto;"><code>${student.username}</code></strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-users-rectangle" style="color:var(--accent-cyan);width:16px;"></i>
          <span style="color:var(--text-muted);">Cohort</span>
          <strong style="margin-left:auto;">${student.cohort || 'N/A'}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-calendar" style="color:var(--accent-cyan);width:16px;"></i>
          <span style="color:var(--text-muted);">Joined</span>
          <strong style="margin-left:auto;">${student.joinedDate || 'N/A'}</strong>
        </div>
      </div>
    </div>
    <!-- Domain + details panel -->
    <div style="display:flex;flex-direction:column;gap:20px;">
      <!-- Domain card -->
      <div class="glass-card" style="padding:28px;">
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:20px;"><i class="fa-solid fa-layer-group" style="color:var(--accent-cyan);margin-right:8px;"></i>Your Domain</h3>
        <div id="student-domain-display">
          ${domainDisplayHtml}
        </div>
      </div>
      <!-- Quick stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--accent-cyan);" id="home-tasks-done">0</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Tasks Done</div>
        </div>
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--success);" id="home-reports-approved">0</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Reports Approved</div>
        </div>
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--accent-purple);" id="home-attendance-pct">0%</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Attendance</div>
        </div>
      </div>
      <!-- Program info -->
      <div class="glass-card" style="padding:24px;">
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:16px;"><i class="fa-solid fa-circle-info" style="color:var(--accent-purple);margin-right:8px;"></i>Program Info</h3>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Organization</span><strong>Speedify Tech X</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Registration</span><strong style="color:var(--success);">MSME Registered</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Support Email</span><a href="mailto:speedifytechx@gmail.com" style="color:var(--accent-cyan);">speedifytechx@gmail.com</a></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="color:var(--text-muted);">Phone</span><a href="tel:+918610535231" style="color:var(--accent-cyan);">+91 8610535231</a></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 1: OVERVIEW -->
<div id="student-overview" class="dashboard-tab" style="display:none;">
  <div class="view-header">
    <div class="view-title"><h1>Intern Overview</h1><p>Welcome back, ${student.fullName}! Access your active progress parameters.</p></div>
    <div class="badge badge-approved"><i class="fa-solid fa-bolt"></i> Speedify Intern</div>
  </div>
  <div class="dashboard-grid">
    <div class="dashboard-left-content">
      <div class="glass-card" style="margin-bottom:24px;">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:16px;">Task Completion Metrics</h3>
        <div class="task-progress-bar-container" style="width:100%;height:12px;margin-bottom:8px;"><div class="student-progress-bar" id="student-main-progress" style="width:0%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:20px;"><span id="txt-tasks-ratio">Tasks Completed: 0/0</span><span id="txt-progress-percent">0%</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:center;border-top:1px solid var(--border-color);padding-top:16px;">
          <div><h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);">Approved Reports</h4><p style="font-size:20px;font-weight:700;color:var(--success);" id="txt-approved-cnt">0</p></div>
          <div><h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);">Attendance Rate</h4><p style="font-size:20px;font-weight:700;color:var(--accent-cyan);" id="txt-attendance-pct">0%</p></div>
        </div>
      </div>
      <div class="glass-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:16px;font-weight:600;">Current Tasks Checklist</h3>
          <a href="#" class="accent-text" style="font-size:12px;text-decoration:none;" onclick="event.preventDefault();document.querySelector('[data-tab=student-tasks]').click();">View All</a>
        </div>
        <div class="task-list" id="overview-task-list"></div>
      </div>
    </div>
    <div class="dashboard-right-content">
      <div class="glass-card" style="height:100%;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:16px;font-weight:600;"><i class="fa-solid fa-play-circle" style="color:var(--accent-cyan);margin-right:8px;"></i>Training Videos</h3>
          <a href="#" class="accent-text" style="font-size:12px;text-decoration:none;" onclick="event.preventDefault();document.querySelector('[data-tab=student-videos]').click();">View All</a>
        </div>
        <div id="overview-videos-list" style="display:flex;flex-direction:column;gap:12px;"></div>
      </div>
    </div>
  </div>
</div>
<!-- TAB 2: SUBMIT REPORT -->
<div id="student-report" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Submit Daily Work Report</h1><p>Record daily activity logs and upload screenshots or demo videos.</p></div></div>
  <div class="glass-card" style="max-width:800px;margin:0 auto;">
    <form id="form-report">
      <div style="display:grid;grid-template-columns:1fr;gap:20px;margin-bottom:20px;">
        <div><label class="form-label">Work Log Date</label><input class="form-control" type="date" id="report-date" required style="padding-left:16px;"></div>
      </div>
      <div class="form-group"><label class="form-label">Detailed Work Summary</label><textarea class="form-control" id="report-summary" placeholder="Describe work completed today..." required></textarea></div>
      <label class="form-label">Attach Progress Proofs</label>
      <div class="file-upload-wrapper">
        <div class="file-upload-box" id="screenshot-upload-box">
          <input type="file" id="report-screenshot" accept="image/*">
          <div class="file-upload-content" id="screenshot-box-content"><i class="fa-regular fa-image"></i><span>Add Screenshot</span><p>PNG, JPG up to 10MB</p></div>
          <div class="file-preview" id="screenshot-preview-container"><img id="screenshot-preview-img" src="" alt="Preview"></div>
          <div class="file-preview-name" id="screenshot-file-name"></div>
        </div>
        <div class="file-upload-box" id="report-video-upload-box">
          <input type="file" id="report-video-file" accept="video/*">
          <div class="file-upload-content" id="report-video-box-content"><i class="fa-regular fa-file-video"></i><span>Upload Progress Video</span><p>MP4, WebM up to 100MB</p></div>
          <div class="file-preview-name" id="report-video-file-name"></div>
        </div>
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; border:2px dashed var(--border-color); border-radius:12px; padding:20px; background:rgba(8,12,20,0.3); transition:all 0.3s ease;">
          <label class="form-label" style="margin-bottom:10px;"><i class="fa-solid fa-link" style="margin-right:6px; color:var(--accent-cyan);"></i>Links</label>
          <div class="input-container">
            <input class="form-control" type="url" id="report-github" placeholder="https://your-project-link.com" style="padding-left:42px;">
            <i class="fa-solid fa-link" style="left:14px; top:50%; transform:translateY(-50%); position:absolute; color:var(--text-muted);"></i>
          </div>
          <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">Add any relevant project or demo link</p>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:16px;">
        <button class="btn btn-secondary" type="reset" id="btn-reset-report">Clear</button>
        <button class="btn btn-primary" type="submit"><span>Submit Daily Report</span><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    </form>
  </div>
</div>`;

  container.innerHTML += `
<!-- TAB 3: SUBMIT PROJECT -->
<div id="student-project" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Submit Project Files & Links</h1><p>Submit final files (ZIP) and supply repository links or live deployments.</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
    <div class="glass-card">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Project Submission Form</h3>
      <form id="form-project">
        <div class="form-group"><label class="form-label">Project Title</label><input class="form-control" type="text" id="proj-title" placeholder="e.g. Authentication Module SPA" required style="padding-left:16px;"></div>
        <div class="form-group"><label class="form-label">Project Description</label><textarea class="form-control" id="proj-desc" placeholder="Details of technologies used..." required style="padding-left:16px;min-height:80px;"></textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div><label class="form-label">Repository URL</label><input class="form-control" type="url" id="proj-repo" placeholder="https://github.com/..." required style="padding-left:16px;"></div>
          <div><label class="form-label">Live Demo Link</label><input class="form-control" type="url" id="proj-live" placeholder="https://..." style="padding-left:16px;"></div>
        </div>
        <div class="form-group"><label class="form-label">Upload Code Package (ZIP)</label>
          <div class="file-upload-box" id="zip-upload-box" style="padding:15px;">
            <input type="file" id="proj-zip" accept=".zip,.rar,.tar,.gz">
            <div class="file-upload-content" id="zip-box-content"><i class="fa-solid fa-file-zipper"></i><span>Upload ZIP Archive</span><p>Max file size 100MB</p></div>
            <div class="file-preview-name" id="zip-file-name" style="margin-top:4px;color:var(--accent-cyan);"></div>
          </div>
        </div>
        <button class="btn btn-primary btn-full" type="submit"><span>Submit Project</span><i class="fa-solid fa-upload"></i></button>
      </form>
    </div>
    <div class="glass-card">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Project Submission History</h3>
      <div class="table-responsive" style="max-height:380px;overflow-y:auto;">
        <table class="custom-table"><thead><tr><th>Project Title</th><th>Status</th><th>Links</th><th>Feedback</th></tr></thead><tbody id="student-projects-tbody"></tbody></table>
      </div>
    </div>
  </div>
</div>
<!-- TAB 4: MY TASKS -->
<div id="student-tasks" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>My Assigned Tasks</h1><p>Review tasks assigned by the mentor and toggle completion checkmarks.</p></div></div>
  <div class="glass-card"><div class="task-list" id="assigned-tasks-list"></div></div>
</div>
<!-- TAB 5: TRAINING VIDEOS & RESOURCES -->
<div id="student-videos" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Training Videos &amp; Resources</h1><p>Watch recorded sessions, lectures, and access links shared by your mentor.</p></div></div>
  <!-- Videos sub-section -->
  <div style="margin-bottom:28px;">
    <h3 style="font-size:15px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;"><i class="fa-solid fa-play-circle" style="color:var(--accent-cyan);margin-right:8px;"></i>Video Lectures</h3>
    <div id="student-videos-grid" class="resource-grid"></div>
  </div>
  <!-- Links sub-section -->
  <div>
    <h3 style="font-size:15px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;"><i class="fa-solid fa-link" style="color:var(--success);margin-right:8px;"></i>Resource Links &amp; Docs</h3>
    <div id="student-links-grid" class="resource-grid"></div>
  </div>
</div>
<!-- TAB 5b: RESOURCE LIBRARY (hidden, kept for data) -->
<div id="student-resources" class="dashboard-tab" style="display:none;">
  <div class="resource-grid" id="student-resources-grid"></div>
</div>
<!-- TAB 6: PAYMENT -->
<div id="student-earnings" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Payment</h1><p>Complete your internship program fee payment using the details below.</p></div></div>

  <!-- Payment Summary Cards -->
  <div class="earnings-grid" style="margin-bottom:28px;">
    <div class="glass-card earnings-card">
      <h4>Program Fee</h4>
      <div class="amount amount-accrued" style="font-size:28px;">₹999</div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">One-time internship fee</div>
    </div>
    <div class="glass-card earnings-card">
      <h4>Payment Status</h4>
      <div class="amount amount-pending" id="se-total-pending" style="font-size:20px;margin-top:8px;">Pending</div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Awaiting confirmation</div>
    </div>
    <div class="glass-card earnings-card">
      <h4>Support</h4>
      <div style="font-size:13px;color:var(--text-primary);margin-top:8px;font-weight:600;">speedifytechx@gmail.com</div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">For payment queries</div>
    </div>
  </div>

  <!-- Payment Methods -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">

    <!-- UPI Payment -->
    <div class="glass-card" style="padding:28px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(0,242,254,0.1);display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,242,254,0.2);">
          <i class="fa-solid fa-mobile-screen-button" style="color:var(--accent-cyan);font-size:18px;"></i>
        </div>
        <div>
          <h3 style="font-size:16px;font-weight:700;">UPI Payment</h3>
          <p style="font-size:12px;color:var(--text-muted);">Pay instantly via any UPI app</p>
        </div>
      </div>
      <div style="background:rgba(8,12,20,0.5);border:1px solid var(--border-color);border-radius:12px;padding:18px;margin-bottom:16px;">
        <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">UPI ID</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:15px;font-weight:600;color:var(--accent-cyan);">speedifytechx@okicici</span>
          <button onclick="navigator.clipboard.writeText('speedifytechx@okicici');this.innerHTML='<i class=\'fa-solid fa-check\'></i>';setTimeout(()=>this.innerHTML='<i class=\'fa-regular fa-copy\'></i>',1500);" style="background:rgba(0,242,254,0.1);border:1px solid rgba(0,242,254,0.2);color:var(--accent-cyan);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px;"><i class="fa-regular fa-copy"></i></button>
        </div>
      </div>
      <div style="background:rgba(8,12,20,0.5);border:1px solid var(--border-color);border-radius:12px;padding:18px;">
        <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Phone Pay / Google Pay</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:15px;font-weight:600;color:var(--accent-cyan);">+91 8610535231</span>
          <button onclick="navigator.clipboard.writeText('8610535231');this.innerHTML='<i class=\'fa-solid fa-check\'></i>';setTimeout(()=>this.innerHTML='<i class=\'fa-regular fa-copy\'></i>',1500);" style="background:rgba(0,242,254,0.1);border:1px solid rgba(0,242,254,0.2);color:var(--accent-cyan);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px;"><i class="fa-regular fa-copy"></i></button>
        </div>
      </div>
    </div>

    <!-- Bank Transfer -->
    <div class="glass-card" style="padding:28px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(155,81,224,0.1);display:flex;align-items:center;justify-content:center;border:1px solid rgba(155,81,224,0.2);">
          <i class="fa-solid fa-building-columns" style="color:var(--accent-purple);font-size:18px;"></i>
        </div>
        <div>
          <h3 style="font-size:16px;font-weight:700;">Bank Transfer</h3>
          <p style="font-size:12px;color:var(--text-muted);">NEFT / IMPS / RTGS</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="background:rgba(8,12,20,0.5);border:1px solid var(--border-color);border-radius:10px;padding:14px;">
          <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Account Name</p>
          <p style="font-size:14px;font-weight:600;">Speedify Tech X</p>
        </div>
        <div style="background:rgba(8,12,20,0.5);border:1px solid var(--border-color);border-radius:10px;padding:14px;">
          <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Account Number</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <p style="font-size:14px;font-weight:600;">XXXX XXXX 5231</p>
            <button onclick="navigator.clipboard.writeText('XXXXXXXXXX5231');this.innerHTML='<i class=\'fa-solid fa-check\'></i>';setTimeout(()=>this.innerHTML='<i class=\'fa-regular fa-copy\'></i>',1500);" style="background:rgba(155,81,224,0.1);border:1px solid rgba(155,81,224,0.2);color:var(--accent-purple);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px;"><i class="fa-regular fa-copy"></i></button>
          </div>
        </div>
        <div style="background:rgba(8,12,20,0.5);border:1px solid var(--border-color);border-radius:10px;padding:14px;">
          <p style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">IFSC Code</p>
          <p style="font-size:14px;font-weight:600;">ICIC0001234</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Instructions -->
  <div class="glass-card instruction-box" style="border-color:rgba(0,242,254,0.2);">
    <p style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--accent-cyan);"><i class="fa-solid fa-circle-info" style="margin-right:8px;"></i>After Payment</p>
    <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Once you complete the payment, please send your <strong style="color:var(--text-primary);">payment screenshot</strong> to <a href="mailto:speedifytechx@gmail.com" style="color:var(--accent-cyan);">speedifytechx@gmail.com</a> or WhatsApp us at <a href="tel:+918610535231" style="color:var(--accent-cyan);">+91 8610535231</a> for confirmation. Your account will be activated within 24 hours.</p>
  </div>
</div>
<!-- TAB 7: WORK HISTORY -->
<div id="student-history" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>My Work Reports History</h1><p>Search historic reports and review mentor comments.</p></div></div>
  <div class="glass-card">
    <div class="table-filters">
      <div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="history-search" placeholder="Search report content..."></div>
      <select class="form-control" id="history-filter-status" style="max-width:180px;padding:10px 14px 10px 16px;background-image:none;"><option value="all">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    </div>
    <div class="table-responsive"><table class="custom-table"><thead><tr><th>Date</th><th>Hours</th><th style="width:40%;">Summary</th><th>Attachments</th><th>Status</th><th>Feedback</th></tr></thead><tbody id="student-history-tbody"></tbody></table></div>
  </div>
</div>
<!-- TAB 8: (removed profile — shown on login home tab) -->
`;

  // --- STUDENT LOGIC WIRE-UP ---
  function updateClock() {
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    if (!timeEl || !dateEl) return;
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dateEl.innerText = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  updateClock();
  const clockInterval = setInterval(updateClock, 1000);
  const originalHash = window.location.hash;
  const intervalChecker = setInterval(() => { if (window.location.hash !== originalHash) { clearInterval(clockInterval); clearInterval(intervalChecker); } }, 1000);

  const btnClockIn = document.getElementById('btn-clock-in');
  const btnClockOut = document.getElementById('btn-clock-out');
  const statusText = document.getElementById('attendance-status-text');

  btnClockIn.addEventListener('click', () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowHour = new Date().getHours(); const nowMinute = new Date().getMinutes();
    let attStatus = 'present';
    if (nowHour > 9 || (nowHour === 9 && nowMinute > 15)) attStatus = 'late';
    const newRecord = { id: generateId('att'), userId: student.id, date: todayStr, clockIn: timeNow, clockOut: '', status: attStatus };
    appState.attendance.push(newRecord); saveState();
    btnClockIn.disabled = true; btnClockIn.style.opacity = '0.5'; btnClockIn.style.cursor = 'not-allowed';
    btnClockOut.disabled = false; btnClockOut.style.opacity = '1'; btnClockOut.style.cursor = 'pointer';
    statusText.innerText = `Clocked In at ${timeNow}`;
    showToast("Clocked in successfully!", "success");
    addStudentActivity(`Checked in today at ${timeNow}. Status: ${attStatus.toUpperCase()}`);
    updateStudentMetrics();
  });

  btnClockOut.addEventListener('click', () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attRec = appState.attendance.find(a => a.userId === student.id && a.date === todayStr);
    if (attRec) { attRec.clockOut = timeNow; saveState(); }
    btnClockOut.disabled = true; btnClockOut.style.opacity = '0.5'; btnClockOut.style.cursor = 'not-allowed';
    statusText.innerText = `Logged Out for today. Clocked out at ${timeNow}`;
    showToast("Clocked out successfully!", "success");
    addStudentActivity(`Checked out today at ${timeNow}.`);
    updateStudentMetrics();
  });

  document.getElementById('report-date').value = todayStr;

  // Screenshot upload
  const ssInput = document.getElementById('report-screenshot');
  const ssBoxContent = document.getElementById('screenshot-box-content');
  const ssPreviewContainer = document.getElementById('screenshot-preview-container');
  const ssPreviewImg = document.getElementById('screenshot-preview-img');
  const ssFileName = document.getElementById('screenshot-file-name');
  ssInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => { ssPreviewImg.src = event.target.result; ssPreviewContainer.style.display = 'block'; ssBoxContent.style.display = 'none'; ssFileName.innerText = file.name; ssFileName.style.display = 'block'; };
      reader.readAsDataURL(file);
    }
  });

  // Progress video upload
  const reportVideoInput = document.getElementById('report-video-file');
  const reportVideoBoxContent = document.getElementById('report-video-box-content');
  const reportVideoFileName = document.getElementById('report-video-file-name');
  reportVideoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      reportVideoBoxContent.querySelector('i').style.color = 'var(--accent-cyan)';
      reportVideoBoxContent.querySelector('span').innerText = 'Video Selected';
      reportVideoFileName.innerText = file.name;
      reportVideoFileName.style.display = 'block';
    }
  });

  document.getElementById('btn-reset-report').addEventListener('click', () => {
    ssBoxContent.style.display = 'block'; ssPreviewContainer.style.display = 'none'; ssPreviewImg.src = '';
    ssFileName.innerText = ''; ssFileName.style.display = 'none';
    // Reset video upload too
    reportVideoBoxContent.querySelector('i').style.color = '';
    reportVideoBoxContent.querySelector('span').innerText = 'Upload Progress Video';
    reportVideoFileName.innerText = ''; reportVideoFileName.style.display = 'none';
    const ghInput = document.getElementById('report-github');
    if (ghInput) ghInput.value = '';
  });

  document.getElementById('form-report').addEventListener('submit', (e) => {
    e.preventDefault();
    const dateVal = document.getElementById('report-date').value;
    const summaryVal = document.getElementById('report-summary').value.trim();
    const githubLink = document.getElementById('report-github').value.trim();
    if (appState.reports.some(r => r.userId === student.id && r.date === dateVal)) { showToast(`Report for ${dateVal} already submitted.`, "error"); return; }
    const ssFile = ssInput.files[0];
    const vidFile = reportVideoInput.files[0];

    // Store video in sessionStorage blob reference to survive page interactions
    let videoUrl = '';
    let videoName = '';
    if (vidFile) {
      videoName = vidFile.name;
      const blobUrl = URL.createObjectURL(vidFile);
      const sessionKey = 'rep_vid_' + Date.now();
      // Read as data URL for persistence (may be large; use blob URL for playback during session)
      videoUrl = '__rep_session:' + sessionKey;
      const vidReader = new FileReader();
      vidReader.onload = (ev) => { sessionStorage.setItem(sessionKey, ev.target.result); };
      vidReader.readAsDataURL(vidFile);
    }

    const newReport = {
      id: generateId('rep'), userId: student.id, studentName: student.fullName,
      date: dateVal, summary: summaryVal, hoursWorked: 0,
      githubLink: githubLink || "",
      videoName: videoName,
      videoUrl: videoUrl,
      screenshotName: ssFile ? ssFile.name : "", screenshotUrl: ssFile ? ssPreviewImg.src : "",
      status: "pending", feedback: "", createdAt: new Date().toISOString()
    };
    appState.reports.push(newReport); saveState();
    showToast("Report submitted successfully!", "success");
    addStudentActivity(`Submitted daily report for ${dateVal}.`);
    document.getElementById('form-report').reset();
    document.getElementById('btn-reset-report').click();
    populateStudentHistory(); updateStudentMetrics();
    document.querySelector('[data-tab=student-history]').click();
  });

  // ZIP upload
  const zipInput = document.getElementById('proj-zip');
  const zipBoxContent = document.getElementById('zip-box-content');
  const zipFileName = document.getElementById('zip-file-name');
  zipInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { zipBoxContent.querySelector('i').style.color = 'var(--accent-purple)'; zipBoxContent.querySelector('span').innerText = 'ZIP Selected'; zipFileName.innerText = file.name; }
  });

  document.getElementById('form-project').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = document.getElementById('proj-title').value.trim();
    const zipFile = zipInput.files[0];
    const newProj = { id: generateId('proj'), userId: student.id, studentName: student.fullName, title: titleVal, description: document.getElementById('proj-desc').value.trim(), repoUrl: document.getElementById('proj-repo').value.trim(), liveUrl: document.getElementById('proj-live').value.trim() || 'N/A', zipName: zipFile ? zipFile.name : "N/A", status: "pending", feedback: "", submittedAt: new Date().toISOString() };
    appState.projects.push(newProj); saveState();
    showToast("Project uploaded successfully!", "success"); addStudentActivity(`Submitted project: "${titleVal}"`);
    document.getElementById('form-project').reset();
    zipBoxContent.querySelector('i').style.color = 'var(--text-muted)'; zipBoxContent.querySelector('span').innerText = 'Upload ZIP Archive'; zipFileName.innerText = '';
    populateStudentProjects();
  });

  function populateStudentProjects() {
    const tbody = document.getElementById('student-projects-tbody');
    if (!tbody) return;
    const myProjs = appState.projects.filter(p => p.userId === student.id);
    if (myProjs.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No projects submitted yet.</td></tr>`; return; }
    tbody.innerHTML = myProjs.map(p => `<tr><td><strong>${p.title}</strong></td><td><span class="badge badge-${p.status}">${p.status}</span></td><td><a href="${p.repoUrl}" target="_blank" class="btn btn-secondary" style="padding:4px 8px;font-size:11px;margin-right:4px;"><i class="fa-brands fa-github"></i> Repo</a>${p.liveUrl !== 'N/A' ? `<a href="${p.liveUrl}" target="_blank" class="btn btn-secondary" style="padding:4px 8px;font-size:11px;"><i class="fa-solid fa-globe"></i> Live</a>` : ''}</td><td><span style="font-size:11.5px;color:${p.feedback ? 'var(--text-primary)' : 'var(--text-muted)'};font-style:${p.feedback ? 'normal' : 'italic'}">${p.feedback || 'Under review.'}</span></td></tr>`).join('');
  }

  function populateStudentTasks() {
    const tasksList = document.getElementById('assigned-tasks-list');
    const overviewTasks = document.getElementById('overview-task-list');
    if (!tasksList || !overviewTasks) return;
    const myTasks = appState.tasks.filter(t => t.assignedTo === student.id);
    if (myTasks.length === 0) { tasksList.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:24px;">No tasks assigned yet.</p>`; overviewTasks.innerHTML = `<p style="color:var(--text-muted);padding:8px;">No current assignments.</p>`; return; }
    let tasksHtml = ''; let overviewHtml = '';
    myTasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      tasksHtml += `<div class="task-item"><label class="task-checkbox-wrapper" for="chk-${task.id}"><input type="checkbox" id="chk-${task.id}" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}"><div class="task-checkbox"><i class="fa-solid fa-check"></i></div><span class="task-text">${task.title}</span></label><div class="task-meta"><span class="task-deadline"><i class="fa-regular fa-calendar"></i> Due: ${task.dueDate}</span><button class="btn btn-secondary" style="padding:6px 12px;font-size:11px;" onclick="showTaskDetails('${task.id}')">Details</button></div></div>`;
      if (!isCompleted) overviewHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;font-size:13px;"><span><i class="fa-solid fa-tasks" style="color:var(--accent-cyan);margin-right:8px;"></i>${task.title}</span><span style="font-size:11px;color:var(--danger);"><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span></div>`;
    });
    tasksList.innerHTML = tasksHtml;
    overviewTasks.innerHTML = overviewHtml || `<p style="color:var(--success);font-size:13px;padding:8px;"><i class="fa-regular fa-face-smile"></i> All tasks completed!</p>`;
    tasksList.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const tId = e.target.getAttribute('data-task-id');
        const task = appState.tasks.find(t => t.id === tId);
        if (task) { task.status = e.target.checked ? 'completed' : 'pending'; task.completedAt = e.target.checked ? new Date().toISOString().split('T')[0] : ''; saveState(); showToast(`Task marked as ${task.status}!`, "info"); addStudentActivity(`Marked task "${task.title}" as ${task.status.toUpperCase()}.`); populateStudentTasks(); updateStudentMetrics(); }
      });
    });
  }

  window.showTaskDetails = function(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    showModal(task.title, `<p style="color:var(--text-secondary);margin-bottom:12px;">${task.description}</p><p><strong>Due:</strong> ${task.dueDate}</p><p><strong>Status:</strong> <span class="badge badge-${task.status === 'completed' ? 'approved' : 'pending'}">${task.status}</span></p>`);
  };

  function populateStudentResources() {
    const grid = document.getElementById('student-resources-grid');
    if (!grid) return;
    const res = appState.resources;
    if (res.length === 0) { grid.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:24px;">No files posted yet.</p>`; return; }
    grid.innerHTML = res.map(r => {
      let mediaButton = '';
      if (r.type === 'video' && r.url) mediaButton = `<button class="btn btn-primary btn-full" onclick="playResourceVideo('${r.id}')" style="margin-bottom:8px;"><i class="fa-solid fa-play"></i> Watch Record</button>`;
      return `<div class="glass-card resource-card"><div><div class="resource-badge ${r.type === 'video' ? 'res-video' : (r.type === 'doc' ? 'res-doc' : 'res-link')}"><i class="fa-solid ${r.type === 'video' ? 'fa-play' : (r.type === 'doc' ? 'fa-file-lines' : 'fa-link')}"></i>${r.type.toUpperCase()}</div><h4 class="resource-title">${r.title}</h4><p class="resource-desc">${r.description}</p></div><div>${mediaButton}${r.linkUrl ? `<a href="${r.linkUrl}" target="_blank" class="btn btn-secondary btn-full"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Resource Link</a>` : ''}</div></div>`;
    }).join('');
  }

  function populateStudentVideos() {
    const videos = appState.resources.filter(r => r.type === 'video');    // Full videos tab
    const linksAndDocs = appState.resources.filter(r => r.type !== 'video'); // Links & docs
    const grid = document.getElementById('student-videos-grid');
    const linksGrid = document.getElementById('student-links-grid');
    if (grid) {
      if (videos.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);"><i class="fa-solid fa-video" style="font-size:40px;margin-bottom:14px;display:block;opacity:0.3;"></i><p>No training videos uploaded yet.<br>Check back soon!</p></div>`;
      } else {
        grid.innerHTML = videos.map(r => `
          <div class="glass-card resource-card">
            <div>
              <div class="resource-badge res-video" style="margin-bottom:12px;"><i class="fa-solid fa-play"></i> VIDEO</div>
              <h4 class="resource-title">${r.title}</h4>
              <p class="resource-desc">${r.description}</p>
              <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px;"><i class="fa-solid fa-user" style="margin-right:4px;"></i>${r.postedBy} &nbsp;·&nbsp; ${new Date(r.postedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <button class="btn btn-primary btn-full" style="margin-bottom:8px;" onclick="playResourceVideo('${r.id}')"><i class="fa-solid fa-play"></i> Watch Now</button>
              ${r.linkUrl ? `<a href="${r.linkUrl}" target="_blank" class="btn btn-secondary btn-full"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Link</a>` : ''}
            </div>
          </div>`).join('');
      }
    }
    if (linksGrid) {
      if (linksAndDocs.length === 0) {
        linksGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);"><i class="fa-solid fa-link" style="font-size:40px;margin-bottom:14px;display:block;opacity:0.3;"></i><p>No resource links shared yet.</p></div>`;
      } else {
        linksGrid.innerHTML = linksAndDocs.map(r => {
          const iconClass = r.type === 'doc' ? 'fa-file-lines' : 'fa-link';
          const badgeClass = r.type === 'doc' ? 'res-doc' : 'res-link';
          return `
          <div class="glass-card resource-card">
            <div>
              <div class="resource-badge ${badgeClass}" style="margin-bottom:12px;"><i class="fa-solid ${iconClass}"></i> ${r.type.toUpperCase()}</div>
              <h4 class="resource-title">${r.title}</h4>
              <p class="resource-desc">${r.description}</p>
              <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px;"><i class="fa-solid fa-user" style="margin-right:4px;"></i>${r.postedBy} &nbsp;·&nbsp; ${new Date(r.postedAt).toLocaleDateString()}</p>
            </div>
            <div>
              ${r.linkUrl ? `<a href="${r.linkUrl}" target="_blank" class="btn btn-primary btn-full"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Resource</a>` : `<p style="font-size:12px;color:var(--text-muted);font-style:italic;">No link provided.</p>`}
            </div>
          </div>`;
        }).join('');
      }
    }
    // Overview preview (latest 3 videos)
    const overviewList = document.getElementById('overview-videos-list');
    if (overviewList) {
      if (videos.length === 0) {
        overviewList.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:12px 0;">No training videos yet.</p>`;
      } else {
        overviewList.innerHTML = videos.slice(0, 3).map(r => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(0,242,254,0.04);border:1px solid rgba(0,242,254,0.1);border-radius:10px;cursor:pointer;" onclick="playResourceVideo('${r.id}')">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,242,254,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid fa-play" style="color:var(--accent-cyan);font-size:14px;"></i>
            </div>
            <div style="overflow:hidden;">
              <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title}</p>
              <p style="font-size:11px;color:var(--text-muted);">${r.postedBy}</p>
            </div>
          </div>`).join('');
      }
    }
  }
  // Expose globally so switchTab can refresh it
  window.populateStudentVideosGlobal = populateStudentVideos;

  window.playResourceVideo = function(resId) {
    const resource = appState.resources.find(r => r.id === resId);
    if (!resource) return;
    // Resolve session-stored video blobs
    let videoUrl = resource.url || '';
    if (videoUrl.startsWith('__session:')) {
      videoUrl = sessionStorage.getItem('res_video_' + videoUrl.replace('__session:', '')) || '';
    }
    if (!videoUrl && resource.linkUrl) videoUrl = resource.linkUrl;

    // Detect YouTube links — embed as iframe instead of <video>
    let mediaHtml = '';
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      mediaHtml = '<iframe width="100%" height="380" src="https://www.youtube.com/embed/' + ytMatch[1] + '" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>';
    } else if (videoUrl) {
      mediaHtml = '<video src="' + videoUrl + '" controls autoplay style="width:100%;max-height:400px;"></video>';
    } else {
      mediaHtml = '<p style="padding:24px;text-align:center;color:var(--text-muted);">Video unavailable — session expired. Please re-upload or add a link.</p>';
    }
    showModal(resource.title, '<div class="modal-media-wrapper">' + mediaHtml + '</div><p style="font-size:13px;color:var(--text-secondary);margin-top:12px;">' + resource.description + '</p>');
  };

  function populateStudentEarnings() {
    const myPayments = appState.payments.filter(p => p.userId === student.id);
    const myReports = appState.reports.filter(r => r.userId === student.id && r.status === 'approved');
    const rate = student.hourlyRate || 15;
    const totalApprovedHours = myReports.reduce((sum, r) => sum + r.hoursWorked, 0);
    const totalAccrued = totalApprovedHours * rate;
    const totalPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = Math.max(0, totalAccrued - totalPaid);
    document.getElementById('se-total-accrued').innerText = `$${totalAccrued.toFixed(2)}`;
    document.getElementById('se-billing-rate').innerText = `Billing rate: $${rate.toFixed(2)}/hr`;
    document.getElementById('se-total-paid').innerText = `$${totalPaid.toFixed(2)}`;
    document.getElementById('se-total-pending').innerText = `$${totalPending.toFixed(2)}`;
    const tbody = document.getElementById('student-payouts-tbody');
    if (!tbody) return;
    if (myPayments.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No payout transactions found.</td></tr>`; return; }
    tbody.innerHTML = myPayments.map(p => `<tr><td><strong>${p.date}</strong></td><td>${p.description}</td><td style="color:var(--success);font-weight:700;">$${p.amount.toFixed(2)}</td><td><code>${p.refNo}</code></td><td><span class="badge badge-paid">Transferred</span></td></tr>`).join('');
  }

  function populateStudentHistory() {
    const tbody = document.getElementById('student-history-tbody');
    if (!tbody) return;
    const myReports = appState.reports.filter(r => r.userId === student.id);
    const searchQuery = document.getElementById('history-search').value.toLowerCase();
    const statusFilter = document.getElementById('history-filter-status').value;
    const filteredReports = myReports.filter(r => { const matchesSearch = r.summary.toLowerCase().includes(searchQuery); const matchesStatus = statusFilter === 'all' || r.status === statusFilter; return matchesSearch && matchesStatus; }).sort((a,b) => new Date(b.date) - new Date(a.date));
    if (filteredReports.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No matching reports found.</td></tr>`; return; }
    tbody.innerHTML = filteredReports.map(r => {
      let mediaLinkHtml = '';
      if (r.screenshotName) mediaLinkHtml += `<button class="attachment-preview-btn" onclick="previewImage('${r.id}')" style="margin-bottom:4px;"><i class="fa-regular fa-image"></i> <span>Img</span></button>`;
      if (r.videoName) mediaLinkHtml += `<button class="attachment-preview-btn" onclick="previewVideo('${r.id}')"><i class="fa-regular fa-square-caret-right"></i> <span>Vid</span></button>`;
      if (!mediaLinkHtml) mediaLinkHtml = '<span style="color:var(--text-muted);">None</span>';
      return `<tr><td><strong>${r.date}</strong></td><td>${r.hoursWorked} hrs</td><td><div style="max-height:80px;overflow-y:auto;white-space:pre-line;line-height:1.4;">${r.summary}</div></td><td>${mediaLinkHtml}</td><td><span class="badge badge-${r.status}">${r.status}</span></td><td><div style="font-size:13px;color:${r.feedback ? 'var(--text-primary)' : 'var(--text-muted)'};font-style:${r.feedback ? 'normal' : 'italic'}">${r.feedback || 'No comments.'}</div></td></tr>`;
    }).join('');
  }

  window.previewImage = function(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report || !report.screenshotUrl) return;
    showModal(`Screenshot: ${report.screenshotName}`, `<div class="modal-media-wrapper"><img src="${report.screenshotUrl}" alt="${report.screenshotName}"></div><p style="font-size:13px;color:var(--text-secondary);">${report.summary}</p>`);
  };

  window.previewVideo = function(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;
    let sourceUrl = report.videoUrl || '';
    // Resolve new __rep_session: format (student-uploaded progress videos)
    if (sourceUrl.startsWith('__rep_session:')) {
      const sessionKey = sourceUrl.replace('__rep_session:', '');
      sourceUrl = sessionStorage.getItem(sessionKey) || '';
    }
    // Legacy fallback
    if (!sourceUrl && report.videoName) sourceUrl = sessionBlobs[report.videoName] || '';
    const videoHtml = sourceUrl
      ? `<video src="${sourceUrl}" controls autoplay style="width:100%;max-height:400px;"></video>`
      : `<p style="padding:24px;text-align:center;color:var(--text-muted);">Video unavailable — session expired or no video attached.</p>`;
    showModal('Progress Video: ' + (report.videoName || 'Demo Video'), '<div class="modal-media-wrapper">' + videoHtml + '</div><p style="font-size:13px;color:var(--text-secondary);margin-top:12px;">' + report.summary + '</p>');
  };

  document.getElementById('history-search').addEventListener('input', populateStudentHistory);
  document.getElementById('history-filter-status').addEventListener('change', populateStudentHistory);

  function populateStudentHomeStats() {
    const myTasks = appState.tasks.filter(t => t.assignedTo === student.id);
    const myReports = appState.reports.filter(r => r.userId === student.id);
    const myAttendance = appState.attendance.filter(a => a.userId === student.id);
    const completedTasks = myTasks.filter(t => t.status === 'completed').length;
    const approvedReports = myReports.filter(r => r.status === 'approved').length;
    const attendedDays = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attPct = Math.round((attendedDays / 20) * 100);
    const el = (id) => document.getElementById(id);
    if (el('home-tasks-done')) el('home-tasks-done').innerText = completedTasks;
    if (el('home-reports-approved')) el('home-reports-approved').innerText = approvedReports;
    if (el('home-attendance-pct')) el('home-attendance-pct').innerText = `${attPct}%`;
  }

  function addStudentActivity(desc) {
    const activityList = document.getElementById('student-activities');
    if (!activityList) return;
    const li = document.createElement('li'); li.style.display = 'flex'; li.style.gap = '10px';
    li.innerHTML = `<i class="fa-solid fa-circle-dot" style="color:var(--accent-cyan);margin-top:3px;"></i><div><p style="font-weight:500;">${desc}</p><span style="font-size:11px;color:var(--text-muted);">Just now</span></div>`;
    activityList.insertBefore(li, activityList.firstChild);
    if (activityList.children.length > 5) activityList.lastChild.remove();
  }

  function updateStudentMetrics() {
    const myTasks = appState.tasks.filter(t => t.assignedTo === student.id);
    const myReports = appState.reports.filter(r => r.userId === student.id);
    const myAttendance = appState.attendance.filter(a => a.userId === student.id);
    const totalTasks = myTasks.length; const completedTasks = myTasks.filter(t => t.status === 'completed').length;
    const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const progressBar = document.getElementById('student-main-progress');
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    const tasksRatio = document.getElementById('txt-tasks-ratio'); if (tasksRatio) tasksRatio.innerText = `Tasks Completed: ${completedTasks}/${totalTasks}`;
    const progressPercent = document.getElementById('txt-progress-percent'); if (progressPercent) progressPercent.innerText = `${progressPct}%`;
    const attendedDays = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attPct = Math.round((attendedDays / 20) * 100);
    const txtAttPct = document.getElementById('txt-attendance-pct'); if (txtAttPct) txtAttPct.innerText = `${attPct}%`;
    const approvedCount = myReports.filter(r => r.status === 'approved').length;
    const txtApprCnt = document.getElementById('txt-approved-cnt'); if (txtApprCnt) txtApprCnt.innerText = approvedCount.toString();
  }

  populateStudentTasks(); populateStudentProjects(); populateStudentResources();
  populateStudentVideos(); populateStudentHistory(); populateStudentHomeStats();
  updateStudentMetrics();
}

// 5. MENTOR DASHBOARD
let attendanceChart = null;
let reportChart = null;

function renderMentorDashboard(container) {
  // Always reload latest state so new student registrations are visible
  const freshState = localStorage.getItem('speedify_portal_state');
  if (freshState) { try { appState = JSON.parse(freshState); } catch(e) {} }
  const mentor = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;
  // Always read fresh from appState — not a stale closure
  const getStudents = () => appState.users.filter(u => u.role === 'student');
  const studentsOnly = getStudents();

  container.innerHTML = `
<!-- TAB HOME: MENTOR PROFILE CARD (shown on login) -->
<div id="mentor-home" class="dashboard-tab">
  <div class="view-header">
    <div class="view-title"><h1>Welcome back, ${mentor.fullName.split(' ')[0]}!</h1><p>Staff administrator account — Speedify Tech X.</p></div>
    <div class="badge badge-approved" style="background:rgba(155,81,224,0.1);color:var(--accent-purple);border:1px solid rgba(155,81,224,0.2)"><i class="fa-solid fa-shield-halved"></i> Staff Access</div>
  </div>
  <div style="display:grid;grid-template-columns:320px 1fr;gap:24px;align-items:start;">
    <!-- Profile card -->
    <div class="glass-card" style="padding:32px;text-align:center;">
      <div class="profile-avatar-large" style="margin:0 auto 16px;background:linear-gradient(135deg,#7c3aed,#a78bfa);">${mentor.fullName.charAt(0).toUpperCase()}</div>
      <h2 style="font-size:20px;font-weight:700;margin-bottom:4px;">${mentor.fullName}</h2>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:6px;">${mentor.designation || 'Lead Mentor'}</p>
      <span class="badge badge-approved" style="font-size:11px;margin-bottom:20px;display:inline-flex;background:rgba(155,81,224,0.1);color:var(--accent-purple);border-color:rgba(155,81,224,0.3);"><i class="fa-solid fa-shield-halved"></i> Active Administrator</span>
      <div style="border-top:1px solid var(--border-color);padding-top:20px;text-align:left;display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-envelope" style="color:var(--accent-purple);width:16px;"></i>
          <span style="color:var(--text-muted);">Email</span>
          <strong style="margin-left:auto;text-align:right;max-width:180px;overflow:hidden;text-overflow:ellipsis;">${mentor.email || 'N/A'}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-building" style="color:var(--accent-purple);width:16px;"></i>
          <span style="color:var(--text-muted);">Department</span>
          <strong style="margin-left:auto;">${mentor.department || 'Management'}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-id-badge" style="color:var(--accent-purple);width:16px;"></i>
          <span style="color:var(--text-muted);">Role</span>
          <strong style="margin-left:auto;">Staff / Mentor</strong>
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:13px;">
          <i class="fa-solid fa-calendar" style="color:var(--accent-purple);width:16px;"></i>
          <span style="color:var(--text-muted);">Member Since</span>
          <strong style="margin-left:auto;">${mentor.joinedDate || 'N/A'}</strong>
        </div>
      </div>
    </div>
    <!-- Domains + quick stats -->
    <div style="display:flex;flex-direction:column;gap:20px;">
      <!-- Domains offered -->
      <div class="glass-card" style="padding:28px;">
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:20px;"><i class="fa-solid fa-layer-group" style="color:var(--accent-purple);margin-right:8px;"></i>Internship Domains Offered</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
          <div style="background:rgba(0,242,254,0.08);border:1px solid rgba(0,242,254,0.2);border-radius:12px;padding:16px;text-align:center;">
            <i class="fa-solid fa-globe" style="font-size:22px;color:#00f2fe;margin-bottom:8px;display:block;"></i>
            <p style="font-size:13px;font-weight:700;">Web Development</p>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">HTML, CSS, JS, React</p>
          </div>
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:16px;text-align:center;">
            <i class="fa-solid fa-mobile-screen" style="font-size:22px;color:#3b82f6;margin-bottom:8px;display:block;"></i>
            <p style="font-size:13px;font-weight:700;">App Development</p>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Flutter, React Native</p>
          </div>
          <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:16px;text-align:center;">
            <i class="fa-solid fa-palette" style="font-size:22px;color:#ec4899;margin-bottom:8px;display:block;"></i>
            <p style="font-size:13px;font-weight:700;">UI/UX Design</p>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Figma, Adobe XD</p>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:16px;text-align:center;">
            <i class="fa-solid fa-layer-group" style="font-size:22px;color:#a78bfa;margin-bottom:8px;display:block;"></i>
            <p style="font-size:13px;font-weight:700;">Full Stack Dev</p>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">React, Node.js, DBs</p>
          </div>
        </div>
      </div>
      <!-- Quick metrics -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--accent-cyan);">${getStudents().length}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Total Interns</div>
        </div>
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--warning);">${appState.reports.filter(r=>r.status==='pending').length}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Pending Reports</div>
        </div>
        <div class="glass-card" style="padding:20px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--success);">${appState.applications.length}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Applications</div>
        </div>
      </div>
      <!-- Program info -->
      <div class="glass-card" style="padding:24px;">
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:16px;"><i class="fa-solid fa-circle-info" style="color:var(--accent-purple);margin-right:8px;"></i>Program Info</h3>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Organization</span><strong>Speedify Tech X</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Registration</span><strong style="color:var(--success);">MSME Registered</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color);"><span style="color:var(--text-muted);">Support Email</span><a href="mailto:speedifytechx@gmail.com" style="color:var(--accent-cyan);">speedifytechx@gmail.com</a></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="color:var(--text-muted);">Phone</span><a href="tel:+918610535231" style="color:var(--accent-cyan);">+91 8610535231</a></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 1: ANALYTICS -->
<div id="mentor-analytics" class="dashboard-tab" style="display:none;">
  <div class="view-header">
    <div class="view-title"><h1>Administrative Board</h1><p>Welcome back, ${mentor.fullName}! Review program statistics.</p></div>
    <div class="badge badge-approved" style="background:rgba(155,81,224,0.1);color:var(--accent-purple);border:1px solid rgba(155,81,224,0.2)"><i class="fa-solid fa-shield-halved"></i> Staff Access</div>
  </div>
  <div class="grid-cols-4">
    <div class="glass-card metric-card metric-cyan"><div class="metric-info"><h3>Total Interns</h3><div class="value" id="m-total-students">0</div></div><div class="metric-icon"><i class="fa-solid fa-user-group"></i></div></div>
    <div class="glass-card metric-card metric-success"><div class="metric-info"><h3>Avg Attendance</h3><div class="value" id="m-avg-attendance">0%</div></div><div class="metric-icon"><i class="fa-solid fa-calendar-check"></i></div></div>
    <div class="glass-card metric-card metric-warning"><div class="metric-info"><h3>Pending Reports</h3><div class="value" id="m-pending-reports">0</div></div><div class="metric-icon"><i class="fa-solid fa-clock"></i></div></div>
    <div class="glass-card metric-card metric-purple"><div class="metric-info"><h3>Tasks Completed</h3><div class="value" id="m-tasks-pct">0%</div></div><div class="metric-icon"><i class="fa-solid fa-list-check"></i></div></div>
  </div>
  <div class="grid-cols-2">
    <div class="glass-card"><h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Attendance Breakdown</h3><div style="height:230px;position:relative;"><canvas id="chart-attendance"></canvas></div></div>
    <div class="glass-card"><h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Daily Work Reports Overview</h3><div style="height:230px;position:relative;"><canvas id="chart-reports"></canvas></div></div>
  </div>
  <div class="glass-card" style="margin-top:24px;"><h3 style="font-size:16px;font-weight:600;margin-bottom:20px;"><i class="fa-solid fa-clipboard-question" style="color:var(--warning);margin-right:8px;"></i>Pending Daily Reports</h3><div id="mentor-pending-reviews-container"></div></div>
</div>
<!-- TAB 2: WORK TRACKER -->
<div id="mentor-tracker" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Intern Consolidated Work Tracker</h1><p>Track everything for a selected student in a unified timeline.</p></div></div>
  <div class="glass-card" style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:16px;"><label class="form-label" style="margin-bottom:0;font-weight:600;">Select Intern:</label><select class="form-control" id="tracker-student-selector" style="max-width:300px;padding:10px 16px;background-image:none;"></select></div></div>
  <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;">
    <div>
      <div class="glass-card" style="margin-bottom:24px;"><h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Intern KPI Card</h3><div style="display:flex;flex-direction:column;gap:12px;font-size:13.5px;" id="tracker-kpi-panel"></div></div>
      <div class="glass-card"><h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Daily Attendance Logs</h3><div class="table-responsive" style="max-height:260px;"><table class="custom-table" style="font-size:12.5px;"><thead><tr><th>Date</th><th>Clock-In</th><th>Clock-Out</th><th>Status</th></tr></thead><tbody id="tracker-attendance-tbody"></tbody></table></div></div>
    </div>
    <div class="glass-card"><h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Intern Activity Timeline</h3><div class="timeline" id="tracker-timeline-box"></div></div>
  </div>
</div>
<!-- TAB 3: REVIEW REPORTS -->
<div id="mentor-review" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>All Work Reports Log</h1><p>Review all historic daily reports and search submissions.</p></div></div>
  <div class="glass-card">
    <div class="table-filters">
      <div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="reports-search" placeholder="Search name or content..."></div>
      <select class="form-control" id="reports-filter-status" style="max-width:180px;padding:10px 14px 10px 16px;background-image:none;"><option value="all">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    </div>
    <div class="table-responsive"><table class="custom-table"><thead><tr><th>Intern</th><th>Date</th><th>Hours</th><th style="width:35%;">Summary</th><th>Attachments</th><th>Status</th><th>Feedback</th><th>Action</th></tr></thead><tbody id="mentor-all-reports-tbody"></tbody></table></div>
  </div>
</div>`;

  container.innerHTML += `
<!-- TAB 4: RESOURCE BOARD -->
<div id="mentor-resources" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Resource Sharing Board</h1><p>Post recorded videos, slides links, or training manuals for all interns.</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;">
    <div class="glass-card">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Upload Resource Item</h3>
      <form id="form-resource">
        <div class="form-group"><label class="form-label">Resource Title</label><input class="form-control" type="text" id="res-title-input" placeholder="e.g. Week 3 REST Api Webinar" required style="padding-left:16px;"></div>
        <div class="form-group"><label class="form-label">Resource Type</label><select class="form-control" id="res-type-input" required style="padding-left:16px;background-image:none;"><option value="video">Recorded Video Lecture</option><option value="doc">Instruction Manual / PDF</option><option value="link">Web Resource Link</option></select></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="res-desc-input" placeholder="Write instructions for the cohort..." required style="padding-left:16px;min-height:80px;"></textarea></div>
        <div class="form-group"><label class="form-label">Resource Link URL <span style="color:var(--text-muted);font-size:11px;">(YouTube, Google Drive, or any link)</span></label><input class="form-control" type="url" id="res-link-input" placeholder="https://youtube.com/watch?v=... or https://docs.google.com/..." style="padding-left:16px;"></div>
        <div class="form-group" id="res-video-upload-group"><label class="form-label">Upload Video File <span style="color:var(--text-muted);font-size:11px;">(Optional if link provided above)</span></label>
          <div class="file-upload-box" id="res-video-upload-box" style="padding:15px;"><input type="file" id="res-video-file" accept="video/*"><div class="file-upload-content" id="res-video-box-content"><i class="fa-regular fa-file-video"></i><span>Select mp4, webm file</span></div><div class="file-preview-name" id="res-video-file-name" style="margin-top:4px;color:var(--accent-cyan);"></div></div>
        </div>
        <button class="btn btn-primary btn-full" type="submit"><span>Post Resource</span><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
    <div class="glass-card"><h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Resource Board Catalog</h3><div class="table-responsive"><table class="custom-table"><thead><tr><th>Title</th><th>Type</th><th>Link / Video</th><th>Action</th></tr></thead><tbody id="mentor-resources-tbody"></tbody></table></div></div>
  </div>
</div>
<!-- TAB 5: ASSIGN TASKS -->
<div id="mentor-tasks" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Assign Tasks & Milestones</h1><p>Push new task targets to interns.</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;">
    <div class="glass-card">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Create Task Card</h3>
      <form id="form-assign-task">
        <div class="form-group"><label class="form-label">Assign Intern</label><select class="form-control" id="task-assignee" required style="padding-left:16px;background-image:none;"></select></div>
        <div class="form-group"><label class="form-label">Task Title</label><input class="form-control" type="text" id="task-title" placeholder="e.g. Core Auth Integration" required style="padding-left:16px;"></div>
        <div class="form-group"><label class="form-label">Task Description</label><textarea class="form-control" id="task-description" placeholder="Specify steps, requirements..." required style="min-height:80px;padding-left:16px;"></textarea></div>
        <div class="form-group"><label class="form-label">Due Date</label><input class="form-control" type="date" id="task-due" required style="padding-left:16px;"></div>
        <button class="btn btn-primary btn-full" type="submit"><span>Assign Task</span><i class="fa-solid fa-circle-plus"></i></button>
      </form>
    </div>
    <div class="glass-card"><h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Active Tasks Tracking</h3><div class="table-responsive"><table class="custom-table"><thead><tr><th>Title</th><th>Assigned To</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead><tbody id="mentor-tasks-tbody"></tbody></table></div></div>
  </div>
</div>`;

  container.innerHTML += `
<!-- TAB 6: STIPEND PAYMENTS -->
<div id="mentor-payments" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Stipend & Billing Manager</h1><p>Monitor approved hours, adjust billing rates, and process stipend clearances.</p></div></div>
  <div class="glass-card" style="margin-bottom:24px;"><h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Intern Billing Rates & Balances</h3><div class="table-responsive"><table class="custom-table"><thead><tr><th>Intern Name</th><th>Hourly Rate</th><th>Approved Hours</th><th>Total Accrued</th><th>Total Paid</th><th>Pending Balance</th><th>Action</th></tr></thead><tbody id="mentor-billing-tbody"></tbody></table></div></div>
</div>
<!-- TAB 7: INTERN DIRECTORY -->
<div id="mentor-students" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Internship Directory</h1><p>Track cohort enrollment lists and performance statistics.</p></div></div>
  <div class="glass-card">
    <div class="table-filters"><div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="students-search" placeholder="Search interns by name..."></div></div>
    <div class="table-responsive"><table class="custom-table"><thead><tr><th>Name</th><th>Username</th><th>Cohort</th><th>Attendance Rate</th><th>Tasks Finished</th><th>Progress Bar</th><th>Performance Grade</th><th>Action</th></tr></thead><tbody id="mentor-students-tbody"></tbody></table></div>
  </div>
</div>
<!-- TAB 8: APPLICATIONS SPREADSHEET -->
<div id="mentor-applications" class="dashboard-tab" style="display:none;">
  <div class="view-header">
    <div class="view-title"><h1>Applications Spreadsheet</h1><p>View internship applications in a Google Sheets-like table.</p></div>
    <button class="btn btn-secondary" id="btn-download-applications-csv"><i class="fa-solid fa-file-excel"></i> Export Sheets CSV</button>
  </div>
  <div class="spreadsheet-container">
    <div class="spreadsheet-header-row">
      <div class="spreadsheet-header-cell" style="flex:0.8;">Date Applied</div>
      <div class="spreadsheet-header-cell">Applicant Name</div>
      <div class="spreadsheet-header-cell">Email Address</div>
      <div class="spreadsheet-header-cell" style="flex:0.8;">Role Preference</div>
      <div class="spreadsheet-header-cell">University</div>
      <div class="spreadsheet-header-cell" style="flex:0.6;">Cohort</div>
      <div class="spreadsheet-header-cell" style="flex:0.7;">Resume Link</div>
      <div class="spreadsheet-header-cell" style="flex:0.5;">Status</div>
      <div class="spreadsheet-header-cell" style="flex:0.6;">Actions</div>
    </div>
    <div id="spreadsheet-rows-container"></div>
  </div>
</div>
<!-- TAB 9: EXPORT DATA -->
<div id="mentor-exports" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Export Portal Records</h1><p>Download CSV spreadsheets containing full database logs.</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
    <div class="glass-card" style="display:flex;flex-direction:column;justify-content:space-between;">
      <div><h3 style="font-size:18px;font-weight:600;margin-bottom:12px;"><i class="fa-solid fa-file-csv" style="color:var(--success);margin-right:8px;"></i>Export Work Reports</h3><p style="color:var(--text-secondary);font-size:14px;line-height:1.5;margin-bottom:20px;">Extract all student submissions, daily summaries, work hours, approval states, and feedback messages.</p></div>
      <button class="btn btn-primary btn-full" id="btn-export-reports"><i class="fa-solid fa-file-arrow-down"></i><span>Download Reports CSV</span></button>
    </div>
    <div class="glass-card" style="display:flex;flex-direction:column;justify-content:space-between;">
      <div><h3 style="font-size:18px;font-weight:600;margin-bottom:12px;"><i class="fa-solid fa-file-excel" style="color:var(--accent-cyan);margin-right:8px;"></i>Export Attendance Logs</h3><p style="color:var(--text-secondary);font-size:14px;line-height:1.5;margin-bottom:20px;">Compile clock-in timestamps, clock-out logs, dates, and status codes across all interns.</p></div>
      <button class="btn btn-primary btn-full" id="btn-export-attendance" style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);box-shadow:0 4px 15px rgba(16,185,129,0.2);"><i class="fa-solid fa-file-arrow-down"></i><span>Download Attendance CSV</span></button>
    </div>
  </div>
</div>
<!-- TAB 10: (profile removed — shown on login home tab) -->
`;

  // --- MENTOR LOGIC WIRE-UP ---
  const taskAssigneeSelect = document.getElementById('task-assignee');
  const trackerStudentSelector = document.getElementById('tracker-student-selector');
  if (taskAssigneeSelect) taskAssigneeSelect.innerHTML = getStudents().map(s => `<option value="${s.id}">${s.fullName} (${s.cohort || 'N/A'})</option>`).join('');
  if (trackerStudentSelector) {
    trackerStudentSelector.innerHTML = getStudents().map(s => `<option value="${s.id}">${s.fullName} (${s.cohort || 'N/A'})</option>`).join('');
    trackerStudentSelector.addEventListener('change', () => populateMentorWorkTrackerData(trackerStudentSelector.value));
  }
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('task-due').value = tomorrow.toISOString().split('T')[0];

  document.getElementById('form-assign-task').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = document.getElementById('task-assignee').value;
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due').value;
    const studentUser = appState.users.find(u => u.id === studentId);
    const newTask = { id: generateId('tsk'), assignedTo: studentId, assignedBy: mentor.fullName, title, description, dueDate, status: "pending", completedAt: "" };
    appState.tasks.push(newTask); saveState();
    showToast(`Task assigned to ${studentUser.fullName}!`, "success");
    document.getElementById('task-title').value = ''; document.getElementById('task-description').value = '';
    populateMentorTasksTracker(); updateMentorMetrics();
    if (trackerStudentSelector && trackerStudentSelector.value === studentId) populateMentorWorkTrackerData(studentId);
  });

  function populateMentorTasksTracker() {
    const tbody = document.getElementById('mentor-tasks-tbody');
    if (!tbody) return;
    if (appState.tasks.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">No tasks assigned yet.</td></tr>`; return; }
    tbody.innerHTML = appState.tasks.map(t => {
      const assignee = appState.users.find(u => u.id === t.assignedTo);
      return `<tr><td><strong>${t.title}</strong></td><td>${assignee ? assignee.fullName : 'Unknown'}</td><td><span style="color:var(--warning);"><i class="fa-regular fa-calendar"></i> ${t.dueDate}</span></td><td><span class="badge badge-${t.status === 'completed' ? 'approved' : 'pending'}">${t.status}</span></td><td><button class="btn btn-danger" style="padding:6px 12px;font-size:11px;" onclick="deleteTask('${t.id}')"><i class="fa-solid fa-trash-can"></i></button></td></tr>`;
    }).join('');
  }

  // Play progress video uploaded by student in a daily report
  window.playStudentReportVideo = function(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;
    let videoUrl = report.videoUrl || '';
    if (videoUrl.startsWith('__rep_session:')) {
      const sessionKey = videoUrl.replace('__rep_session:', '');
      videoUrl = sessionStorage.getItem(sessionKey) || '';
    }
    if (!videoUrl) {
      showModal('Progress Video', '<p style="padding:24px;text-align:center;color:var(--text-muted);">Video not available — session has expired or no video was attached to this report.</p>');
      return;
    }
    showModal('Progress Video \u2014 ' + report.date, '<div class="modal-media-wrapper"><video src="' + videoUrl + '" controls autoplay style="width:100%;max-height:400px;"></video></div><p style="font-size:13px;color:var(--text-secondary);margin-top:12px;"><strong>Report Summary:</strong> ' + report.summary + '</p><p style="font-size:12px;color:var(--text-muted);margin-top:6px;"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>' + report.date + ' &nbsp;&middot;&nbsp; ' + report.hoursWorked + ' hrs &nbsp;&middot;&nbsp; <span class="badge badge-' + report.status + '" style="font-size:10px;">' + report.status + '</span></p>');
  };

  window.deleteTask = function(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      appState.tasks = appState.tasks.filter(t => t.id !== taskId); saveState();
      showToast("Task deleted.", "info"); populateMentorTasksTracker(); updateMentorMetrics();
      if (trackerStudentSelector) populateMentorWorkTrackerData(trackerStudentSelector.value);
    }
  };

  function populateMentorStudents() {
    const tbody = document.getElementById('mentor-students-tbody');
    if (!tbody) return;
    const searchQuery = document.getElementById('students-search').value.toLowerCase();
    const filtered = getStudents().filter(s => s.fullName.toLowerCase().includes(searchQuery));
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">No matching interns found.</td></tr>`; return; }
    tbody.innerHTML = filtered.map(s => {
      const sTasks = appState.tasks.filter(t => t.assignedTo === s.id);
      const sAtt = appState.attendance.filter(a => a.userId === s.id);
      const completedCount = sTasks.filter(t => t.status === 'completed').length;
      const totalTasks = sTasks.length;
      const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      const attendedDays = sAtt.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendanceRatePct = Math.round((attendedDays / 20) * 100);
      const ratio = (completionPct + attendanceRatePct) / 2;
      const grade = ratio >= 90 ? 'Elite (A+)' : ratio >= 75 ? 'Strong (B)' : ratio >= 50 ? 'Satisfactory (C)' : 'Needs Improvement (D)';
      const gradeColor = grade.startsWith('Elite') ? 'var(--accent-cyan)' : grade.startsWith('Strong') ? 'var(--success)' : 'var(--warning)';
      return `<tr>
        <td><strong style="cursor:pointer;color:var(--accent-cyan);" onclick="openStudentProfile('${s.id}')">${s.fullName}</strong></td>
        <td><code>${s.username}</code></td>
        <td>${s.cohort || 'N/A'}</td>
        <td><strong>${attendanceRatePct}%</strong> <span style="font-size:11px;color:var(--text-muted);">(${attendedDays}/20 days)</span></td>
        <td>${completedCount}/${totalTasks} tasks</td>
        <td><div class="student-progress-bar-container"><div class="student-progress-bar" style="width:${completionPct}%"></div></div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${completionPct}% Completed</div></td>
        <td><span style="font-weight:700;color:${gradeColor}">${grade}</span></td>
        <td><button class="btn btn-secondary" style="padding:6px 14px;font-size:12px;" onclick="openStudentProfile('${s.id}')"><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`;
    }).join('');
  }
  document.getElementById('students-search').addEventListener('input', populateMentorStudents);

  // ── Open full student profile in modal ──────────────────────────────────────
  window.openStudentProfile = function(studentId) {
    const s = appState.users.find(u => u.id === studentId);
    if (!s) return;

    const sReports   = appState.reports.filter(r => r.userId === studentId);
    const sTasks     = appState.tasks.filter(t => t.assignedTo === studentId);
    const sProjects  = appState.projects.filter(p => p.userId === studentId);
    const sAtt       = appState.attendance.filter(a => a.userId === studentId);
    const sPayments  = appState.payments.filter(p => p.userId === studentId);

    const completedTasks   = sTasks.filter(t => t.status === 'completed').length;
    const approvedReports  = sReports.filter(r => r.status === 'approved').length;
    const totalHours       = sReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const attendedDays     = sAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePct    = Math.round((attendedDays / 20) * 100);
    const totalPaid        = sPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const initials         = s.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const attRows = sAtt.length
      ? sAtt.map(a => `<tr><td><code>${a.date}</code></td><td>${a.clockIn || '--'}</td><td>${a.clockOut || '--'}</td><td><span class="badge badge-${a.status}">${a.status}</span></td></tr>`).join('')
      : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:10px;">No attendance records</td></tr>`;

    const taskRows = sTasks.length
      ? sTasks.map(t => `<tr><td>${t.title}</td><td>${t.dueDate}</td><td><span class="badge badge-${t.status === 'completed' ? 'approved' : 'pending'}">${t.status}</span></td></tr>`).join('')
      : `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:10px;">No tasks assigned</td></tr>`;

    const reportRows = sReports.length
      ? sReports.map(r => {
          const hasVideo = r.videoName && r.videoUrl;
          return `<tr><td><code>${r.date}</code></td><td style="max-width:220px;white-space:normal;font-size:12px;">${r.summary.slice(0, 80)}…</td><td>${r.hoursWorked} hrs</td><td><span class="badge badge-${r.status}">${r.status}</span></td>${hasVideo ? `<td><button class="btn btn-secondary" style="padding:4px 10px;font-size:11px;" onclick="playStudentReportVideo('${r.id}')"><i class="fa-solid fa-play" style="color:var(--accent-cyan);"></i> Video</button></td>` : '<td><span style="color:var(--text-muted);font-size:11px;">—</span></td>'}</tr>`;
        }).join('')
      : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:10px;">No reports submitted</td></tr>`;

    const projectRows = sProjects.length
      ? sProjects.map(p => `<tr><td>${p.title}</td><td><a href="${p.repoUrl}" target="_blank" style="color:var(--accent-cyan);font-size:12px;">Repo ↗</a></td><td><span class="badge badge-${p.status}">${p.status}</span></td></tr>`).join('')
      : `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:10px;">No projects submitted</td></tr>`;

    const payRows = sPayments.length
      ? sPayments.map(p => `<tr><td><code>${p.date}</code></td><td style="font-size:12px;">${p.description}</td><td style="color:var(--success);font-weight:700;">₹${p.amount}</td></tr>`).join('')
      : `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:10px;">No payments recorded</td></tr>`;

    const ratio = (Math.round((sTasks.length > 0 ? (completedTasks / sTasks.length) * 100 : 0)) + attendancePct) / 2;
    const grade = ratio >= 90 ? 'Elite (A+)' : ratio >= 75 ? 'Strong (B)' : ratio >= 50 ? 'Satisfactory (C)' : 'Needs Improvement (D)';
    const gradeColor = grade.startsWith('Elite') ? 'var(--accent-cyan)' : grade.startsWith('Strong') ? 'var(--success)' : 'var(--warning)';

    const html = `
      <!-- Profile Header -->
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px;flex-wrap:wrap;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 4px 16px rgba(0,242,254,0.3);">${initials}</div>
        <div style="flex:1;">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:4px;">${s.fullName}</h2>
          <p style="color:var(--text-muted);font-size:13px;margin-bottom:6px;">${s.cohort || 'No cohort assigned'} &nbsp;·&nbsp; ${s.university || 'N/A'}</p>
          <span style="font-weight:700;color:${gradeColor};font-size:13px;">Performance: ${grade}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Joined</div>
          <div style="font-size:13px;font-weight:600;">${s.joinedDate || 'N/A'}</div>
        </div>
      </div>

      <!-- Info Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px;">
        <div class="glass-card" style="padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--accent-cyan);">${attendancePct}%</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Attendance</div>
        </div>
        <div class="glass-card" style="padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--success);">${totalHours}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Approved Hrs</div>
        </div>
        <div class="glass-card" style="padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--accent-purple);">${completedTasks}/${sTasks.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Tasks Done</div>
        </div>
        <div class="glass-card" style="padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--warning);">₹${totalPaid}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Total Paid</div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="glass-card" style="padding:16px;margin-bottom:20px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Contact Details</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;font-size:13px;">
          <div><span style="color:var(--text-muted);">Email:</span> <strong>${s.email || 'N/A'}</strong></div>
          <div><span style="color:var(--text-muted);">Phone:</span> <strong>${s.phone || 'N/A'}</strong></div>
          <div><span style="color:var(--text-muted);">Username:</span> <code>${s.username}</code></div>
          <div><span style="color:var(--text-muted);">Hourly Rate:</span> <strong style="color:var(--success);">₹${s.hourlyRate || 'N/A'}/hr</strong></div>
        </div>
      </div>

      <!-- Attendance -->
      <div class="glass-card" style="padding:16px;margin-bottom:20px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;"><i class="fa-solid fa-clock" style="color:var(--accent-cyan);margin-right:6px;"></i>Attendance Log</h4>
        <div class="table-responsive"><table class="custom-table"><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr></thead><tbody>${attRows}</tbody></table></div>
      </div>

      <!-- Tasks -->
      <div class="glass-card" style="padding:16px;margin-bottom:20px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;"><i class="fa-solid fa-list-check" style="color:var(--accent-purple);margin-right:6px;"></i>Assigned Tasks</h4>
        <div class="table-responsive"><table class="custom-table"><thead><tr><th>Task</th><th>Due Date</th><th>Status</th></tr></thead><tbody>${taskRows}</tbody></table></div>
      </div>

      <!-- Reports -->
      <div class="glass-card" style="padding:16px;margin-bottom:20px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;"><i class="fa-solid fa-file-pen" style="color:var(--warning);margin-right:6px;"></i>Work Reports (${approvedReports} approved)</h4>
        <div class="table-responsive"><table class="custom-table"><thead><tr><th>Date</th><th>Summary</th><th>Hours</th><th>Status</th><th>Progress Video</th></tr></thead><tbody>${reportRows}</tbody></table></div>
      </div>

      <!-- Projects -->
      <div class="glass-card" style="padding:16px;margin-bottom:20px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;"><i class="fa-solid fa-code-branch" style="color:var(--success);margin-right:6px;"></i>Projects Submitted</h4>
        <div class="table-responsive"><table class="custom-table"><thead><tr><th>Title</th><th>Repo</th><th>Status</th></tr></thead><tbody>${projectRows}</tbody></table></div>
      </div>

      <!-- Payments -->
      <div class="glass-card" style="padding:16px;margin-bottom:8px;">
        <h4 style="font-size:13px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;"><i class="fa-solid fa-wallet" style="color:var(--success);margin-right:6px;"></i>Payment History</h4>
        <div class="table-responsive"><table class="custom-table"><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead><tbody>${payRows}</tbody></table></div>
      </div>

      <!-- Quick action -->
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="switchTab('mentor-tracker');document.getElementById('tracker-student-selector').value='${studentId}';populateMentorWorkTrackerDataGlobal('${studentId}');document.getElementById('modal-container').classList.remove('active');">
          <i class="fa-solid fa-clock-rotate-left"></i> Open in Work Tracker
        </button>
        <button class="btn btn-secondary" onclick="document.getElementById('modal-container').classList.remove('active');">
          <i class="fa-solid fa-xmark"></i> Close
        </button>
      </div>`;

    showModal(`Intern Profile — ${s.fullName}`, html);
  };

  function populateMentorWorkTrackerData(studentId) {
    const sUser = appState.users.find(u => u.id === studentId);
    const kpiPanel = document.getElementById('tracker-kpi-panel');
    const timelineBox = document.getElementById('tracker-timeline-box');
    const attTbody = document.getElementById('tracker-attendance-tbody');
    if (!sUser || !kpiPanel || !timelineBox || !attTbody) return;
    const sReports = appState.reports.filter(r => r.userId === studentId);
    const sTasks = appState.tasks.filter(t => t.assignedTo === studentId);
    const sProjects = appState.projects.filter(p => p.userId === studentId);
    const sAttendance = appState.attendance.filter(a => a.userId === studentId);
    const totalApprovedHrs = sReports.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.hoursWorked, 0);
    kpiPanel.innerHTML = `<p><strong>Name:</strong> ${sUser.fullName}</p><p><strong>Cohort:</strong> ${sUser.cohort || 'N/A'}</p><p><strong>Approved Hours:</strong> <span class="accent-text">${totalApprovedHrs} hrs</span></p><p><strong>Tasks Completed:</strong> ${sTasks.filter(t => t.status === 'completed').length}/${sTasks.length}</p><p><strong>Projects Uploaded:</strong> ${sProjects.length}</p><p><strong>University:</strong> ${sUser.university || 'N/A'}</p>`;
    attTbody.innerHTML = sAttendance.length === 0 ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:10px;">No logs</td></tr>` : sAttendance.map(a => `<tr><td><code>${a.date}</code></td><td>${a.clockIn || '--'}</td><td>${a.clockOut || '--'}</td><td><span class="badge badge-${a.status}">${a.status}</span></td></tr>`).join('');
    const events = [];
    sReports.forEach(r => events.push({ date: r.date, timestamp: new Date(r.createdAt || r.date).getTime(), type: 'report', title: `Daily Work Report submitted (${r.hoursWorked} hrs)`, content: r.summary, status: r.status }));
    sProjects.forEach(p => events.push({ date: p.submittedAt ? p.submittedAt.split('T')[0] : 'Project Date', timestamp: new Date(p.submittedAt).getTime(), type: 'project', title: `Project Uploaded: "${p.title}"`, content: p.description + `<br><strong>Repo:</strong> <a href="${p.repoUrl}" target="_blank" style="color:var(--accent-cyan);">${p.repoUrl}</a>`, status: p.status }));
    sAttendance.forEach(a => { if (a.clockIn) events.push({ date: a.date, timestamp: new Date(a.date + ' 09:00:00').getTime(), type: 'attendance', title: 'Checked In', content: `Clocked in at ${a.clockIn}. Status: ${a.status.toUpperCase()}.`, status: a.status }); });
    events.sort((a, b) => b.timestamp - a.timestamp);
    timelineBox.innerHTML = events.length === 0 ? `<p style="color:var(--text-muted);padding:16px;">No chronological records yet.</p>` :
      events.map(e => {
        let badgeClass = 'badge-pending';
        if (['approved','present','paid'].includes(e.status)) badgeClass = 'badge-approved';
        if (['rejected','absent'].includes(e.status)) badgeClass = 'badge-rejected';
        return `<div class="timeline-item timeline-item-${e.type}"><div class="timeline-marker"></div><div class="timeline-date">${e.date}</div><div class="timeline-content-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h4 style="margin-bottom:0;">${e.title}</h4><span class="badge ${badgeClass}">${e.status || 'logged'}</span></div><p>${e.content}</p></div></div>`;
      }).join('');
  }
  if (getStudents().length > 0 && trackerStudentSelector) populateMentorWorkTrackerData(getStudents()[0].id);
  // Expose so the student profile modal "Open in Work Tracker" button can call it
  window.populateMentorWorkTrackerDataGlobal = populateMentorWorkTrackerData;

  // Resource board
  const resTypeSelect = document.getElementById('res-type-input');
  const resVideoGroup = document.getElementById('res-video-upload-group');
  if (resTypeSelect && resVideoGroup) {
    resTypeSelect.addEventListener('change', () => { resVideoGroup.style.display = resTypeSelect.value === 'video' ? 'block' : 'none'; });
  }
  const resVideoFileInput = document.getElementById('res-video-file');
  const resVideoFileName = document.getElementById('res-video-file-name');
  const resVideoBoxContent = document.getElementById('res-video-box-content');
  if (resVideoFileInput) {
    resVideoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { sessionBlobs[file.name] = ev.target.result; };
        reader.readAsDataURL(file);
        resVideoBoxContent.querySelector('span').innerText = 'Video Selected';
        resVideoFileName.innerText = file.name;
      }
    });
  }
  document.getElementById('form-resource').addEventListener('submit', (e) => {
    e.preventDefault();
    const videoFile = resVideoFileInput ? resVideoFileInput.files[0] : null;
    const title = document.getElementById('res-title-input').value.trim();
    const type  = document.getElementById('res-type-input').value;
    const desc  = document.getElementById('res-desc-input').value.trim();
    const link  = document.getElementById('res-link-input').value.trim() || '';

    const saveResource = (dataUrl) => {
      // Store large video blobs in sessionStorage keyed by resource ID, keep URL ref in state
      const resId = generateId('res');
      let storedUrl = '';
      if (dataUrl && dataUrl.startsWith('data:video')) {
        try {
          sessionStorage.setItem('res_video_' + resId, dataUrl);
          storedUrl = '__session:' + resId; // lightweight marker
        } catch(e) {
          storedUrl = ''; // session storage also full, skip
        }
      } else {
        storedUrl = dataUrl || '';
      }
      const newResource = {
        id: resId, title, type,
        url: storedUrl,
        fileName: videoFile ? videoFile.name : "",
        description: desc, linkUrl: link,
        postedBy: mentor.fullName, postedAt: new Date().toISOString()
      };
      appState.resources.push(newResource); saveState();
      showToast("Training resource posted!", "success");
      document.getElementById('form-resource').reset();
      if (resVideoFileName) resVideoFileName.innerText = '';
      if (resVideoBoxContent) resVideoBoxContent.querySelector('span').innerText = 'Select mp4, webm file';
      if (resVideoGroup) resVideoGroup.style.display = 'block';
      populateMentorResources();
    };

    if (videoFile) {
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
      const reader = new FileReader();
      reader.onload = (ev) => { btn.disabled = false; btn.innerHTML = '<span>Post Resource</span><i class="fa-solid fa-paper-plane"></i>'; saveResource(ev.target.result); };
      reader.onerror = () => { btn.disabled = false; btn.innerHTML = '<span>Post Resource</span><i class="fa-solid fa-paper-plane"></i>'; showToast("Failed to read video file.", "error"); };
      reader.readAsDataURL(videoFile);
    } else {
      saveResource("");
    }
  });

  function populateMentorResources() {
    const tbody = document.getElementById('mentor-resources-tbody');
    if (!tbody) return;
    if (appState.resources.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No files posted.</td></tr>`; return; }
    tbody.innerHTML = appState.resources.map(r => `<tr><td><strong>${r.title}</strong></td><td><span class="badge ${r.type === 'video' ? 'res-video' : (r.type === 'doc' ? 'res-doc' : 'res-link')}" style="padding:4px 8px;">${r.type}</span></td><td>${r.linkUrl ? `<a href="${r.linkUrl}" target="_blank" style="color:var(--accent-cyan);font-size:12px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Link</a>` : ''}${r.fileName ? `<div style="font-size:10px;color:var(--text-muted);">${r.fileName}</div>` : ''}</td><td><button class="btn btn-danger" style="padding:6px 12px;font-size:11px;" onclick="deleteResource('${r.id}')"><i class="fa-solid fa-trash-can"></i></button></td></tr>`).join('');
  }
  window.deleteResource = function(resId) {
    if (confirm("Delete this resource?")) { appState.resources = appState.resources.filter(r => r.id !== resId); saveState(); showToast("Resource removed.", "info"); populateMentorResources(); }
  };

  // Payments
  function populateMentorPayments() {
    const tbody = document.getElementById('mentor-billing-tbody');
    if (!tbody) return;
    tbody.innerHTML = getStudents().map(s => {
      const sReports = appState.reports.filter(r => r.userId === s.id && r.status === 'approved');
      const sPayments = appState.payments.filter(p => p.userId === s.id);
      const rate = s.hourlyRate || 15;
      const accrued = sReports.reduce((sum, r) => sum + r.hoursWorked, 0) * rate;
      const paid = sPayments.reduce((sum, p) => sum + p.amount, 0);
      const pending = Math.max(0, accrued - paid);
      return `<tr><td><strong>${s.fullName}</strong><div style="font-size:11px;color:var(--text-muted);">${s.cohort || ''}</div></td><td><div style="display:flex;align-items:center;gap:8px;"><span>$</span><input type="number" class="form-control" value="${rate}" style="max-width:80px;padding:6px 10px;font-size:13px;" onchange="updateHourlyBillingRate('${s.id}',this.value)"></div></td><td><strong>${sReports.reduce((sum, r) => sum + r.hoursWorked, 0)} hrs</strong></td><td>$${accrued.toFixed(2)}</td><td>$${paid.toFixed(2)}</td><td style="color:${pending > 0 ? 'var(--warning)' : 'var(--text-muted)'};font-weight:700;">$${pending.toFixed(2)}</td><td><button class="btn btn-primary" style="padding:6px 12px;font-size:11px;" ${pending <= 0 ? 'disabled style="opacity:0.5;"' : ''} onclick="processPaymentDialog('${s.id}',${pending})"><i class="fa-solid fa-credit-card"></i> Pay Stipend</button></td></tr>`;
    }).join('');
  }

  window.updateHourlyBillingRate = function(studentId, newVal) {
    const rateVal = parseFloat(newVal);
    if (isNaN(rateVal) || rateVal <= 0) return;
    const stud = appState.users.find(u => u.id === studentId);
    if (stud) { stud.hourlyRate = rateVal; saveState(); showToast(`Billing rate updated to $${rateVal}/hr`, "info"); populateMentorPayments(); }
  };

  window.processPaymentDialog = function(studentId, maxPayable) {
    const studentObj = appState.users.find(u => u.id === studentId);
    if (!studentObj) return;
    showModal(`Process Stipend: ${studentObj.fullName}`, `<div style="font-size:13.5px;"><p style="margin-bottom:12px;">Max Payable: <strong>$${maxPayable.toFixed(2)}</strong></p><div class="form-group"><label class="form-label">Payment Amount ($)</label><input class="form-control" type="number" id="pay-amount" value="${maxPayable.toFixed(2)}" max="${maxPayable}" min="1" step="0.01" style="padding-left:16px;"></div><div class="form-group"><label class="form-label">Stipend Description</label><input class="form-control" type="text" id="pay-desc" value="Stipend Payment clearance" style="padding-left:16px;"></div><div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px;"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="confirmStipendPayment('${studentId}')">Confirm Payout</button></div></div>`);
  };

  window.confirmStipendPayment = function(studentId) {
    const amountVal = parseFloat(document.getElementById('pay-amount').value);
    const descVal = document.getElementById('pay-desc').value.trim() || 'Stipend Payout';
    if (isNaN(amountVal) || amountVal <= 0) { showToast("Enter a valid payment amount.", "error"); return; }
    const newPay = { id: generateId('pay'), userId: studentId, amount: amountVal, description: descVal, date: new Date().toISOString().split('T')[0], refNo: `TX-PAY-${Math.floor(100000 + Math.random() * 900000)}` };
    appState.payments.push(newPay); saveState(); closeModal();
    showToast("Payment transaction successful!", "success"); populateMentorPayments(); updateMentorMetrics();
  };

  // Applications Spreadsheet
  function populateApplicationsSpreadsheet() {
    const rowsBox = document.getElementById('spreadsheet-rows-container');
    if (!rowsBox) return;
    const apps = appState.applications;
    if (apps.length === 0) { rowsBox.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No applications submitted yet.</div>`; return; }
    rowsBox.innerHTML = apps.map(a => `<div class="spreadsheet-row" id="app-row-${a.id}"><div class="spreadsheet-cell" style="flex:0.8;"><code>${new Date(a.appliedAt).toLocaleDateString()}</code></div><div class="spreadsheet-cell"><strong>${a.fullName}</strong></div><div class="spreadsheet-cell">${a.email}</div><div class="spreadsheet-cell" style="flex:0.8;">${a.role}</div><div class="spreadsheet-cell">${a.university}</div><div class="spreadsheet-cell" style="flex:0.6;">${a.preferredCohort}</div><div class="spreadsheet-cell" style="flex:0.7;"><a href="${a.resumeLink}" target="_blank" style="color:var(--accent-cyan);text-decoration:none;"><i class="fa-solid fa-file-pdf"></i> Resume</a></div><div class="spreadsheet-cell" style="flex:0.5;"><span class="badge ${a.status === 'Approved' ? 'badge-approved' : (a.status === 'Rejected' ? 'badge-rejected' : 'badge-pending')}">${a.status}</span></div><div class="spreadsheet-cell" style="flex:0.6;display:flex;gap:6px;"><button class="btn btn-primary" style="padding:4px 6px;font-size:11px;background:var(--success);" onclick="reviewApplication('${a.id}','Approved')" title="Approve"><i class="fa-solid fa-check"></i></button><button class="btn btn-secondary" style="padding:4px 6px;font-size:11px;color:var(--danger);" onclick="reviewApplication('${a.id}','Rejected')" title="Reject"><i class="fa-solid fa-xmark"></i></button></div></div>`).join('');
  }

  window.reviewApplication = function(appId, targetStatus) {
    const appRecord = appState.applications.find(a => a.id === appId);
    if (appRecord) {
      appRecord.status = targetStatus; saveState();
      showToast(`Application marked as ${targetStatus}!`, "success");
      populateApplicationsSpreadsheet();
      if (targetStatus === 'Approved') {
        const alreadyExists = appState.users.some(u => u.email.toLowerCase() === appRecord.email.toLowerCase());
        if (!alreadyExists) {
          const cleanUsername = appRecord.fullName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10);
          appState.users.push({ id: generateId('usr'), username: cleanUsername, password: "password123", fullName: appRecord.fullName, role: "student", email: appRecord.email, cohort: appRecord.preferredCohort, university: appRecord.university, phone: appRecord.phone, joinedDate: new Date().toISOString().split('T')[0], hourlyRate: 15 });
          saveState(); showToast(`Intern account created! User: ${cleanUsername} / Pass: password123`, "info");
          populateMentorStudents();
        }
      }
    }
  };

  document.getElementById('btn-download-applications-csv').addEventListener('click', () => {
    if (appState.applications.length === 0) { showToast("No applications to download.", "error"); return; }
    const headers = ["Applicant Name","Email","Phone","Role Preference","University","Cohort","Resume Link","Status","Date Applied"];
    const rows = appState.applications.map(a => [a.fullName,a.email,a.phone,a.role,a.university,a.preferredCohort,a.resumeLink,a.status,a.appliedAt]);
    downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), "Speedify_Internship_Applications.csv");
  });

  // Pending Reports Cards
  function populatePendingReviewsList() {
    const deck = document.getElementById('mentor-pending-reviews-container');
    if (!deck) return;
    const pending = appState.reports.filter(r => r.status === 'pending');
    if (pending.length === 0) { deck.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);"><i class="fa-regular fa-circle-check" style="font-size:32px;color:var(--success);margin-bottom:12px;"></i><p style="font-weight:500;font-size:14px;">All student daily reports processed.</p></div>`; return; }
    deck.innerHTML = pending.map(r => {
      let mediaRowHtml = '';
      if (r.screenshotName) mediaRowHtml += `<button class="attachment-preview-btn" onclick="previewImage('${r.id}')"><i class="fa-regular fa-image"></i> <span>Img: ${r.screenshotName}</span></button>`;
      if (r.videoName) mediaRowHtml += `<button class="attachment-preview-btn" onclick="previewVideo('${r.id}')"><i class="fa-regular fa-square-caret-right"></i> <span>Vid: ${r.videoName}</span></button>`;
      if (mediaRowHtml) mediaRowHtml = `<div class="report-attachments-row">${mediaRowHtml}</div>`;
      return `<div class="glass-card report-review-card" style="margin-bottom:20px;border-left:4px solid var(--warning);"><div class="report-review-header"><div class="report-review-user"><div class="avatar" style="width:36px;height:36px;font-size:14px;">${r.studentName.charAt(0)}</div><div><h4>${r.studentName}</h4><span>Submitted on ${new Date(r.createdAt).toLocaleDateString()}</span></div></div><div style="text-align:right;"><span style="font-weight:600;font-size:13px;color:var(--accent-cyan);">Date: ${r.date}</span><div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Hours: ${r.hoursWorked} hrs</div></div></div><div class="report-details-body"><p style="white-space:pre-line;">${r.summary}</p>${mediaRowHtml}</div><div class="review-actions-panel"><textarea class="review-feedback-input" id="feedback-${r.id}" placeholder="Add feedback comments..."></textarea><div class="review-btns"><button class="btn btn-secondary btn-danger" onclick="reviewReportStatus('${r.id}','rejected')"><i class="fa-solid fa-xmark"></i> Reject</button><button class="btn btn-primary" style="background:var(--success);box-shadow:0 4px 15px rgba(16,185,129,0.2);" onclick="reviewReportStatus('${r.id}','approved')"><i class="fa-solid fa-check"></i> Approve</button></div></div></div>`;
    }).join('');
  }

  window.reviewReportStatus = function(reportId, targetStatus) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;
    const fbInput = document.getElementById(`feedback-${reportId}`);
    report.status = targetStatus; report.feedback = fbInput ? fbInput.value.trim() : ''; saveState();
    showToast(targetStatus === 'approved' ? "Report Approved!" : "Report Rejected.", targetStatus === 'approved' ? 'success' : 'info');
    populatePendingReviewsList(); populateMentorAllReports(); populateMentorStudents(); populateMentorPayments(); updateMentorMetrics();
    if (trackerStudentSelector) populateMentorWorkTrackerData(trackerStudentSelector.value);
    setTimeout(initAnalyticsCharts, 100);
  };

  function populateMentorAllReports() {
    const tbody = document.getElementById('mentor-all-reports-tbody');
    if (!tbody) return;
    const searchQuery = document.getElementById('reports-search').value.toLowerCase();
    const statusFilter = document.getElementById('reports-filter-status').value;
    const filtered = appState.reports.filter(r => (r.studentName.toLowerCase().includes(searchQuery) || r.summary.toLowerCase().includes(searchQuery)) && (statusFilter === 'all' || r.status === statusFilter)).sort((a,b) => new Date(b.date) - new Date(a.date));
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">No matching reports found.</td></tr>`; return; }
    tbody.innerHTML = filtered.map(r => {
      let mediaLinkHtml = '';
      if (r.screenshotName) mediaLinkHtml += `<button class="attachment-preview-btn" onclick="previewImage('${r.id}')" style="margin-bottom:4px;"><i class="fa-regular fa-image"></i> <span>Img</span></button>`;
      if (r.videoName) mediaLinkHtml += `<button class="attachment-preview-btn" onclick="previewVideo('${r.id}')"><i class="fa-regular fa-square-caret-right"></i> <span>Vid</span></button>`;
      if (!mediaLinkHtml) mediaLinkHtml = '<span style="color:var(--text-muted);">None</span>';
      let actionHtml = r.status === 'pending' ? `<div style="display:flex;gap:8px;"><button class="btn btn-primary" style="padding:6px 10px;font-size:11px;background:var(--success);" onclick="directAction('${r.id}','approved')"><i class="fa-solid fa-check"></i></button><button class="btn btn-secondary" style="padding:6px 10px;font-size:11px;color:var(--danger);" onclick="directAction('${r.id}','rejected')"><i class="fa-solid fa-xmark"></i></button></div>` : `<span style="color:var(--text-muted);font-size:12px;">Completed</span>`;
      let feedbackText = r.status === 'pending' ? `<input type="text" class="review-feedback-input" id="tbl-feedback-${r.id}" placeholder="Feedback..." style="min-height:auto;padding:6px 8px;">` : `<span style="font-size:12.5px;font-style:${r.feedback ? 'normal' : 'italic'}">${r.feedback || 'None'}</span>`;
      return `<tr><td><strong>${r.studentName}</strong></td><td><code>${r.date}</code></td><td>${r.hoursWorked} hrs</td><td><div style="max-height:70px;overflow-y:auto;white-space:pre-line;line-height:1.4;font-size:12.5px;">${r.summary}</div></td><td>${mediaLinkHtml}</td><td><span class="badge badge-${r.status}">${r.status}</span></td><td>${feedbackText}</td><td>${actionHtml}</td></tr>`;
    }).join('');
  }

  window.directAction = function(reportId, targetStatus) {
    const feedbackInput = document.getElementById(`tbl-feedback-${reportId}`);
    const report = appState.reports.find(r => r.id === reportId);
    if (report) {
      report.status = targetStatus; report.feedback = feedbackInput ? feedbackInput.value.trim() : ''; saveState();
      showToast(`Report ${targetStatus} successfully!`, "success");
      populatePendingReviewsList(); populateMentorAllReports(); populateMentorStudents(); populateMentorPayments(); updateMentorMetrics();
      if (trackerStudentSelector) populateMentorWorkTrackerData(trackerStudentSelector.value);
      setTimeout(initAnalyticsCharts, 100);
    }
  };

  document.getElementById('reports-search').addEventListener('input', populateMentorAllReports);
  document.getElementById('reports-filter-status').addEventListener('change', populateMentorAllReports);

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename;
    link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast(`CSV downloaded: ${filename}`, "success");
  }

  document.getElementById('btn-export-reports').addEventListener('click', () => {
    if (appState.reports.length === 0) { showToast("No reports found.", "error"); return; }
    const headers = ["Report ID","Intern Name","Work Date","Hours Worked","Summary","Screenshot","Video","Status","Feedback","Submitted At"];
    const rows = appState.reports.map(r => [r.id,r.studentName,r.date,r.hoursWorked,`"${r.summary.replace(/"/g,'""')}"`,r.screenshotName||'',r.videoName||'',r.status,`"${(r.feedback||'').replace(/"/g,'""')}"`,r.createdAt]);
    downloadCSV([headers.join(','),...rows.map(r=>r.join(','))].join('\n'), "Speedify_Work_Reports.csv");
  });

  document.getElementById('btn-export-attendance').addEventListener('click', () => {
    if (appState.attendance.length === 0) { showToast("No attendance logs found.", "error"); return; }
    const headers = ["Log ID","Intern Name","Date","Clock-In Time","Clock-Out Time","Status"];
    const rows = appState.attendance.map(l => { const u = appState.users.find(u => u.id === l.userId); return [l.id,u?u.fullName:'Unknown',l.date,l.clockIn||'N/A',l.clockOut||'N/A',l.status]; });
    downloadCSV([headers.join(','),...rows.map(r=>r.join(','))].join('\n'), "Speedify_Attendance_Logs.csv");
  });

  function populateMentorProfileData() {
    // Profile is rendered inline in the mentor-home tab HTML — nothing to wire up
  }

  function updateMentorMetrics() {
    const totalStudents = getStudents().length;
    const pendingReportsCount = appState.reports.filter(r => r.status === 'pending').length;
    const totalCheckedInDays = appState.attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const avgAttendancePct = (totalStudents * 20) > 0 ? Math.round((totalCheckedInDays / (totalStudents * 20)) * 100) : 0;
    const totalTasks = appState.tasks.length;
    const tasksPct = totalTasks > 0 ? Math.round((appState.tasks.filter(t => t.status === 'completed').length / totalTasks) * 100) : 0;
    document.getElementById('m-total-students').innerText = totalStudents.toString();
    document.getElementById('m-avg-attendance').innerText = `${avgAttendancePct}%`;
    document.getElementById('m-pending-reports').innerText = pendingReportsCount.toString();
    document.getElementById('m-tasks-pct').innerText = `${tasksPct}%`;
  }

  populatePendingReviewsList(); populateMentorStudents(); populateMentorTasksTracker();
  populateMentorResources(); populateMentorPayments(); populateApplicationsSpreadsheet();
  populateMentorAllReports(); populateMentorProfileData(); updateMentorMetrics();
  setTimeout(initAnalyticsCharts, 100);
}

// --- ANALYTICS CHARTS ---
function initAnalyticsCharts() {
  const ctxAtt = document.getElementById('chart-attendance');
  const ctxRep = document.getElementById('chart-reports');
  if (!ctxAtt || !ctxRep) return;
  if (attendanceChart) attendanceChart.destroy();
  if (reportChart) reportChart.destroy();
  attendanceChart = new Chart(ctxAtt, { type: 'doughnut', data: { labels: ['Present','Late','Absent'], datasets: [{ data: [appState.attendance.filter(a=>a.status==='present').length, appState.attendance.filter(a=>a.status==='late').length, appState.attendance.filter(a=>a.status==='absent').length], backgroundColor: ['#10b981','#f59e0b','#f43f5e'], borderColor: '#1e293b', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f8fafc', font: { family: 'Outfit' } } } } } });
  reportChart = new Chart(ctxRep, { type: 'bar', data: { labels: ['Approved','Pending','Rejected'], datasets: [{ label: 'Reports Count', data: [appState.reports.filter(r=>r.status==='approved').length, appState.reports.filter(r=>r.status==='pending').length, appState.reports.filter(r=>r.status==='rejected').length], backgroundColor: ['rgba(16,185,129,0.4)','rgba(245,158,11,0.4)','rgba(244,63,94,0.4)'], borderColor: ['#10b981','#f59e0b','#f43f5e'], borderWidth: 1.5 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } }, plugins: { legend: { display: false } } } });
}

// --- GLOBAL INIT handled by initFirebase().then() at top of file ---


// ─────────────────────────────────────────────────────────────
// MOBILE SIDEBAR TOGGLE
// ─────────────────────────────────────────────────────────────
(function initMobileSidebar() {
  const hamburger = document.getElementById('btn-hamburger');
  const backdrop  = document.getElementById('sidebar-backdrop');
  const sidebar   = document.getElementById('sidebar');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('hidden');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('hidden');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (backdrop)  backdrop.addEventListener('click', closeSidebar);

  // Close sidebar when a nav item is tapped on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth > 768) return;
    const navItem = e.target.closest('.nav-item');
    if (navItem && sidebar && !sidebar.classList.contains('hidden')) {
      closeSidebar();
    }
  });

  // On resize to desktop, remove mobile overflow lock
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      document.body.style.overflow = '';
      if (backdrop) backdrop.classList.remove('active');
    }
  });
})();
