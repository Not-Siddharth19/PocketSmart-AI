// PocketSmart AI - Client Logic

const tokenKey = 'pocketsmart_token';

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-circle-exclamation';
  else if (type === 'info') icon = 'fa-circle-info';
  
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Theme & Customization Manager
function getSavedTheme() {
  return localStorage.getItem('pocketsmart_theme') || 'system';
}

function getSavedAccent() {
  return localStorage.getItem('pocketsmart_accent') || 'blue';
}

function getEffectiveTheme(themeSetting) {
  if (themeSetting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return themeSetting;
}

function applyTheme(themeName) {
  localStorage.setItem('pocketsmart_theme', themeName);
  const effective = getEffectiveTheme(themeName);
  document.documentElement.setAttribute('data-theme', effective);
  document.documentElement.setAttribute('data-theme-setting', themeName);
  
  // Update settings page active theme card if present
  document.querySelectorAll('.theme-card').forEach(card => {
    if (card.getAttribute('data-theme-val') === themeName) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

function applyAccent(accentName) {
  localStorage.setItem('pocketsmart_accent', accentName);
  document.documentElement.setAttribute('data-accent', accentName);

  document.querySelectorAll('.accent-btn').forEach(btn => {
    if (btn.getAttribute('data-accent-val') === accentName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function applyDisplayPreferences() {
  const reduceMotion = localStorage.getItem('pocketsmart_reduce_motion') === 'true';
  const compactMode = localStorage.getItem('pocketsmart_compact_mode') === 'true';

  if (reduceMotion) {
    document.documentElement.setAttribute('data-reduce-motion', 'true');
  } else {
    document.documentElement.removeAttribute('data-reduce-motion');
  }

  if (compactMode) {
    document.documentElement.setAttribute('data-compact', 'true');
  } else {
    document.documentElement.removeAttribute('data-compact');
  }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getSavedTheme() === 'system') {
    applyTheme('system');
  }
});

function getToken() {
  const local = localStorage.getItem(tokenKey);
  if (local) return local;
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  if (match) {
    const val = decodeURIComponent(match[2]);
    localStorage.setItem(tokenKey, val);
    return val;
  }
  return null;
}

function setToken(t) {
  if (t) {
    localStorage.setItem(tokenKey, t);
    document.cookie = `access_token=${encodeURIComponent(t)}; path=/; max-age=86400; SameSite=Lax`;
  }
}

function clearToken() {
  localStorage.removeItem(tokenKey);
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
}

// API Helper
async function api(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  options.headers = headers;

  const res = await fetch(url, options);
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // Non-JSON response
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      if (!['/login', '/register', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    const msg = data.detail || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(msg);
  }
  return data;
}

// Navbar & Auth State Management
function updateNavAuth() {
  const token = getToken();
  const navAuthBtn = document.getElementById('navAuthBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const navDashboard = document.getElementById('navDashboard');
  const navHistory = document.getElementById('navHistory');

  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });

  if (token) {
    if (navAuthBtn) navAuthBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    if (navAuthBtn) {
      navAuthBtn.style.display = 'inline-flex';
      navAuthBtn.textContent = 'Sign In';
      navAuthBtn.href = '/login';
    }
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// Provider badge styling
function renderProviderBadges(links) {
  if (!links || !links.length) return '';
  return `<div class="shopping-links-wrap">${links.map(l => {
    const prov = l.provider.toLowerCase().replace(/[^a-z0-9]/g, '');
    let icon = 'fa-arrow-up-right-from-square';
    if (prov.includes('amazon')) icon = 'fa-cart-shopping';
    else if (prov.includes('flipkart')) icon = 'fa-bag-shopping';
    else if (prov.includes('ikea')) icon = 'fa-couch';
    else if (prov.includes('swiggy') || prov.includes('zomato')) icon = 'fa-utensils';
    else if (prov.includes('tanishq') || prov.includes('caratlane') || prov.includes('bluestone')) icon = 'fa-gem';
    else if (prov.includes('oyo') || prov.includes('booking') || prov.includes('makemytrip')) icon = 'fa-hotel';
    
    return `<a class="shop-badge ${prov} default" href="${l.url}" target="_blank" rel="noopener noreferrer">
      <i class="fa-solid ${icon}"></i> ${l.provider}
    </a>`;
  }).join('')}</div>`;
}

// Result Renderers
function renderHomeResult(d) {
  const budget = Number(d.total_budget || d.budget || 0);
  const remaining = Number(d.remaining_budget || 0);

  const breakdownHTML = (d.budget_breakdown || []).map(cat => {
    const itemsHTML = (cat.items || []).map(item => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td style="color: var(--text-muted);">${item.description || ''}</td>
        <td><strong>₹${Number(item.price || item.estimated_price || 0).toLocaleString()}</strong></td>
        <td>${item.quantity || 1}</td>
        <td>${renderProviderBadges(item.shopping_links || item.links)}</td>
      </tr>
    `).join('');

    return `
      <div class="category-block">
        <div class="category-block-header">
          <h3><i class="fa-solid fa-layer-group" style="color: var(--primary);"></i> ${cat.category}</h3>
          <span class="alloc-badge">Allocation: ₹${Number(cat.allocation || 0).toLocaleString()}</span>
        </div>
        <div style="overflow-x: auto;">
          <table class="recommendations-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Shopping Links</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  const suggestionsHTML = (d.additional_suggestions || []).length ? `
    <div class="suggestions-box">
      <h4><i class="fa-solid fa-lightbulb" style="color: var(--accent-gold);"></i> Additional Suggestions</h4>
      <ul>
        ${d.additional_suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
    <div class="result-card">
      <div class="result-top-bar">
        <div>
          <h2>${d.title || 'Your Personalized Budget Plan'}</h2>
          <p style="font-size: 14px; opacity: 0.9; margin-top: 4px;">${d.summary || ''}</p>
        </div>
        <button class="btn btn-outline-white" onclick="window.print()" style="padding: 8px 18px; font-size: 13px;">
          <i class="fa-solid fa-print"></i> Print / Save
        </button>
      </div>

      <div class="budget-summary-banner">
        <div class="budget-metric">
          <span class="metric-label">Total Budget</span>
          <span class="metric-val">₹${budget.toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Estimated Allocation</span>
          <span class="metric-val">₹${Number(d.allocated_budget || d.total_estimate || (budget - remaining)).toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Remaining Buffer</span>
          <span class="metric-val green">₹${remaining.toLocaleString()}</span>
        </div>
      </div>

      <div class="category-breakdown-section">
        ${breakdownHTML}
        ${suggestionsHTML}
      </div>
    </div>
  `;
}

function renderPartyResult(d) {
  const budget = Number(d.total_budget || d.budget || 0);
  const remaining = Number(d.remaining_budget || 0);

  const breakdownHTML = (d.budget_breakdown || []).map(cat => {
    const itemsHTML = (cat.items || []).map(item => `
      <div style="padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="flex: 1; min-width: 240px;">
          <h4 style="font-size: 15px; margin-bottom: 4px;">${item.name}</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${item.description || ''}</p>
          ${renderProviderBadges(item.shopping_links || item.links)}
        </div>
        <div style="font-size: 16px; font-weight: 800; color: var(--primary-dark);">
          ₹${Number(item.estimated_price || 0).toLocaleString()}
        </div>
      </div>
    `).join('');

    return `
      <div class="category-block">
        <div class="category-block-header">
          <h3><i class="fa-solid fa-champagne-glasses" style="color: var(--accent-gold);"></i> ${cat.category}</h3>
          <span class="alloc-badge">₹${Number(cat.allocation || 0).toLocaleString()}</span>
        </div>
        <div>
          ${itemsHTML}
        </div>
      </div>
    `;
  }).join('');

  const venueHTML = (d.venue_suggestions || []).length ? `
    <div class="category-block" style="border-color: #93c5fd;">
      <div class="category-block-header" style="background: #eff6ff;">
        <h3 style="color: #1e3a8a;"><i class="fa-solid fa-location-dot" style="color: #2563eb;"></i> Venue Suggestions</h3>
      </div>
      <div style="padding: 20px;">
        ${d.venue_suggestions.map(v => `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h4 style="font-size: 16px; font-weight: 700;">${v.name}</h4>
              <p style="font-size: 13px; color: var(--text-muted);">Type: ${v.type} &bull; Capacity: ~${v.capacity} Guests</p>
            </div>
            <div>
              ${renderProviderBadges(v.shopping_links)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const calcTableHTML = (d.calculation_table_inr || d.calculation_table || []).length ? `
    <div style="margin-top: 24px;">
      <h4 style="font-family: var(--font-heading); font-size: 16px; margin-bottom: 12px;">Summary Calculation Table</h4>
      <div style="overflow-x: auto;">
        <table class="recommendations-table" style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md);">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Cost</th>
              <th>Budget Share (%)</th>
            </tr>
          </thead>
          <tbody>
            ${(d.calculation_table_inr || d.calculation_table).map(c => `
              <tr>
                <td><strong>${c.category}</strong></td>
                <td>₹${Number(c.total_cost || 0).toLocaleString()}</td>
                <td><span class="query-chip" style="background: var(--primary-light); color: var(--primary-dark); font-weight: 700;">${c.percentage_of_budget}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  ` : '';

  const suggestionsHTML = (d.additional_suggestions || []).length ? `
    <div class="suggestions-box">
      <h4><i class="fa-solid fa-lightbulb" style="color: var(--accent-gold);"></i> Additional Suggestions</h4>
      <ul>
        ${d.additional_suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
    <div class="result-card">
      <div class="result-top-bar">
        <div>
          <h2>${d.title || 'Your Party Budget Plan'}</h2>
          <p style="font-size: 14px; opacity: 0.9; margin-top: 4px;">${d.summary || ''}</p>
        </div>
        <button class="btn btn-outline-white" onclick="window.print()" style="padding: 8px 18px; font-size: 13px;">
          <i class="fa-solid fa-print"></i> Print / Save
        </button>
      </div>

      <div class="budget-summary-banner">
        <div class="budget-metric">
          <span class="metric-label">Total Budget</span>
          <span class="metric-val">₹${budget.toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Allocated Amount</span>
          <span class="metric-val">₹${Number(d.allocated_budget || d.total_estimate || (budget - remaining)).toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Remaining Buffer</span>
          <span class="metric-val green">₹${remaining.toLocaleString()}</span>
        </div>
      </div>

      <div class="category-breakdown-section">
        ${breakdownHTML}
        ${venueHTML}
        ${calcTableHTML}
        ${suggestionsHTML}
      </div>
    </div>
  `;
}

function renderJewelryResult(d) {
  const budget = Number(d.total_budget || d.budget || 0);
  const remaining = Number(d.remaining_budget || 0);

  const outfitHTML = d.outfit_analysis ? `
    <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px;">
      <h4 style="color: #9d174d; font-family: var(--font-heading); font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-shirt"></i> Outfit Analysis
      </h4>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div><strong>Colors:</strong> ${(d.outfit_analysis.colors || ['Custom']).map(c => `<span class="query-chip" style="background: #fff; color: #be185d;">${c}</span>`).join(' ')}</div>
        <div><strong>Style:</strong> <span class="query-chip" style="background: #fff; color: #be185d;">${d.outfit_analysis.style || 'Classic'}</span></div>
        <div><strong>Formality:</strong> <span class="query-chip" style="background: #fff; color: #be185d;">${d.outfit_analysis.formality || 'Festive'}</span></div>
      </div>
    </div>
  ` : '';

  // Grab items either from jewelry_recommendations or recommendations or breakdown
  let items = d.jewelry_recommendations || [];
  if (!items.length && d.budget_breakdown) {
    items = d.budget_breakdown.flatMap(b => b.items || []);
  }
  if (!items.length && d.recommendations) {
    items = d.recommendations;
  }

  const itemsGrid = items.map(item => `
    <div class="jewelry-item-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h4 style="font-size: 16px;">${item.item_type || item.name}</h4>
          <span class="price-pill">₹${Number(item.price || item.estimated_price || 0).toLocaleString()}</span>
        </div>
        <p style="font-size: 13px; color: var(--text-muted);">${item.description || item.reason || ''}</p>
        ${item.style ? `<span class="query-chip" style="margin-bottom: 10px; display: inline-block;">Style: ${item.style}</span>` : ''}
      </div>
      <div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Shop For This:</div>
        ${renderProviderBadges(item.shopping_links || item.links)}
      </div>
    </div>
  `).join('');

  const tipsHTML = (d.styling_tips || []).length ? `
    <div class="suggestions-box" style="border-left-color: #ec4899; background: #fff1f2;">
      <h4 style="color: #9f1239;"><i class="fa-solid fa-sparkles" style="color: #f43f5e;"></i> Styling Tips</h4>
      <ul>
        ${d.styling_tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
    <div class="result-card">
      <div class="result-top-bar" style="background: linear-gradient(135deg, #831843 0%, #be185d 100%);">
        <div>
          <h2>${d.title || 'Your Personalized Jewelry Recommendations'}</h2>
          <p style="font-size: 14px; opacity: 0.9; margin-top: 4px;">${d.summary || ''}</p>
        </div>
        <button class="btn btn-outline-white" onclick="window.print()" style="padding: 8px 18px; font-size: 13px;">
          <i class="fa-solid fa-print"></i> Print / Save
        </button>
      </div>

      <div class="budget-summary-banner">
        <div class="budget-metric">
          <span class="metric-label">Total Budget</span>
          <span class="metric-val">₹${budget.toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Allocated Spend</span>
          <span class="metric-val">₹${Number(d.allocated_budget || d.total_estimate || (budget - remaining)).toLocaleString()}</span>
        </div>
        <div class="budget-metric">
          <span class="metric-label">Remaining Buffer</span>
          <span class="metric-val green">₹${remaining.toLocaleString()}</span>
        </div>
      </div>

      <div class="category-breakdown-section">
        ${outfitHTML}
        <div class="jewelry-items-grid">
          ${itemsGrid}
        </div>
        ${tipsHTML}
      </div>
    </div>
  `;
}

function displayResult(category, data) {
  const container = document.getElementById('result');
  if (!container) return;
  if (category === 'home') {
    container.innerHTML = renderHomeResult(data);
  } else if (category === 'party') {
    container.innerHTML = renderPartyResult(data);
  } else if (category === 'jewelry') {
    container.innerHTML = renderJewelryResult(data);
  }
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Global Event Listeners & Page Handlers
document.addEventListener('DOMContentLoaded', async () => {
  applyDisplayPreferences();
  updateNavAuth();

  // Header quick theme toggle button
  const headerThemeToggle = document.getElementById('headerThemeToggle');
  if (headerThemeToggle) {
    headerThemeToggle.addEventListener('click', () => {
      const currentEffective = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
    });
  }

  // Protect internal routes
  const protectedPaths = ['/dashboard', '/planner/home', '/planner/party', '/planner/jewelry', '/history', '/settings'];
  const currentPath = window.location.pathname;
  if (protectedPaths.includes(currentPath) && !getToken()) {
    window.location.href = '/login';
    return;
  }

  // Logout button handler
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    clearToken();
    window.location.href = '/login';
  });

  // ==================== LOGIN FORM ====================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('loginError');
      const submitBtn = document.getElementById('loginSubmitBtn');
      if (errEl) errEl.style.display = 'none';
      
      const formData = new FormData(loginForm);
      const payload = Object.fromEntries(formData);

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

      try {
        const res = await api('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setToken(res.access_token);
        window.location.href = '/dashboard';
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Invalid username or password';
          errEl.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
      }
    });
  }

  // ==================== REGISTER FORM ====================
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('registerError');
      const submitBtn = document.getElementById('regSubmitBtn');
      if (errEl) errEl.style.display = 'none';

      const formData = new FormData(regForm);
      const payload = Object.fromEntries(formData);

      if (payload.password !== payload.confirm_password) {
        if (errEl) {
          errEl.textContent = 'Passwords do not match';
          errEl.style.display = 'block';
        }
        return;
      }
      delete payload.confirm_password;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

      try {
        await api('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // Auto login on success
        const logRes = await api('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: payload.username, password: payload.password })
        });
        setToken(logRes.access_token);
        window.location.href = '/dashboard';
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Registration failed';
          errEl.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
      }
    });
  }

  // ==================== DASHBOARD PAGE ====================
  const recentActList = document.getElementById('dashboardRecentActivity');
  if (recentActList) {
    try {
      const data = await api('/api/session-data');
      if (data.user && data.user.username) {
        const welcomeEl = document.getElementById('welcomeUser');
        if (welcomeEl) welcomeEl.textContent = `Welcome, ${data.user.username}!`;
      }

      if (data.recent_plans && data.recent_plans.length) {
        recentActList.innerHTML = data.recent_plans.map(p => {
          let icon = 'fa-couch';
          let color = '#2563eb';
          if (p.category === 'party') { icon = 'fa-champagne-glasses'; color = '#d97706'; }
          else if (p.category === 'jewelry') { icon = 'fa-gem'; color = '#db2777'; }

          const timeStr = p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

          return `
            <div class="activity-item">
              <div class="activity-info">
                <div class="activity-icon" style="color: ${color};">
                  <i class="fa-solid ${icon}"></i>
                </div>
                <div class="activity-details">
                  <h4>${p.title}</h4>
                  <span>₹${Number(p.budget || 0).toLocaleString()} &bull; ${timeStr}</span>
                </div>
              </div>
              <a class="btn btn-secondary" href="/history" style="padding: 6px 14px; font-size: 12px; border-radius: var(--radius-full);">View Details</a>
            </div>
          `;
        }).join('');
      } else {
        recentActList.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">
            <p>No plans created yet. Choose a planner above to generate your first AI budget plan!</p>
          </div>
        `;
      }
    } catch (e) {
      recentActList.innerHTML = '<div style="color: var(--text-muted); padding: 14px;">Log in to view your activity history.</div>';
    }
  }

  // ==================== HOME PLANNER FORM ====================
  const homeForm = document.getElementById('homeForm');
  if (homeForm) {
    homeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('homeError');
      const submitBtn = document.getElementById('submitHomeBtn');
      if (errEl) errEl.style.display = 'none';

      const formData = new FormData(homeForm);
      const rooms = formData.getAll('rooms');
      const payload = {
        total_budget: Number(formData.get('total_budget')),
        num_lights: Number(formData.get('num_lights')),
        num_fans: Number(formData.get('num_fans')),
        num_furniture: Number(formData.get('num_furniture')),
        num_dining_tables: Number(formData.get('num_dining_tables')),
        rooms: rooms.length ? rooms : ['Living Room'],
        additional_requirements: formData.get('additional_requirements') || ''
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Home Budget Plan...';

      try {
        const result = await api('/api/generate-home', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        displayResult('home', result);
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Failed to generate recommendations';
          errEl.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Recommendations';
      }
    });
  }

  // ==================== PARTY PLANNER FORM ====================
  const partyForm = document.getElementById('partyForm');
  if (partyForm) {
    partyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('partyError');
      const submitBtn = document.getElementById('submitPartyBtn');
      if (errEl) errEl.style.display = 'none';

      const formData = new FormData(partyForm);
      const payload = {
        total_budget: Number(formData.get('total_budget')),
        num_guests: Number(formData.get('num_guests')),
        party_type: formData.get('party_type'),
        venue_type: formData.get('venue_type'),
        needs_catering: formData.get('needs_catering') === 'true',
        needs_decoration: formData.get('needs_decoration') === 'true',
        needs_entertainment: formData.get('needs_entertainment') === 'true',
        additional_requirements: formData.get('additional_requirements') || ''
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Party Plan...';

      try {
        const result = await api('/api/generate-party', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        displayResult('party', result);
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Failed to generate party plan';
          errEl.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Budget Plan';
      }
    });
  }

  // ==================== JEWELRY PLANNER FORM & IMAGE PREVIEW ====================
  const jewelryForm = document.getElementById('jewelryForm');
  if (jewelryForm) {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('outfitImageInput');
    const previewWrap = document.getElementById('imagePreviewWrap');
    const previewImg = document.getElementById('imagePreview');
    const removeImgBtn = document.getElementById('removeImageBtn');

    dropzone?.addEventListener('click', () => fileInput.click());
    dropzone?.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary)'; });
    dropzone?.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border)'; });
    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileChange();
      }
    });

    fileInput?.addEventListener('change', handleFileChange);

    function handleFileChange() {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewWrap.style.display = 'block';
          dropzone.style.display = 'none';
        };
        reader.readAsDataURL(file);
      }
    }

    removeImgBtn?.addEventListener('click', () => {
      fileInput.value = '';
      previewImg.src = '';
      previewWrap.style.display = 'none';
      dropzone.style.display = 'block';
    });

    jewelryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('jewelryError');
      const submitBtn = document.getElementById('submitJewelryBtn');
      if (errEl) errEl.style.display = 'none';

      const formData = new FormData(jewelryForm);
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Outfit & Recommending Jewelry...';

      try {
        const result = await api('/api/generate-jewelry', {
          method: 'POST',
          body: formData
        });
        displayResult('jewelry', result);
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Failed to generate jewelry recommendations';
          errEl.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Get Recommendations';
      }
    });
  }

  // ==================== HISTORY PAGE ====================
  const historyList = document.getElementById('historyList');
  if (historyList) {
    let allHistory = [];

    async function loadHistory() {
      try {
        allHistory = await api('/api/history');
        renderHistoryList('all');
      } catch (e) {
        historyList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">Failed to load history: ${e.message}</div>`;
      }
    }

    function renderHistoryList(filter) {
      const filtered = filter === 'all' ? allHistory : allHistory.filter(h => h.category === filter);
      const countEl = document.getElementById('historyCountText');
      if (countEl) countEl.textContent = `Showing ${filtered.length} saved plan(s)`;

      if (!filtered.length) {
        historyList.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--card-bg); border-radius: var(--radius-xl); border: 1px solid var(--border);">
            <i class="fa-solid fa-folder-open" style="font-size: 40px; margin-bottom: 14px; opacity: 0.5;"></i>
            <h3>No plans found</h3>
            <p style="margin-top: 6px;">You haven't created any ${filter !== 'all' ? filter : ''} budget plans yet.</p>
          </div>
        `;
        return;
      }

      historyList.innerHTML = filtered.map(item => {
        const cat = item.category;
        const res = item.result || {};
        const query = item.query || {};
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent';
        const budget = res.total_budget || res.budget || query.budget || query.total_budget || 0;
        const remaining = res.remaining_budget || 0;

        let icon = 'fa-couch';
        let catLabel = 'Home Interior Budget';
        if (cat === 'party') { icon = 'fa-champagne-glasses'; catLabel = 'Party Planning Budget'; }
        else if (cat === 'jewelry') { icon = 'fa-gem'; catLabel = 'Jewelry Budget'; }

        // Query chips
        const chips = [];
        if (query.rooms) chips.push(`Rooms: ${Array.isArray(query.rooms) ? query.rooms.join(', ') : query.rooms}`);
        if (query.num_lights) chips.push(`Lights: ${query.num_lights}`);
        if (query.num_fans) chips.push(`Fans: ${query.num_fans}`);
        if (query.num_guests) chips.push(`Guests: ${query.num_guests}`);
        if (query.party_type) chips.push(`Type: ${query.party_type}`);
        if (query.occasion) chips.push(`Occasion: ${query.occasion}`);
        if (query.style) chips.push(`Style: ${query.style}`);
        if (query.has_image) chips.push('With outfit image: Yes');

        return `
          <div class="history-card">
            <div>
              <div class="history-card-header">
                <span class="category-tag ${cat}"><i class="fa-solid ${icon}"></i> ${catLabel}</span>
                <span class="history-time">${dateStr}</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 18px; margin-bottom: 12px;">${res.title || catLabel}</h3>
              <div class="history-metrics">
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">TOTAL BUDGET</div>
                  <div style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">₹${Number(budget).toLocaleString()}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">REMAINING</div>
                  <div style="font-size: 18px; font-weight: 800; color: var(--accent-emerald);">₹${Number(remaining).toLocaleString()}</div>
                </div>
              </div>
              <div class="history-query-tags">
                ${chips.map(c => `<span class="query-chip">${c}</span>`).join('')}
              </div>
            </div>
            <button class="btn btn-primary btn-full view-details-btn" data-id="${item.id}" style="padding: 10px; font-size: 14px;">
              <i class="fa-solid fa-eye"></i> View Full Details
            </button>
          </div>
        `;
      }).join('');

      // Attach details button click handlers
      document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number(btn.getAttribute('data-id'));
          const rec = allHistory.find(h => h.id === id);
          if (rec) openDetailModal(rec);
        });
      });
    }

    // Filter Buttons
    document.querySelectorAll('#historyFilterButtons button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#historyFilterButtons button').forEach(b => {
          b.className = 'btn btn-secondary';
        });
        btn.className = 'btn btn-primary';
        renderHistoryList(btn.getAttribute('data-filter'));
      });
    });

    loadHistory();
  }

  // Modal helpers
  const modal = document.getElementById('detailModal');
  const modalClose = document.getElementById('closeModalBtn');
  const modalBody = document.getElementById('modalBody');

  function openDetailModal(rec) {
    if (!modal || !modalBody) return;
    let html = '';
    if (rec.category === 'home') html = renderHomeResult(rec.result);
    else if (rec.category === 'party') html = renderPartyResult(rec.result);
    else if (rec.category === 'jewelry') html = renderJewelryResult(rec.result);

    modalBody.innerHTML = html;
    modal.style.display = 'flex';
  }

  modalClose?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // ==================== SETTINGS PAGE CONTROLLER ====================
  const settingsWrapper = document.querySelector('.settings-page-wrapper');
  if (settingsWrapper) {
    // 1. Tab Switching
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    const tabSections = document.querySelectorAll('.settings-section');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabSections.forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        const targetSec = document.getElementById(`tab-${targetTab}`);
        if (targetSec) targetSec.classList.add('active');
      });
    });

    // 2. Initialize Appearance Controls State
    const savedTheme = getSavedTheme();
    const savedAccent = getSavedAccent();
    
    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.getAttribute('data-theme-val') === savedTheme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-theme-val');
        applyTheme(val);
        showToast(`Theme changed to ${val.charAt(0).toUpperCase() + val.slice(1)}`, 'success');
      });
    });

    document.querySelectorAll('.accent-btn').forEach(btn => {
      if (btn.getAttribute('data-accent-val') === savedAccent) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-accent-val');
        applyAccent(val);
        showToast(`Accent color updated to ${btn.querySelector('.accent-name')?.textContent || val}`, 'success');
      });
    });

    const reduceMotionToggle = document.getElementById('reduceMotionToggle');
    if (reduceMotionToggle) {
      reduceMotionToggle.checked = localStorage.getItem('pocketsmart_reduce_motion') === 'true';
      reduceMotionToggle.addEventListener('change', (e) => {
        localStorage.setItem('pocketsmart_reduce_motion', e.target.checked);
        applyDisplayPreferences();
        showToast(e.target.checked ? 'Reduced motion enabled' : 'Motion animations enabled', 'info');
      });
    }

    const compactModeToggle = document.getElementById('compactModeToggle');
    if (compactModeToggle) {
      compactModeToggle.checked = localStorage.getItem('pocketsmart_compact_mode') === 'true';
      compactModeToggle.addEventListener('change', (e) => {
        localStorage.setItem('pocketsmart_compact_mode', e.target.checked);
        applyDisplayPreferences();
        showToast(e.target.checked ? 'Compact view enabled' : 'Comfortable view enabled', 'info');
      });
    }

    // 3. Currency & Regional Settings
    const currencySelect = document.getElementById('settingCurrency');
    const numFormatSelect = document.getElementById('settingNumberFormat');
    const defaultBudgetInput = document.getElementById('settingDefaultBudget');
    const bufferPercentSelect = document.getElementById('settingBufferPercent');

    if (currencySelect) currencySelect.value = localStorage.getItem('pocketsmart_currency') || 'INR';
    if (numFormatSelect) numFormatSelect.value = localStorage.getItem('pocketsmart_num_format') || 'lakhs';
    if (defaultBudgetInput) defaultBudgetInput.value = localStorage.getItem('pocketsmart_default_budget') || '50000';
    if (bufferPercentSelect) bufferPercentSelect.value = localStorage.getItem('pocketsmart_buffer_percent') || '10';

    document.getElementById('saveRegionalBtn')?.addEventListener('click', () => {
      if (currencySelect) localStorage.setItem('pocketsmart_currency', currencySelect.value);
      if (numFormatSelect) localStorage.setItem('pocketsmart_num_format', numFormatSelect.value);
      if (defaultBudgetInput) localStorage.setItem('pocketsmart_default_budget', defaultBudgetInput.value);
      if (bufferPercentSelect) localStorage.setItem('pocketsmart_buffer_percent', bufferPercentSelect.value);
      showToast('Regional & Currency preferences saved!', 'success');
    });

    // 4. AI & Shopping Provider Settings
    const aiModelSelect = document.getElementById('settingAiModel');
    const strictBudgetToggle = document.getElementById('strictBudgetToggle');
    const stylingTipsToggle = document.getElementById('stylingTipsToggle');

    if (aiModelSelect) aiModelSelect.value = localStorage.getItem('pocketsmart_ai_model') || 'gemini-2.5-flash';
    if (strictBudgetToggle) strictBudgetToggle.checked = localStorage.getItem('pocketsmart_strict_budget') !== 'false';
    if (stylingTipsToggle) stylingTipsToggle.checked = localStorage.getItem('pocketsmart_styling_tips') !== 'false';

    const providerCheckboxes = {
      'provAmazon': 'pocketsmart_prov_amazon',
      'provFlipkart': 'pocketsmart_prov_flipkart',
      'provIkea': 'pocketsmart_prov_ikea',
      'provSwiggy': 'pocketsmart_prov_swiggy',
      'provTanishq': 'pocketsmart_prov_tanishq',
      'provBluestone': 'pocketsmart_prov_bluestone'
    };

    Object.entries(providerCheckboxes).forEach(([elemId, storageKey]) => {
      const el = document.getElementById(elemId);
      if (el) el.checked = localStorage.getItem(storageKey) !== 'false';
    });

    document.getElementById('saveAiSettingsBtn')?.addEventListener('click', () => {
      if (aiModelSelect) localStorage.setItem('pocketsmart_ai_model', aiModelSelect.value);
      if (strictBudgetToggle) localStorage.setItem('pocketsmart_strict_budget', strictBudgetToggle.checked);
      if (stylingTipsToggle) localStorage.setItem('pocketsmart_styling_tips', stylingTipsToggle.checked);

      Object.entries(providerCheckboxes).forEach(([elemId, storageKey]) => {
        const el = document.getElementById(elemId);
        if (el) localStorage.setItem(storageKey, el.checked);
      });
      showToast('AI Model and Shopping Store settings saved!', 'success');
    });

    // 5. Load User Profile
    async function loadUserProfile() {
      try {
        const user = await api('/api/auth/me');
        const usernameEl = document.getElementById('settingsUsername');
        const profUsername = document.getElementById('profileUsername');
        const profEmail = document.getElementById('profileEmail');
        const profUserId = document.getElementById('profileUserId');
        const profMember = document.getElementById('profileMemberSince');

        if (usernameEl) usernameEl.textContent = user.username;
        if (profUsername) profUsername.textContent = user.username;
        if (profEmail) profEmail.textContent = user.email;
        if (profUserId) profUserId.textContent = `#${user.id}`;
        if (profMember) {
          profMember.textContent = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active';
        }
      } catch (e) {
        const usernameEl = document.getElementById('settingsUsername');
        if (usernameEl) usernameEl.textContent = 'User Profile';
      }
    }
    loadUserProfile();

    // 6. Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('changePasswordError');
        const succEl = document.getElementById('changePasswordSuccess');
        const submitBtn = document.getElementById('changePasswordBtn');

        if (errEl) errEl.style.display = 'none';
        if (succEl) succEl.style.display = 'none';

        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        if (newPass !== confirmPass) {
          if (errEl) {
            errEl.textContent = 'New passwords do not match';
            errEl.style.display = 'block';
          }
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

        try {
          await api('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password: currentPass, new_password: newPass })
          });
          if (succEl) {
            succEl.textContent = 'Password updated successfully!';
            succEl.style.display = 'block';
          }
          changePasswordForm.reset();
          showToast('Password updated successfully!', 'success');
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || 'Failed to update password';
            errEl.style.display = 'block';
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Update Password';
        }
      });
    }

    // 7. Data Management (Export & Clear History)
    document.getElementById('exportHistoryBtn')?.addEventListener('click', async () => {
      try {
        const exportData = await api('/api/history/export');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `pocketsmart_budget_history_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Budget history exported successfully!', 'success');
      } catch (err) {
        showToast(`Export failed: ${err.message}`, 'error');
      }
    });

    document.getElementById('clearHistoryBtn')?.addEventListener('click', async () => {
      if (confirm("Are you sure you want to delete all your recommendation history? This action cannot be undone.")) {
        try {
          await api('/api/history/clear', { method: 'POST' });
          showToast('Recommendation history cleared successfully!', 'success');
        } catch (err) {
          showToast(`Failed to clear history: ${err.message}`, 'error');
        }
      }
    });

    document.getElementById('resetDefaultsBtn')?.addEventListener('click', () => {
      if (confirm("Reset all local preferences (theme, currency, AI stores) to default?")) {
        localStorage.removeItem('pocketsmart_theme');
        localStorage.removeItem('pocketsmart_accent');
        localStorage.removeItem('pocketsmart_reduce_motion');
        localStorage.removeItem('pocketsmart_compact_mode');
        localStorage.removeItem('pocketsmart_currency');
        localStorage.removeItem('pocketsmart_num_format');
        localStorage.removeItem('pocketsmart_default_budget');
        localStorage.removeItem('pocketsmart_buffer_percent');
        localStorage.removeItem('pocketsmart_ai_model');
        localStorage.removeItem('pocketsmart_strict_budget');
        localStorage.removeItem('pocketsmart_styling_tips');
        applyTheme('system');
        applyAccent('blue');
        applyDisplayPreferences();
        showToast('All preferences reset to defaults!', 'info');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }
});

