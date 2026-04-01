/**
 * Rwanda SkillsConnect — Mobile Navigation & UX Utilities
 * Injects bottom nav, handles sidebar toggle, chat mobile UX
 * No business logic — pure UI enhancement
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  const NAV_CONFIGS = {
    worker: [
      { href: 'freelancer-dashboard.html', icon: 'fa-tachometer-alt', label: 'Home' },
      { href: 'find-jobs.html',            icon: 'fa-search',         label: 'Jobs' },
      { href: 'messages.html',             icon: 'fa-comments',       label: 'Messages', badge: 'msgBadge' },
      { href: 'wallet.html',               icon: 'fa-wallet',         label: 'Wallet' },
      { href: 'profile.html',              icon: 'fa-user',           label: 'Profile' },
    ],
    employer: [
      { href: 'employer-dashboard.html',   icon: 'fa-tachometer-alt', label: 'Home' },
      { href: 'find-workers.html',         icon: 'fa-search',         label: 'Workers' },
      { href: 'messages.html',             icon: 'fa-comments',       label: 'Messages', badge: 'msgBadge' },
      { href: 'wallet.html',               icon: 'fa-wallet',         label: 'Wallet' },
      { href: 'profile.html',              icon: 'fa-building',       label: 'Profile' },
    ],
    admin: [
      { href: 'admin-dashboard.html',      icon: 'fa-tachometer-alt', label: 'Dashboard' },
      { href: 'admin-dashboard.html',      icon: 'fa-users',          label: 'Users',    section: 'users-all' },
      { href: 'admin-dashboard.html',      icon: 'fa-briefcase',      label: 'Jobs',     section: 'jobs' },
      { href: 'admin-dashboard.html',      icon: 'fa-exchange-alt',   label: 'Finance',  section: 'transactions' },
      { href: 'admin-dashboard.html',      icon: 'fa-chart-bar',      label: 'Analytics',section: 'analytics' },
    ],
  };

  /* ── Detect current page role ───────────────────────────── */
  function detectRole() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || '';
    if (page.startsWith('admin')) return 'admin';
    if (page.startsWith('employer') || page === 'post-job.html' ||
        page === 'find-workers.html' || page === 'job-applications.html') return 'employer';
    return 'worker';
  }

  /* ── Detect active nav item ─────────────────────────────── */
  function isActive(href) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    return href === current || href.split('?')[0] === current;
  }

  /* ── Build bottom nav HTML ──────────────────────────────── */
  function buildBottomNav(role) {
    const items = NAV_CONFIGS[role] || NAV_CONFIGS.worker;
    const itemsHtml = items.map(item => {
      const active = isActive(item.href) ? 'active' : '';
      const sectionAttr = item.section ? `data-section="${item.section}"` : '';
      return `
        <a href="${item.href}" class="nav-item-btn ${active}" ${sectionAttr} aria-label="${item.label}">
          <i class="fas ${item.icon}"></i>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge" id="bottomNav_${item.badge}" style="display:none;"></span>` : ''}
        </a>`;
    }).join('');

    return `
      <nav class="mobile-bottom-nav" id="mobileBottomNav" role="navigation" aria-label="Mobile navigation">
        <div class="nav-items">${itemsHtml}</div>
      </nav>`;
  }

  /* ── Inject bottom nav ──────────────────────────────────── */
  function injectBottomNav() {
    if (document.getElementById('mobileBottomNav')) return;
    // Don't inject on login/register/landing pages
    const page = window.location.pathname.split('/').pop() || '';
    const excluded = ['index.html', 'login.html', 'register.html', 'signup.html',
                      'forgot-password.html', 'reset-password.html', 'otp-verify.html',
                      'otp-verification.html', 'role-selection.html', 'email-confirmation.html',
                      'auth-callback.html', ''];
    if (excluded.includes(page)) return;

    const role = detectRole();
    document.body.insertAdjacentHTML('beforeend', buildBottomNav(role));
    document.body.classList.add('has-bottom-nav');

    // Wire admin section shortcuts
    document.querySelectorAll('#mobileBottomNav [data-section]').forEach(btn => {
      btn.addEventListener('click', e => {
        const section = btn.dataset.section;
        if (section && typeof window.showSection === 'function') {
          e.preventDefault();
          window.showSection(section);
        }
      });
    });
  }

  /* ── Sync notification badge to bottom nav ──────────────── */
  function syncNotifBadge() {
    // Watch for changes to the existing nav badge and mirror to bottom nav
    const sourceIds = ['notifBadgeNav', 'notifBadgeSidebar'];
    sourceIds.forEach(id => {
      const source = document.getElementById(id);
      if (!source) return;
      const observer = new MutationObserver(() => {
        const bottomBadge = document.getElementById('bottomNav_msgBadge');
        if (bottomBadge) {
          bottomBadge.textContent = source.textContent;
          bottomBadge.style.display = source.style.display;
        }
      });
      observer.observe(source, { childList: true, characterData: true, subtree: true, attributes: true });
    });
  }

  /* ── Sidebar toggle wiring ──────────────────────────────── */
  function wireSidebarToggle() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebarOverlay');
    const toggle   = document.getElementById('mobileToggle');
    const collapse = document.getElementById('sidebarCollapse');

    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.add('show');
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (toggle) toggle.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Collapse toggle (desktop)
    if (collapse) {
      collapse.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = collapse.querySelector('i');
        if (icon) {
          icon.className = sidebar.classList.contains('collapsed')
            ? 'fas fa-chevron-right'
            : 'fas fa-chevron-left';
        }
        // Adjust main content margin
        const main = document.querySelector('.main-content');
        if (main && window.innerWidth > 992) {
          main.style.marginLeft = sidebar.classList.contains('collapsed') ? '72px' : '';
        }
      });
    }

    // Close sidebar when a menu item is clicked on mobile
    sidebar.querySelectorAll('.menu-item, .sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 992) closeSidebar();
      });
    });
  }

  /* ── Chat mobile panel toggle ───────────────────────────── */
  function wireChatMobile() {
    const convList = document.getElementById('convList');
    const chatPanel = document.getElementById('chatPanel');
    const convAside = document.querySelector('.chat-layout > aside');
    if (!convList || !chatPanel || !convAside) return;

    // Inject back button into chat header
    const chatHeader = chatPanel.querySelector('.bg-white.border-b');
    if (chatHeader && !chatHeader.querySelector('.chat-back-btn')) {
      const backBtn = document.createElement('button');
      backBtn.className = 'chat-back-btn';
      backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      backBtn.setAttribute('aria-label', 'Back to conversations');
      backBtn.addEventListener('click', () => {
        convAside.classList.remove('chat-hidden');
        chatPanel.classList.add('hidden');
      });
      chatHeader.insertBefore(backBtn, chatHeader.firstChild);
    }

    // When a conversation is opened on mobile, hide the list
    const origOpenConv = window.openConversation;
    if (typeof origOpenConv === 'function') {
      window.openConversation = function (convId) {
        origOpenConv(convId);
        if (window.innerWidth <= 768) {
          convAside.classList.add('chat-hidden');
        }
      };
    }
  }

  /* ── Wallet sidebar toggle ──────────────────────────────── */
  function wireWalletSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !sidebar.classList.contains('sidebar')) return;
    // Wallet page uses nav.sidebar — handled by wireSidebarToggle
    // Add mobile toggle button if missing
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    if (!document.getElementById('mobileToggle')) {
      const btn = document.createElement('button');
      btn.id = 'mobileToggle';
      btn.className = 'mobile-toggle';
      btn.innerHTML = '<i class="fas fa-bars"></i>';
      btn.setAttribute('aria-label', 'Open menu');
      const header = mainContent.querySelector('.d-flex.justify-content-between');
      if (header) header.prepend(btn);
    }
  }

  /* ── Responsive table labels ────────────────────────────── */
  function addTableLabels() {
    document.querySelectorAll('.table-responsive table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      table.querySelectorAll('tbody tr').forEach(row => {
        Array.from(row.querySelectorAll('td')).forEach((td, i) => {
          if (headers[i] && !td.dataset.label) {
            td.dataset.label = headers[i];
          }
        });
      });
    });
  }

  /* ── Observe DOM for dynamic table rows ─────────────────── */
  function observeTables() {
    const observer = new MutationObserver(() => addTableLabels());
    document.querySelectorAll('tbody').forEach(tbody => {
      observer.observe(tbody, { childList: true });
    });
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    injectBottomNav();
    wireSidebarToggle();
    wireChatMobile();
    wireWalletSidebar();
    addTableLabels();
    observeTables();
    syncNotifBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on resize (e.g., orientation change)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && window.innerWidth > 992) {
        sidebar.classList.remove('show');
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    }, 150);
  });

})();
