/* ============================================================
   The Weighted Coin: interactive logic
   ============================================================ */

/* ---- math constants (exact, tied to real −110 odds) ---- */
const HOUSE_WIN_PROB = 0.5238;              // book's coin lands "house" 52.38%
const PLAYER_WIN_PROB = 1 - HOUSE_WIN_PROB; // 47.62%
const LEG_DECIMAL = 210 / 110;              // −110 in decimal odds = 1.9091
const LEG_EDGE_FACTOR = 0.5 * LEG_DECIMAL;  // 0.95455: a fair coin priced at −110
const SP_RATE = 1.10;                       // S&P 500 long-run average, ~10%/yr

/* ---------- insider / neutral framing toggle ---------- */
function currentMode() {
  const urlMode = new URLSearchParams(location.search).get('mode');
  if (urlMode === 'neutral' || urlMode === 'insider') return urlMode;
  try { return localStorage.getItem('wc-mode') || 'insider'; } catch (e) { return 'insider'; }
}
function applyMode(mode) {
  document.body.classList.toggle('mode-neutral', mode === 'neutral');
  const chip = document.getElementById('modeChip');
  if (chip) chip.innerHTML = 'Framing: <b>' + mode + '</b> · M';
  try { localStorage.setItem('wc-mode', mode); } catch (e) {}
}
function toggleMode() {
  applyMode(document.body.classList.contains('mode-neutral') ? 'insider' : 'neutral');
}
applyMode(currentMode()); // run before reveal paints, to avoid a flash of the wrong framing

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
   shared coin animation
   ========================================================= */
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
function flash(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('go');
  void el.offsetWidth;
  el.classList.add('go');
}

/* =========================================================
   SLIDE 2 — the "fair" coin (a simple honest flip)
   ========================================================= */
const s1 = { wins: 0, losses: 0, busy: false };
function flipSlide1() {
  if (s1.busy) return;
  s1.busy = true;
  const playerWins = Math.random() < 0.5; // genuinely fair
  animateCoin(document.getElementById('coin1'), playerWins, () => {
    if (playerWins) { s1.wins++; flash('flash-win-1'); }
    else { s1.losses++; flash('flash-loss-1'); }
    document.getElementById('wins1').textContent = s1.wins;
    document.getElementById('losses1').textContent = s1.losses;
    s1.busy = false;
  });
}

/* =========================================================
   SLIDE 3 — the bankroll grind (fair vs the book's coin)
   ========================================================= */
const s2 = { bank: 100, start: 100, bet: 10, history: [100], wins: 0, losses: 0, fair: true };

function s2PlayerWins() { return Math.random() < (s2.fair ? 0.5 : PLAYER_WIN_PROB); }
function s2ApplyFlip() {
  if (s2PlayerWins()) { s2.bank += s2.bet; s2.wins++; }
  else { s2.bank -= s2.bet; s2.losses++; }
  s2.history.push(s2.bank);
}
function s2Render() {
  const bankEl = document.getElementById('bank2');
  if (!bankEl) return;
  bankEl.textContent = '$' + s2.bank;
  bankEl.className = s2.bank >= s2.start ? 'you-color' : (s2.bank <= 0 ? 'house-color' : 'gold-color');
  document.getElementById('flips2').textContent = s2.wins + s2.losses;
  document.getElementById('wins2').textContent = s2.wins;
  document.getElementById('losses2').textContent = s2.losses;
  drawChart();
}
function s2Reset() { s2.bank = s2.start; s2.history = [s2.start]; s2.wins = 0; s2.losses = 0; s2Render(); }
function flipSlide2Once() { s2ApplyFlip(); s2Render(); }
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
function drawChart() {
  const canvas = document.getElementById('chart2');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const data = s2.history, pad = 14;
  const maxV = Math.max(s2.start * 1.4, ...data, 20);
  const minV = Math.min(0, ...data);
  const xFor = i => pad + (i / Math.max(1, data.length - 1)) * (w - 2 * pad);
  const yFor = v => h - pad - ((v - minV) / (maxV - minV)) * (h - 2 * pad);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, yFor(s2.start)); ctx.lineTo(w - pad, yFor(s2.start)); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Inter, sans-serif';
  ctx.fillText('start $' + s2.start, pad + 2, yFor(s2.start) - 4);

  const ending = data[data.length - 1];
  const up = ending >= s2.start;
  ctx.strokeStyle = up ? '#38d39f' : '#ff5d73'; ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((v, i) => { i ? ctx.lineTo(xFor(i), yFor(v)) : ctx.moveTo(xFor(i), yFor(v)); });
  ctx.stroke();
  ctx.lineTo(xFor(data.length - 1), yFor(minV)); ctx.lineTo(xFor(0), yFor(minV)); ctx.closePath();
  ctx.fillStyle = up ? 'rgba(56,211,159,0.12)' : 'rgba(255,93,115,0.12)'; ctx.fill();
}

/* =========================================================
   SLIDE 5 — S&P 500 opportunity cost
   ========================================================= */
function money(x) { return '$' + Math.round(x).toLocaleString(); }
function updateSP() {
  const amtEl = document.getElementById('spAmount');
  if (!amtEl) return;
  const amt = +amtEl.value;
  document.getElementById('spVal').textContent = money(amt);
  const yrs = [1, 3, 5, 10];
  const vals = yrs.map(y => amt * Math.pow(SP_RATE, y));
  const max = vals[vals.length - 1];
  yrs.forEach((y, i) => {
    document.getElementById('spY' + y).textContent = money(vals[i]);
    document.getElementById('spBar' + y).style.width = (vals[i] / max * 100) + '%';
  });
}

/* =========================================================
   SLIDE 6 — odds translator (+/− money → probability)
   ========================================================= */
function fmtPct(p) {
  const v = Math.round(p * 1000) / 10;
  return (Number.isInteger(v) ? v : v.toFixed(1)) + '%';
}
function updateOdds(odds) {
  odds = +odds;
  const shown = odds > 0 ? '+' + odds : '−' + Math.abs(odds);
  let prob, meaning;
  if (odds > 0) {
    prob = 100 / (odds + 100);
    meaning = 'Risk <strong>$100</strong> to win <strong>$' + odds + '</strong>.';
  } else {
    const a = Math.abs(odds);
    prob = a / (a + 100);
    meaning = 'Risk <strong>$' + a + '</strong> to win <strong>$100</strong>.';
  }
  document.getElementById('oddsShown').textContent = shown;
  document.getElementById('oddsMeaning').innerHTML = meaning;
  document.getElementById('oddsProb').textContent = fmtPct(prob);
  document.querySelectorAll('.odds-preset').forEach(b => {
    const active = +b.dataset.odds === odds;
    b.classList.toggle('gold', active);
    b.classList.toggle('ghost', !active);
  });
}

/* =========================================================
   SLIDE 8 — "build the price": linked diagram + Monte Carlo
   ========================================================= */
let simP = 0.05; // last-drawn progress, so we can redraw on resize / slide change
function drawBell(p) {
  simP = p;
  const c = document.getElementById('simChart');
  if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth, h = c.clientHeight;
  if (!w) return;
  c.width = w * dpr; c.height = h * dpr;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const pad = 4, bars = 29, bw = (w - 2 * pad) / bars;
  for (let i = 0; i < bars; i++) {
    const x = (i - (bars - 1) / 2) / ((bars - 1) / 6); // map bar index to -3..3
    let g = Math.exp(-0.5 * x * x);                     // gaussian height 0..1
    const jitter = (1 - p) * 0.4 * Math.sin(i * 12.9898) * Math.cos(i * 4.1414); // noise that fades as p→1
    g = Math.max(0, g * (0.12 + 0.88 * p) + jitter * g);
    const bh = g * (h - 2 * pad);
    const mid = i > bars * 0.36 && i < bars * 0.64;
    ctx.fillStyle = mid ? 'rgba(255,211,78,0.95)' : 'rgba(78,168,222,0.75)';
    ctx.fillRect(pad + i * bw + 0.5, h - pad - bh, bw - 1, bh);
  }
}
function runSim() {
  const target = 250000, dur = 1500;
  let start = null;
  function frame(now) {
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const countEl = document.getElementById('simCount');
    if (countEl) countEl.textContent = Math.floor(eased * target).toLocaleString();
    drawBell(eased);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
let priceGen = 0;
function buildPrice() {
  const flow = document.getElementById('pflow');
  if (!flow) return;
  const items = flow.querySelectorAll('.pnode, .parrow');
  items.forEach(el => el.classList.remove('show'));
  const gen = ++priceGen;
  let i = 0;
  const reveal = () => {
    if (gen !== priceGen || i >= items.length) return;
    const el = items[i];
    el.classList.add('show');
    if (el.dataset.sim === '1') runSim();
    i++;
    setTimeout(reveal, el.classList.contains('parrow') ? 200 : 480);
  };
  reveal();
}

/* =========================================================
   SLIDE 10 — parlay as a row of coin flips
   ========================================================= */
function buildParlayCoins(n) {
  const box = document.getElementById('parlayCoins');
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'coin mini-coin landed-you';
    c.innerHTML = '<div class="coin-face heads">😎</div><div class="coin-face tails">🏦</div>';
    box.appendChild(c);
  }
}
let parlayBusy = false;
function flipAllCoins() {
  if (parlayBusy) return;
  const coins = document.querySelectorAll('#parlayCoins .mini-coin');
  if (!coins.length) return;
  parlayBusy = true;
  const result = document.getElementById('parlayResult');
  result.innerHTML = '&nbsp;';
  let allWin = true;
  coins.forEach(coin => {
    const win = Math.random() < 0.5; // each leg is a fair coin
    if (!win) allWin = false;
    animateCoin(coin, win);
  });
  setTimeout(() => {
    result.innerHTML = allWin
      ? '<span class="you-color">All of them hit. You win. Notice how rarely that happens.</span>'
      : '<span class="house-color">One missed, so the whole parlay loses. That\'s the usual ending.</span>';
    parlayBusy = false;
  }, 1150);
}
function updateParlay() {
  const legsEl = document.getElementById('legs');
  if (!legsEl) return;
  const legs = +legsEl.value;
  document.getElementById('legCount').textContent = legs;
  const lc2 = document.getElementById('legCount2');
  if (lc2) lc2.textContent = legs;

  const trueProb = Math.pow(0.5, legs);
  const hold = 1 - Math.pow(LEG_EDGE_FACTOR, legs);
  const offeredProfit = 10 * (Math.pow(LEG_DECIMAL, legs) - 1);
  const fairProfit = 10 * (Math.pow(2, legs) - 1);

  document.getElementById('trueProb').textContent =
    (trueProb * 100 >= 1 ? (trueProb * 100).toFixed(1) : (trueProb * 100).toFixed(2)) + '%';
  document.getElementById('hold').textContent = (hold * 100).toFixed(0) + '%';
  document.getElementById('fairPay').textContent = money(fairProfit);
  document.getElementById('offerPay').textContent = money(offeredProfit);

  buildParlayCoins(legs);
  const res = document.getElementById('parlayResult');
  if (res) res.innerHTML = '&nbsp;';
}

/* =========================================================
   wiring
   ========================================================= */
function wire() {
  document.querySelectorAll('[data-flip]').forEach(btn => {
    btn.onclick = () => (btn.dataset.flip === '1' ? flipSlide1() : flipSlide2Once());
  });
  document.querySelectorAll('[data-flip100]').forEach(btn => { btn.onclick = () => flipSlide2Many(100); });
  document.querySelectorAll('[data-reset]').forEach(btn => { btn.onclick = () => s2Reset(); });

  const toggle = document.getElementById('fairToggle2');
  if (toggle) {
    toggle.onchange = () => {
      s2.fair = toggle.checked;
      document.getElementById('fairLabel2').textContent =
        toggle.checked ? 'Fair coin (50 / 50)' : "The book's coin (52.4% house)";
      s2Reset();
    };
  }

  const sp = document.getElementById('spAmount');
  if (sp) { sp.oninput = updateSP; updateSP(); }

  document.querySelectorAll('.odds-preset').forEach(b => { b.onclick = () => updateOdds(b.dataset.odds); });
  if (document.getElementById('oddsShown')) updateOdds(300);

  const buildBtn = document.getElementById('buildPrice');
  if (buildBtn) buildBtn.onclick = buildPrice;

  const legs = document.getElementById('legs');
  if (legs) { legs.oninput = updateParlay; updateParlay(); }
  const flipAll = document.getElementById('flipAll');
  if (flipAll) flipAll.onclick = flipAllCoins;
}

Reveal.on('ready', () => {
  wire();
  s2Render();
  const chip = document.getElementById('modeChip');
  if (chip) chip.onclick = toggleMode;
  Reveal.addKeyBinding({ keyCode: 77, key: 'M', description: 'Toggle insider / neutral framing' }, toggleMode);
});
Reveal.on('slidechanged', (e) => {
  drawChart();
  drawBell(simP);
  if (e.currentSlide && e.currentSlide.querySelector('#pflow')) buildPrice();
});
window.addEventListener('resize', () => { drawChart(); drawBell(simP); });
