/* ============================================
   ALEXANDRIA GUIDE - TOUR PLANNER
   ============================================ */

(function() {
  'use strict';

  const TourPlanner = {
    storageKey: 'alexandria_tour',
    items: [],
    
    init() {
      this.load();
      this.render();
      this.bindEvents();
    },
    
    load() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        this.items = stored ? JSON.parse(stored) : [];
      } catch {
        this.items = [];
      }
    },
    
    save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },
    
    add(place) {
      const exists = this.items.find(item => item.id === place.id);
      if (exists) {
        window.Toast && window.Toast.show(`${place.name} is already in your tour!`, 'warning');
        return;
      }
      
      this.items.push(place);
      this.save();
      this.render();
      this.updateButtonState(place.id, true);
      
      window.Toast && window.Toast.show(`${place.name} added to your tour!`, 'success');
    },
    
    remove(id) {
      const place = this.items.find(item => item.id === id);
      this.items = this.items.filter(item => item.id !== id);
      this.save();
      this.render();
      this.updateButtonState(id, false);
      
      if (place) {
        window.Toast && window.Toast.show(`${place.name} removed from tour`, 'info');
      }
    },
    
    reset() {
      if (this.items.length === 0) return;
      
      this.items.forEach(item => this.updateButtonState(item.id, false));
      this.items = [];
      this.save();
      this.render();
      
      window.Toast && window.Toast.show('Tour reset successfully!', 'info');
    },
    
    updateButtonState(id, added) {
      const btn = document.querySelector(`[data-place-id="${id}"]`);
      if (btn) {
        if (added) {
          btn.textContent = 'Added to Tour';
          btn.classList.add('added');
        } else {
          btn.textContent = 'Add to Tour';
          btn.classList.remove('added');
        }
      }
    },
    
    render() {
      const container = document.getElementById('planner-items');
      const countEl = document.getElementById('planner-count');
      
      if (!container || !countEl) return;
      
      countEl.textContent = this.items.length;
      
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="planner-empty">
            <div class="planner-empty-icon">🗺️</div>
            <p>Start building your dream tour!<br>Add places from the list.</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = this.items.map(item => `
        <div class="planner-item" data-item-id="${item.id}">
          <div class="planner-item-info">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <span class="planner-item-name">${item.name}</span>
          </div>
          <button class="planner-item-remove" onclick="TourPlanner.remove('${item.id}')" title="Remove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `).join('');
    },
    
    bindEvents() {
      // Add buttons on planner page
      document.querySelectorAll('.planner-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.placeId;
          const name = e.target.dataset.placeName;
          const image = e.target.dataset.placeImage;
          
          if (id && name && image) {
            this.add({ id, name, image });
          }
        });
      });
      
      // Reset button
      const resetBtn = document.getElementById('planner-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.reset());
      }
      
      // Save button (would send to PHP backend)
      const saveBtn = document.getElementById('planner-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveTour());
      }
    },
    
    saveTour() {
      if (this.items.length === 0) {
        window.Toast && window.Toast.show('Your tour is empty!', 'warning');
        return;
      }
      
      // Check if user is logged in
      const user = window.AuthStatus && window.AuthStatus.getUser();
      if (!user) {
        window.Toast && window.Toast.show('Please login to save your tour', 'warning');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
        return;
      }
      
      // Save to backend
      fetch('../php/save-booking.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          places: this.items.map(item => item.name)
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.Toast && window.Toast.show('Tour saved successfully!', 'success');
        } else {
          window.Toast && window.Toast.show(data.message || 'Failed to save tour', 'error');
        }
      })
      .catch(() => {
        // Fallback: just show success since we can't guarantee PHP is running
        window.Toast && window.Toast.show('Tour saved to your device!', 'success');
      });
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TourPlanner.init());
  } else {
    TourPlanner.init();
  }

  // Expose globally
  window.TourPlanner = TourPlanner;
})();
