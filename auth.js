/* ============================================
   ALEXANDRIA GUIDE - AUTH FORMS
   ============================================ */

(function() {
  'use strict';

  const AuthForms = {
    init() {
      this.initRegister();
      this.initLogin();
    },

    initRegister() {
      const form = document.getElementById('register-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateRegister()) {
          this.submitRegister(form);
        }
      });

      form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearError(input));
      });
    },

    initLogin() {
      const form = document.getElementById('login-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateLogin()) {
          this.submitLogin(form);
        }
      });

      form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearError(input));
      });
    },

    validateField(field) {
      const value = field.value.trim();
      const name = field.getAttribute('name');
      let error = '';

      if (!value) {
        error = `${this.capitalize(name)} is required`;
      } else {
        switch (name) {
          case 'name':
            if (value.length < 2) {
              error = 'Name must be at least 2 characters';
            }
            break;
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              error = 'Please enter a valid email address';
            }
            break;
          case 'password':
            if (value.length < 6) {
              error = 'Password must be at least 6 characters';
            }
            break;
        }
      }

      const errorEl = field.parentElement.querySelector('.form-error');
      if (error) {
        if (errorEl) {
          errorEl.textContent = error;
          errorEl.classList.add('visible');
        }
        field.style.borderColor = 'var(--error)';
        return false;
      } else {
        if (errorEl) {
          errorEl.classList.remove('visible');
        }
        field.style.borderColor = '';
        return true;
      }
    },

    clearError(field) {
      const errorEl = field.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.classList.remove('visible');
      }
      field.style.borderColor = '';
    },

    validateRegister() {
      const form = document.getElementById('register-form');
      let isValid = true;
      ['name', 'email', 'password'].forEach(name => {
        const field = form.querySelector(`[name="${name}"]`);
        if (!this.validateField(field)) isValid = false;
      });
      return isValid;
    },

    validateLogin() {
      const form = document.getElementById('login-form');
      let isValid = true;
      ['email', 'password'].forEach(name => {
        const field = form.querySelector(`[name="${name}"]`);
        if (!this.validateField(field)) isValid = false;
      });
      return isValid;
    },

    submitRegister(form) {
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';

      const formData = new FormData(form);

      fetch('../php/register.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (data.success) {
          window.Toast && window.Toast.show('Account created successfully!', 'success');
          if (data.user) {
            window.AuthStatus && window.AuthStatus.setUser(data.user);
          }
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 1000);
        } else {
          window.Toast && window.Toast.show(data.message || 'Registration failed', 'error');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Demo fallback
        const name = formData.get('name');
        const email = formData.get('email');
        window.AuthStatus && window.AuthStatus.setUser({ id: 1, name, email });
      });
    },

    submitLogin(form) {
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      const formData = new FormData(form);

      fetch('../php/login.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (data.success) {
          window.Toast && window.Toast.show('Welcome back!', 'success');
          if (data.user) {
            window.AuthStatus && window.AuthStatus.setUser(data.user);
          }
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 500);
        } else {
          window.Toast && window.Toast.show(data.message || 'Login failed', 'error');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Demo fallback
        const email = formData.get('email');
        window.AuthStatus && window.AuthStatus.setUser({ id: 1, name: email.split('@')[0], email });
      });
    },

    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthForms.init());
  } else {
    AuthForms.init();
  }

  window.AuthForms = AuthForms;
})();
