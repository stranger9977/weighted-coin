/* ============================================================
   The Weighted Coin — interactive logic
   ============================================================ */

/* ---- math constants (exact, tied to real −110 odds) ---- */
const HOUSE_WIN_PROB = 0.5238;       // book's coin lands "house" 52.38% of the time
const PLAYER_WIN_PROB = 1 - HOUSE_WIN_PROB; // 47.62%
const LEG_DECIMAL = 210 / 110;       // −110 in decimal odds = 1.9091
const LEG_EDGE_FACTOR = 0.5 * LEG_DECIMAL; // 0.95455 — fair coin priced at −110

/* ---------- reveal init ---------- */
Reveal.initialize({
  hash: true,
  slideNumber: 'c/t',
  transition: 'slide',
  controls: true,
  progress: true,
  width: 1280,
  height: 760,
  margin: 0.06,
  plugins: [RevealNotes],
});

/* =========================================================
   SLIDE 1 — the "fair" coin (a simple honest flip)
   ========================================================= */
const s1 = { wins: 0, losses: 0, busy: false };

function animateCoin(coinEl, playerWins, onDone) {
  coinEl.classList.remove('landed-you', 'landed-house');
  void coinEl.offsetWidth; // reflow so the animation restarts
  coinEl.classList.add('flipping');
  if (!playerWins) coinEl.classList.add('to-house');
  const handler = () => {
    coinEl.classList.remove('flipping', 'to-house');
    coinEl.classList.add(playerWins ? 'landed-you' : 'landed-house');
    coinEl.removeEventListener('animationend', handler);
    onDone && onDone();
  };
  coinEl.addEventListener('animationend', handler);
}

function flash(id, win) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('go');
  void el.offsetWidth;
  el.classList.add('go');
}

function flipSlide1() {
  if (s1.busy) return;
  s1.busy = true;
  const playerWins = Math.random() < 0.5; // genuinely fair
  animateCoin(document.getElementById('coin1'), playerWins, () => {
    if (playerWins) { s1.wins++; flash('flash-win-1', true); }
    else { s1.losses++; flash('flash-loss-1', false); }
    document.getElementById('wins1').textContent = s1.wins;
    document.getElementById('losses1').textContent = s1.losses;
    s1.busy = false;
  });
}

/* =========================================================
   SLIDE 2 — the bankroll grind (fair vs the book's coin)
   ========================================================= */
const s2 = {
  bank: 100,
  start: 100,
  bet: 10,
  history: [100],
  wins: 0,
  losses: 0,
  fair: true,
  busy: false,
};

function s2PlayerWins() {
  const p = s2.fair ? 0.5 : PLAYER_WIN_PROB;
  return Math.random() < p;
}

function s2ApplyFlip() {
  const win = s2PlayerWins();
  if (win) { s2.bank += s2.bet; s2.wins++; }
  else { s2.bank -= s2.bet; s2.losses++; }
  s2.history.push(s2.bank);
}

function s2Render() {
  const bankEl = document.getElementById('bank2');
  bankEl.textContent = '$' + s2.bank;
  bankEl.className = s2.bank >= s2.start ? 'you-color' : (s2.bank <= 0 ? 'house-color' : 'gold-color');
  document.getElementById('flips2').textContent = s2.wins + s2.losses;
  document.getElementById('wins2').textContent = s2.wins;
  document.getElementById('losses2').textContent = s2.losses;
  drawChart();
}

function s2Reset() {
  s2.bank = s2.start; s2.history = [s2.start]; s2.wins = 0; s2.losses = 0;
  s2Render();
}

function flipSlide2Once() {
  // slide 2 shows the bankroll chart, not a coin — just resolve one flip
  s2ApplyFlip();
  s2Render();
}

function flipSlide2Many(n) {
  let i = 0;
  const step = () => {
    const chunk = Math.min(3, n - i);
    for (let k = 0; k < chunk; k++) { s2ApplyFlip(); i++; }
    s2Render();
    if (i < n) requestAnimationFrame(step);
  };
  step();
}

/* ---- bankroll line chart ---- */
function drawChart() {
  const canvas = document.getElementById('chart2');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w === 0) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const data = s2.history;
  const pad = 14;
  const maxV = Math.max(s2.start * 1.4, ...data, 20);
  const minV = Math.min(0, ...data);
  const xFor = i => pad + (i / Math.max(1, data.length - 1)) * (w - 2 * pad);
  const yFor = v => h - pad - ((v - minV) / (maxV - minV)) * (h - 2 * pad);

  // zero / starting line
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, yFor(s2.start)); ctx.lineTo(w - pad, yFor(s2.start));
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('start $' + s2.start, pad + 2, yFor(s2.start) - 4);

  // bankroll line
  const ending = data[data.length - 1];
  const up = ending >= s2.start;
  ctx.strokeStyle = up ? '#38d39f' : '#ff5d73';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((v, i) => { i ? ctx.lineTo(xFor(i), yFor(v)) : ctx.moveTo(xFor(i), yFor(v)); });
  ctx.stroke();

  // fill under line
  ctx.lineTo(xFor(data.length - 1), yFor(minV));
  ctx.lineTo(xFor(0), yFor(minV));
  ctx.closePath();
  ctx.fillStyle = up ? 'rgba(56,211,159,0.12)' : 'rgba(255,93,115,0.12)';
  ctx.fill();
}

/* =========================================================
   SLIDE 6 — parlay calculator
   ========================================================= */
function fmtMoney(x) {
  return '$' + (Math.round(x * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function updateParlay() {
  const legs = +document.getElementById('legs').value;
  document.getElementById('legCount').textContent = legs;

  const trueProb = Math.pow(0.5, legs);             // fair coin, all must hit
  const offeredDecimal = Math.pow(LEG_DECIMAL, legs); // book's payout multiplier
  const fairDecimal = Math.pow(2, legs);            // 1 / trueProb
  const hold = 1 - Math.pow(LEG_EDGE_FACTOR, legs); // exact: 1 − 0.95455^legs

  const stake = 10;
  const offeredProfit = stake * (offeredDecimal - 1);
  const fairProfit = stake * (fairDecimal - 1);

  document.getElementById('trueProb').textContent =
    (trueProb * 100 >= 1 ? (trueProb * 100).toFixed(1) : (trueProb * 100).toFixed(2)) + '%';
  document.getElementById('hold').textContent = (hold * 100).toFixed(0) + '%';
  document.getElementById('fairPay').textContent = fmtMoney(fairProfit);
  document.getElementById('offerPay').textContent = fmtMoney(offeredProfit);

  // bars scaled to the fair payout (always the bigger one)
  document.getElementById('probBar').style.width = Math.max(2, trueProb * 100) + '%';
  document.getElementById('fairBar').style.width = '100%';
  document.getElementById('offerBar').style.width = (offeredProfit / fairProfit * 100).toFixed(1) + '%';
}

/* =========================================================
   wiring
   ========================================================= */
function wire() {
  document.querySelectorAll('[data-flip]').forEach(btn => {
    btn.onclick = () => (btn.dataset.flip === '1' ? flipSlide1() : flipSlide2Once());
  });
  document.querySelectorAll('[data-flip100]').forEach(btn => {
    btn.onclick = () => flipSlide2Many(100);
  });
  document.querySelectorAll('[data-reset]').forEach(btn => {
    btn.onclick = () => s2Reset();
  });

  const toggle = document.getElementById('fairToggle2');
  if (toggle) {
    toggle.onchange = () => {
      s2.fair = toggle.checked;
      document.getElementById('fairLabel2').textContent =
        toggle.checked ? 'Fair coin (50 / 50)' : "The book's coin (52.4% house)";
      s2Reset();
    };
  }

  const legs = document.getElementById('legs');
  if (legs) { legs.oninput = updateParlay; updateParlay(); }
}

Reveal.on('ready', () => { wire(); s2Render(); });
Reveal.on('slidechanged', () => { drawChart(); });
window.addEventListener('resize', drawChart);
