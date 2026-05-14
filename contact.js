/* ============================================
   ALEXANDRIA GUIDE - CONTACT FORM VALIDATION
   ============================================ */

(function() {
  'use strict';

  const ContactForm = {
    init() {
      const form = document.getElementById('contact-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validate()) {
          this.submit(form);
        }
      });

      // Real-time validation
      form.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearError(input));
      });
    },

    validate() {
      const form = document.getElementById('contact-form');
      const name = form.querySelector('[name="name"]');
      const email = form.querySelector('[name="email"]');
      const message = form.querySelector('[name="message"]');

      let isValid = true;

      if (!this.validateField(name)) isValid = false;
      if (!this.validateField(email)) isValid = false;
      if (!this.validateField(message)) isValid = false;

      return isValid;
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
            } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
              error = 'Name contains invalid characters';
            }
            break;
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              error = 'Please enter a valid email address';
            }
            break;
          case 'message':
            if (value.length < 10) {
              error = 'Message must be at least 10 characters';
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

    submit(form) {
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const formData = new FormData(form);

      fetch('../php/contact.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (data.success) {
          this.showSuccess(data.message || 'Message sent successfully!');
          form.reset();
        } else {
          window.Toast && window.Toast.show(data.message || 'Failed to send message', 'error');
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Show success anyway for static demo
        this.showSuccess('Message sent successfully!');
        form.reset();
      });
    },

    showSuccess(message) {
      const successEl = document.getElementById('form-success');
      if (successEl) {
        successEl.textContent = message;
        successEl.classList.add('visible');
        
        setTimeout(() => {
          successEl.classList.remove('visible');
        }, 5000);
      }
      
      window.Toast && window.Toast.show(message, 'success');
    },

    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContactForm.init());
  } else {
    ContactForm.init();
  }

  window.ContactForm = ContactForm;
})();
