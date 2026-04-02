/**
 * Rwanda SkillsConnect — Mobile Navigation & UX Utilities
 */
(function () {
  'use strict';

  /* ── Bottom nav config ───────────────────────────────────── */
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
      { href: 'admin-dashboard.html',      icon: 'fa-users',          label: 'Users',     section: 'users-all' },
      { href: 'admin-dashboard.html',      icon: 'fa-briefcase',      label: 'Jobs',      section: 'jobs' },
      { href: 'admin-dashboard.html',      icon: 'fa-exchange-alt',   label: 'Finance',   section: 'transactions' },
      { href: 'admin-dashboard.html',      icon: 'fa-chart-bar',      label: 'Analytics', section: 'analytics' },
    ],
  };

  /* ── Helpers ─────────────────────────────────────────────── */
  function detectRole() {
    const page = window.location.pathname.split('/').pop() || '';
    if (page.startsWith('admin')) return 'admin';
    if (page.startsWith('employer') || page === 'post-job.html' ||
        page === 'find-workers.html' || page === 'job-applications.html') return 'employer';
    return 'worker';
  }

  function isActive(href) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    return href === current || href.split('?')[0] === current;
  }

  /* ── Bottom nav ──────────────────────────────────────────── */
  function buildBottomNav(role) {
    const items = NAV_CONFIGS[role] || NAV_CONFIGS.worker;
    const html = items.map(item => {
      const active      = isActive(item.href) ? 'active' : '';
      const sectionAttr = item.section ? 'data-section="' + item.section + '"' : '';
      const badge       = item.badge
        ? '<span class="nav-badge" id="bottomNav_' + item.badge + '" style="display:none;"></span>'
        : '';
      return '<a href="' + item.href + '" class="nav-item-btn ' + active + '" ' + sectionAttr + ' aria-label="' + item.label + '">'
           + '<i class="fas ' + item.icon + '"></i>'
           + '<span>' + item.label + '</span>'
           + badge
           + '</a>';
    }).join('');
    return '<nav class="mobile-bottom-nav" id="mobileBottomNav" role="navigation" aria-label="Mobile navigation">'
         + '<div class="nav-items">' + html + '</div></nav>';
  }

  function injectBottomNav() {
    if (document.getElementById('mobileBottomNav')) return;
    const page = window.location.pathname.split('/').pop() || '';
    const excluded = ['index.html','login.html','register.html','signup.html',
                      'forgot-password.html','reset-password.html','otp-verify.html',
                      'otp-verification.html','role-selection.html','email-confirmation.html',
                      'auth-callback.html','messages.html',''];
    if (excluded.includes(page)) return;

    document.body.insertAdjacentHTML('beforeend', buildBottomNav(detectRole()));

    document.querySelectorAll('#mobileBottomNav [data-section]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var section = btn.dataset.section;
        if (section && typeof window.showSection === 'function') {
          e.preventDefault();
          window.showSection(section);
        }
      });
    });
  }

  /* ── Notification badge sync ─────────────────────────────── */
  function syncNotifBadge() {
    ['notifBadgeNav', 'notifBadgeSidebar'].forEach(function(id) {
      var source = document.getElementById(id);
      if (!source) return;
      new MutationObserver(function() {
        var bottomBadge = document.getElementById('bottomNav_msgBadge');
        if (bottomBadge) {
          bottomBadge.textContent = source.textContent;
          bottomBadge.style.display = source.style.display;
        }
      }).observe(source, { childList: true, characterData: true, subtree: true, attributes: true });
    });
  }

  /* ── Sidebar collapse/expand (chevron button) ────────────── */
  function wireSidebarToggle() {
    var sidebar  = document.getElementById('sidebar');
    var overlay  = document.getElementById('sidebarOverlay');
    var toggle   = document.getElementById('mobileToggle');   // hamburger
    var collapse = document.getElementById('sidebarCollapse'); // chevron

    if (!sidebar) return;

    /* helpers */
    function updateCollapseIcon() {
      if (!collapse) return;
      var icon = collapse.querySelector('i');
      if (!icon) return;
      if (window.innerWidth <= 992) {
        // on mobile the chevron is a close (X) button — show left arrow
        icon.className = 'fas fa-chevron-left';
      } else {
        // on desktop show direction matching sidebar state
        icon.className = sidebar.classList.contains('collapsed')
          ? 'fas fa-chevron-right'
          : 'fas fa-chevron-left';
      }
    }

    function updateMainMargin() {
      if (window.innerWidth <= 992) return;
      var main = document.querySelector('.main-content');
      if (main) main.style.marginLeft = sidebar.classList.contains('collapsed') ? '72px' : '';
    }

    function openSidebar() {
      sidebar.classList.add('show');
      sidebar.classList.remove('collapsed');
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      updateCollapseIcon();
    }

    function closeSidebar() {
      sidebar.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
      updateCollapseIcon();
    }

    /* hamburger — open on mobile */
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        openSidebar();
      });
    }

    /* overlay backdrop — close */
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    /* chevron button */
    if (collapse) {
      // Remove any previously attached listeners by cloning the node
      var freshCollapse = collapse.cloneNode(true);
      collapse.parentNode.replaceChild(freshCollapse, collapse);
      collapse = freshCollapse;

      collapse.addEventListener('click', function(e) {
        e.stopPropagation();

        if (window.innerWidth <= 992) {
          /* mobile: chevron = close sidebar */
          closeSidebar();
        } else {
          /* desktop: chevron = collapse / expand */
          sidebar.classList.toggle('collapsed');
          updateCollapseIcon();
          updateMainMargin();
        }
      });
    }

    /* close when a menu link is tapped on mobile */
    sidebar.querySelectorAll('.menu-item, .sidebar-item').forEach(function(item) {
      item.addEventListener('click', function() {
        if (window.innerWidth <= 992) closeSidebar();
      });
    });

    /* set correct icon on load */
    updateCollapseIcon();
    updateMainMargin();
  }

  /* ── Chat mobile panel ───────────────────────────────────── */
  function wireChatMobile() {
    var convList  = document.getElementById('convList');
    var chatPanel = document.getElementById('chatPanel');
    var convAside = document.querySelector('.chat-layout > aside');
    if (!convList || !chatPanel || !convAside) return;

    var chatHeader = chatPanel.querySelector('.bg-white.border-b');
    if (chatHeader && !chatHeader.querySelector('.chat-back-btn')) {
      var backBtn = document.createElement('button');
      backBtn.className = 'chat-back-btn';
      backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      backBtn.setAttribute('aria-label', 'Back to conversations');
      backBtn.addEventListener('click', function() {
        convAside.classList.remove('chat-hidden');
        chatPanel.classList.add('hidden');
      });
      chatHeader.insertBefore(backBtn, chatHeader.firstChild);
    }

    var origOpenConv = window.openConversation;
    if (typeof origOpenConv === 'function') {
      window.openConversation = function(convId) {
        origOpenConv(convId);
        if (window.innerWidth <= 768) convAside.classList.add('chat-hidden');
      };
    }
  }

  /* ── Responsive table labels ─────────────────────────────── */
  function addTableLabels() {
    document.querySelectorAll('.table-responsive table').forEach(function(table) {
      var headers = Array.from(table.querySelectorAll('thead th')).map(function(th) {
        return th.textContent.trim();
      });
      table.querySelectorAll('tbody tr').forEach(function(row) {
        Array.from(row.querySelectorAll('td')).forEach(function(td, i) {
          if (headers[i] && !td.dataset.label) td.dataset.label = headers[i];
        });
      });
    });
  }

  function observeTables() {
    var observer = new MutationObserver(addTableLabels);
    document.querySelectorAll('tbody').forEach(function(tbody) {
      observer.observe(tbody, { childList: true });
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    injectBottomNav();
    wireSidebarToggle();
    wireChatMobile();
    addTableLabels();
    observeTables();
    syncNotifBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* re-evaluate icon/margin on orientation change */
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var sidebar = document.getElementById('sidebar');
      if (!sidebar) return;
      if (window.innerWidth > 992) {
        sidebar.classList.remove('show');
        var overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
      /* re-sync icon */
      var collapse = document.getElementById('sidebarCollapse');
      if (collapse) {
        var icon = collapse.querySelector('i');
        if (icon) {
          icon.className = (window.innerWidth <= 992 || !sidebar.classList.contains('collapsed'))
            ? 'fas fa-chevron-left'
            : 'fas fa-chevron-right';
        }
      }
    }, 150);
  });

})();
