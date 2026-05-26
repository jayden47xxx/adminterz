const STATE = {
  points: 2450,
  adsWatched: 4,
  adsLimit: 10,
  totalEarned: 12450,
  totalWithdrawn: 9.50,
  referrals: 3,
  plan: 'Starter',
  transactions: [
    { type:'earn',    label:'Ad watched — 5 pts',               date:'Today 14:32',  display:'+5 pts'    },
    { type:'earn',    label:'Ad watched — 5 pts',               date:'Today 13:10',  display:'+5 pts'    },
    { type:'withdraw',label:'Withdrawal — USDT (approved)',     date:'22/05/2026',   display:'-$5.00'    },
    { type:'earn',    label:'Referral bonus',                    date:'20/05/2026',   display:'+500 pts'  },
    { type:'withdraw',label:'Withdrawal — USDT (approved)',     date:'10/05/2026',   display:'-$5.00'    },
  ]
};

const POINT_VALUE = 0.001;

function pts(p)  { return p.toLocaleString() + ' pts'; }
function usd(p)  { return '$' + (p * POINT_VALUE).toFixed(2); }

function renderHome() {
  document.getElementById('bal-points').textContent        = pts(STATE.points);
  document.getElementById('bal-usd').textContent           = usd(STATE.points);
  document.getElementById('ads-watched').textContent       = STATE.adsWatched;
  document.getElementById('total-earned-pts').textContent  = pts(STATE.totalEarned);
  document.getElementById('total-withdrawn-usd').textContent = '$' + STATE.totalWithdrawn.toFixed(2);
  document.getElementById('referral-count').textContent    = STATE.referrals;
  if (document.getElementById('referral-count-card')) {
    document.getElementById('referral-count-card').textContent = STATE.referrals;
  }

  const pct = (STATE.adsWatched / STATE.adsLimit) * 100;
  document.getElementById('watch-progress').style.width    = Math.min(pct, 100) + '%';
  document.getElementById('watch-count-label').textContent = STATE.adsWatched + ' / ' + STATE.adsLimit + ' today';

  const btn = document.getElementById('watch-btn');
  if (STATE.adsWatched >= STATE.adsLimit) {
    btn.disabled  = true;
    btn.innerHTML = '<i class="ti ti-check"></i> Daily limit reached';
  } else {
    btn.disabled  = false;
    btn.innerHTML = '<i class="ti ti-player-play"></i> Watch Ad — Earn 5 pts';
  }

  renderTxList();
}

function renderTxList() {
  const el = document.getElementById('tx-list');
  if (!el) return;
  if (!STATE.transactions.length) {
    el.innerHTML = '<div style="text-align:center;padding:28px 0;font-size:13px;color:var(--muted)">No transactions yet</div>';
    return;
  }
  el.innerHTML = STATE.transactions.slice().reverse().slice(0, 5).map(tx => `
    <div class="tx-item">
      <div class="tx-left">
        <div class="tx-icon" style="background:${tx.type === 'earn' ? 'rgba(16,185,129,0.12)' : 'rgba(14,165,233,0.12)'}">
          <i class="ti ${tx.type === 'earn' ? 'ti-eye' : 'ti-arrow-up'}"
             style="font-size:16px;color:${tx.type === 'earn' ? 'var(--mint2)' : 'var(--accent2)'}"></i>
        </div>
        <div>
          <div class="tx-name">${tx.label}</div>
          <div class="tx-date">${tx.date}</div>
        </div>
      </div>
      <div class="tx-amount" style="color:${tx.type === 'earn' ? 'var(--mint2)' : 'var(--gold2)'}">
        ${tx.display}
      </div>
    </div>`).join('');
}

/* ── AD PLAYER ─────────────────────────────────── */
let adTimer = null, adSecs = 30;
const adBrands = [
  { name:'TechVault',    tag:'Cloud storage for everyone'      },
  { name:'SwiftPay',     tag:'Send money worldwide instantly'  },
  { name:'NovaBit',      tag:'Trade crypto with confidence'    },
  { name:'LearnAI',      tag:'Master AI in 30 days'            },
  { name:'HostPro',      tag:'Fast & reliable web hosting'     },
  { name:'CryptoEdge',   tag:'Smarter crypto tools'            },
  { name:'GlobalSend',   tag:'Remittance made simple'          },
];

function watchAd() {
  if (STATE.adsWatched >= STATE.adsLimit) return;
  const b = adBrands[Math.floor(Math.random() * adBrands.length)];
  document.getElementById('ad-brand').textContent   = b.name;
  document.getElementById('ad-tagline').textContent = b.tag;
  adSecs = 30;
  document.getElementById('ad-timer').textContent   = adSecs;
  document.getElementById('ad-skip').classList.remove('show');
  document.getElementById('ad-overlay').classList.add('open');
  adTimer = setInterval(() => {
    adSecs--;
    document.getElementById('ad-timer').textContent = adSecs;
    if (adSecs <= 5) document.getElementById('ad-skip').classList.add('show');
    if (adSecs <= 0) finishAd();
  }, 1000);
}

function finishAd() {
  clearInterval(adTimer);
  document.getElementById('ad-overlay').classList.remove('open');
  STATE.adsWatched++;
  STATE.points      += 5;
  STATE.totalEarned += 5;
  const now = new Date();
  STATE.transactions.push({
    type: 'earn',
    label: 'Ad watched — 5 pts',
    date: 'Today ' + now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
    display: '+5 pts'
  });
  renderHome();
  showToast('🎉 +5 points earned!');
}

function skipAd() { finishAd(); }

/* ── WITHDRAW ───────────────────────────────────── */
let selMethod = null;

function openWithdraw() {
  selMethod = null;
  document.querySelectorAll('.withdraw-method').forEach(m => m.classList.remove('selected'));
  document.getElementById('withdraw-form-section').style.display = 'none';
  document.getElementById('withdraw-modal').classList.add('open');
}
function closeWithdraw() { document.getElementById('withdraw-modal').classList.remove('open'); }

function selectMethod(method, el) {
  selMethod = method;
  document.querySelectorAll('#withdraw-modal .withdraw-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  const minPts = method === 'usdt' ? 5000 : 10000;
  const minUsd = method === 'usdt' ? '$5.00' : '$10.00';
  document.getElementById('withdraw-method-label').textContent  = method === 'usdt' ? 'USDT (ERC-20)' : 'Bitcoin (BTC)';
  document.getElementById('withdraw-min-label').textContent     = minPts.toLocaleString() + ' pts (' + minUsd + ')';
  document.getElementById('withdraw-balance-label').textContent = pts(STATE.points) + ' (' + usd(STATE.points) + ')';
  document.getElementById('withdraw-addr-label').textContent    = method === 'usdt' ? 'Your USDT ERC-20 address' : 'Your Bitcoin (BTC) address';
  document.getElementById('withdraw-form-section').style.display = 'block';
}

function submitWithdraw() {
  const minPts = selMethod === 'usdt' ? 5000 : 10000;
  const addr   = document.getElementById('withdraw-addr').value.trim();
  if (!addr)                { showToast('Enter your wallet address', true); return; }
  if (STATE.points < minPts){ showToast('Need ' + minPts.toLocaleString() + ' pts minimum', true); return; }
  const earned = (STATE.points * POINT_VALUE).toFixed(2);
  STATE.totalWithdrawn += parseFloat(earned);
  STATE.transactions.push({
    type: 'withdraw',
    label: 'Withdrawal — ' + (selMethod === 'usdt' ? 'USDT' : 'BTC') + ' (pending)',
    date: new Date().toLocaleDateString('en-GB'),
    display: '-$' + earned
  });
  STATE.points = 0;
  closeWithdraw();
  renderHome();
  showToast('Withdrawal submitted! Processing 24–48h');
}

/* ── TRANSFER ───────────────────────────────────── */
function openTransfer()  { document.getElementById('transfer-modal').classList.add('open'); }
function closeTransfer() { document.getElementById('transfer-modal').classList.remove('open'); }

function submitTransfer() {
  const email = document.getElementById('transfer-email').value.trim();
  const ptsIn = parseInt(document.getElementById('transfer-pts').value) || 0;
  if (!email)              { showToast('Enter recipient email', true); return; }
  if (ptsIn < 100)         { showToast('Minimum transfer: 100 pts', true); return; }
  if (ptsIn > STATE.points){ showToast('Not enough points', true); return; }
  STATE.points -= ptsIn;
  STATE.transactions.push({
    type: 'withdraw',
    label: 'Transfer to ' + email,
    date: new Date().toLocaleDateString('en-GB'),
    display: '-' + ptsIn + ' pts'
  });
  document.getElementById('transfer-email').value = '';
  document.getElementById('transfer-pts').value   = '';
  closeTransfer();
  renderHome();
  showToast('Transferred ' + ptsIn.toLocaleString() + ' pts!');
}

/* ── SIDEBAR ────────────────────────────────────── */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (err ? ' err' : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function copyRef() {
  navigator.clipboard.writeText('https://adminterz.netlify.app/pages/signup.html?ref=JohnDemo').catch(() => {});
  showToast('Referral link copied!');
}

document.addEventListener('DOMContentLoaded', () => renderHome());
