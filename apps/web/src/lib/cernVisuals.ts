import * as THREE from 'three';

/**
 * Shared PARTON High-Tech Rendering Toolkit
 * Provides DPR-aware canvas calibration, off-screen RAF pausing,
 * additive volumetric glow sprites, phosphor oscilloscope waveforms,
 * vector-field glyphs, and custom Three.js GLSL shader builders.
 */

export interface CanvasViewport {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}

/**
 * Synchronizes a 2D canvas's backing store pixels with its CSS layout box
 * and devicePixelRatio (clamped to 2 for sharp HiDPI output without GPU bloat).
 */
export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  fallbackW = 640,
  fallbackH = 300
): CanvasViewport | null {
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width > 10 ? rect.width : fallbackW;
  const cssH = rect.height > 10 ? rect.height : fallbackH;
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const targetW = Math.round(cssW * dpr);
  const targetH = Math.round(cssH * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: cssW, height: cssH, dpr };
}

/**
 * Efficient background processing helper:
 * Observes both modern `contentvisibilityautostatechange` and fallback `IntersectionObserver`
 * so off-screen WebGL/Canvas animations automatically suspend RAF work.
 */
export function observeOffscreenVisibility(
  el: HTMLElement,
  onVisibilityChange: (visible: boolean) => void
): () => void {
  const onCvChange = (e: Event) => {
    const skipped = (e as unknown as { skipped?: boolean }).skipped;
    if (typeof skipped === 'boolean') {
      onVisibilityChange(!skipped);
    }
  };
  el.addEventListener('contentvisibilityautostatechange', onCvChange);

  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          onVisibilityChange(entry.isIntersecting);
        }
      },
      { rootMargin: '160px' }
    );
    io.observe(el);
  }

  return () => {
    el.removeEventListener('contentvisibilityautostatechange', onCvChange);
    io?.disconnect();
  };
}

/**
 * Draws a precision CERN Control Centre CAD graticule with minor/major subdivisions,
 * subtle vignette, and calibrated corner fiducial brackets.
 */
export function drawCernGridBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options?: {
    accentColor?: string;
    bgInner?: string;
    bgOuter?: string;
    gridStep?: number;
    showScanlines?: boolean;
    showCrosshair?: boolean;
  }
) {
  const accent = options?.accentColor ?? 'rgba(0, 229, 255, 0.08)';
  const bgInner = options?.bgInner ?? '#091426';
  const bgOuter = options?.bgOuter ?? '#03060D';
  const step = options?.gridStep ?? 28;

  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 12, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  bgGrad.addColorStop(0, bgInner);
  bgGrad.addColorStop(1, bgOuter);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Minor grid lines
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Major crosshair axis
  if (options?.showCrosshair) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // CRT/Instrument subtle horizontal scanlines
  if (options?.showScanlines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  // Corner CAD fiducial brackets
  const bLen = 10;
  const pad = 7;
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  // TL
  ctx.moveTo(pad, pad + bLen);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bLen, pad);
  // TR
  ctx.moveTo(w - pad - bLen, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + bLen);
  // BL
  ctx.moveTo(pad, h - pad - bLen);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + bLen, h - pad);
  // BR
  ctx.moveTo(w - pad - bLen, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - bLen);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a multi-pass volumetric phosphor oscilloscope trace:
 * Outer bloom -> medium neon halo -> crisp white-hot core.
 */
export function drawPhosphorCurve(
  ctx: CanvasRenderingContext2D,
  points: ReadonlyArray<{ x: number; y: number }>,
  color: string,
  lineWidth = 2.0,
  alpha = 1.0
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'lighter';

  const tracePath = () => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  };

  // Pass 1: Wide outer atmospheric bloom
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.18 * alpha;
  ctx.lineWidth = lineWidth * 4.5;
  tracePath();
  ctx.stroke();

  // Pass 2: Medium saturation halo
  ctx.globalAlpha = 0.45 * alpha;
  ctx.lineWidth = lineWidth * 2.1;
  tracePath();
  ctx.stroke();

  // Pass 3: Core saturated trace
  ctx.globalAlpha = 0.95 * alpha;
  ctx.lineWidth = lineWidth;
  tracePath();
  ctx.stroke();

  // Pass 4: Specular centerline filament
  ctx.strokeStyle = '#FFFFFF';
  ctx.globalAlpha = 0.55 * alpha;
  ctx.lineWidth = Math.max(0.75, lineWidth * 0.42);
  tracePath();
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders a volumetric additive radial glow particle or focal hotspot.
 */
export function drawAdditiveGlowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgbTuple: string,
  intensity = 1.0
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const r = Math.max(1, radius);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255, 255, 255, ${0.95 * intensity})`);
  g.addColorStop(0.28, `rgba(${rgbTuple}, ${0.85 * intensity})`);
  g.addColorStop(0.65, `rgba(${rgbTuple}, ${0.24 * intensity})`);
  g.addColorStop(1, `rgba(${rgbTuple}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a crisp directional vector arrow (used for B-fields, Lorentz forces, heat flux).
 */
export function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth = 1.6,
  headSize = 6
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI / 6), y2 - headSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI / 6), y2 - headSize * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Generates a soft circular additive glow texture for Three.js `PointsMaterial`
 * so 3D particle clouds render as luminous plasma orbs instead of flat squares.
 */
export function createThreeGlowTexture(size = 64): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255,255,255,1.0)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.25)');
  grad.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a custom GLSL Three.js ShaderMaterial for the Cryogenic Superfluid He-II
 * Lambda-transition shell (coherent quantum vortex ripples < 2.17 K, turbulent
 * nucleate boiling > 2.17 K, high-energy quench shockwave on trip).
 */
export function createSuperfluidJacketShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uRegime: { value: 0 }, // 0 = Superfluid He-II, 1 = Boiling He-I, 2 = Quench
      uFieldNorm: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uRegime;
      uniform float uFieldNorm;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(N, V)), 2.0);

        if (uRegime < 0.5) {
          // Superfluid He-II: Coherent quantized helical vortex filaments
          float helix1 = sin(vUv.x * 38.0 - uTime * 2.4 + sin(vUv.y * 12.0 + uTime));
          float helix2 = sin(vUv.x * 24.0 + uTime * 1.9 + vUv.y * 18.0);
          float filaments = smoothstep(0.62, 0.98, abs(helix1 * helix2));
          vec3 baseCol = mix(vec3(0.0, 0.45, 0.85), vec3(0.0, 0.95, 1.0), filaments);
          vec3 col = baseCol + vec3(0.75, 0.95, 1.0) * filaments * 0.65;
          float alpha = (0.14 + 0.34 * fresnel + 0.36 * filaments) * (0.65 + 0.35 * uFieldNorm);
          gl_FragColor = vec4(col, alpha);
        } else if (uRegime < 1.5) {
          // Boiling He-I: Chaotic thermal convection & nucleate vapor plumes
          float boil = noise(vec2(vUv.x * 16.0, vUv.y * 22.0 - uTime * 2.8));
          float plumes = smoothstep(0.45, 0.88, boil);
          vec3 col = mix(vec3(0.95, 0.45, 0.05), vec3(1.0, 0.88, 0.25), plumes);
          float alpha = 0.16 + 0.36 * fresnel + 0.35 * plumes;
          gl_FragColor = vec4(col, alpha);
        } else {
          // Thermal Quench: Rapid expanding resistive heat wave
          float shock = 0.5 + 0.5 * sin(vUv.y * 26.0 - uTime * 4.5);
          float n = noise(vUv * 18.0 + uTime * 3.0);
          vec3 col = mix(vec3(0.85, 0.05, 0.15), vec3(1.0, 0.42, 0.1), shock * n);
          float alpha = 0.22 + 0.42 * fresnel + 0.28 * shock;
          gl_FragColor = vec4(col, alpha);
        }
      }
    `,
  });
}

/**
 * Creates a custom GLSL Three.js ShaderMaterial for an electromagnetic
 * standing wave / relativistic quantum plasma field (used in RF Cavities,
 * TVA Loom & Mirror Dimension).
 */
export function createPlasmaWaveShaderMaterial(
  colorPrimary = 0xffe600,
  colorSecondary = 0xff0055
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColorA: { value: new THREE.Color(colorPrimary) },
      uColorB: { value: new THREE.Color(colorSecondary) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(N, V)), 2.2);
        float wave = 0.5 + 0.5 * sin(vUv.x * 20.0 - uTime * 3.2 + sin(vUv.y * 12.0));
        float rings = smoothstep(0.6, 0.98, abs(sin(vUv.y * 28.0 + uTime * 2.0)));
        vec3 col = mix(uColorA, uColorB, wave);
        col += vec3(1.0) * rings * 0.4;
        float alpha = (0.12 + 0.45 * fresnel + 0.28 * rings) * clamp(uIntensity, 0.15, 1.2);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}
