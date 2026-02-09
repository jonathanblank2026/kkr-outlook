import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  purple: "#49004B", purpleLight: "#6B1A6D", purpleDark: "#2E002F",
  gold: "#B8943E", goldLight: "#D4B066", goldMuted: "rgba(184,148,62,0.15)",
  cream: "#FAF8F5", warmWhite: "#FDFCFA", white: "#FFFFFF",
  text: "#1A1A1A", textSec: "#5A5A5A", textMuted: "#8A8A8A",
  divider: "#E5E0D8", card: "#FFFFFF",
};
const sans = "'Ghost', 'Inter', 'Arial Narrow', sans-serif";
const display = "'Ghost', 'Inter', 'Arial Narrow', sans-serif";

function useInView(th = 0.2) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: th });
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function AnimC({ end, suffix = "", duration = 2000, started }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);
  return <span>{val}{suffix}</span>;
}

/* ---- Animated bar chart using JS animation loop ---- */
function AnimBarChart({ data, title, started, legend }) {
  const max = Math.max(...data.map(d => Math.max(d.v1, d.v2 !== undefined ? d.v2 : 0)));
  const [progress, setProgress] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!started || animRef.current) return;
    animRef.current = true;
    let t0 = null;
    const duration = 1400;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started]);

  return (
    <div style={{ background: C.cream, border: `1px solid ${C.divider}`, padding: "20px 16px", marginBottom: 18 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 600, color: C.purple, marginBottom: 16, textAlign: "center" }}>{title}</div>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center" }}>
        {data.map((d, i) => {
          const stagger = Math.max(0, progress - i * 0.08);
          const barProg = Math.min(stagger / 0.7, 1);
          const labelOpacity = Math.max(0, (progress - 0.5 - i * 0.05) / 0.3);
          const h1 = barProg * (d.v1 / max) * 100;
          const h2 = d.v2 !== undefined ? barProg * (d.v2 / max) * 100 : null;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 90 }}>
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", width: "100%", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: h2 !== null ? 1 : 2 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.purple, marginBottom: 3, opacity: Math.min(labelOpacity, 1) }}>
                    {d.v1}{d.unit || ""}
                  </div>
                  <div style={{ width: "100%", height: 120, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ width: "80%", background: C.purple, borderRadius: "2px 2px 0 0", height: `${h1}%`, minWidth: 18 }} />
                  </div>
                </div>
                {h2 !== null && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.gold, marginBottom: 3, opacity: Math.min(labelOpacity, 1) }}>
                      {d.v2}{d.unit || ""}
                    </div>
                    <div style={{ width: "100%", height: 120, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ width: "80%", background: C.gold, borderRadius: "2px 2px 0 0", height: `${h2}%`, minWidth: 18 }} />
                    </div>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 9, color: C.textMuted, textAlign: "center", marginTop: 6, lineHeight: 1.2 }}>{d.label}</span>
            </div>
          );
        })}
      </div>
      {legend && (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {legend.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, background: l.color, borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: C.textMuted }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Gold ore particle system for hero ---- */
function GoldParticles() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animId = useRef(null);
  const dims = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      dims.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles — mix of tiny dust and larger ore fragments
    const count = 90;
    particles.current = Array.from({ length: count }, (_, i) => {
      const isLarge = i < 12;
      const isMedium = i >= 12 && i < 30;
      return {
        x: Math.random() * dims.current.w,
        y: Math.random() * dims.current.h,
        size: isLarge ? 2.5 + Math.random() * 3 : isMedium ? 1.2 + Math.random() * 1.8 : 0.5 + Math.random() * 1.2,
        speedY: -(0.08 + Math.random() * 0.25),
        speedX: (Math.random() - 0.5) * 0.15,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.003 + Math.random() * 0.008,
        opacity: isLarge ? 0.5 + Math.random() * 0.4 : 0.15 + Math.random() * 0.35,
        shimmerSpeed: 0.01 + Math.random() * 0.025,
        shimmerPhase: Math.random() * Math.PI * 2,
        // Gold color variation: from warm gold to pale champagne
        hue: 38 + Math.random() * 12,
        sat: 55 + Math.random() * 30,
        light: isLarge ? 62 + Math.random() * 15 : 55 + Math.random() * 20,
        facets: isLarge ? Math.floor(3 + Math.random() * 4) : 0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005,
      };
    });

    let t = 0;
    const draw = () => {
      t++;
      const { w, h } = dims.current;
      ctx.clearRect(0, 0, w, h);

      particles.current.forEach(p => {
        // Update position
        p.drift += p.driftSpeed;
        p.x += p.speedX + Math.sin(p.drift) * 0.2;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.shimmerPhase += p.shimmerSpeed;

        // Wrap around
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // Shimmer
        const shimmer = 0.5 + 0.5 * Math.sin(p.shimmerPhase);
        const alpha = p.opacity * (0.4 + 0.6 * shimmer);

        if (p.facets > 0) {
          // Large ore fragments — irregular polygon with glow
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // Glow
          ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${p.light + 10}%, ${alpha * 0.6})`;
          ctx.shadowBlur = p.size * 3;

          ctx.beginPath();
          for (let f = 0; f < p.facets; f++) {
            const angle = (f / p.facets) * Math.PI * 2;
            const r = p.size * (0.7 + 0.3 * Math.sin(angle * 2.5 + p.shimmerPhase));
            const fx = Math.cos(angle) * r;
            const fy = Math.sin(angle) * r;
            f === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
          }
          ctx.closePath();
          ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
          ctx.fill();

          // Bright facet highlight
          ctx.shadowBlur = 0;
          ctx.beginPath();
          const ha = p.rotation * 2;
          ctx.arc(Math.cos(ha) * p.size * 0.3, Math.sin(ha) * p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 30%, 90%, ${alpha * shimmer * 0.8})`;
          ctx.fill();

          ctx.restore();
        } else {
          // Small dust particles — simple circles with soft glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
          ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${p.light + 10}%, ${alpha * 0.4})`;
          ctx.shadowBlur = p.size * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animId.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animId.current) cancelAnimationFrame(animId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
    />
  );
}

/* ---- Ore divider between sections ---- */
function OreDivider() {
  const canvasRef = useRef(null);
  const [ref, vis] = useInView(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vis) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.offsetWidth;
    const h = 24;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const dust = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: 0.4 + Math.random() * 1.2,
      speed: 0.15 + Math.random() * 0.35,
      hue: 38 + Math.random() * 12,
      sat: 55 + Math.random() * 30,
      light: 58 + Math.random() * 18,
      opacity: 0.2 + Math.random() * 0.5,
      shimmer: Math.random() * Math.PI * 2,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      dust.forEach(p => {
        p.x += p.speed;
        p.shimmer += 0.02;
        if (p.x > w + 5) { p.x = -5; p.y = Math.random() * h; }
        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.shimmer));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [vis]);

  return (
    <div ref={ref} style={{ height: 24, position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

/* ---- Animated mining icons for High Grade explainer ---- */
function MiningIcon({ type, visible }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 48;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles = Array.from({ length: type === "upgrade" ? 12 : type === "filter" ? 16 : type === "refine" ? 10 : 8 }, (_, i) => ({
      x: Math.random() * size, y: Math.random() * size,
      size: 0.8 + Math.random() * 2,
      baseY: Math.random() * size,
      baseX: Math.random() * size,
      speed: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      hue: 38 + Math.random() * 12,
      opacity: 0.3 + Math.random() * 0.6,
    }));

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      if (type === "upgrade") {
        // Gold flecks rising and coalescing upward
        particles.forEach(p => {
          p.y -= p.speed * 0.5;
          if (p.y < -3) { p.y = size + 3; p.x = 12 + Math.random() * 24; }
          const shimmer = 0.5 + 0.5 * Math.sin(t * 3 + p.phase);
          // Converge toward center as they rise
          const pull = (1 - p.y / size) * 0.3;
          const dx = p.x + (cx - p.x) * pull;
          ctx.beginPath();
          ctx.arc(dx, p.y, p.size * (0.7 + shimmer * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity * shimmer})`;
          ctx.shadowColor = `hsla(42, 80%, 70%, ${p.opacity * 0.4})`;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        // Gem forming at top
        const gemGlow = 0.4 + 0.3 * Math.sin(t * 2);
        ctx.beginPath();
        ctx.moveTo(cx, 6); ctx.lineTo(cx + 7, 14); ctx.lineTo(cx + 4, 20);
        ctx.lineTo(cx - 4, 20); ctx.lineTo(cx - 7, 14); ctx.closePath();
        ctx.fillStyle = `hsla(42, 80%, 65%, ${gemGlow})`;
        ctx.shadowColor = `hsla(42, 80%, 70%, ${gemGlow * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (type === "filter") {
        // Particles being sorted — gold passes through, grey deflects
        particles.forEach((p, i) => {
          const isGold = i < 8;
          p.phase += 0.02;
          if (isGold) {
            // Gold particles funnel down through center
            p.y += p.speed * 0.4;
            const funnelX = cx + Math.sin(p.phase) * (p.y < cy ? 12 - (p.y / cy) * 8 : 4);
            if (p.y > size + 3) { p.y = -3; }
            const shimmer = 0.5 + 0.5 * Math.sin(t * 3 + p.phase);
            ctx.beginPath();
            ctx.arc(funnelX, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(42, 75%, 65%, ${p.opacity * shimmer})`;
            ctx.fill();
          } else {
            // Grey particles deflect sideways
            const side = i % 2 === 0 ? -1 : 1;
            p.x += side * p.speed * 0.3;
            p.y += p.speed * 0.2;
            if (p.y > size || p.x < -5 || p.x > size + 5) { p.y = cy - 5 + Math.random() * 10; p.x = cx + side * 3; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 170, 160, ${0.2 + 0.1 * Math.sin(t + p.phase)})`;
            ctx.fill();
          }
        });
        // Funnel shape
        ctx.strokeStyle = `hsla(42, 60%, 60%, ${0.2 + 0.1 * Math.sin(t)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 6); ctx.lineTo(cx - 4, cy + 6);
        ctx.moveTo(cx + 14, cy - 6); ctx.lineTo(cx + 4, cy + 6);
        ctx.stroke();
      } else if (type === "refine") {
        // Raw ore on left transforming to refined bar on right
        const progress = 0.5 + 0.5 * Math.sin(t * 0.8);
        // Raw chunks
        particles.forEach(p => {
          p.phase += 0.015;
          const rawX = 8 + Math.sin(p.phase) * 3;
          const rawY = p.baseY * 0.6 + 10;
          const barX = 32 + (p.baseX - 24) * 0.15;
          const barY = 14 + (p.baseY / size) * 20;
          const px = rawX + (barX - rawX) * progress;
          const py = rawY + (barY - rawY) * progress;
          const s = p.size * (1.2 - progress * 0.4);
          const shimmer = 0.4 + 0.6 * Math.sin(t * 2 + p.phase);
          ctx.beginPath();
          ctx.arc(px, py, s, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${38 + progress * 6}, ${55 + progress * 25}%, ${55 + progress * 12}%, ${p.opacity * shimmer})`;
          ctx.fill();
        });
        // Refined bar outline
        const barAlpha = 0.15 + progress * 0.25;
        ctx.strokeStyle = `hsla(42, 70%, 65%, ${barAlpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(28, 14, 14, 20);
        ctx.fillStyle = `hsla(42, 70%, 65%, ${barAlpha * 0.3})`;
        ctx.fillRect(28, 14, 14, 20);
      } else if (type === "steady") {
        // Steady pulse — ore vein with rhythmic glow
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5);
        // Vein line
        ctx.beginPath();
        ctx.moveTo(8, cy + 4);
        ctx.quadraticCurveTo(cx - 4, cy - 8, cx, cy);
        ctx.quadraticCurveTo(cx + 4, cy + 8, size - 8, cy - 4);
        ctx.strokeStyle = `hsla(42, 70%, 60%, ${0.3 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = `hsla(42, 80%, 65%, ${pulse * 0.5})`;
        ctx.shadowBlur = 6 + pulse * 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Pulsing nodes along vein
        [0.2, 0.5, 0.8].forEach((pos, j) => {
          const nx = 8 + pos * (size - 16);
          const ny = cy + Math.sin(pos * Math.PI + 0.5) * (pos < 0.5 ? -4 : 4);
          const nodeGlow = 0.4 + 0.6 * Math.sin(t * 1.5 + j * 1.2);
          ctx.beginPath();
          ctx.arc(nx, ny, 2.5 + nodeGlow * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(42, 80%, 68%, ${nodeGlow * 0.8})`;
          ctx.shadowColor = `hsla(42, 80%, 70%, ${nodeGlow * 0.5})`;
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [visible, type]);

  return <canvas ref={canvasRef} style={{ width: 48, height: 48, display: "block", margin: "0 auto 10px" }} />;
}

/* ---- Gold shimmer overlay for allocation bars ---- */
function ShimmerBar({ width, height, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      if (canvas) { const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); }
      return;
    }
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const flecks = Array.from({ length: 15 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: 0.4 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.015,
      opacity: 0.3 + Math.random() * 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      flecks.forEach(f => {
        f.phase += f.speed;
        const shimmer = 0.3 + 0.7 * Math.sin(f.phase);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(42, 80%, 85%, ${f.opacity * shimmer})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, width, height]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", width, height }} />;
}

/* ---- Gold dust burst for mega-theme card expand ---- */
function GoldBurst({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const burstRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 48;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (active) {
      burstRef.current = Array.from({ length: 18 }, () => ({
        x: size / 2, y: size / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 0.8 + Math.random() * 2,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        hue: 38 + Math.random() * 12,
      }));
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      let alive = false;
      burstRef.current.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 75%, 65%, ${p.life * 0.7})`;
        ctx.shadowColor = `hsla(42, 80%, 70%, ${p.life * 0.4})`;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      if (alive) animRef.current = requestAnimationFrame(draw);
    };
    if (active) draw();
    else ctx.clearRect(0, 0, size, size);

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active]);

  return <canvas ref={canvasRef} style={{ width: 48, height: 48, position: "absolute", top: -12, left: -12, pointerEvents: "none" }} />;
}

/* ---- Floating ore fragments for McVey quote ---- */
function QuoteOre() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const w = () => canvas.width / (window.devicePixelRatio || 1);
    const h = () => canvas.height / (window.devicePixelRatio || 1);

    const fragments = Array.from({ length: 8 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 300,
      size: 3 + Math.random() * 5,
      facets: Math.floor(4 + Math.random() * 3),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.003,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: -(0.04 + Math.random() * 0.08),
      drift: Math.random() * Math.PI * 2,
      driftSpeed: 0.004 + Math.random() * 0.006,
      opacity: 0.12 + Math.random() * 0.18,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.008 + Math.random() * 0.015,
      hue: 38 + Math.random() * 10,
    }));

    let animId;
    const draw = () => {
      const cw = w(), ch = h();
      ctx.clearRect(0, 0, cw, ch);

      fragments.forEach(f => {
        f.drift += f.driftSpeed;
        f.x += f.speedX + Math.sin(f.drift) * 0.15;
        f.y += f.speedY;
        f.rotation += f.rotSpeed;
        f.shimmerPhase += f.shimmerSpeed;

        if (f.y < -15) { f.y = ch + 15; f.x = Math.random() * cw; }
        if (f.x < -15) f.x = cw + 15;
        if (f.x > cw + 15) f.x = -15;

        const shimmer = 0.5 + 0.5 * Math.sin(f.shimmerPhase);
        const alpha = f.opacity * (0.4 + 0.6 * shimmer);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.shadowColor = `hsla(${f.hue}, 70%, 65%, ${alpha * 0.5})`;
        ctx.shadowBlur = f.size * 2;

        ctx.beginPath();
        for (let n = 0; n < f.facets; n++) {
          const angle = (n / f.facets) * Math.PI * 2;
          const r = f.size * (0.7 + 0.3 * Math.sin(angle * 2.5 + f.shimmerPhase));
          const fx = Math.cos(angle) * r;
          const fy = Math.sin(angle) * r;
          n === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fillStyle = `hsla(${f.hue}, 65%, 60%, ${alpha})`;
        ctx.fill();

        // Highlight
        ctx.shadowBlur = 0;
        const ha = f.rotation * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(ha) * f.size * 0.25, Math.sin(ha) * f.size * 0.25, f.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(42, 40%, 88%, ${alpha * shimmer * 0.6})`;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

const sections = [
  {
    id: "capital-markets", nav: "Capital Markets", num: "01", sub: "The Backdrop",
    title: "The Repricing Has Happened",
    body: "The S&P 500\u2019s implied 10-year forward CAGR now sits near 16% \u2014 double the 8% embedded for much of the prior decade. Credit spreads have compressed to levels not seen since 2021, narrowing the margin for error across fixed income. The productivity renaissance is real, but the market has already repriced it. The \u201CGlass Half Full\u201D thesis that guided KKR\u2019s view in recent years must evolve. The good news is in the price.",
    stat: "~16%",
    statLabel: "S&P 500 implied 10-year forward CAGR vs. ~8% for prior decade \u2014 equity and credit markets have repriced the optimism",
    fa: "The market has already priced in much of the good news \u2014 equity valuations are stretched and credit spreads have compressed. How you\u2019re positioned matters more than ever right now.",
    chart: {
      title: "S&P 500 Implied 10-Year Forward CAGR",
      data: [
        { label: "2015", v1: 8, unit: "%" }, { label: "2017", v1: 6, unit: "%" },
        { label: "2019", v1: 7, unit: "%" }, { label: "2021", v1: 10, unit: "%" },
        { label: "2023", v1: 13, unit: "%" }, { label: "2025", v1: 16, unit: "%" },
      ],
    },
  },
  {
    id: "portfolios", nav: "Portfolios", num: "02", sub: "The Tension",
    title: "But Portfolios Haven\u2019t",
    body: "Most allocators are still running the 60/40 playbook in a world that has moved past it. Return dispersion across asset classes is compressing. Inflation is settling at a structurally higher baseline. And the three tailwinds propping up global growth \u2014 fiscal spending, AI capex, and household wealth \u2014 are dangerously correlated. They could weaken together. Meanwhile, 2021-vintage credit stress is surfacing. A B is an A in this environment, but a C could be an F.",
    stat: "60/40",
    statLabel: "The legacy allocation model under pressure as return dispersion compresses and correlated risks emerge",
    fa: "The traditional portfolio mix was built for a different environment \u2014 one with lower inflation, wider return dispersion, and less correlated risks.",
    chart: null,
  },
  {
    id: "upgrade-window", nav: "Upgrade Window", num: "03", sub: "The Thesis",
    title: "The Upgrade Window Is Open",
    body: "The answer is not retreat but upgrade. The cost to raise portfolio quality has fallen to near-record lows \u2014 the premium for owning high-quality global equities has compressed to just 17%. Credit spread differentials tell the same story. This is a rare window where upgrading resilience, capital efficiency, and counterparty quality costs almost nothing. Stay invested. Get better.",
    stat: "17%",
    statLabel: "Quality premium (MSCI Quality vs. ACWI) \u2014 near historic lows, meaning upgrading portfolio quality is unusually inexpensive",
    fa: "There\u2019s a window right now where upgrading to higher-quality holdings costs almost nothing in terms of premium \u2014 that\u2019s unusual, and it won\u2019t last forever.",
    chart: {
      title: "Quality Premium: MSCI Quality vs. ACWI (Historical)",
      data: [
        { label: "2016", v1: 32, unit: "%" }, { label: "2018", v1: 28, unit: "%" },
        { label: "2020", v1: 35, unit: "%" }, { label: "2022", v1: 25, unit: "%" },
        { label: "2024", v1: 20, unit: "%" }, { label: "Now", v1: 17, unit: "%" },
      ],
    },
  },
  {
    id: "alpha-emerging", nav: "Alpha Emerging", num: "04", sub: "The Conviction Themes",
    title: "Alpha Is Emerging",
    body: "Operational improvement is delivering historic margin expansion \u2014 particularly in businesses transitioning from capital-heavy to capital-light models. International earnings inflections in Europe, Japan, and Emerging Markets are running above trend for the first time in years, creating the broadest opportunity set for geographic diversification since the post-GFC era. And national security is no longer just a policy concern \u2014 it is redefining where capital flows across supply chains, energy, data, and critical infrastructure. The scale of this buildout is also a primary reason inflation stays sticky, connecting the investment thesis directly to the rate regime.",
    stat: "3 of 4",
    statLabel: "Major regions where KKR forecasts above-consensus GDP growth in 2026",
    fa: "For the first time in years, international earnings are inflecting above trend \u2014 this is a broadening opportunity, not just a U.S. story.",
    chart: {
      title: "2026 GDP Growth: KKR vs. Consensus",
      data: [
        { label: "U.S.", v1: 2.5, v2: 2.3, unit: "%" }, { label: "Eurozone", v1: 1.4, v2: 1.1, unit: "%" },
        { label: "Japan", v1: 1.5, v2: 1.0, unit: "%" }, { label: "EM ex-China", v1: 4.8, v2: 4.2, unit: "%" },
      ],
      legend: [{ label: "KKR Forecast", color: C.purple }, { label: "Consensus", color: C.gold }],
    },
    videos: [
      { name: "Henry McVey", title: "Head of GMAA", region: "Global Overview", initials: "HM" },
      { name: "Regional Head", title: "Americas", region: "U.S. & LatAm", initials: "AM" },
      { name: "Regional Head", title: "EMEA", region: "Europe & Middle East", initials: "EU" },
      { name: "Regional Head", title: "Asia Pacific", region: "Asia & Japan", initials: "AP" },
    ],
  },
  {
    id: "high-grade", nav: "High Grade", num: "05", sub: "The Action",
    title: "High Grade Your Portfolio",
    body: "Shift from 60/40 to a framework that effectively leverages Private Equity, Real Assets, and Private Credit \u2014 the asset classes with the most compelling medium-term return potential. Own less index. Own more structuring. The portfolio that outperforms in this regime is not the one with the best market call \u2014 it is the one built to compound through governance, active ownership, and the ability to make its own luck.",
    stat: "High Grade",
    statLabel: "The action: upgrade quality, add structuring, compress risk \u2014 implemented through a 40/30/30 allocation framework",
    fa: "We believe adding meaningful private markets exposure can help bridge the gap between your return targets and what public markets are likely to deliver over the next five years.",
    chart: null,
  },
];

const megaThemes = [
  { t: "Corporate Reform", s: "Capital Heavy \u2192 Capital Light", d: "Multinationals are shedding cyclical weight. The carve-out pipeline is surging as companies reposition toward higher-margin, asset-light models \u2014 and private markets are the natural buyer.", i: "\u25A3" },
  { t: "National Security", s: "Security as Inflation Driver", d: "Security now means supply chains, energy independence, data sovereignty, and pharmaceutical resilience. Governments are spending massively \u2014 and redundancy is expensive. Thirty years of just-in-time efficiency are being replaced by just-in-case resilience, and that buildout is a primary reason inflation stays sticky near 2.5\u20133%. The capital requirements are enormous, long-duration, and directly linked to the rate regime.", i: "\u25C8" },
  { t: "Productivity Renaissance", s: "AI \u00B7 Automation \u00B7 Digitalization", d: "AI capex is already contributing meaningfully to real GDP growth. But the next wave of value creation shifts from the companies enabling AI to the companies applying it.", i: "\u25C7" },
  { t: "Asia Tilt", s: "India + Japan + Intra-Asia Trade", d: "India\u2019s consumption upgrade is accelerating across financial services, healthcare, and education. Japan\u2019s corporate reform is unlocking trapped value. Trade within Asia is decoupling from the West.", i: "\u25C6" },
  { t: "Services Economy", s: "Services as Growth Driver", d: "Goods trade is increasingly politicized. Services \u2014 which drive productivity, trade balances, and market leadership \u2014 are becoming the durable growth engine most portfolios underweight.", i: "\u25A4" },
  { t: "Collateral-Based Flows", s: "Asset-Backed Opportunities", d: "As banks retreat and credit markets mature, asset-backed lending is becoming the connective tissue of private credit. The structural demand is multi-year and under-allocated.", i: "\u25A5" },
];

const authors = [
  { n: "Henry H. McVey", r: "Partner, Head of Global Macro and Asset Allocation and CIO of KKR\u2019s Balance Sheet", l: "New York" },
  { n: "David McNellis", r: "Managing Director, Co-Head of Global Macro, and Head of Private Markets Portfolio Construction", l: "New York" },
  { n: "Aidan T. Corcoran", r: "Managing Director, Co-Head of Global Macro", l: "Dublin" },
  { n: "Changchun Hua", r: "Managing Director, Global Macro and Asset Allocation", l: "Hong Kong" },
];

const socialPosts = [
  { p: "LinkedIn \u2014 Launch", t: "\"The productivity miracle is real. It\u2019s also priced in.\" Henry McVey on why 2026 is the year to High Grade \u2014 not derisk \u2014 your portfolio. Our latest Outlook is live.", n: "McVey byline \u00B7 Links to Tier 1 \u00B7 Pin to company page" },
  { p: "LinkedIn \u2014 Data Carousel (1/5)", t: "The S&P 500\u2019s implied 10-year forward CAGR: ~16%.\nA decade ago, it was 8%.\nThe good news isn\u2019t a secret anymore.", n: "Branded slide \u00B7 Mobile-optimized \u00B7 Drives to web experience" },
  { p: "LinkedIn \u2014 Conviction Theme", t: "Corporate Reform: Capital Heavy \u2192 Capital Light.\nThe carve-out pipeline is surging. Multinationals are shedding cyclical weight and private markets are the natural buyer.", n: "500\u2013800 words \u00B7 Weekly series \u00B7 Links to theme module" },
  { p: "X / Twitter \u2014 Thread (1/8)", t: "KKR\u2019s 2026 Outlook in one sentence: the productivity renaissance is real, but it\u2019s priced in. What matters now is portfolio *quality*, not portfolio *size*.", n: "8\u201310 tweets \u00B7 Conversational tone \u00B7 Thread ends with web link" },
];

const pitchSlides = [
  { n: "01", t: "Macro Setup", d: "One chart: S&P implied return compression. Headline \u2014 \"The good news is priced in.\"" },
  { n: "02", t: "The High Grading Thesis", d: "Quality premium chart + cost-to-upgrade message. Bridge to fund-specific content." },
  { n: "03", t: "Where We See Alpha", d: "Conviction theme summary. Each theme maps to specific KKR strategies." },
  { n: "04", t: "Regional Conviction", d: "GDP forecast table: KKR vs. consensus. \"Above consensus in 3 of 4 regions.\"" },
  { n: "05\u201306", t: "Portfolio Construction", d: "The 40/30/30 framework with 5-year return expectations by asset class." },
];

function SectionBlock({ s }) {
  const [ref, vis] = useInView(0.1);
  const [chartStarted, setChartStarted] = useState(false);

  useEffect(() => {
    if (vis && s.chart) {
      const timer = setTimeout(() => setChartStarted(true), 900);
      return () => clearTimeout(timer);
    }
  }, [vis]);

  return (
    <div ref={ref} id={s.id} style={{
      maxWidth: 940, margin: "0 auto", padding: "0 40px",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 36, padding: "40px 0", borderTop: `1px solid ${C.divider}`, alignItems: "start" }}>
        <div style={{ position: "sticky", top: 120 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 3, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
            {s.num} {"\u2014"} {s.sub}
          </div>
          <div style={{ fontFamily: display, fontSize: s.stat.length > 6 ? 32 : 44, fontWeight: 700, color: C.purple, lineHeight: 1.1, marginBottom: 8 }}>{s.stat}</div>
          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{s.statLabel}</div>
        </div>
        <div>
          <h3 style={{ fontFamily: display, fontSize: 26, fontWeight: 600, color: C.purple, margin: "0 0 14px", lineHeight: 1.3 }}>{s.title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: C.textSec, margin: "0 0 18px" }}>{s.body}</p>
          {s.chart && (
            <AnimBarChart
              title={s.chart.title}
              data={s.chart.data}
              started={chartStarted}
              legend={s.chart.legend}
            />
          )}
          {s.videos && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 12 }}>Regional Perspectives</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {s.videos.map((v, vi) => (
                  <div key={vi} style={{ background: C.cream, border: `1px solid ${C.divider}`, padding: "16px 12px", textAlign: "center", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.divider}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", margin: "0 auto 10px",
                      background: `linear-gradient(135deg, ${C.purpleLight}, ${C.purpleDark})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{v.initials}</span>
                      <div style={{
                        position: "absolute", bottom: -2, right: -2,
                        width: 18, height: 18, borderRadius: "50%",
                        background: C.gold, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 8, color: C.purpleDark }}>{"\u25B6"}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 2 }}>{v.name}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>{v.region}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, fontStyle: "italic", marginTop: 8 }}>
                Video placeholder: 60-90 second perspectives from each regional head on their local opportunity set.
              </div>
            </div>
          )}
          <div style={{ background: C.goldMuted, borderLeft: `3px solid ${C.gold}`, padding: "12px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 5 }}>Suggested Client Language</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0, fontStyle: "italic" }}>
              {"\u201C"}{s.fa}{"\u201D"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighGradeExplainer() {
  const [ref, vis] = useInView(0.2);
  const items = [
    { type: "upgrade", label: "Upgrade Quality", desc: "Shift from broad market exposure to high-quality, capital-efficient businesses" },
    { type: "filter", label: "Compress Risk", desc: "Reduce concentration in correlated public market tailwinds" },
    { type: "refine", label: "Add Structuring", desc: "Replace passive index weight with private markets alpha and asset-backed flows" },
    { type: "steady", label: "Stay Invested", desc: "Don\u2019t retreat to cash \u2014 the cost of upgrading is at historic lows" },
  ];
  return (
    <section ref={ref} style={{ background: C.purple, borderTop: "1px solid rgba(184,148,62,0.3)", borderBottom: "1px solid rgba(184,148,62,0.3)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Definition</div>
          <h2 style={{ fontFamily: display, fontSize: 34, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>What Does It Mean to High Grade?</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto" }}>
            Four principles that define the shift from passive allocation to intentional portfolio construction.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 20px", textAlign: "center",
              opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
            }}>
              <MiningIcon type={item.type} visible={vis} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{item.label}</div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ display: "inline-block", padding: "10px 24px", border: "1px solid rgba(184,148,62,0.3)", background: "rgba(184,148,62,0.08)" }}>
            <span style={{ fontFamily: display, fontSize: 16, color: C.goldLight, fontStyle: "italic" }}>
              {"\u201CThe discipline to upgrade is now the edge.\u201D"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function KKROutlook() {
  const [tab, setTab] = useState("outlook");
  const [aTheme, setATheme] = useState(null);
  const [scrollY, setSY] = useState(0);
  const [hStarted, setHS] = useState(false);
  const [hRef, hIn] = useInView(0.3);
  const [alloc, setAlloc] = useState("traditional");
  const [email, setEmail] = useState("");
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => { const h = () => setSY(window.scrollY); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { if (hIn) setHS(true); }, [hIn]);

  const scrollTo = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const tabs = [
    { id: "outlook", l: "The Outlook" },
    { id: "extensions", l: "Repurposing & Extensions" },
    { id: "governance", l: "Editorial Governance" },
  ];

  return (
    <div style={{ fontFamily: sans, color: C.text, background: C.warmWhite, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,300;1,14..32,400&display=swap" rel="stylesheet" />

      {/* ATTRIBUTION */}
      <div style={{ background: C.purpleDark, padding: "10px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>
          {"By "}<strong style={{ color: C.goldLight }}>Jonathan Blank</strong>{" \u2014 to showcase how I think about investment editorial stories"}
        </span>
      </div>
      <div style={{ background: C.goldMuted, padding: "10px 32px", textAlign: "center", borderBottom: `1px solid ${C.divider}` }}>
        <span style={{ fontSize: 12, color: C.purple, fontWeight: 500 }}>
          {"This version is designed for "}<strong>Financial Advisors</strong>{" via "}
          <a href="https://www.kkr.com/about/global-wealth-solutions" target="_blank" rel="noopener noreferrer" style={{ color: C.purple, textDecoration: "underline" }}>KKR Global Wealth Solutions</a>
        </span>
      </div>
      <div style={{ background: C.cream, padding: "9px 32px", textAlign: "center", borderBottom: `1px solid ${C.divider}` }}>
        <span style={{ fontSize: 11, color: C.textSec }}>
          {"Using "}<strong style={{ color: C.purple }}>TOFU AI</strong>{", we would create customized landing pages for different institutional investor audiences \u2014 pension funds, sovereign wealth funds, insurance companies, and more \u2014 each tailored from this single source narrative."}
        </span>
      </div>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrollY > 50 ? "rgba(46,0,47,0.97)" : C.purple,
        backdropFilter: scrollY > 50 ? "blur(12px)" : "none",
        transition: "all 0.3s", borderBottom: "1px solid rgba(184,148,62,0.2)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: 3 }}>KKR</span>
              <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.25)" }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Global Macro & Asset Allocation</span>
            </div>
            {tab === "outlook" && (
              <div style={{ display: "flex", gap: 18 }}>
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} onClick={(e) => scrollTo(e, s.id)}
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 500, letterSpacing: 0.3, whiteSpace: "nowrap", cursor: "pointer" }}
                    onMouseEnter={e => e.target.style.color = C.goldLight}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                  >{s.nav}</a>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 8 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ padding: "10px 20px", border: "none", background: "transparent", color: tab === t.id ? C.goldLight : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, fontFamily: sans, cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", transition: "all 0.2s", letterSpacing: 0.3 }}
              >{t.l}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* ========== OUTLOOK ========== */}
      {tab === "outlook" && (<>
        {/* HERO */}
        <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", background: `linear-gradient(165deg, ${C.purpleDark} 0%, ${C.purple} 45%, ${C.purpleLight} 100%)`, position: "relative", overflow: "hidden" }}>
          <GoldParticles />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, transparent, ${C.gold}, transparent)`, zIndex: 2 }} />
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 40px 56px", position: "relative", zIndex: 3 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 40 }}>{"Outlook for 2026 \u2014 Henry H. McVey"}</div>
            <h1 style={{ fontFamily: display, fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700, color: "rgba(220,200,230,0.5)", lineHeight: 1.15, margin: "0 0 8px" }}>The productivity miracle is real.</h1>
            <h1 style={{ fontFamily: display, fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>{"It\u2019s also priced in."}</h1>
            <p style={{ fontFamily: display, fontSize: "clamp(17px, 2.2vw, 25px)", color: C.goldLight, fontStyle: "italic", fontWeight: 300, margin: "24px 0 0", lineHeight: 1.4, maxWidth: 520 }}>The discipline to upgrade is now the edge.</p>
            <div style={{ margin: "44px 0 0", display: "flex", gap: 12 }}>
              <button onClick={(e) => scrollTo(e, "capital-markets")} style={{ background: C.gold, color: C.purpleDark, border: "none", padding: "13px 28px", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, cursor: "pointer", fontFamily: sans }} onMouseEnter={e => e.target.style.background = C.goldLight} onMouseLeave={e => e.target.style.background = C.gold}>Read the Outlook</button>
              <button style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.25)", padding: "13px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: sans }} onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; e.target.style.color = "rgba(255,255,255,0.8)"; }}>Watch McVey (1:30)</button>
            </div>
          </div>
          <div ref={hRef} style={{ maxWidth: 940, margin: "0 auto", padding: "0 40px 56px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, position: "relative", zIndex: 3 }}>
            {[
              { v: 16, sf: "%", lb: "S&P 500 Implied 10-yr Forward CAGR", sl: "vs. ~8% for prior decade \u2014 optimism is elevated" },
              { v: 17, sf: "%", lb: "Quality Premium (MSCI Quality vs. ACWI)", sl: "near historic lows \u2014 upgrading is inexpensive" },
              { v: 7600, sf: "", lb: "KKR S&P 500 Price Target (2026)", sl: "~9% return \u00B7 EPS forecast $303 vs. $301 consensus" },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)", padding: "26px 22px", textAlign: "center" }}>
                <div style={{ fontFamily: display, fontSize: i === 2 ? 34 : 40, fontWeight: 700, color: C.goldLight, marginBottom: 6, lineHeight: 1 }}>
                  <AnimC end={item.v} suffix={item.sf} duration={i === 2 ? 2200 : 1800} started={hStarted} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 0.3, marginBottom: 4 }}>{item.lb}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{item.sl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* NAV EXPLAINER */}
        <section style={{ background: C.cream, borderBottom: `1px solid ${C.divider}`, padding: "36px 40px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: C.textSec, margin: 0 }}>
              <strong style={{ color: C.purple }}>How to navigate this experience:</strong>
              {" The five sections below follow the arc of KKR\u2019s macro outlook \u2014 from why "}
              <em>The Repricing Has Happened</em>{", to why "}
              <em>Portfolios Haven\u2019t</em>{" kept pace, through "}
              <em>The Upgrade Window</em>{" that\u2019s now open, to where "}
              <em>Alpha Is Emerging</em>{" and how to "}
              <em>High Grade Your Portfolio</em>{" to capture it. Use the navigation above to jump to any section. The "}
              <em>Repurposing & Extensions</em>{" tab shows how this content adapts for social media, pitchbooks, and events. "}
              <em>Editorial Governance</em>{" outlines the workflow that produced it."}
            </p>
          </div>
        </section>

        <HighGradeExplainer />

        {/* NARRATIVE */}
        <section style={{ background: C.warmWhite }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 40px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>The Case for Action</div>
            <h2 style={{ fontFamily: display, fontSize: 36, fontWeight: 700, color: C.purple, margin: "0 0 14px", lineHeight: 1.2 }}>{"High Grade, Don\u2019t Derisk"}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: C.textSec, maxWidth: 600, margin: "0 0 52px" }}>
              {"Growth is running above consensus. The credit cycle is maturing. And portfolios built for the last decade are not built for the next one. Five sections that frame KKR\u2019s case for upgrading \u2014 not retreating."}
            </p>
          </div>
          {sections.map((s, i) => <div key={s.id}>{i > 0 && <OreDivider />}<SectionBlock s={s} /></div>)}
        </section>

        {/* ALLOCATION */}
        <section style={{ background: C.cream, borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "68px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Portfolio Construction</div>
            <h2 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, color: C.purple, margin: "0 0 8px" }}>The Allocation Shift</h2>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 32 }}>Less passive exposure, more private markets alpha.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 32 }}>
              {["traditional", "highgrade"].map(v => (
                <button key={v} onClick={() => setAlloc(v)} style={{ padding: "9px 20px", border: "none", fontSize: 13, fontWeight: 500, fontFamily: sans, cursor: "pointer", background: alloc === v ? C.purple : "transparent", color: alloc === v ? "#fff" : C.textSec, transition: "all 0.3s" }}>
                  {v === "traditional" ? "Traditional 60/40" : "High Graded 40/30/30"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
              {(alloc === "traditional" ? [
                { l: "Public Equities", p: 60, c: C.purpleLight }, { l: "Fixed Income", p: 40, c: "#9A7B9C" },
              ] : [
                { l: "Public Equities", p: 40, c: C.purpleLight }, { l: "PE & Real Assets", p: 30, c: C.purple }, { l: "Private Credit", p: 30, c: C.gold },
              ]).map((item, i) => (
                <div key={`${alloc}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110 }}>
                  <div style={{ width: 85, height: 145, background: C.cream, border: `2px solid ${item.c}`, borderRadius: 3, overflow: "hidden", display: "flex", alignItems: "flex-end", position: "relative" }}>
                    <div style={{ width: "100%", background: item.c, transition: "height 0.8s cubic-bezier(0.16,1,0.3,1)", height: `${item.p}%`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1 }}>{item.p}%</span>
                      {alloc === "highgrade" && <ShimmerBar width={85} height={Math.round(145 * item.p / 100)} active={true} />}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.textSec, textAlign: "center", maxWidth: 100 }}>{item.l}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ background: C.goldMuted, borderLeft: `3px solid ${C.gold}`, padding: "11px 16px", display: "inline-block", textAlign: "left" }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>Suggested Client Language</div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: C.text, margin: 0, fontStyle: "italic", maxWidth: 460 }}>
                  {"\u201CWe believe adding meaningful private markets exposure can help bridge the gap between your return targets and what public markets are likely to deliver over the next five years.\u201D"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MEGA THEMES */}
        <section style={{ background: C.warmWhite }}>
          <div style={{ maxWidth: 940, margin: "0 auto", padding: "68px 40px" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Structural Conviction Themes</div>
            <h2 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, color: C.purple, margin: "0 0 36px" }}>Where We Are Placing Big Bets</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: C.divider }}>
              {megaThemes.map((th, i) => (
                <div key={i} onClick={() => setATheme(aTheme === i ? null : i)} style={{ background: aTheme === i ? C.purple : C.card, padding: "26px 22px", cursor: "pointer", transition: "all 0.3s", minHeight: 165, display: "flex", flexDirection: "column" }}
                  onMouseEnter={e => { if (aTheme !== i) e.currentTarget.style.background = C.cream; }}
                  onMouseLeave={e => { if (aTheme !== i) e.currentTarget.style.background = C.card; }}>
                  <div style={{ fontSize: 18, color: aTheme === i ? C.goldLight : C.gold, marginBottom: 12, position: "relative" }}>{th.i}<GoldBurst active={aTheme === i} /></div>
                  <h3 style={{ fontFamily: display, fontSize: 19, fontWeight: 600, margin: "0 0 3px", color: aTheme === i ? "#fff" : C.purple, lineHeight: 1.3 }}>{th.t}</h3>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.5, color: aTheme === i ? C.goldLight : C.textMuted, marginBottom: 10 }}>{th.s}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.7, margin: 0, color: aTheme === i ? "rgba(255,255,255,0.7)" : C.textSec, flex: 1 }}>{th.d}</p>
                  {aTheme === i && <div style={{ marginTop: 12, fontSize: 11, color: C.goldLight, fontWeight: 500 }}>{"Explore theme \u2192"}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section style={{ background: C.purple, position: "relative", overflow: "hidden" }}>
          <QuoteOre />
          <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, background: "radial-gradient(circle, rgba(184,148,62,0.1) 0%, transparent 70%)" }} />
          <div style={{ maxWidth: 660, margin: "0 auto", padding: "68px 40px", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: display, fontSize: 52, fontWeight: 300, color: C.gold, lineHeight: 1, marginBottom: 10, opacity: 0.5 }}>{"\u201C"}</div>
            <blockquote style={{ fontFamily: display, fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
              {"The opportunity set in operational improvement stories, collateral-based cash flows, and international markets is as robust as we\u2019ve seen in years. However, the cycle is more mature, so we believe now is the time to High Grade portfolios."}
            </blockquote>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purpleLight}, ${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, color: "#fff" }}>HM</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Henry H. McVey</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{"Head of Global Macro & Asset Allocation, CIO of KKR\u2019s Balance Sheet"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* TIER 3 */}
        <section style={{ background: C.cream, borderTop: `1px solid ${C.divider}` }}>
          <div style={{ maxWidth: 740, margin: "0 auto", padding: "68px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Deep Dive</div>
            <h2 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, color: C.purple, margin: "0 0 10px" }}>{"High Grade, Don\u2019t Derisk"}</h2>
            <p style={{ fontSize: 14, color: C.textSec, maxWidth: 440, margin: "0 auto 32px" }}>The complete outlook with all macro forecasts, capital market assumptions, asset allocation views, and 40+ supporting exhibits.</p>
            {!gateOpen ? (
              <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "36px 32px", maxWidth: 380, margin: "0 auto" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.purple, marginBottom: 16 }}>Access the full report</div>
                <input type="email" placeholder="Business email address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.divider}`, fontSize: 14, fontFamily: sans, marginBottom: 10, outline: "none", boxSizing: "border-box", background: C.warmWhite }} />
                <button onClick={() => setGateOpen(true)} style={{ width: "100%", padding: "12px", background: C.purple, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, fontFamily: sans, cursor: "pointer" }} onMouseEnter={e => e.target.style.background = C.purpleLight} onMouseLeave={e => e.target.style.background = C.purple}>Download Report (PDF)</button>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 10 }}>By downloading the full report, you acknowledge you are a registered financial advisor.</div>
              </div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "36px 32px", maxWidth: 380, margin: "0 auto" }}>
                <div style={{ fontSize: 34, marginBottom: 10, color: C.purple }}>{"\u2713"}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.purple, marginBottom: 6 }}>Report ready for download</div>
                <div style={{ fontSize: 13, color: C.textSec }}>High Grading: Outlook for 2026 (PDF, 15.4 MB)</div>
              </div>
            )}
          </div>
        </section>
      </>)}

      {/* ========== EXTENSIONS ========== */}
      {tab === "extensions" && (
        <section style={{ background: C.warmWhite }}>
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 40px" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Channel Extensions</div>
            <h2 style={{ fontFamily: display, fontSize: 34, fontWeight: 700, color: C.purple, margin: "0 0 8px" }}>Repurposing the Outlook</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.textSec, margin: "0 0 44px", maxWidth: 600 }}>
              {"Every extension is a purposeful compression of the same macro outlook \u2014 not a separate creative exercise. The narrative architecture stays constant; what changes is the depth, format, and call to action."}
            </p>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Audience-Specific Versions</h3>
            <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "24px", marginBottom: 44 }}>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: C.textSec, margin: "0 0 16px" }}>
                {"Using "}<strong style={{ color: C.purple }}>TOFU</strong>{" (an AI-powered content personalization platform), we create audience-specific landing pages from the same source narrative. Each version preserves the five-section architecture while adapting language, emphasis, and calls to action for the audience\u2019s decision-making context."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { aud: "Financial Advisors", focus: "Client conversation starters, suggested language, allocation tools", url: "/outlook/wealth" },
                  { aud: "Pension Funds", focus: "Liability-driven context, funded status implications, long-duration asset framing", url: "/outlook/pensions" },
                  { aud: "Sovereign Wealth Funds", focus: "Geopolitical positioning, national security emphasis, infrastructure allocation", url: "/outlook/sovereign" },
                  { aud: "Insurance CIOs", focus: "ALM implications, capital-efficient structures, collateral-based flows emphasis", url: "/outlook/insurance" },
                ].map((a, i) => (
                  <div key={i} style={{ background: C.cream, border: `1px solid ${C.divider}`, padding: "16px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.purple, marginBottom: 6 }}>{a.aud}</div>
                    <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5, margin: "0 0 8px" }}>{a.focus}</p>
                    <div style={{ fontSize: 10, color: C.gold, fontWeight: 500 }}>{a.url}</div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Launch Flywheel</h3>
            <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "24px", marginBottom: 44 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>Week 1: Launch Sequence</div>
                  <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Day 1:</strong> Video teasers from McVey, McNellis, and Corcoran posted to their personal LinkedIn accounts. KKR handles amplify with reshare + commentary.</div>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Day 2:</strong> Full launch post from McVey on KKR LinkedIn. McVey publishes extended commentary on his personal LinkedIn with behind-the-thesis narrative.</div>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Day 3:</strong> Data carousel series begins (5 posts, 1 per day). X/Twitter thread from KKR handle.</div>
                    <div><strong style={{ color: C.purple }}>Day 5:</strong> Email distribution to segmented lists with audience-specific subject lines and preview text.</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>{"Weeks 2\u201312: Sustain Cadence"}</div>
                  <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Weekly:</strong> One conviction theme deep-dive post on LinkedIn (6 themes = 6 weeks of content).</div>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Bi-weekly:</strong> Author video clips addressing one theme each. Posted to personal accounts, reshared by KKR.</div>
                    <div style={{ marginBottom: 6 }}><strong style={{ color: C.purple }}>Monthly:</strong> Webinar series. Each session produces replay + social clips that feed back into the content flywheel.</div>
                    <div><strong style={{ color: C.purple }}>Ongoing:</strong> Macro updates tied back to the High Grading thesis as data evolves.</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic", borderTop: `1px solid ${C.divider}`, paddingTop: 12 }}>
                {"Personal LinkedIn accounts drive 3\u20135x the engagement of brand handles in financial services. The author-first strategy ensures the Outlook is amplified through the most trusted channels in institutional investing."}
              </div>
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Social Media Posts</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 44 }}>
              {socialPosts.map((sp, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "22px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{sp.p}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: "0 0 12px", flex: 1, whiteSpace: "pre-line" }}>{sp.t}</p>
                  <div style={{ fontSize: 10, color: C.textMuted, borderTop: `1px solid ${C.divider}`, paddingTop: 8 }}>{sp.n}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>{"Pitchbook Module (4\u20136 Slides)"}</h3>
            <p style={{ fontSize: 13, color: C.textSec, marginBottom: 16, maxWidth: 560 }}>A self-contained macro context module for any KKR fundraising or client review deck.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 44 }}>
              {pitchSlides.map((sl, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "52px 160px 1fr", background: C.card, border: `1px solid ${C.divider}` }}>
                  <div style={{ background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", color: C.goldLight, fontFamily: display, fontSize: 16 }}>{sl.n}</div>
                  <div style={{ padding: "12px 14px", borderRight: `1px solid ${C.divider}`, display: "flex", alignItems: "center" }}><span style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>{sl.t}</span></div>
                  <div style={{ padding: "12px 14px" }}><span style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{sl.d}</span></div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Event Collateral</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { t: "McVey Keynote (20 min)", d: "Structured around the five-section narrative. Opens with the 16% implied CAGR provocation. Conviction themes tailored to each audience." },
                { t: "Webinar Series (Monthly)", d: "Launch webinar covers the full outlook. Five subsequent sessions deep-dive into one conviction theme each. Fireside format with external moderator." },
                { t: "Conference Leave-Behind", d: "One-page summary: hero headline, three counter stats, five section titles, QR code to web experience. For the hallway conversation." },
                { t: "Video: 90-Second Cut", d: "McVey delivers the High Grading thesis in his own words. Subtitled for silent autoplay. 60-second cut for LinkedIn native upload." },
              ].map((ev, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "22px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>{ev.t}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.7, color: C.textSec, margin: 0 }}>{ev.d}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32, padding: "12px 16px", background: C.goldMuted, borderLeft: `3px solid ${C.gold}`, fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
              <strong>Compliance note:</strong>{" All materials carry the standard McVey/GMAA personal-views disclaimer. Social posts link to a hosted disclaimer page. All final materials require legal review \u2014 see the Editorial Governance tab for the tiered review protocol."}
            </div>
          </div>
        </section>
      )}

      {/* ========== GOVERNANCE ========== */}
      {tab === "governance" && (
        <section style={{ background: C.warmWhite }}>
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 40px" }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 16 }}>Framework</div>
            <h2 style={{ fontFamily: display, fontSize: 34, fontWeight: 700, color: C.purple, margin: "0 0 8px" }}>Editorial Governance</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.textSec, margin: "0 0 44px", maxWidth: 600 }}>
              The gap between a great research report and a great thought leadership platform is governance. This framework ensures coherence across channels, prevents compliance bottlenecks, and sustains engagement beyond launch week.
            </p>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 20px" }}>Editorial Workflow</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 44 }}>
              {[
                { p: "1. Ideation", tm: "T-12 wks", d: "McVey/GMAA develops macro thesis. Marketing conducts competitive audit using Jasper.ai to perform deep research into peer outlooks (BlackRock, Apollo, Bridgewater, etc.) where published, identifying narrative gaps and differentiated angles. Themes stress-tested against client intelligence.", w: "GMAA, Marketing Strategy, Client Intel" },
                { p: "2. Editorial Brief", tm: "T-8 wks", d: "Editorial Lead presents narrative brief to McVey, Content Lead, and Global Marketing for sign-off. Once approved, McVey provides written content. Web, design, and social teams then briefed. TOFU generates audience-specific content variants.", w: "Editorial Lead, McVey, Content Lead, Global Mktg" },
                { p: "3. Development", tm: "T-4 wks", d: "Editorial team shapes draft into channel-ready content. Web build begins. Video pre-production with regional heads. Pitchbook module and social assets drafted. Brand and accessibility audit.", w: "Editorial, Design, Dev, Video, Brand" },
                { p: "4. Compliance Review", tm: "T-2 wks", d: "Jasper.ai performs first-pass compliance screening across all materials, flagging specific language and claims for human review. Legal and compliance then focus on flagged areas plus full review of PDF report and video script. Fact-checking of all data. Final QA.", w: "Jasper.ai, Legal, Compliance, QA, Mktg Ops" },
                { p: "5. Launch", tm: "T-0", d: "Coordinated release: web live, PDF distributes, author video teasers on personal LinkedIns, full launch from McVey on KKR handle with personal commentary. Social begins. Media outreach.", w: "Marketing, Comms, McVey, Sales Enablement" },
                { p: "6. Sustain", tm: "T+1 to 12 wks", d: "Six-part conviction theme series publishes weekly: Wk 1 Corporate Reform, Wk 2 National Security (as inflation driver), Wk 3 Productivity Renaissance, Wk 4 Asia Tilt, Wk 5 Services Economy, Wk 6 Collateral-Based Flows. Each authored on McVey\u2019s or regional head\u2019s personal LinkedIn with KKR amplification Day 2. Bi-weekly author video clips. Monthly webinars (fireside format, external moderator) produce replay assets for web experience. Weeks 7\u201312 address reader-surfaced tensions: forecast-vs.-narrative reconciliation, China macro-vs.-micro paradox, productivity-vs.-retraining gap. Bi-weekly engagement review. Jasper.ai monitors competitor publications for reactive opportunities.", w: "Marketing, GMAA, Digital Analytics" },
              ].map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 200px", background: C.card, border: `1px solid ${C.divider}` }}>
                  <div style={{ background: C.cream, padding: "14px", borderRight: `1px solid ${C.divider}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>{s.p}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{s.tm}</div>
                  </div>
                  <div style={{ padding: "14px" }}><p style={{ fontSize: 12, lineHeight: 1.7, color: C.textSec, margin: 0 }}>{s.d}</p></div>
                  <div style={{ padding: "14px", borderLeft: `1px solid ${C.divider}` }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, color: C.textMuted, textTransform: "uppercase", marginBottom: 3 }}>Stakeholders</div>
                    <span style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>{s.w}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 20px" }}>AI-Assisted Toolchain</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 44 }}>
              <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.purple, marginBottom: 8 }}>Jasper.ai</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 6 }}><strong>Competitive Intelligence:</strong> Deep research into peer outlook publications. Identifies narrative positioning, data emphasis, and thematic gaps.</div>
                  <div style={{ marginBottom: 6 }}><strong>First-Pass Compliance:</strong> Screens all materials against pre-approved language library and regulatory guidelines. Highlights specific claims for human review.</div>
                  <div><strong>Ongoing Monitoring:</strong> Tracks competitor publications post-launch for reactive content opportunities.</div>
                </div>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.purple, marginBottom: 8 }}>TOFU</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 6 }}><strong>Audience Versioning:</strong> Generates audience-specific landing pages from the single source narrative. Adapts hero copy, section emphasis, and CTAs.</div>
                  <div style={{ marginBottom: 6 }}><strong>Personalization at Scale:</strong> Each version preserves the five-section architecture and McVey voice while tuning for the audience{"'"}s context.</div>
                  <div><strong>Compliance Integrated:</strong> All variants route through the same tiered review protocol before deployment.</div>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 20px" }}>Voice & Tone Standards</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 44 }}>
              {[
                { a: "Conviction", y: "Clear positions with evidence. \"We believe\" followed by \"because.\"", n: "Hedging every statement into meaninglessness." },
                { a: "Precision", y: "Specific numbers. \"17% quality premium\" not \"low premiums.\"", n: "Vague qualifiers. Specificity is authority." },
                { a: "Accessibility", y: "Explain through metaphor. \"High Grading\" itself is the model.", n: "Assuming the reader has your expertise level." },
                { a: "Urgency", y: "Frame timing as opportunity. \"The cost to upgrade is low today.\"", n: "Fear-based framing. Not the KKR voice." },
                { a: "Continuity", y: "Reference prior outlooks. \"Glass Half Full evolves into High Grading.\"", n: "Treating each publication as a standalone." },
              ].map((v, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.purple, marginBottom: 8 }}>{v.a}</div>
                  <div style={{ fontSize: 11, color: "#2D6B2D", marginBottom: 6, lineHeight: 1.6 }}>{"\u2713"} {v.y}</div>
                  <div style={{ fontSize: 11, color: "#8B3A3A", lineHeight: 1.6 }}>{"\u2717"} {v.n}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Compliance Integration</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 44 }}>
              {[
                { t: "Pre-Approved Language Library", d: "Living document of compliance-cleared phrases. Social posts drawing from this library can bypass individual review. Jasper.ai validates drafts against this library before human review." },
                { t: "Tiered Review Protocol", d: "Web hero + social: batch review. Narrative + video: individual. Full report: standard. TOFU variants: reviewed as batch against source. Prevents bottlenecks." },
                { t: "Standing Disclaimer Framework", d: "All channels carry McVey personal-views disclaimer. Web footer, pitchbook every slide, social links to hosted page. Author LinkedIn posts include standardized disclosure." },
              ].map((c, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.purple, marginBottom: 6 }}>{c.t}</div>
                  <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6, margin: 0 }}>{c.d}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: C.purple, margin: "0 0 18px" }}>Measurement</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { c: "Web Experience", m: "Unique visitors, scroll depth by tier, time on page, PDF downloads, email captures", g: "2x prior Outlook traffic; 40% reach Tier 2" },
                { c: "Social Media", m: "Impressions, engagement rate, click-throughs, shares, author account growth", g: ">3% engagement (LinkedIn); 500+ launch shares" },
                { c: "Pitchbook", m: "Module adoption rate, client feedback scores", g: "70%+ adoption within 30 days" },
                { c: "Lead Quality", m: "MQL conversion from Tier 3, pipeline attribution, TOFU variant performance", g: "15% MQL conversion; trackable pipeline" },
              ].map((m, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.divider}`, padding: "18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.purple, marginBottom: 6 }}>{m.c}</div>
                  <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6, margin: "0 0 6px" }}>{m.m}</p>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.gold }}>Target: {m.g}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background: C.purpleDark, borderTop: `3px solid ${C.gold}` }}>
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "44px 40px" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>Report Authors</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {authors.map((a, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{a.n}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.r}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{a.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: 3 }}>KKR</span>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", maxWidth: 420, lineHeight: 1.7, marginTop: 8 }}>
                The views expressed herein are the personal views of Henry McVey and do not necessarily reflect the views of KKR or the strategies and products that KKR offers or invests. Nothing contained herein constitutes investment, legal, tax, or other advice.
              </p>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {["All Insights", "About GMAA", "Global Wealth Solutions", "Subscribe"].map(l => (
                <a key={l} href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none" }} onMouseEnter={e => e.target.style.color = C.goldLight} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 9, color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
            {"© 2026 KKR & Co. Inc. All rights reserved. \"Suggested Client Language\" is intended as a discussion framework for financial professionals and does not constitute investment advice or a recommendation. All forward-looking statements are subject to change. Reimagination concept by Jonathan Blank."}
          </div>
        </div>
      </footer>
    </div>
  );
}
