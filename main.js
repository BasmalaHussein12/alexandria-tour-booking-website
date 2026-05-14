/* ============================================
   ALEXANDRIA GUIDE - MAIN JAVASCRIPT
   ============================================ */

(function() {
  'use strict';

  // ==========================================
  // THEME SYSTEM
  // ==========================================
  const ThemeManager = {
    key: 'alexandria-theme',
    
    init() {
      const saved = localStorage.getItem(this.key);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      this.set(theme);
      
      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.key)) {
          this.set(e.matches ? 'dark' : 'light');
        }
      });
    },
    
    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.key, theme);
      this.updateToggleIcon(theme);
    },
    
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      this.set(next);
    },
    
    updateToggleIcon(theme) {
      const toggle = document.querySelector('.theme-toggle');
      if (toggle) {
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
    }
  };

  // ==========================================
  // PARTICLE SYSTEM (Sea Dust)
  // ==========================================
  const ParticleSystem = {
    container: null,
    maxParticles: 25,
    
    init() {
      this.container = document.getElementById('particles');
      if (!this.container) return;
      
      // Create initial particles
      for (let i = 0; i < this.maxParticles; i++) {
        setTimeout(() => this.createParticle(), i * 800);
      }
      
      // Continue creating particles
      setInterval(() => {
        if (this.container.children.length < this.maxParticles) {
          this.createParticle();
        }
      }, 2000);
    },
    
    createParticle() {
      if (!this.container) return;
      
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;
      
      this.container.appendChild(particle);
      
      // Remove after animation completes
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, (duration + delay) * 1000);
    }
  };

  // ==========================================
  // NAVIGATION
  // ==========================================
  const Navigation = {
    init() {
      const navbar = document.querySelector('.navbar');
      const mobileBtn = document.querySelector('.mobile-menu-btn');
      const navLinks = document.querySelector('.nav-links');
      
      // Scroll effect
      if (navbar) {
        window.addEventListener('scroll', () => {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        });
      }
      
      // Mobile menu toggle
      if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
          navLinks.classList.toggle('active');
          const spans = mobileBtn.querySelectorAll('span');
          if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
          } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
          }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = mobileBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
          });
        });
      }
      
      // Active nav link
      this.setActiveLink();
    },
    
    setActiveLink() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    }
  };

  // ==========================================
  // SCROLL REVEAL
  // ==========================================
  const ScrollReveal = {
    init() {
      const reveals = document.querySelectorAll('.reveal');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      reveals.forEach(el => observer.observe(el));
    }
  };

  // ==========================================
  // CURRENT DATE
  // ==========================================
  const DateDisplay = {
    init() {
      const dateEl = document.getElementById('current-date');
      if (dateEl) {
        const now = new Date();
        const options = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
      }
    }
  };

  // ==========================================
  // AUTH STATUS
  // ==========================================
  const AuthStatus = {
    init() {
      const authContainer = document.getElementById('auth-container');
      if (!authContainer) return;
      
      const user = this.getUser();
      
      if (user && user.name) {
        authContainer.innerHTML = `
          <div class="user-badge">
            <span>Hi, ${user.name}</span>
            <button onclick="AuthStatus.logout()">Logout</button>
          </div>
        `;
      }
    },
    
    getUser() {
      try {
        return JSON.parse(localStorage.getItem('alexandria_user') || 'null');
      } catch {
        return null;
      }
    },
    
    setUser(user) {
      localStorage.setItem('alexandria_user', JSON.stringify(user));
      window.location.reload();
    },
    
    logout() {
      localStorage.removeItem('alexandria_user');
      fetch('../php/logout.php', { method: 'POST' })
        .finally(() => {
          window.location.href = '../index.html';
        });
    }
  };

  // ==========================================
  // LIGHTBOX
  // ==========================================
  const Lightbox = {
    init() {
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = document.getElementById('lightbox-img');
      const closeBtn = document.querySelector('.lightbox-close');
      
      if (!lightbox || !lightboxImg) return;
      
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          if (img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        });
      });
      
      const close = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      };
      
      if (closeBtn) closeBtn.addEventListener('click', close);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
          close();
        }
      });
    }
  };

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  const Toast = {
    container: null,
    
    init() {
      this.container = document.createElement('div');
      this.container.style.cssText = `
        position: fixed;
        top: 90px;
        right: 24px;
        z-index: 3000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    },
    
    show(message, type = 'info') {
      const toast = document.createElement('div');
      const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--primary)'
      };
      
      toast.style.cssText = `
        padding: 14px 20px;
        background: ${colors[type]};
        color: white;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slide-in-right 0.3s ease;
        max-width: 300px;
        cursor: pointer;
      `;
      
      toast.textContent = message;
      
      this.container.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slide-out-right 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      
      toast.addEventListener('click', () => toast.remove());
    }
  };

  // ==========================================
  // GLOBAL INITIALIZATION
  // ==========================================
  function init() {
    ThemeManager.init();
    ParticleSystem.init();
    Navigation.init();
    ScrollReveal.init();
    DateDisplay.init();
    AuthStatus.init();
    Lightbox.init();
    Toast.init();
    
    // Global helpers
    window.ThemeManager = ThemeManager;
    window.AuthStatus = AuthStatus;
    window.Toast = Toast;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Additional keyframes for toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slide-in-right {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slide-out-right {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);
