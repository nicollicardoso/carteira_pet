const API = '/api';

function toast(msg, ok = true) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '30px', right: '30px',
    background: ok ? '#12922c' : '#e53935',
    color: 'white', padding: '16px 26px',
    borderRadius: '14px', fontSize: '16px',
    fontFamily: 'Poppins,sans-serif',
    boxShadow: '0 5px 20px rgba(0,0,0,.2)',
    zIndex: '9999', opacity: '1', transition: 'opacity .4s'
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
}

async function post(url, body) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { ok: res.ok, data: await res.json() };
}

async function put(url, body) {
  const res = await fetch(API + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { ok: res.ok, data: await res.json() };
}

async function get(url) {
  const res = await fetch(API + url);
  return { ok: res.ok, data: await res.json() };
}
