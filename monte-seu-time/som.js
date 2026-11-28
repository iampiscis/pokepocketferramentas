const CHAVE = 'pp-pas-som';
const MAX_VOZES = 12;
const GERAL = 0.35;

let memoria = false;
let ctx = null;
let grafo = null;
let vozes = 0;
let pausa = 0;

const lim = (x, a, b) => Math.min(b, Math.max(a, x));
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);

function criarRuidos(c) {
  const sr = c.sampleRate;
  const n = Math.floor(sr * 2);
  const branco = c.createBuffer(1, n, sr);
  const w = branco.getChannelData(0);
  for (let i = 0; i < n; i++) w[i] = Math.random() * 2 - 1;
  const rosa = c.createBuffer(1, n, sr);
  const p = rosa.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, soma = 0;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + x * 0.0555179;
    b1 = 0.99332 * b1 + x * 0.0750759;
    b2 = 0.969 * b2 + x * 0.153852;
    b3 = 0.8665 * b3 + x * 0.3104856;
    b4 = 0.55 * b4 + x * 0.5329522;
    b5 = -0.7616 * b5 - x * 0.016898;
    p[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362;
    b6 = x * 0.115926;
    soma += p[i];
  }
  const media = soma / n;
  let pico = 0;
  for (let i = 0; i < n; i++) { p[i] -= media; pico = Math.max(pico, Math.abs(p[i])); }
  const k = 0.95 / (pico || 1);
  for (let i = 0; i < n; i++) p[i] *= k;
  return { branco, rosa };
}

function impulso(c, dur) {
  const sr = c.sampleRate;
  const n = Math.floor(sr * dur);
  const pre = Math.floor(sr * 0.012);
  const ent = Math.floor(sr * 0.004);
  const b = c.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let y = 0;
    for (let i = pre; i < n; i++) {
      const x = (i - pre) / (n - pre);
      const coef = 0.8 - 0.62 * x;
      y += coef * ((Math.random() * 2 - 1) - y);
      const fade = Math.min(1, (i - pre) / ent);
      d[i] = y * Math.pow(1 - x, 3.2) * fade;
    }
  }
  return b;
}

function montarGrafo(c) {
  const { branco, rosa } = criarRuidos(c);
  const bus = c.createGain(); bus.gain.value = 1.8;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 28; hp.Q.value = 0.7;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 3;
  comp.attack.value = 0.003; comp.release.value = 0.2;
  const geral = c.createGain(); geral.gain.value = GERAL;
  bus.connect(hp); hp.connect(comp); comp.connect(geral); geral.connect(c.destination);
  const rev = c.createGain();
  const revHp = c.createBiquadFilter(); revHp.type = 'highpass'; revHp.frequency.value = 200;
  const conv = c.createConvolver(); conv.buffer = impulso(c, 0.8);
  const revLp = c.createBiquadFilter(); revLp.type = 'lowpass'; revLp.frequency.value = 6500;
  const volta = c.createGain(); volta.gain.value = 0.5;
  rev.connect(revHp); revHp.connect(conv); conv.connect(revLp); revLp.connect(volta); volta.connect(hp);
  return { bus, rev, branco, rosa, curvas: {} };
}

function kit(c, G, t0) {
  const K = {
    fim: t0,
    fontes: [],
    marca(x) { if (x > K.fim) K.fim = x; return x; },
    g(v = 0) { const n = c.createGain(); n.gain.value = v; return n; },
    f(tipo, fr, q = 0.707) {
      const n = c.createBiquadFilter(); n.type = tipo; n.frequency.value = fr; n.Q.value = q; return n;
    },
    o(tipo = 'sine', fr = 440, t = t0) {
      const n = c.createOscillator(); n.type = tipo; n.frequency.value = fr; n.start(t); K.fontes.push(n); return n;
    },
    ruido(rosa = false, t = t0) {
      const n = c.createBufferSource(); n.buffer = rosa ? G.rosa : G.branco; n.loop = true;
      n.start(t, Math.random() * 1.8); K.fontes.push(n); return n;
    },
    lfo(fr, prof, tipo = 'sine') { const o = K.o(tipo, fr); const g = K.g(prof); o.connect(g); return g; },
    trem(fr, base, prof) { const g = K.g(base); K.lfo(fr, prof).connect(g.gain); return g; },
    sat(k) {
      let cv = G.curvas[k];
      if (!cv) {
        const N = 2049; cv = new Float32Array(N);
        for (let i = 0; i < N; i++) { const x = (i / (N - 1)) * 2 - 1; cv[i] = Math.tanh(k * x) / k; }
        G.curvas[k] = cv;
      }
      const ws = c.createWaveShaper(); ws.curve = cv; ws.oversample = '2x'; return ws;
    },
    liga(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[0]; },
    rampa(p, t, v0, ...s) {
      p.setValueAtTime(v0, t);
      let tt = t;
      for (let i = 0; i < s.length; i += 2) { tt += s[i + 1]; p.exponentialRampToValueAtTime(Math.max(s[i], 1e-4), tt); }
      return tt;
    },
    perc(p, t, a, pk, dec) {
      a = Math.max(a, 0.002); pk = Math.max(pk, 2e-4);
      p.setValueAtTime(0, t);
      p.linearRampToValueAtTime(pk, t + a);
      p.exponentialRampToValueAtTime(1e-4, t + a + dec);
      p.linearRampToValueAtTime(0, t + a + dec + 0.005);
      return K.marca(t + a + dec + 0.005);
    },
    env(p, t, a, pk, d, s, h, r) {
      a = Math.max(a, 0.002); pk = Math.max(pk, 2e-4);
      const sv = Math.max(pk * s, 1e-4);
      p.setValueAtTime(0, t);
      p.linearRampToValueAtTime(pk, t + a);
      p.exponentialRampToValueAtTime(sv, t + a + d);
      if (h > 0) p.setValueAtTime(sv, t + a + d + h);
      const te = t + a + d + h + r;
      p.exponentialRampToValueAtTime(1e-4, te);
      p.linearRampToValueAtTime(0, te + 0.005);
      return K.marca(te + 0.005);
    },
    estalos(p, t, n, dur, gmin, gmax, comp = 0.005, curva = 1) {
      const ts = [];
      for (let i = 0; i < n; i++) ts.push(t + Math.pow(Math.random(), curva) * dur);
      ts.sort((x, y) => x - y);
      p.setValueAtTime(0, t);
      let ult = t;
      for (const x of ts) {
        const ti = Math.max(x, ult + 0.0005);
        const g = rnd(gmin, gmax);
        const cc = comp * rnd(0.6, 1.4);
        p.setValueAtTime(0, ti);
        p.linearRampToValueAtTime(g, ti + 0.002);
        p.exponentialRampToValueAtTime(g * 0.01, ti + 0.002 + cc);
        p.linearRampToValueAtTime(0, ti + 0.003 + cc);
        ult = ti + 0.003 + cc;
      }
      return K.marca(ult);
    },
    sino(out, t, f, pk, dec, P) {
      for (const [r, a, dm] of P) {
        if (f * r > 16000) continue;
        const o = K.o('sine', f * r, t); const g = K.g();
        K.perc(g.gain, t, 0.002, pk * a, dec * dm); K.liga(o, g, out);
      }
    },
    fm(out, t, fc, razao, ind, pk, dec) {
      const car = K.o('sine', fc, t); const mod = K.o('sine', fc * razao, t); const mg = K.g();
      mg.gain.setValueAtTime(fc * ind, t);
      mg.gain.exponentialRampToValueAtTime(fc * ind * 0.04, t + dec * 0.65);
      K.liga(mod, mg, car.frequency);
      const ga = K.g(); K.perc(ga.gain, t, 0.003, pk, dec); K.liga(car, ga, out);
    },
  };
  return K;
}

const RECEITAS = {
  disparo: { vol: 1.2, rev: 0.14, f(K, out, t, v) {
    const n = K.ruido(); const bp = K.f('bandpass', 700, 1.1); const g = K.g();
    K.rampa(bp.frequency, t, 650 * v, 3600 * v, 0.16);
    K.env(g.gain, t, 0.012, 1.2, 0.07, 0.45, 0, 0.16); K.liga(n, bp, g, out);
    const ar = K.ruido(); const hp = K.f('highpass', 5500); const g2 = K.g();
    K.perc(g2.gain, t + 0.01, 0.02, 0.22, 0.18); K.liga(ar, hp, g2, out);
    const tom = K.o('triangle'); const lp = K.f('lowpass', 2600); const g3 = K.g();
    K.rampa(tom.frequency, t, 1150 * v, 380 * v, 0.12);
    K.perc(g3.gain, t, 0.003, 0.1, 0.16); K.liga(tom, lp, g3, out);
    const s = K.o('sine'); const g4 = K.g();
    K.rampa(s.frequency, t, 160 * v, 62 * v, 0.08);
    K.perc(g4.gain, t, 0.003, 0.3, 0.14); K.liga(s, g4, out);
  } },

  impacto: { vol: 1.0, rev: 0.12, f(K, out, t, v) {
    const n = K.ruido(); const bp = K.f('bandpass', 3200 * v, 0.8); const g = K.g();
    K.perc(g.gain, t, 0.002, 0.7, 0.05); K.liga(n, bp, g, out);
    const s = K.o('sine'); const gs = K.g();
    K.rampa(s.frequency, t, 150 * v, 52 * v, 0.14);
    K.perc(gs.gain, t, 0.003, 0.75, 0.38); K.liga(s, gs, out);
    const tr = K.o('triangle'); const lp = K.f('lowpass', 1200); const gt = K.g();
    K.rampa(tr.frequency, t, 320 * v, 130 * v, 0.06);
    K.perc(gt.gain, t, 0.002, 0.28, 0.14); K.liga(tr, lp, gt, out);
    const n2 = K.ruido(true); const lp2 = K.f('lowpass', 900, 1); const g2 = K.g();
    K.rampa(lp2.frequency, t, 900, 240, 0.1);
    K.perc(g2.gain, t, 0.002, 0.7, 0.22); K.liga(n2, lp2, g2, out);
  } },

  soco: { vol: 1.4, rev: 0.06, f(K, out, t, v) {
    const bus = K.g(0.55); const sat = K.sat(2); const pos = K.g(1.6); K.liga(bus, sat, pos, out);
    const s = K.o('sine'); const gs = K.g();
    K.rampa(s.frequency, t, 210 * v, 46 * v, 0.07);
    K.perc(gs.gain, t, 0.002, 1, 0.26); K.liga(s, gs, bus);
    const n = K.ruido(); const bp = K.f('bandpass', 1800 * v, 0.9); const g = K.g();
    K.perc(g.gain, t, 0.002, 1, 0.07); K.liga(n, bp, g, bus);
    const n2 = K.ruido(); const hp = K.f('highpass', 4500); const g2 = K.g();
    K.perc(g2.gain, t, 0.002, 0.35, 0.025); K.liga(n2, hp, g2, out);
    const n3 = K.ruido(true); const lp = K.f('lowpass', 350); const g3 = K.g();
    K.perc(g3.gain, t, 0.003, 0.9, 0.16); K.liga(n3, lp, g3, bus);
  } },

  fogo: { vol: 1.1, rev: 0.18, f(K, out, t, v) {
    const n = K.ruido(true); const bp = K.f('bandpass', 600, 0.8); const lp = K.f('lowpass', 3200);
    K.rampa(bp.frequency, t, 380 * v, 1400 * v, 0.2, 750 * v, 0.65);
    const tr = K.trem(8.5 * v, 0.75, 0.25); const g = K.g();
    K.env(g.gain, t, 0.05, 0.9, 0.22, 0.65, 0.3, 0.4); K.liga(n, bp, lp, tr, g, out);
    const n2 = K.ruido(true); const lp2 = K.f('lowpass', 280, 0.9); const g2 = K.g();
    K.env(g2.gain, t, 0.07, 0.8, 0.25, 0.6, 0.25, 0.4); K.liga(n2, lp2, g2, out);
    const n3 = K.ruido(); const hp3 = K.f('highpass', 2400); const g3 = K.g();
    K.estalos(g3.gain, t + 0.03, 16, 0.85, 0.15, 0.6, 0.006, 1.2); K.liga(n3, hp3, g3, out);
    const n4 = K.ruido(); const bp4 = K.f('bandpass', 1100 * v, 2.5); const g4 = K.g();
    K.estalos(g4.gain, t + 0.06, 7, 0.75, 0.6, 1.4, 0.014, 1); K.liga(n4, bp4, g4, out);
  } },

  veneno: { vol: 1.15, rev: 0.22, f(K, out, t, v) {
    const n = K.ruido(true); const lp = K.f('lowpass', 550, 2); const g = K.g();
    K.lfo(4.5, 220).connect(lp.frequency);
    K.env(g.gain, t, 0.08, 0.35, 0.2, 0.7, 0.25, 0.3); K.liga(n, lp, g, out);
    let ti = t + 0.015;
    for (let i = 0; i < 8; i++) {
      const f0 = rnd(230, 520) * v * (1 + i * 0.04);
      const o = K.o('sine', f0, ti); const go = K.g();
      K.rampa(o.frequency, ti, f0, f0 * rnd(2.1, 2.9), rnd(0.04, 0.07));
      K.perc(go.gain, ti, 0.003, rnd(0.3, 0.5), rnd(0.08, 0.12)); K.liga(o, go, out);
      ti += rnd(0.05, 0.1);
    }
  } },

  gelo: { vol: 1.05, rev: 0.38, f(K, out, t, v) {
    const n = K.ruido(); const hp = K.f('highpass', 2600); const g = K.g();
    K.perc(g.gain, t, 0.002, 0.5, 0.06); K.liga(n, hp, g, out);
    const n2 = K.ruido(); const bp = K.f('bandpass', 4200, 1.4); const g2 = K.g();
    K.estalos(g2.gain, t + 0.008, 12, 0.2, 0.2, 0.6, 0.005, 1.3); K.liga(n2, bp, g2, out);
    const P = [[1, 1, 1], [2.76, 0.55, 0.65], [5.4, 0.3, 0.45], [8.93, 0.16, 0.3]];
    [[1760, 0], [2350, 0.06], [2960, 0.13], [3520, 0.21]].forEach(([f, d], i) =>
      K.sino(out, t + d, f * v * rnd(0.99, 1.01), 0.2 - i * 0.025, 0.9 - i * 0.1, P));
    const n3 = K.ruido(); const hp3 = K.f('highpass', 7500); const g3 = K.g();
    K.env(g3.gain, t + 0.02, 0.12, 0.12, 0.2, 0.5, 0, 0.45); K.liga(n3, hp3, g3, out);
  } },

  raio: { vol: 0.83, rev: 0.2, f(K, out, t, v) {
    const bus = K.g(1); const sat = K.sat(2.5); const hp = K.f('highpass', 250); const lp = K.f('lowpass', 6000);
    const pos = K.g(1.4); K.liga(bus, sat, hp, lp, pos, out);
    const g = K.g(); K.env(g.gain, t, 0.003, 0.45, 0.05, 0.55, 0.1, 0.25); g.connect(bus);
    const j = K.lfo(43 * v, 140, 'square');
    for (const d of [-14, 16]) {
      const o = K.o('sawtooth'); o.detune.value = d;
      K.rampa(o.frequency, t, 1500 * v, 190 * v, 0.34);
      j.connect(o.frequency); o.connect(g);
    }
    const n = K.ruido(); const hp2 = K.f('highpass', 1800); const g2 = K.g();
    K.estalos(g2.gain, t, 30, 0.45, 0.1, 0.55, 0.004, 1.5); K.liga(n, hp2, g2, out);
    const n3 = K.ruido(); const g3 = K.g();
    K.perc(g3.gain, t, 0.002, 0.45, 0.035); K.liga(n3, g3, out);
  } },

  planta: { vol: 0.73, rev: 0.3, f(K, out, t, v) {
    const lp = K.f('lowpass', 1700, 0.7); const g = K.g();
    K.env(g.gain, t, 0.09, 0.5, 0.25, 0.75, 0.22, 0.4); K.liga(lp, g, out);
    const vib = K.lfo(4.8, 7);
    [[1, 'sine', 0.6], [1.5, 'triangle', 0.22], [2, 'sine', 0.14]].forEach(([r, tp, a]) => {
      const o = K.o(tp); K.rampa(o.frequency, t, 330 * v * r, 520 * v * r, 0.6);
      vib.connect(o.detune); K.liga(o, K.g(a), lp);
    });
    const n = K.ruido(true); const bp = K.f('bandpass', 1400, 2.2); const g2 = K.g();
    K.rampa(bp.frequency, t, 1100 * v, 2600 * v, 0.6);
    K.env(g2.gain, t, 0.06, 0.4, 0.2, 0.6, 0.2, 0.35); K.liga(n, bp, g2, out);
  } },

  terra: { vol: 0.95, rev: 0.08, f(K, out, t, v) {
    const s = K.o('sine'); const gs = K.g();
    K.rampa(s.frequency, t, 115 * v, 42 * v, 0.13);
    K.perc(gs.gain, t, 0.003, 0.7, 0.3); K.liga(s, gs, out);
    const n = K.ruido(true); const lp = K.f('lowpass', 700, 0.9); const g = K.g();
    K.rampa(lp.frequency, t, 800, 170, 0.14);
    K.perc(g.gain, t, 0.003, 0.8, 0.25); K.liga(n, lp, g, out);
    const n2 = K.ruido(); const bp = K.f('bandpass', 2900 * v, 0.7); const hp = K.f('highpass', 900);
    const gr = K.g(); const ge = K.g();
    K.estalos(gr.gain, t + 0.02, 55, 0.42, 0.08, 0.35, 0.007, 1.5);
    K.env(ge.gain, t + 0.01, 0.02, 1, 0.12, 0.5, 0.05, 0.3);
    K.liga(n2, bp, hp, gr, ge, out);
    const n3 = K.ruido(); const bp3 = K.f('bandpass', 3600, 0.9); const g3 = K.g();
    K.env(g3.gain, t + 0.015, 0.02, 0.12, 0.1, 0.4, 0.05, 0.25); K.liga(n3, bp3, g3, out);
  } },

  psi: { vol: 1.25, rev: 0.45, f(K, out, t, v) {
    const mix = K.g(); const lp = K.f('lowpass', 5200);
    K.env(mix.gain, t, 0.07, 0.6, 0.25, 0.7, 0.25, 0.5); K.liga(mix, lp, out);
    const vib = K.lfo(5.3, 9);
    [440, 554.37, 659.25, 830.61].forEach((f, i) => {
      for (const d of [-7, 7]) {
        const o = K.o(i % 2 ? 'triangle' : 'sine', f * v); o.detune.value = d; vib.connect(o.detune);
        const ga = K.g(); const ti = t + i * 0.035;
        ga.gain.setValueAtTime(0, t); ga.gain.setValueAtTime(0, ti); ga.gain.linearRampToValueAtTime(0.11, ti + 0.04);
        K.liga(o, ga, mix);
      }
    });
    const sh = K.o('sine', 1760 * v); const tr = K.trem(11, 0.6, 0.4); const gsh = K.g();
    K.env(gsh.gain, t + 0.08, 0.15, 0.08, 0.2, 0.6, 0.15, 0.45); K.liga(sh, tr, gsh, out);
    const n = K.ruido(); const hp = K.f('highpass', 6500); const g = K.g();
    K.env(g.gain, t, 0.1, 0.07, 0.2, 0.5, 0.1, 0.4); K.liga(n, hp, g, out);
  } },

  fantasma: { vol: 0.65, rev: 0.5, f(K, out, t, v) {
    const n = K.ruido(true); const b1 = K.f('bandpass', 1300, 7); const b2 = K.f('bandpass', 2600, 6);
    K.rampa(b1.frequency, t, 1300 * v, 380 * v, 0.95);
    K.rampa(b2.frequency, t, 2700 * v, 950 * v, 0.95);
    const m = K.g();
    K.env(m.gain, t, 0.18, 4, 0.3, 0.7, 0.2, 0.45);
    n.connect(b1); n.connect(b2); K.liga(b1, K.g(1), m); K.liga(b2, K.g(0.5), m); m.connect(out);
    const vib = K.lfo(5.5, 28);
    const lp = K.f('lowpass', 1600); const gv = K.g();
    K.env(gv.gain, t, 0.2, 0.22, 0.3, 0.7, 0.2, 0.4); K.liga(lp, gv, out);
    for (const [tp, r] of [['sine', 1], ['triangle', 1.006]]) {
      const o = K.o(tp); K.rampa(o.frequency, t, 640 * v * r, 290 * v * r, 0.9); vib.connect(o.detune); o.connect(lp);
    }
  } },

  vento: { vol: 1.75, rev: 0.25, f(K, out, t, v) {
    const n = K.ruido(true); const bp = K.f('bandpass', 400, 1.6); const tr = K.trem(3.2, 0.8, 0.2); const g = K.g();
    bp.frequency.setValueAtTime(380 * v, t);
    bp.frequency.setTargetAtTime(1900 * v, t, 0.16);
    bp.frequency.setTargetAtTime(600 * v, t + 0.45, 0.22);
    K.env(g.gain, t, 0.16, 1.4, 0.25, 0.75, 0.15, 0.45); K.liga(n, bp, tr, g, out);
    const n2 = K.ruido(); const bp2 = K.f('bandpass', 900, 14); const g2 = K.g();
    bp2.frequency.setValueAtTime(850 * v, t);
    bp2.frequency.setTargetAtTime(4000 * v, t, 0.16);
    bp2.frequency.setTargetAtTime(1300 * v, t + 0.45, 0.22);
    K.env(g2.gain, t + 0.04, 0.16, 0.9, 0.25, 0.6, 0.1, 0.4); K.liga(n2, bp2, g2, out);
  } },

  sombra: { vol: 0.65, rev: 0.28, f(K, out, t, v) {
    const s = K.o('sine'); const gs = K.g();
    K.rampa(s.frequency, t, 72 * v, 34 * v, 0.5);
    K.env(gs.gain, t, 0.004, 0.7, 0.1, 0.6, 0.1, 0.4); K.liga(s, gs, out);
    const lp = K.f('lowpass', 1400, 6); const pre = K.g(0.5); const sat = K.sat(2); const g = K.g();
    K.rampa(lp.frequency, t, 1500, 160, 0.38);
    K.env(g.gain, t, 0.004, 1, 0.08, 0.5, 0.06, 0.32); K.liga(lp, pre, sat, g, out);
    for (const d of [-15, 15]) {
      const o = K.o('sawtooth'); o.detune.value = d; K.rampa(o.frequency, t, 110 * v, 52 * v, 0.42); o.connect(lp);
    }
    const n = K.ruido(true); const lp2 = K.f('lowpass', 1800); const g2 = K.g();
    K.rampa(lp2.frequency, t, 2000, 140, 0.42);
    K.perc(g2.gain, t, 0.006, 0.6, 0.55); K.liga(n, lp2, g2, out);
    const n3 = K.ruido(); const bp = K.f('bandpass', 1400, 0.9); const g3 = K.g();
    K.perc(g3.gain, t, 0.002, 0.35, 0.05); K.liga(n3, bp, g3, out);
  } },

  fada: { vol: 1.3, rev: 0.42, f(K, out, t, v) {
    [1046.5, 1318.5, 1568, 2093, 2637].forEach((f, i) => {
      const ti = t + i * 0.055;
      K.fm(out, ti, f * v, 2, 0.7, 0.16, 0.55);
      K.sino(out, ti, f * v * 2, 0.05, 0.3, [[1, 1, 1], [2.4, 0.5, 0.6]]);
    });
    const n = K.ruido(); const hp = K.f('highpass', 7000); const g = K.g();
    K.estalos(g.gain, t + 0.02, 12, 0.4, 0.04, 0.12, 0.012, 1); K.liga(n, hp, g, out);
  } },

  cura: { vol: 0.95, rev: 0.4, f(K, out, t, v) {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const ti = t + i * 0.09;
      K.fm(out, ti, f * v, 2, 1.1, 0.2, 0.85);
      K.sino(out, ti, f * v, 0.06, 0.6, [[2, 1, 1], [3.01, 0.4, 0.7]]);
    });
    const lp = K.f('lowpass', 2200); const g = K.g();
    K.env(g.gain, t, 0.14, 0.12, 0.3, 0.8, 0.3, 0.45); K.liga(lp, g, out);
    for (const f of [261.63, 392]) K.o('triangle', f * v).connect(lp);
    K.fm(out, t + 0.38, 2093 * v, 2, 0.5, 0.08, 0.6);
  } },

  chuva: { vol: 1.35, rev: 0.3, f(K, out, t, v) {
    const amb = K.g(); const a = amb.gain;
    a.setValueAtTime(0, t); a.linearRampToValueAtTime(1, t + 0.6);
    a.setValueAtTime(1, t + 1.6); a.linearRampToValueAtTime(0, t + 2.45);
    K.marca(t + 2.45); amb.connect(out);
    const n = K.ruido(true); const hp = K.f('highpass', 450); const lp = K.f('lowpass', 5200);
    K.liga(n, hp, lp, K.g(0.45), amb);
    const n2 = K.ruido(); const hp2 = K.f('highpass', 6500); K.liga(n2, hp2, K.g(0.06), amb);
    for (let i = 0; i < 36; i++) {
      const ti = t + 0.08 + Math.random() * 2.2; const f = rnd(1600, 4200) * v;
      const o = K.o('sine', f, ti); const go = K.g();
      K.rampa(o.frequency, ti, f, f * rnd(1.2, 1.5), 0.02);
      K.perc(go.gain, ti, 0.002, rnd(0.04, 0.13), rnd(0.03, 0.06)); K.liga(o, go, amb);
    }
    const n3 = K.ruido(); const bp = K.f('bandpass', 3000, 1); const g3 = K.g();
    K.estalos(g3.gain, t + 0.08, 45, 2.25, 0.08, 0.35, 0.004, 1); K.liga(n3, bp, g3, amb);
  } },

  inseto: { vol: 1.8, rev: 0.12, f(K, out, t, v) {
    const bp = K.f('bandpass', 1900 * v, 1.6); const lp = K.f('lowpass', 4200);
    const tr = K.trem(33 * v, 0.65, 0.35); const g = K.g();
    K.env(g.gain, t, 0.025, 0.5, 0.06, 0.85, 0.24, 0.13); K.liga(bp, lp, tr, g, out);
    const vib = K.lfo(11 * v, 16);
    for (const r of [1, 1.008]) {
      const o = K.o('sawtooth');
      K.rampa(o.frequency, t, 225 * v * r, 300 * v * r, 0.17, 215 * v * r, 0.26);
      vib.connect(o.frequency); o.connect(bp);
    }
  } },

  rugido: { vol: 0.73, rev: 0.3, f(K, out, t, v) {
    const bus = K.g(0.35); const sat = K.sat(2.2); const pos = K.g(1.5); K.liga(bus, sat, pos, out);
    const lp = K.f('lowpass', 500, 7); const g = K.g();
    K.rampa(lp.frequency, t, 480 * v, 1300 * v, 0.2, 420 * v, 0.75);
    K.env(g.gain, t, 0.06, 0.7, 0.2, 0.75, 0.3, 0.45); K.liga(lp, g, bus);
    const vib = K.lfo(6.4, 3.5);
    for (const d of [-18, 0, 21]) {
      const o = K.o('sawtooth'); o.detune.value = d;
      K.rampa(o.frequency, t, 76 * v, 98 * v, 0.16, 56 * v, 0.78);
      vib.connect(o.frequency); o.connect(lp);
    }
    const n = K.ruido(true); const bp = K.f('bandpass', 520 * v, 1.2); const tr = K.trem(27, 0.6, 0.4); const gn = K.g();
    K.env(gn.gain, t, 0.05, 1.2, 0.2, 0.7, 0.3, 0.45); K.liga(n, bp, tr, gn, bus);
    const s = K.o('sine', 46 * v); const gs = K.g();
    K.env(gs.gain, t, 0.08, 0.35, 0.3, 0.6, 0.2, 0.4); K.liga(s, gs, out);
  } },

  metal: { vol: 1.05, rev: 0.32, f(K, out, t, v) {
    K.fm(out, t, 520 * v, 1.41, 2.2, 0.3, 1.0);
    K.fm(out, t, 1420 * v, 1.97, 1.4, 0.15, 0.6);
    K.sino(out, t, 873 * v, 0.12, 0.8, [[1, 1, 1], [2.32, 0.6, 0.7], [3.87, 0.4, 0.5], [5.13, 0.25, 0.35]]);
    const n = K.ruido(); const hp = K.f('highpass', 3500); const g = K.g();
    K.perc(g.gain, t, 0.002, 0.4, 0.03); K.liga(n, hp, g, out);
    const o = K.o('triangle'); const go = K.g();
    K.rampa(o.frequency, t, 220 * v, 150 * v, 0.05);
    K.perc(go.gain, t, 0.002, 0.25, 0.09); K.liga(o, go, out);
  } },

  pedra: { vol: 1.25, rev: 0.14, f(K, out, t, v) {
    const clack = (ti, f, pk) => {
      const n = K.ruido(); const b1 = K.f('bandpass', f, 6); const b2 = K.f('bandpass', f * 1.87, 4);
      const g1 = K.g(); const g2 = K.g();
      K.perc(g1.gain, ti, 0.002, pk, 0.06); K.perc(g2.gain, ti, 0.002, pk * 0.6, 0.04);
      n.connect(b1); n.connect(b2); K.liga(b1, g1, out); K.liga(b2, g2, out);
    };
    clack(t, 950 * v, 3.4);
    clack(t + rnd(0.04, 0.06), 1350 * v, 2.1);
    const o = K.o('triangle'); const go = K.g();
    K.rampa(o.frequency, t, 280 * v, 130 * v, 0.04);
    K.perc(go.gain, t, 0.002, 0.4, 0.09); K.liga(o, go, out);
    const n = K.ruido(); const bp = K.f('bandpass', 2300, 1.8); const g = K.g();
    K.estalos(g.gain, t + 0.08, 6, 0.22, 0.3, 0.9, 0.01, 1.3); K.liga(n, bp, g, out);
  } },

  esquiva: { vol: 1.1, rev: 0.1, f(K, out, t, v) {
    const n = K.ruido(); const bp = K.f('bandpass', 2600, 1.3); const g = K.g();
    K.rampa(bp.frequency, t, 2800 * v, 650 * v, 0.15);
    K.env(g.gain, t, 0.025, 1.1, 0.05, 0.5, 0, 0.1); K.liga(n, bp, g, out);
    const n2 = K.ruido(true); const bp2 = K.f('bandpass', 500, 0.9); const g2 = K.g();
    K.rampa(bp2.frequency, t, 450 * v, 1300 * v, 0.1);
    K.perc(g2.gain, t, 0.02, 0.45, 0.16); K.liga(n2, bp2, g2, out);
  } },

  falha: { vol: 0.8, rev: 0.2, f(K, out, t, v) {
    const lp = K.f('lowpass', 2800, 5); const g = K.g();
    K.rampa(lp.frequency, t, 3000, 280, 0.42);
    K.env(g.gain, t, 0.006, 0.22, 0.06, 0.7, 0.15, 0.25); K.liga(lp, g, out);
    const vib = K.lfo(13, 30);
    for (const [tp, d] of [['square', 0], ['sawtooth', 9]]) {
      const o = K.o(tp); o.detune.value = d; vib.connect(o.detune);
      K.rampa(o.frequency, t, 520 * v, 105 * v, 0.42); o.connect(lp);
    }
    const n = K.ruido(); const hp = K.f('highpass', 2600); const gc = K.g(); const ge = K.g();
    K.estalos(gc.gain, t + 0.02, 26, 0.45, 0.2, 0.8, 0.006, 1.4);
    K.env(ge.gain, t, 0.01, 0.5, 0.15, 0.4, 0, 0.3); K.liga(n, hp, gc, ge, out);
    const n2 = K.ruido(true); const bp = K.f('bandpass', 1500, 1); const g2 = K.g();
    K.perc(g2.gain, t, 0.004, 0.4, 0.14); K.liga(n2, bp, g2, out);
  } },

  passo: { vol: 1.1, rev: 0.05, f(K, out, t, v) {
    const o = K.o('triangle'); const go = K.g();
    K.rampa(o.frequency, t, 340 * v, 200 * v, 0.04);
    K.perc(go.gain, t, 0.002, 0.35, 0.08); K.liga(o, go, out);
    const s = K.o('sine', 150 * v); const gs = K.g();
    K.perc(gs.gain, t, 0.003, 0.3, 0.1); K.liga(s, gs, out);
    const n = K.ruido(); const bp = K.f('bandpass', 2200 * v, 1); const g = K.g();
    K.perc(g.gain, t, 0.002, 0.25, 0.02); K.liga(n, bp, g, out);
    const n2 = K.ruido(true); const lp = K.f('lowpass', 1200); const g2 = K.g();
    K.perc(g2.gain, t, 0.002, 0.35, 0.05); K.liga(n2, lp, g2, out);
  } },

  puxao: { vol: 0.95, rev: 0.35, f(K, out, t, v) {
    const lp = K.f('lowpass', 4200); const g = K.g();
    K.env(g.gain, t, 0.04, 0.35, 0.1, 0.8, 0.26, 0.2); K.liga(lp, g, out);
    const vib = K.lfo(7, 15);
    for (const [tp, r, a] of [['sine', 1, 0.7], ['triangle', 1.5, 0.3]]) {
      const o = K.o(tp); K.rampa(o.frequency, t, 260 * v * r, 1250 * v * r, 0.44);
      vib.connect(o.detune); K.liga(o, K.g(a), lp);
    }
    const n = K.ruido(); const bp = K.f('bandpass', 600, 3); const g2 = K.g();
    K.rampa(bp.frequency, t, 500 * v, 4800 * v, 0.44);
    K.env(g2.gain, t, 0.06, 0.5, 0.1, 0.7, 0.24, 0.15); K.liga(n, bp, g2, out);
    [[1975.5, 0.42, 0.13], [2637, 0.48, 0.1], [3136, 0.54, 0.08]].forEach(([f, d, p]) =>
      K.fm(out, t + d, f * v, 2, 0.6, p, 0.4));
  } },

  clique: { vol: 1.0, rev: 0.04, f(K, out, t, v) {
    const s = K.o('sine'); const gs = K.g();
    K.rampa(s.frequency, t, 1900 * v, 1250 * v, 0.03);
    K.perc(gs.gain, t, 0.002, 0.3, 0.09); K.liga(s, gs, out);
    const o = K.o('triangle', 950 * v); const go = K.g();
    K.perc(go.gain, t, 0.002, 0.14, 0.06); K.liga(o, go, out);
    const n = K.ruido(); const hp = K.f('highpass', 5000); const g = K.g();
    K.perc(g.gain, t, 0.002, 0.08, 0.012); K.liga(n, hp, g, out);
  } },
};

function disparar(c, G, nome, forca, pan, t) {
  const rec = RECEITAS[nome];
  if (!rec) return null;
  const voz = c.createGain();
  voz.gain.value = rec.vol * forca;
  let saida = voz;
  if (c.createStereoPanner) {
    const p = c.createStereoPanner(); p.pan.value = pan; voz.connect(p); saida = p;
  }
  saida.connect(G.bus);
  const envio = c.createGain(); envio.gain.value = rec.rev;
  saida.connect(envio); envio.connect(G.rev);
  const K = kit(c, G, t);
  rec.f(K, voz, t, 1 + (Math.random() - 0.5) * 0.06);
  const fim = K.fim + 0.03;
  for (const s of K.fontes) s.stop(fim);
  return { fim, nos: [voz, saida, envio] };
}

function garantirCtx() {
  if (ctx) return true;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
  grafo = montarGrafo(ctx);
  return true;
}

function destravar() {
  try {
    if (ctx && ctx.state === 'running') return;
    if (!somLigado() || !garantirCtx()) return;
    ctx.resume().catch(() => {});
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(ev, destravar, { passive: true, capture: true });
  }
}

export function somLigado() {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v !== null) return v === '1';
  } catch (e) {}
  return memoria;
}

export function alternarSom() {
  const novo = !somLigado();
  memoria = novo;
  try { localStorage.setItem(CHAVE, novo ? '1' : '0'); } catch (e) {}
  try {
    clearTimeout(pausa);
    if (novo) {
      if (garantirCtx() && ctx.state !== 'running') ctx.resume().catch(() => {});
    } else if (ctx) {
      pausa = setTimeout(() => {
        try { if (!somLigado() && ctx.state === 'running') ctx.suspend().catch(() => {}); } catch (e) {}
      }, 1500);
    }
  } catch (e) {}
  return novo;
}

export function tocar(nome, opcoes = {}) {
  try {
    const { forca = 1, pan = 0 } = opcoes || {};
    if (!somLigado() || !RECEITAS[nome]) return;
    if (!garantirCtx()) return;
    if (ctx.state !== 'running') { ctx.resume().catch(() => {}); return; }
    if (vozes >= MAX_VOZES) return;
    const f = lim(Number(forca) || 0, 0, 1.5);
    if (f <= 0) return;
    const p = lim(Number(pan) || 0, -1, 1);
    const r = disparar(ctx, grafo, nome, f, p, ctx.currentTime + 0.005);
    if (!r) return;
    vozes++;
    setTimeout(() => {
      vozes = Math.max(0, vozes - 1);
      for (const n of r.nos) { try { n.disconnect(); } catch (e) {} }
    }, Math.max(0, r.fim - ctx.currentTime + 0.2) * 1000);
  } catch (e) {}
}
