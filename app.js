// Speedify Tech X Internship Portal - Core Application Logic

// --- STATE MANAGEMENT ---
const DEFAULT_STATE = {
  users: [
    { id: "usr_1", username: "mentor", password: "password123", fullName: "Dr. Sarah Jenkins", role: "mentor", email: "sarah.j@speedify.com", department: "Engineering", designation: "Lead Mentor", joinedDate: "2025-01-10" },
    { id: "usr_2", username: "student1", password: "password123", fullName: "Alex Mercer", role: "student", email: "alex.m@gmail.com", cohort: "Web Dev Cohort A", joinedDate: "2026-06-01", phone: "+1 (555) 019-2834", university: "Stanford University", hourlyRate: 20 },
    { id: "usr_3", username: "student2", password: "password123", fullName: "Elena Rostova", role: "student", email: "elena.r@outlook.com", cohort: "Mobile Dev Cohort B", joinedDate: "2026-06-01", phone: "+1 (555) 018-9201", university: "MIT", hourlyRate: 18 }
  ],
  attendance: [
    { id: "att_1", userId: "usr_2", date: "2026-06-17", clockIn: "09:05 AM", clockOut: "05:15 PM", status: "present" },
    { id: "att_2", userId: "usr_2", date: "2026-06-18", clockIn: "08:58 AM", clockOut: "05:00 PM", status: "present" },
    { id: "att_3", userId: "usr_3", date: "2026-06-17", clockIn: "09:45 AM", clockOut: "05:30 PM", status: "late" },
    { id: "att_4", userId: "usr_3", date: "2026-06-18", clockIn: "", clockOut: "", status: "absent" }
  ],
  reports: [
    { id: "rep_1", userId: "usr_2", studentName: "Alex Mercer", date: "2026-06-17", summary: "Implemented the client-side state machine and route dispatcher. Designed glassmorphic cards using advanced CSS variables and backdrop filters. Completed responsive grid integration for student progress views.", hoursWorked: 8, videoName: "progress_demo_v1.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", screenshotName: "dashboard_layout.png", screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2300f2fe'>Screenshot: Dashboard Layout Mockup</text></svg>", status: "approved", feedback: "Excellent layout design and clean code structure.", createdAt: "2026-06-17T17:30:00Z" },
    { id: "rep_2", userId: "usr_2", studentName: "Alex Mercer", date: "2026-06-18", summary: "Worked on routing logic and local persistence using localStorage. Bound click event triggers to dynamic templates. Resolved index navigation offsets.", hoursWorked: 7.5, videoName: "route_test.mp4", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", screenshotName: "route_diagram.png", screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2300f2fe'>Screenshot: SPA Route Mapping Diagram</text></svg>", status: "pending", feedback: "", createdAt: "2026-06-18T17:15:00Z" },
    { id: "rep_3", userId: "usr_3", studentName: "Elena Rostova", date: "2026-06-17", summary: "Configured build scripts and dependencies. Initiated landing page template using Flexbox. Set up base asset catalog.", hoursWorked: 6, videoName: "", videoUrl: "", screenshotName: "project_init.png", screenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2300f2fe'>Screenshot: Project Initialization Folder Structure</text></svg>", status: "approved", feedback: "Setup is fine. Please attach progress videos starting tomorrow.", createdAt: "2026-06-17T18:00:00Z" }
  ],
  tasks: [
    { id: "tsk_1", assignedTo: "usr_2", assignedBy: "Dr. Sarah Jenkins", title: "Implement SPA Router", description: "Design a state-based client-side router in Vanilla JS supporting hash triggers.", dueDate: "2026-06-20", status: "completed", completedAt: "2026-06-18" },
    { id: "tsk_2", assignedTo: "usr_2", assignedBy: "Dr. Sarah Jenkins", title: "Create Glassmorphic Dashboard UI", description: "Assemble CSS tokens, blur filters, grid layouts, and hover behaviors.", dueDate: "2026-06-22", status: "pending", completedAt: "" },
    { id: "tsk_3", assignedTo: "usr_3", assignedBy: "Dr. Sarah Jenkins", title: "Integrate LocalStorage DB", description: "Establish state initialization, query methods, and writes mapper mapping to localStorage.", dueDate: "2026-06-21", status: "pending", completedAt: "" }
  ],
  projects: [
    { id: "proj_1", userId: "usr_2", studentName: "Alex Mercer", title: "Internship Web Portal SPA", description: "Completed Phase 1 of the portal. Implemented index structure, styling sheets, routing configs, and state bindings.", repoUrl: "https://github.com/alexmercer/speedify-portal", liveUrl: "https://speedify-portal-demo.web.app", zipName: "speedify_portal_src.zip", status: "approved", feedback: "Excellent architectural layout. Frontend details are very polished.", submittedAt: "2026-06-18T16:00:00Z" }
  ],
  resources: [
    { id: "res_1", title: "Orientation Lecture & Workspace Setup", type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", fileName: "orientation_session_rec.mp4", description: "Check out this recorded video reviewing corporate guidelines, project timelines, and local environment staging requirements.", linkUrl: "https://slides.google.com/speedify-orientation", postedBy: "Dr. Sarah Jenkins", postedAt: "2026-06-01T10:00:00Z" },
    { id: "res_2", title: "API Documentation Guidelines", type: "doc", url: "", fileName: "", description: "Read through this document summarizing standardized REST routing, JWT schemas, and SQLite models constraints.", linkUrl: "https://docs.speedify.com/api-handbook", postedBy: "Dr. Sarah Jenkins", postedAt: "2026-06-05T14:30:00Z" }
  ],
  payments: [
    { id: "pay_1", userId: "usr_2", amount: 160, description: "Stipend Payout: June Week 1 & 2 (8 Approved Hours @ $20/hr)", date: "2026-06-18", refNo: "TX-PAY-882031" }
  ],
  applications: [
    { id: "app_1", fullName: "James Cole", email: "james.cole@gmail.com", phone: "+1 (555) 012-3456", role: "Software Engineer Intern", university: "Harvard University", preferredCohort: "Web Dev Cohort A", resumeLink: "https://drive.google.com/resume_james", portfolioLink: "https://jamescole.dev", coverLetter: "I am passionate about high-performance web systems and would love to contribute to Speedify.", status: "Review", appliedAt: "2026-06-19T10:15:00Z" }
  ],
  config: { firebase: null, sheetsWebhook: "" }
};

// State and Session Init
let appState = JSON.parse(localStorage.getItem('speedify_portal_state'));
if (!appState) {
  appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  localStorage.setItem('speedify_portal_state', JSON.stringify(appState));
}
let currentSession = JSON.parse(sessionStorage.getItem('speedify_portal_session')) || { currentUser: null };
const sessionBlobs = {};

function saveState() { localStorage.setItem('speedify_portal_state', JSON.stringify(appState)); }
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
  const hash = window.location.hash || '#login';
  const viewContainer = document.getElementById('view-container');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (!viewContainer) return;
  if (hash === '#apply') {
    sidebar.classList.add('hidden'); mainContent.classList.add('full-width'); mainContent.classList.remove('shifted');
    renderApplyView(viewContainer); return;
  }
  if (!currentSession.currentUser && hash !== '#login' && hash !== '#register') { navigateTo('#login'); return; }
  if (currentSession.currentUser && (hash === '#login' || hash === '#register')) { navigateTo('#dashboard'); return; }
  if (currentSession.currentUser) {
    sidebar.classList.remove('hidden'); mainContent.classList.remove('full-width'); mainContent.classList.add('shifted');
    updateSidebarUI();
  } else {
    sidebar.classList.add('hidden'); mainContent.classList.add('full-width'); mainContent.classList.remove('shifted');
  }
  if (hash === '#login') renderLoginView(viewContainer);
  else if (hash === '#register') renderRegisterView(viewContainer);
  else if (hash === '#dashboard') {
    if (currentSession.currentUser.role === 'mentor') renderMentorDashboard(viewContainer);
    else renderStudentDashboard(viewContainer);
  } else { viewContainer.innerHTML = `<div class="glass-card"><h2>404 - View Not Found</h2></div>`; }
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
      <li><a class="nav-item active" data-tab="mentor-analytics"><i class="fa-solid fa-chart-line"></i><span>Analytics Dashboard</span></a></li>
      <li><a class="nav-item" data-tab="mentor-tracker"><i class="fa-solid fa-clock-rotate-left"></i><span>Intern Work Tracker</span></a></li>
      <li><a class="nav-item" data-tab="mentor-review"><i class="fa-solid fa-clipboard-check"></i><span>Review Reports</span></a></li>
      <li><a class="nav-item" data-tab="mentor-resources"><i class="fa-solid fa-photo-film"></i><span>Resource Board</span></a></li>
      <li><a class="nav-item" data-tab="mentor-tasks"><i class="fa-solid fa-list-check"></i><span>Assign Tasks</span></a></li>
      <li><a class="nav-item" data-tab="mentor-payments"><i class="fa-solid fa-wallet"></i><span>Stipend Payments</span></a></li>
      <li><a class="nav-item" data-tab="mentor-students"><i class="fa-solid fa-graduation-cap"></i><span>Intern Directory</span></a></li>
      <li><a class="nav-item" data-tab="mentor-applications"><i class="fa-solid fa-table-cells"></i><span>Applications Sheet</span></a></li>
      <li><a class="nav-item" data-tab="mentor-exports"><i class="fa-solid fa-download"></i><span>Export Data</span></a></li>
      <li><a class="nav-item" data-tab="mentor-profile"><i class="fa-solid fa-id-card"></i><span>My Profile</span></a></li>`;
  } else {
    sidebarMenu.innerHTML = `
      <li><a class="nav-item active" data-tab="student-overview"><i class="fa-solid fa-house"></i><span>Overview</span></a></li>
      <li><a class="nav-item" data-tab="student-report"><i class="fa-solid fa-file-pen"></i><span>Submit Report</span></a></li>
      <li><a class="nav-item" data-tab="student-project"><i class="fa-solid fa-code-branch"></i><span>Submit Project</span></a></li>
      <li><a class="nav-item" data-tab="student-tasks"><i class="fa-solid fa-tasks"></i><span>My Tasks</span></a></li>
      <li><a class="nav-item" data-tab="student-resources"><i class="fa-solid fa-folder-open"></i><span>Resource Library</span></a></li>
      <li><a class="nav-item" data-tab="student-earnings"><i class="fa-solid fa-sack-dollar"></i><span>My Earnings</span></a></li>
      <li><a class="nav-item" data-tab="student-history"><i class="fa-solid fa-history"></i><span>Work History</span></a></li>
      <li><a class="nav-item" data-tab="student-profile"><i class="fa-solid fa-circle-user"></i><span>My Profile</span></a></li>`;
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
}

// Log Out
document.getElementById('btn-logout').addEventListener('click', () => {
  currentSession.currentUser = null; saveSession();
  showToast("Logged out successfully.", "info"); navigateTo('#login');
});

// --- RENDERERS ---

// 1. PUBLIC APPLY VIEW
function renderApplyView(container) {
  container.innerHTML = `
  <div style="max-width:720px;margin:40px auto;padding:0 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="logo.jpg" alt="Speedify Logo" class="login-logo-img">
      <h1 style="font-size:26px;font-weight:700;margin-bottom:6px;">Internship Application Form</h1>
      <p style="color:var(--text-secondary);font-size:14px;">Apply to the Speedify Tech X Internship Program.</p>
      <a href="#login" style="display:inline-block;margin-top:12px;font-size:13px;color:var(--accent-cyan);text-decoration:none;"><i class="fa-solid fa-arrow-left"></i> Back to Portal Login</a>
    </div>
    <div class="glass-card fade-in">
      <form id="form-apply">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div><label class="form-label">Full Name</label><input class="form-control" type="text" id="apply-name" placeholder="John Doe" required style="padding-left:16px;"></div>
          <div><label class="form-label">Email Address</label><input class="form-control" type="email" id="apply-email" placeholder="john.doe@gmail.com" required style="padding-left:16px;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div><label class="form-label">Phone Number</label><input class="form-control" type="tel" id="apply-phone" placeholder="+1 (555) 000-0000" required style="padding-left:16px;"></div>
          <div><label class="form-label">University / College</label><input class="form-control" type="text" id="apply-uni" placeholder="Stanford University" required style="padding-left:16px;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div><label class="form-label">Preferred Internship Role</label>
            <select class="form-control" id="apply-role" required style="padding-left:16px;background-image:none;">
              <option>Software Engineer Intern</option><option>Mobile App Developer Intern</option>
              <option>UI/UX Designer Intern</option><option>Data Analyst Intern</option>
            </select></div>
          <div><label class="form-label">Target Cohort / Batch</label>
            <select class="form-control" id="apply-cohort" required style="padding-left:16px;background-image:none;">
              <option>Web Dev Cohort A</option><option>Mobile Dev Cohort B</option><option>Data Analytics Cohort C</option>
            </select></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div><label class="form-label">Resume Link</label><input class="form-control" type="url" id="apply-resume" placeholder="https://drive.google.com/file/..." required style="padding-left:16px;"></div>
          <div><label class="form-label">Portfolio / Github URL</label><input class="form-control" type="url" id="apply-portfolio" placeholder="https://github.com/username" style="padding-left:16px;"></div>
        </div>
        <div class="form-group"><label class="form-label">Brief Cover Letter</label><textarea class="form-control" id="apply-cover" placeholder="Tell us why you'd be a great fit..." required style="padding-left:16px;"></textarea></div>
        <button class="btn btn-primary btn-full" type="submit"><span>Submit Application</span><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  </div>`;
  document.getElementById('form-apply').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Submitting...</span>';

    const appData = {
      id: generateId('app'),
      fullName:        document.getElementById('apply-name').value.trim(),
      email:           document.getElementById('apply-email').value.trim(),
      phone:           document.getElementById('apply-phone').value.trim(),
      role:            document.getElementById('apply-role').value,
      university:      document.getElementById('apply-uni').value.trim(),
      preferredCohort: document.getElementById('apply-cohort').value,
      resumeLink:      document.getElementById('apply-resume').value.trim(),
      portfolioLink:   document.getElementById('apply-portfolio').value.trim() || 'N/A',
      coverLetter:     document.getElementById('apply-cover').value.trim(),
      status:    "Review",
      appliedAt: new Date().toISOString()
    };

    // Always save locally
    appState.applications.push(appData);
    saveState();

    // Save to Firestore using the global firebaseDb
    if (firebaseDb) {
      try {
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await addDoc(collection(firebaseDb, "applications"), appData);
        showToast("Application saved to Firebase!", "success");
      } catch (err) {
        console.error("Firestore write error:", err);
        showToast("Saved locally — Firebase sync failed.", "warning");
      }
    } else {
      showToast("Application submitted successfully!", "success");
    }

    document.getElementById('form-apply').reset();
    btn.disabled = false;
    btn.innerHTML = '<span>Submit Application</span><i class="fa-solid fa-paper-plane"></i>';
    navigateTo('#login');
  });
}

// 2. LOGIN VIEW
function renderLoginView(container) {
  container.innerHTML = `
  <div class="auth-wrapper">
    <div class="glass-card auth-card fade-in">
      <div class="auth-header">
        <img src="logo.jpg" alt="Speedify Logo" class="login-logo-img">
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
      </div>
    </div>
  </div>`;
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailVal    = document.getElementById('login-username').value.trim();
    const passwordVal = document.getElementById('login-password').value;

    if (isFirebaseActive && firebaseAuth) {
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Signing in...</span>';
      try {
        const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, emailVal, passwordVal);        const fbUser = userCredential.user;

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
        navigateTo('#dashboard');
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
      // Local fallback (username OR email)
      const user = appState.users.find(u =>
        (u.username.toLowerCase() === emailVal.toLowerCase() ||
         u.email.toLowerCase()    === emailVal.toLowerCase()) &&
        u.password === passwordVal
      );
      if (user) {
        currentSession.currentUser = { id: user.id, username: user.username, fullName: user.fullName, role: user.role, email: user.email };
        saveSession(); showToast(`Welcome back, ${user.fullName}!`, "success"); navigateTo('#dashboard');
      } else { showToast("Invalid email or password.", "error"); }
    }
  });
}

// 3. REGISTER VIEW
function renderRegisterView(container) {
  container.innerHTML = `
  <div class="auth-wrapper">
    <div class="glass-card auth-card fade-in">
      <div class="auth-header"><img src="logo.jpg" alt="Speedify Logo" class="login-logo-img"><h2>Create Account</h2><p>Register as a student or staff administrator</p></div>
      <div class="role-toggle">
        <button type="button" class="role-btn active" id="role-student-btn" data-role="student"><i class="fa-solid fa-graduation-cap"></i> Student</button>
        <button type="button" class="role-btn" id="role-mentor-btn" data-role="mentor"><i class="fa-solid fa-user-tie"></i> Mentor / Staff</button>
      </div>
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
  const roleStudentBtn = document.getElementById('role-student-btn');
  const roleMentorBtn = document.getElementById('role-mentor-btn');
  const cohortGroup = document.getElementById('cohort-group');
  roleStudentBtn.addEventListener('click', () => { selectedRole = 'student'; roleStudentBtn.classList.add('active'); roleMentorBtn.classList.remove('active'); cohortGroup.style.display = 'block'; });
  roleMentorBtn.addEventListener('click', () => { selectedRole = 'mentor'; roleMentorBtn.classList.add('active'); roleStudentBtn.classList.remove('active'); cohortGroup.style.display = 'none'; });
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
      showToast("Registration successful!", "success"); navigateTo('#login');
    }
  });
}

// 4. STUDENT DASHBOARD
function renderStudentDashboard(container) {
  const student = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = appState.attendance.find(a => a.userId === student.id && a.date === todayStr);
  let checkInTime = todaysAttendance ? todaysAttendance.clockIn : '';
  let checkOutTime = todaysAttendance ? todaysAttendance.clockOut : '';
  let isCheckedIn = !!checkInTime;
  let isCheckedOut = !!checkOutTime;

  container.innerHTML = `
<!-- TAB 1: OVERVIEW -->
<div id="student-overview" class="dashboard-tab">
  <div class="view-header">
    <div class="view-title"><h1>Intern Overview</h1><p>Welcome back, ${student.fullName}! Access your active progress parameters.</p></div>
    <div class="badge badge-approved"><i class="fa-solid fa-bolt"></i> Speedify Intern</div>
  </div>
  <div class="dashboard-grid">
    <div class="dashboard-left-content">
      <div class="grid-cols-2">
        <div class="glass-card attendance-panel">
          <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:12px;">Daily Work Attendance</h3>
          <div class="attendance-time" id="live-time">12:00:00 PM</div>
          <div class="attendance-date" id="live-date">...</div>
          <div style="display:flex;gap:16px;width:100%;justify-content:center;">
            <button class="btn btn-primary" id="btn-clock-in" ${isCheckedIn ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-right-to-bracket"></i> Clock In</button>
            <button class="btn btn-secondary" id="btn-clock-out" ${!isCheckedIn || isCheckedOut ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-right-from-bracket"></i> Clock Out</button>
          </div>
          <div style="margin-top:16px;font-size:12.5px;color:var(--text-secondary);" id="attendance-status-text">${isCheckedOut ? 'Logged Out for today' : (isCheckedIn ? 'Clocked In at ' + checkInTime : 'Not checked in yet')}</div>
        </div>
        <div class="glass-card" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary);margin-bottom:16px;">Task Completion Metrics</h3>
            <div class="task-progress-bar-container" style="width:100%;height:12px;margin-bottom:8px;"><div class="student-progress-bar" id="student-main-progress" style="width:0%"></div></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;"><span id="txt-tasks-ratio">Tasks Completed: 0/0</span><span id="txt-progress-percent">0%</span></div>
          </div>
          <div style="border-top:1px solid var(--border-color);padding-top:16px;margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:center;">
            <div><h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);">Attendance</h4><p style="font-size:20px;font-weight:700;color:var(--accent-cyan);" id="txt-attendance-pct">0%</p></div>
            <div><h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);">Approved Reports</h4><p style="font-size:20px;font-weight:700;color:var(--success);" id="txt-approved-cnt">0</p></div>
          </div>
        </div>
      </div>
      <div class="glass-card" style="margin-top:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:16px;font-weight:600;">Current Tasks Checklist</h3>
          <a href="#" class="accent-text" style="font-size:12px;text-decoration:none;" onclick="event.preventDefault();document.querySelector('[data-tab=student-tasks]').click();">View All</a>
        </div>
        <div class="task-list" id="overview-task-list"></div>
      </div>
    </div>
    <div class="dashboard-right-content">
      <div class="glass-card" style="height:100%;">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Portal Activity Logs</h3>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:16px;font-size:13px;" id="student-activities">
          <li style="display:flex;gap:10px;"><i class="fa-solid fa-circle-dot" style="color:var(--accent-cyan);margin-top:3px;"></i><div><p style="font-weight:500;">Authorized login token sync</p><span style="font-size:11px;color:var(--text-muted);">Just now</span></div></li>
        </ul>
      </div>
    </div>
  </div>
</div>
<!-- TAB 2: SUBMIT REPORT -->
<div id="student-report" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Submit Daily Work Report</h1><p>Record daily activity logs and upload screenshots or demo videos.</p></div></div>
  <div class="glass-card" style="max-width:800px;margin:0 auto;">
    <form id="form-report">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div><label class="form-label">Work Log Date</label><input class="form-control" type="date" id="report-date" required style="padding-left:16px;"></div>
        <div><label class="form-label">Hours Invested</label><input class="form-control" type="number" id="report-hours" placeholder="e.g. 8" min="0.5" max="24" step="0.5" required style="padding-left:16px;"></div>
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
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; border:2px dashed var(--border-color); border-radius:12px; padding:20px; background:rgba(8,12,20,0.3); transition:all 0.3s ease;">
          <label class="form-label" style="margin-bottom:10px;"><i class="fa-brands fa-github" style="margin-right:6px; color:var(--accent-cyan);"></i>GitHub Repository Link</label>
          <div class="input-container">
            <input class="form-control" type="url" id="report-github" placeholder="https://github.com/username/repo" style="padding-left:42px;">
            <i class="fa-brands fa-github" style="left:14px; top:50%; transform:translateY(-50%); position:absolute; color:var(--text-muted);"></i>
          </div>
          <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">Link to your day's commit or branch</p>
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
<!-- TAB 5: RESOURCE LIBRARY -->
<div id="student-resources" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>Training & Lecture Resources</h1><p>Access recorded videos, lectures, and shared slides from Staff.</p></div></div>
  <div class="resource-grid" id="student-resources-grid"></div>
</div>
<!-- TAB 6: MY EARNINGS -->
<div id="student-earnings" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>My Internship Earnings</h1><p>Track accumulated hours worked, billing rates, and historical payment receipt tokens.</p></div></div>
  <div class="earnings-grid">
    <div class="glass-card earnings-card"><h4>Total Accrued</h4><div class="amount amount-accrued" id="se-total-accrued">$0.00</div><div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;" id="se-billing-rate">Billing rate: $0.00/hr</div></div>
    <div class="glass-card earnings-card"><h4>Stipend Paid</h4><div class="amount amount-paid" id="se-total-paid">$0.00</div><div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Transferred to account</div></div>
    <div class="glass-card earnings-card"><h4>Pending Payout</h4><div class="amount amount-pending" id="se-total-pending">$0.00</div><div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">Accrued pending clearance</div></div>
  </div>
  <div class="glass-card">
    <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Payout Transactions Log</h3>
    <div class="table-responsive"><table class="custom-table"><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Ref No.</th><th>Status</th></tr></thead><tbody id="student-payouts-tbody"></tbody></table></div>
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
<!-- TAB 8: PROFILE -->
<div id="student-profile" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>My Personal Profile</h1><p>Manage contact information and verify enrolled cohort status.</p></div></div>
  <div class="profile-container">
    <div class="glass-card profile-sidebar">
      <div class="profile-avatar-large" id="sp-avatar">A</div>
      <h2 id="sp-name">Student Full Name</h2><p id="sp-role-txt">Tech X Intern</p>
      <div style="border-top:1px solid var(--border-color);padding-top:16px;margin-top:16px;text-align:left;font-size:13px;">
        <p style="margin-bottom:8px;"><strong style="color:var(--text-secondary);">University:</strong> <span id="sp-sidebar-uni">...</span></p>
        <p><strong style="color:var(--text-secondary);">Joined Date:</strong> <span id="sp-sidebar-joined">...</span></p>
      </div>
    </div>
    <div class="glass-card profile-detail-card">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;border-bottom:1px solid var(--border-color);padding-bottom:10px;">Enrolled Student Details</h3>
      <div class="profile-info-grid">
        <div class="profile-info-item"><h4>Email Address</h4><p id="sp-detail-email">...</p></div>
        <div class="profile-info-item"><h4>Phone Contact</h4><p id="sp-detail-phone">...</p></div>
        <div class="profile-info-item"><h4>Username</h4><p id="sp-detail-username">...</p></div>
        <div class="profile-info-item"><h4>Assigned Cohort</h4><p id="sp-detail-cohort">...</p></div>
      </div>
    </div>
  </div>
</div>`;

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

  document.getElementById('btn-reset-report').addEventListener('click', () => {
    ssBoxContent.style.display = 'block'; ssPreviewContainer.style.display = 'none'; ssPreviewImg.src = '';
    ssFileName.innerText = ''; ssFileName.style.display = 'none';
    const ghInput = document.getElementById('report-github');
    if (ghInput) ghInput.value = '';
  });

  document.getElementById('form-report').addEventListener('submit', (e) => {
    e.preventDefault();
    const dateVal = document.getElementById('report-date').value;
    const hoursVal = parseFloat(document.getElementById('report-hours').value);
    const summaryVal = document.getElementById('report-summary').value.trim();
    const githubLink = document.getElementById('report-github').value.trim();
    if (appState.reports.some(r => r.userId === student.id && r.date === dateVal)) { showToast(`Report for ${dateVal} already submitted.`, "error"); return; }
    const ssFile = ssInput.files[0];
    const newReport = {
      id: generateId('rep'), userId: student.id, studentName: student.fullName,
      date: dateVal, summary: summaryVal, hoursWorked: hoursVal,
      githubLink: githubLink || "",
      videoName: "", videoUrl: "",
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

  window.playResourceVideo = function(resId) {
    const resource = appState.resources.find(r => r.id === resId);
    if (!resource) return;
    showModal(resource.title, `<div class="modal-media-wrapper"><video src="${resource.url}" controls autoplay></video></div><p style="font-size:13px;color:var(--text-secondary);">${resource.description}</p>`);
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
    let sourceUrl = report.videoUrl;
    if (!sourceUrl && report.videoName) sourceUrl = sessionBlobs[report.videoName] || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    showModal(`Video Demo: ${report.videoName || 'Demo Video'}`, `<div class="modal-media-wrapper"><video src="${sourceUrl}" controls autoplay></video></div><p style="font-size:13px;color:var(--text-secondary);">${report.summary}</p>`);
  };

  document.getElementById('history-search').addEventListener('input', populateStudentHistory);
  document.getElementById('history-filter-status').addEventListener('change', populateStudentHistory);

  function populateStudentProfileData() {
    document.getElementById('sp-avatar').innerText = student.fullName.charAt(0).toUpperCase();
    document.getElementById('sp-name').innerText = student.fullName;
    document.getElementById('sp-sidebar-uni').innerText = student.university || 'N/A';
    document.getElementById('sp-sidebar-joined').innerText = student.joinedDate || 'N/A';
    document.getElementById('sp-detail-email').innerText = student.email || 'N/A';
    document.getElementById('sp-detail-phone').innerText = student.phone || 'N/A';
    document.getElementById('sp-detail-username').innerText = student.username;
    document.getElementById('sp-detail-cohort').innerText = student.cohort || 'N/A';
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
  populateStudentEarnings(); populateStudentHistory(); populateStudentProfileData();
  updateStudentMetrics();
}

// 5. MENTOR DASHBOARD
let attendanceChart = null;
let reportChart = null;

function renderMentorDashboard(container) {
  const mentor = appState.users.find(u => u.id === currentSession.currentUser.id) || currentSession.currentUser;
  const studentsOnly = appState.users.filter(u => u.role === 'student');

  container.innerHTML = `
<!-- TAB 1: ANALYTICS -->
<div id="mentor-analytics" class="dashboard-tab">
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
        <div class="form-group"><label class="form-label">Resource Link URL (Optional)</label><input class="form-control" type="url" id="res-link-input" placeholder="https://docs.google.com/..." style="padding-left:16px;"></div>
        <div class="form-group" id="res-video-upload-group"><label class="form-label">Upload Video File</label>
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
    <div class="table-responsive"><table class="custom-table"><thead><tr><th>Name</th><th>Username</th><th>Cohort</th><th>Attendance Rate</th><th>Tasks Finished</th><th>Progress Bar</th><th>Performance Grade</th></tr></thead><tbody id="mentor-students-tbody"></tbody></table></div>
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
<!-- TAB 10: MENTOR PROFILE -->
<div id="mentor-profile" class="dashboard-tab" style="display:none;">
  <div class="view-header"><div class="view-title"><h1>My Personal Profile</h1><p>Verify administrative credentials and details.</p></div></div>
  <div class="profile-container">
    <div class="glass-card profile-sidebar">
      <div class="profile-avatar-large" id="mp-avatar">M</div>
      <h2 id="mp-name">Mentor Name</h2><p id="mp-role-txt">Lead Program Director</p>
      <div style="border-top:1px solid var(--border-color);padding-top:16px;margin-top:16px;text-align:left;font-size:13px;">
        <p style="margin-bottom:8px;"><strong style="color:var(--text-secondary);">Department:</strong> <span id="mp-sidebar-dept">...</span></p>
        <p><strong style="color:var(--text-secondary);">Enrolled Date:</strong> <span id="mp-sidebar-joined">...</span></p>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div class="glass-card profile-detail-card">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;border-bottom:1px solid var(--border-color);padding-bottom:10px;">Staff Credentials</h3>
        <div class="profile-info-grid">
          <div class="profile-info-item"><h4>Email Address</h4><p id="mp-detail-email">...</p></div>
          <div class="profile-info-item"><h4>Designation</h4><p id="mp-detail-desig">...</p></div>
          <div class="profile-info-item"><h4>Username</h4><p id="mp-detail-username">...</p></div>
          <div class="profile-info-item"><h4>Admin Status</h4><p><span class="badge badge-approved">Active Administrator</span></p></div>
        </div>
      </div>

      <!-- Google Sheets Integration -->
      <div class="glass-card" style="border:1px solid rgba(16,185,129,0.2);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border-color);">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-table-cells-large" style="color:var(--success);font-size:16px;"></i>
          </div>
          <div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:2px;">Google Sheets Integration</h3>
            <p style="font-size:11px;color:var(--text-muted);">Auto-sync internship applications to your spreadsheet</p>
          </div>
          <span id="sheets-status-badge" class="badge ${appState.config.sheetsWebhook ? 'badge-approved' : 'badge-pending'}" style="margin-left:auto;">
            ${appState.config.sheetsWebhook ? '<i class="fa-solid fa-circle-check"></i> Connected' : '<i class="fa-solid fa-circle-xmark"></i> Not Connected'}
          </span>
        </div>

        <div style="font-size:12.5px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;padding:14px;background:rgba(16,185,129,0.03);border:1px solid rgba(16,185,129,0.1);border-radius:10px;">
          <strong style="color:var(--text-primary);font-size:13px;">How to connect Google Sheets:</strong><br><br>
          <strong style="color:var(--accent-cyan);">Step 1.</strong> Open <a href="https://sheets.google.com" target="_blank" style="color:var(--accent-cyan);">Google Sheets</a> → create a new spreadsheet<br>
          <strong style="color:var(--accent-cyan);">Step 2.</strong> Click <strong>Extensions → Apps Script</strong><br>
          <strong style="color:var(--accent-cyan);">Step 3.</strong> Paste this script and click <strong>Deploy → New Deployment → Web App</strong> (Anyone can access):<br><br>
          <pre id="apps-script-snippet" style="background:rgba(0,0,0,0.4);padding:12px;border-radius:8px;font-size:11px;color:#a5f3fc;overflow-x:auto;white-space:pre-wrap;line-height:1.6;">function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date","Full Name","Email","Phone","Role","University","Cohort","Resume","Portfolio","Cover Letter","Status"]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(data.appliedAt).toLocaleDateString(),
    data.fullName, data.email, data.phone, data.role,
    data.university, data.preferredCohort, data.resumeLink,
    data.portfolioLink, data.coverLetter, data.status
  ]);
  return ContentService.createTextOutput("OK");
}</pre>
          <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById('apps-script-snippet').innerText); showToast('Script copied!','success');" style="padding:6px 14px;font-size:11px;margin-top:8px;">
            <i class="fa-solid fa-copy"></i> Copy Script
          </button><br><br>
          <strong style="color:var(--accent-cyan);">Step 4.</strong> Copy the <strong>Web App URL</strong> from the deployment and paste it below.
        </div>

        <div class="form-group">
          <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;">
            <span>Google Apps Script Web App URL</span>
            <span id="webhook-validate-msg" style="font-size:10px;"></span>
          </label>
          <div class="input-container">
            <input class="form-control" type="url" id="cfg-sheets-webhook-input"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value="${appState.config.sheetsWebhook || ''}"
              style="padding-left:42px;">
            <i class="fa-solid fa-link" style="left:14px;top:50%;transform:translateY(-50%);position:absolute;color:var(--text-muted);"></i>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-primary" id="btn-save-webhook" style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 15px rgba(16,185,129,0.2);">
            <i class="fa-solid fa-plug"></i><span>Save & Connect</span>
          </button>
          <button class="btn btn-secondary" id="btn-test-webhook" style="color:var(--accent-cyan);border-color:rgba(0,242,254,0.2);">
            <i class="fa-solid fa-paper-plane"></i><span>Send Test Row</span>
          </button>
          ${appState.config.sheetsWebhook ? `<button class="btn btn-secondary" id="btn-disconnect-webhook" style="color:var(--danger);border-color:rgba(244,63,94,0.2);margin-left:auto;"><i class="fa-solid fa-plug-circle-xmark"></i><span>Disconnect</span></button>` : ''}
        </div>
      </div>
    </div>
  </div>
</div>`;

  // --- MENTOR LOGIC WIRE-UP ---
  const taskAssigneeSelect = document.getElementById('task-assignee');
  const trackerStudentSelector = document.getElementById('tracker-student-selector');
  if (taskAssigneeSelect) taskAssigneeSelect.innerHTML = studentsOnly.map(s => `<option value="${s.id}">${s.fullName} (${s.cohort || 'N/A'})</option>`).join('');
  if (trackerStudentSelector) {
    trackerStudentSelector.innerHTML = studentsOnly.map(s => `<option value="${s.id}">${s.fullName} (${s.cohort || 'N/A'})</option>`).join('');
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
    const filtered = studentsOnly.filter(s => s.fullName.toLowerCase().includes(searchQuery));
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">No matching interns found.</td></tr>`; return; }
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
      return `<tr><td><strong>${s.fullName}</strong></td><td><code>${s.username}</code></td><td>${s.cohort || 'N/A'}</td><td><strong>${attendanceRatePct}%</strong> <span style="font-size:11px;color:var(--text-muted);">(${attendedDays}/20 days)</span></td><td>${completedCount}/${totalTasks} tasks</td><td><div class="student-progress-bar-container"><div class="student-progress-bar" style="width:${completionPct}%"></div></div><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${completionPct}% Completed</div></td><td><span style="font-weight:700;color:${gradeColor}">${grade}</span></td></tr>`;
    }).join('');
  }
  document.getElementById('students-search').addEventListener('input', populateMentorStudents);

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
  if (studentsOnly.length > 0 && trackerStudentSelector) populateMentorWorkTrackerData(studentsOnly[0].id);

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
      if (file) { const objectUrl = URL.createObjectURL(file); sessionBlobs[file.name] = objectUrl; resVideoBoxContent.querySelector('span').innerText = 'Video Selected'; resVideoFileName.innerText = file.name; }
    });
  }
  document.getElementById('form-resource').addEventListener('submit', (e) => {
    e.preventDefault();
    const videoFile = resVideoFileInput ? resVideoFileInput.files[0] : null;
    const newResource = { id: generateId('res'), title: document.getElementById('res-title-input').value.trim(), type: document.getElementById('res-type-input').value, url: videoFile ? sessionBlobs[videoFile.name] : "", fileName: videoFile ? videoFile.name : "", description: document.getElementById('res-desc-input').value.trim(), linkUrl: document.getElementById('res-link-input').value.trim() || '', postedBy: mentor.fullName, postedAt: new Date().toISOString() };
    appState.resources.push(newResource); saveState();
    showToast("Training resource posted!", "success");
    document.getElementById('form-resource').reset();
    if (resVideoFileName) resVideoFileName.innerText = '';
    if (resVideoBoxContent) resVideoBoxContent.querySelector('span').innerText = 'Select mp4, webm file';
    if (resVideoGroup) resVideoGroup.style.display = 'block';
    populateMentorResources();
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
    tbody.innerHTML = studentsOnly.map(s => {
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
    document.getElementById('mp-avatar').innerText = mentor.fullName.charAt(0).toUpperCase();
    document.getElementById('mp-name').innerText = mentor.fullName;
    document.getElementById('mp-sidebar-dept').innerText = mentor.department || 'Management';
    document.getElementById('mp-sidebar-joined').innerText = mentor.joinedDate || 'N/A';
    document.getElementById('mp-detail-email').innerText = mentor.email || 'N/A';
    document.getElementById('mp-detail-desig').innerText = mentor.designation || 'Lead Mentor';
    document.getElementById('mp-detail-username').innerText = mentor.username;
  }

  function updateMentorMetrics() {
    const totalStudents = studentsOnly.length;
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
