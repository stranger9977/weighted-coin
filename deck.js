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
const SAMPLE_CAP = 400; // max points kept for the chart, so a million flips stays fast
const s2 = {
  bank: 100, start: 100, bet: 10, wins: 0, losses: 0, fair: true,
  samples: [100], sampleStep: 1, sinceSample: 0, playing: false,
};

function s2PlayerWins() { return Math.random() < (s2.fair ? 0.5 : PLAYER_WIN_PROB); }
function s2RecordSample() {
  if (++s2.sinceSample >= s2.sampleStep) {
    s2.sinceSample = 0;
    s2.samples.push(s2.bank);
    if (s2.samples.length > SAMPLE_CAP) {
      s2.samples = s2.samples.filter((_, i) => i % 2 === 0); // thin out, keep every other point
      s2.sampleStep *= 2;
    }
  }
}
function s2ApplyFlip() {
  if (s2PlayerWins()) { s2.bank += s2.bet; s2.wins++; }
  else { s2.bank -= s2.bet; s2.losses++; }
  s2RecordSample();
}
function fmtBank(v) { return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString(); }
function s2Render() {
  const bankEl = document.getElementById('bank2');
  if (!bankEl) return;
  bankEl.textContent = fmtBank(s2.bank);
  bankEl.className = s2.bank >= s2.start ? 'you-color' : (s2.bank <= 0 ? 'house-color' : 'gold-color');
  const total = s2.wins + s2.losses;
  document.getElementById('flips2').textContent = total.toLocaleString();
  document.getElementById('wins2').textContent = s2.wins.toLocaleString();
  document.getElementById('losses2').textContent = s2.losses.toLocaleString();
  const wr = document.getElementById('winRate2');
  const af = document.getElementById('avgFlip2');
  if (wr) wr.textContent = total ? (s2.wins / total * 100).toFixed(2) + '%' : '-';
  if (af) {
    const avg = total ? (s2.bank - s2.start) / total : 0;
    af.textContent = total ? (avg < 0 ? '-$' : '$') + Math.abs(avg).toFixed(2) : '-';
  }
  drawChart();
}
function s2SetTargets() {
  const wt = document.getElementById('winTarget2');
  if (wt) wt.textContent = s2.fair ? '(settles near 50%)' : '(settles near 47.6%)';
}
function s2Reset() {
  s2.bank = s2.start; s2.samples = [s2.start]; s2.sampleStep = 1; s2.sinceSample = 0;
  s2.wins = 0; s2.losses = 0;
  s2Render(); s2SetTargets();
}
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
function playToMillion() {
  if (s2.playing) return;
  let target = 1000000;
  if (s2.wins + s2.losses >= target) target = (s2.wins + s2.losses) + 1000000;
  s2.playing = true;
  const btn = document.getElementById('play1m');
  if (btn) { btn.disabled = true; btn.textContent = 'Playing…'; }
  let perFrame = 250;
  const step = () => {
    const batch = Math.min(perFrame, target - (s2.wins + s2.losses));
    for (let k = 0; k < batch; k++) s2ApplyFlip();
    perFrame = Math.min(25000, Math.floor(perFrame * 1.4)); // accelerate the fast-forward
    s2Render();
    if (s2.wins + s2.losses < target) requestAnimationFrame(step);
    else { s2.playing = false; if (btn) { btn.disabled = false; btn.textContent = '▶ Play to 1,000,000'; } }
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
  const data = s2.samples, pad = 14;
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
function vizCtx(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w) return null;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}
function drawViz(canvas, type, p) {
  const c = vizCtx(canvas); if (!c) return;
  const { ctx, w, h } = c;
  if (type === 'data') {                          // rows of data points filling in
    const cols = 14, rows = 4, total = cols * rows, lit = Math.floor(p * total);
    const gx = w / cols, gy = h / rows, r = Math.min(gx, gy) * 0.26;
    for (let i = 0; i < total; i++) {
      const cx = (i % cols + 0.5) * gx, cy = (Math.floor(i / cols) + 0.5) * gy;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7);
      ctx.fillStyle = i < lit ? 'rgba(78,168,222,0.95)' : 'rgba(255,255,255,0.10)';
      ctx.fill();
    }
  } else if (type === 'features') {               // rolling sparklines drawing left to right
    const cols2 = ['rgba(56,211,159,0.9)', 'rgba(78,168,222,0.9)', 'rgba(255,211,78,0.9)'];
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = cols2[k]; ctx.lineWidth = 2; ctx.beginPath();
      const maxX = p * w;
      for (let x = 0; x <= maxX; x += 3) {
        const y = h / 2 + Math.sin(x * 0.09 + k * 2) * (h * 0.2) * Math.sin(x * 0.014 + k);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  } else if (type === 'models') {                 // scatter points with a fitted line sweeping in
    const n = 16;
    for (let i = 0; i < n; i++) {
      if (i / n > p) break;
      const x = (i + 0.5) / n * w;
      const base = h * 0.82 - (x / w) * (h * 0.62);
      const noise = Math.sin(i * 23.3) * Math.cos(i * 7.1) * h * 0.12;
      ctx.beginPath(); ctx.arc(x, base + noise, 2.2, 0, 7);
      ctx.fillStyle = 'rgba(78,168,222,0.85)'; ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,211,78,0.95)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h * 0.82); ctx.lineTo(p * w, h * 0.82 - p * (h * 0.62)); ctx.stroke();
  } else if (type === 'range') {                   // a confidence band widening on a number line
    const cy = h * 0.6, cx = w / 2, half = (w * 0.4) * p;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.08, cy); ctx.lineTo(w * 0.92, cy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,211,78,0.30)';
    ctx.fillRect(cx - half, cy - h * 0.24, half * 2, h * 0.48);
    ctx.fillStyle = 'rgba(255,211,78,1)';
    ctx.fillRect(cx - 1.5, cy - h * 0.32, 3, h * 0.64);
  } else if (type === 'vig') {                      // a fair bar with a gold "tax" slice added on the end
    const barY = h * 0.34, barH = h * 0.34, full = w * 0.84, x0 = w * 0.08;
    ctx.fillStyle = 'rgba(78,168,222,0.85)';
    ctx.fillRect(x0, barY, full * 0.78, barH);
    ctx.fillStyle = 'rgba(255,211,78,1)';
    ctx.fillRect(x0 + full * 0.78, barY, full * 0.22 * p, barH);
  }
}
function animateCanvas(canvas, type, gen, dur) {
  let start = null;
  const frame = (now) => {
    if (gen !== priceGen) return;
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / dur);
    drawViz(canvas, type, p);
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function animatePrice(gen) {                        // the final box counts in to −110
  const el = document.querySelector('#pflow .priceval');
  if (!el) return;
  const from = -260, to = -110, dur = 850;
  let start = null;
  const frame = (now) => {
    if (gen !== priceGen) return;
    if (start === null) start = now;
    const p = Math.min(1, (now - start) / dur);
    el.textContent = '−' + Math.abs(Math.round(from + (to - from) * p));
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function startViz(node, type, gen) {
  if (type === 'price') return animatePrice(gen);
  if (type === 'sim') return runSim();
  const canvas = node.querySelector('canvas');
  if (canvas) animateCanvas(canvas, type, gen, 1100);
}
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
    const viz = el.dataset ? el.dataset.viz : null;
    if (viz) startViz(el, viz, gen);
    i++;
    setTimeout(reveal, el.classList.contains('parrow') ? 200 : 520);
  };
  reveal();
}

/* =========================================================
   SLIDE 11 — build a parlay (real odds, coins weighted to each leg)
   ========================================================= */
const LEGS = [
  { label: 'Chiefs to win', odds: '−200', d: 1.50, p: 0.65 },
  { label: 'Game over 47.5 points', odds: '−110', d: 1.909, p: 0.50 },
  { label: 'Kelce scores a TD', odds: '+110', d: 2.10, p: 0.45 },
  { label: 'Mahomes 300+ pass yards', odds: '+130', d: 2.30, p: 0.42 },
  { label: 'A kickoff returned for a TD', odds: '+300', d: 4.00, p: 0.22 },
  { label: 'Exact final score 27-24', odds: '+2000', d: 21.0, p: 0.03 },
];
const parlaySel = new Set([0, 1, 4]); // a favorite, a coin flip, and a longshot: the classic trap
let parlayBusy = false;

function selectedLegs() { return [...parlaySel].sort((a, b) => a - b).map(i => LEGS[i]); }
function fmtSmallPct(p) {
  const v = p * 100;
  if (v >= 1) return v.toFixed(1) + '%';
  if (v >= 0.1) return v.toFixed(2) + '%';
  return v.toFixed(3) + '%';
}
function buildLegList() {
  const box = document.getElementById('legList');
  if (!box) return;
  box.innerHTML = '';
  LEGS.forEach((leg, i) => {
    const chip = document.createElement('button');
    chip.className = 'leg-chip' + (parlaySel.has(i) ? ' on' : '');
    chip.innerHTML = '<span>' + leg.label + '</span><b>' + leg.odds + '</b>';
    chip.onclick = () => { parlaySel.has(i) ? parlaySel.delete(i) : parlaySel.add(i); updateParlay(); };
    box.appendChild(chip);
  });
}
function updateParlay() {
  if (!document.getElementById('legList')) return;
  buildLegList();
  const legs = selectedLegs();
  const coins = document.getElementById('parlayCoins');
  coins.innerHTML = '';
  legs.forEach(leg => {
    const c = document.createElement('div');
    c.className = 'coin mini-coin landed-you';
    c.dataset.p = leg.p;
    c.innerHTML = '<div class="coin-face heads">😎</div><div class="coin-face tails">🏦</div>';
    coins.appendChild(c);
  });
  const fp = document.getElementById('fairPay'), op = document.getElementById('offerPay');
  const tp = document.getElementById('trueProb'), hd = document.getElementById('hold');
  const fbar = document.getElementById('fairBar'), obar = document.getElementById('offerBar');
  const res = document.getElementById('parlayResult');
  if (res) res.innerHTML = '&nbsp;';
  if (!legs.length) {
    [fp, op, tp, hd].forEach(el => { if (el) el.textContent = '-'; });
    if (fbar) fbar.style.width = '0%';
    if (obar) obar.style.width = '0%';
    return;
  }
  const stake = 10;
  const prob = legs.reduce((a, l) => a * l.p, 1);
  const offeredDec = legs.reduce((a, l) => a * l.d, 1);
  const cut = 1 - legs.reduce((a, l) => a * l.p * l.d, 1);
  const fairReturn = stake / prob;      // total return that would break even
  const offeredReturn = stake * offeredDec; // what the book actually pays back
  if (fp) fp.textContent = money(fairReturn);
  if (op) op.textContent = money(offeredReturn);
  if (tp) tp.textContent = fmtSmallPct(prob);
  if (hd) hd.textContent = (cut * 100).toFixed(0) + '%';
  if (fbar) fbar.style.width = '100%';
  if (obar) obar.style.width = (offeredReturn / fairReturn * 100).toFixed(1) + '%';
}
function flipAllCoins() {
  if (parlayBusy) return;
  const coins = document.querySelectorAll('#parlayCoins .mini-coin');
  if (!coins.length) return;
  parlayBusy = true;
  const result = document.getElementById('parlayResult');
  if (result) result.innerHTML = '&nbsp;';
  let allWin = true;
  coins.forEach(coin => {
    const p = parseFloat(coin.dataset.p || '0.5');
    const win = Math.random() < p;          // each leg weighted to its real chance
    if (!win) allWin = false;
    animateCoin(coin, win);
  });
  setTimeout(() => {
    if (result) result.innerHTML = allWin
      ? '<span class="you-color">Every leg hit. You win. Now hit it again and see how often that happens.</span>'
      : '<span class="house-color">A leg missed, so the whole parlay is gone.</span>';
    parlayBusy = false;
  }, 1150);
}

/* =========================================================
   SLIDE 12 — no free lunch: keep betting and the spikes fade
   ========================================================= */
const lunch = { bank: 100, start: 100, bets: 0, samples: [100], sampleStep: 1, sinceSample: 0, busy: false, p: 0.22, profit: 30 };
const LUNCH_STAKE = 10, LUNCH_CAP = 500;
function parlayEconomics() {                  // the exact parlay the user built on the previous slide
  const legs = selectedLegs();
  if (!legs.length) return { p: 0.22, profit: 30 };
  const p = legs.reduce((a, l) => a * l.p, 1);
  const dec = legs.reduce((a, l) => a * l.d, 1);
  return { p, profit: LUNCH_STAKE * (dec - 1) };
}
function lunchStep() {
  const win = Math.random() < lunch.p;
  lunch.bank += win ? lunch.profit : -LUNCH_STAKE;
  lunch.bets++;
  if (++lunch.sinceSample >= lunch.sampleStep) {
    lunch.sinceSample = 0;
    lunch.samples.push(lunch.bank);
    if (lunch.samples.length > LUNCH_CAP) { lunch.samples = lunch.samples.filter((_, i) => i % 2 === 0); lunch.sampleStep *= 2; }
  }
}
function drawLunch() {
  const c = document.getElementById('lunchChart');
  if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth, h = c.clientHeight;
  if (!w) return;
  c.width = w * dpr; c.height = h * dpr;
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
  const data = lunch.samples, pad = 16;
  const maxV = Math.max(lunch.start * 1.2, ...data), minV = Math.min(0, ...data);
  const xFor = i => pad + (i / Math.max(1, data.length - 1)) * (w - 2 * pad);
  const yFor = v => h - pad - ((v - minV) / (maxV - minV)) * (h - 2 * pad);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, yFor(lunch.start)); ctx.lineTo(w - pad, yFor(lunch.start)); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '12px Inter, sans-serif';
  ctx.fillText('start $' + lunch.start, pad + 2, yFor(lunch.start) - 5);
  const up = data[data.length - 1] >= lunch.start;
  ctx.strokeStyle = up ? '#38d39f' : '#ff5d73'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  data.forEach((v, i) => { i ? ctx.lineTo(xFor(i), yFor(v)) : ctx.moveTo(xFor(i), yFor(v)); });
  ctx.stroke();
  ctx.lineTo(xFor(data.length - 1), yFor(minV)); ctx.lineTo(xFor(0), yFor(minV)); ctx.closePath();
  ctx.fillStyle = up ? 'rgba(56,211,159,0.12)' : 'rgba(255,93,115,0.12)'; ctx.fill();
}
function updateLunchHud() {
  const b = document.getElementById('lunchBank');
  if (b) { b.textContent = fmtBank(lunch.bank); b.className = lunch.bank >= lunch.start ? 'you-color' : 'house-color'; }
  const n = document.getElementById('lunchBets');
  if (n) n.textContent = lunch.bets.toLocaleString();
}
function updateLunchDesc() {
  const pe = document.getElementById('lunchProb');
  if (pe) pe.textContent = fmtSmallPct(lunch.p);
  const pay = document.getElementById('lunchPay');
  if (pay) pay.textContent = money(LUNCH_STAKE + lunch.profit);
}
function resetLunch() {
  const e = parlayEconomics();
  lunch.p = e.p; lunch.profit = e.profit;
  lunch.bank = lunch.start; lunch.bets = 0; lunch.samples = [lunch.start]; lunch.sampleStep = 1; lunch.sinceSample = 0;
  drawLunch(); updateLunchHud(); updateLunchDesc();
}
function keepBetting() {
  if (lunch.busy) return;
  lunch.busy = true;
  const btn = document.getElementById('lunchBtn');
  if (btn) btn.disabled = true;
  // run enough bets to actually SEE several wins, scaled to how rare the parlay is
  const runLen = Math.min(20000, Math.max(300, Math.round(8 / lunch.p)));
  const target = lunch.bets + runLen;
  const batchPer = Math.max(1, Math.ceil(runLen / 90)); // ~90 frames, roughly steady ~1.5s
  const tick = () => {
    for (let k = 0; k < batchPer && lunch.bets < target; k++) lunchStep();
    drawLunch(); updateLunchHud();
    if (lunch.bets < target) requestAnimationFrame(tick);
    else { lunch.busy = false; if (btn) btn.disabled = false; }
  };
  tick();
}

/* =========================================================
   KELLY criterion calculator (its own slide)
   ========================================================= */
function updateKelly() {
  const el = document.getElementById('kellyRate');
  if (!el) return;
  const p = +el.value / 100;
  document.getElementById('kellyRateVal').textContent = (+el.value).toFixed(1).replace(/\.0$/, '') + '%';
  const b = 100 / 110;                 // net decimal odds for −110
  const f = (b * p - (1 - p)) / b;     // Kelly fraction of bankroll
  const frac = document.getElementById('kellyFrac');
  const dol = document.getElementById('kellyDollar');
  if (f <= 0) {
    frac.textContent = 'bet $0'; frac.className = 'big-number house-color';
    dol.textContent = 'A losing edge has no winning bet size.';
  } else {
    frac.textContent = (f * 100).toFixed(1) + '%'; frac.className = 'big-number you-color';
    dol.textContent = 'On a $100 bankroll, that is ' + money(f * 100) + ' a bet.';
  }
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
  const play = document.getElementById('play1m');
  if (play) play.onclick = playToMillion;
  s2SetTargets();

  const sp = document.getElementById('spAmount');
  if (sp) { sp.oninput = updateSP; updateSP(); }

  document.querySelectorAll('.odds-preset').forEach(b => { b.onclick = () => updateOdds(b.dataset.odds); });
  if (document.getElementById('oddsShown')) updateOdds(300);

  const buildBtn = document.getElementById('buildPrice');
  if (buildBtn) buildBtn.onclick = buildPrice;

  if (document.getElementById('legList')) updateParlay();
  const flipAll = document.getElementById('flipAll');
  if (flipAll) flipAll.onclick = flipAllCoins;

  const lunchBtn = document.getElementById('lunchBtn');
  if (lunchBtn) lunchBtn.onclick = keepBetting;
  const lunchResetBtn = document.getElementById('lunchResetBtn');
  if (lunchResetBtn) lunchResetBtn.onclick = resetLunch;
  if (document.getElementById('lunchChart')) resetLunch();

  const kelly = document.getElementById('kellyRate');
  if (kelly) { kelly.oninput = updateKelly; updateKelly(); }
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
  if (e.currentSlide && e.currentSlide.querySelector('#lunchChart')) resetLunch();
  else drawLunch();
  if (e.currentSlide && e.currentSlide.querySelector('#pflow')) buildPrice();
});
window.addEventListener('resize', () => { drawChart(); drawBell(simP); drawLunch(); });
