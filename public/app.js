// app.js - client-side interactions
document.addEventListener('DOMContentLoaded', () => {
  // Apply form
  const applyForm = document.getElementById('apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(applyForm);
      const data = {
        name: f.get('name'),
        email: f.get('email'),
        netWorthRange: f.get('netWorthRange'),
        interests: f.get('interests'),
        note: f.get('note')
      };
      const feedback = document.getElementById('apply-feedback');
      feedback.innerText = 'Submitting with discretion…';
      try {
        const r = await fetch('/api/apply', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        });
        const j = await r.json();
        if (j.ok) {
          feedback.innerText = j.message;
          applyForm.reset();
        } else {
          feedback.innerText = j.error || 'Submission failed';
        }
      } catch (err) {
        feedback.innerText = 'Network error — try again quietly.';
      }
    });
  }
  // AI ping
  const aiPing = document.getElementById('ai-ping');
  if (aiPing) {
    aiPing.addEventListener('click', async () => {
      const result = document.getElementById('ai-result');
      result.innerText = 'Requesting intelligence…';
      try {
        const r = await fetch('/api/ai-signal');
        const j = await r.json();
        result.innerHTML = `<strong>${j.signal}</strong><div class="muted small">${j.whisper}</div>`;
      } catch (e) {
        result.innerText = 'Unable to fetch intelligence.';
      }
    });
  }
  // Subscription selection (mock)
  const tierButtons = [...document.querySelectorAll('.tier-choose')];
  tierButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const tier = btn.getAttribute('data-tier');
      const name = prompt('Name for subscription (demo):');
      const email = prompt('Email for subscription (demo):');
      if (!name || !email) return alert('Name & email required (demo).');
      try {
        const r = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, email, tier })
        });
        const j = await r.json();
        if (j.ok) {
          alert(j.message + '\n(This is a mocked flow; integrate Stripe for live payments.)');
        } else {
          alert('Subscription failed: ' + (j.error || 'unknown'));
        }
      } catch (err) {
        alert('Network error - try again.');
      }
    });
  });
  // Simple login (demo)
  const loginForm = document.querySelector('#login-form');
  if (loginForm){
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[name=email]').value;
      const r = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const j = await r.json();
      if (j.ok && j.redirect) {
        window.location = j.redirect;
      } else {
        alert('Login failed (demo).');
      }
    });
  }
});
