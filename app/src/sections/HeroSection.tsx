import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const vertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float displacement(vec2 uv) {
  return hash(uv * 1.2 + uTime * 0.05);
}

float circle(vec2 uv, vec2 center, float radius, float softness) {
  float d = length(uv - center);
  return 1.0 - smoothstep(radius - softness, radius + softness, d);
}

float ditheredCircle(vec2 uv, vec2 center, float radius, float softness) {
  float c = circle(uv, center, radius, softness);
  float noise = hash(uv * uResolution * 0.01) * 0.15;
  return smoothstep(0.0, noise + 0.1, c);
}

void main() {
  vec2 uv = v_uv;
  
  vec3 colorLeft = vec3(0.04, 0.04, 0.06);
  vec3 colorImage = texture2D(uTexture, uv).rgb;
  
  float diskCenterX = 0.65 + uProgress * 0.25;
  float diskCenterY = 0.5;
  float diskRadius = 0.65 + uProgress * 0.15;
  float diskSoftness = 0.45 - uProgress * 0.1;
  
  vec2 center = vec2(diskCenterX, diskCenterY);
  
  float mask = ditheredCircle(uv, center, diskRadius, diskSoftness);
  
  float edgeNoise = displacement(uv) * 0.08 * (1.0 - uProgress);
  mask = clamp(mask + edgeNoise, 0.0, 1.0);
  
  vec3 finalColor = mix(colorLeft, colorImage, mask);
  
  float fadeOut = 1.0 - smoothstep(0.85, 1.0, uProgress) * 0.75;
  finalColor *= fadeOut;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const textureRef = useRef<WebGLTexture | null>(null);
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const rafRef = useRef(0);
  const visibleRef = useRef(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    glRef.current = gl;

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;
    programRef.current = program;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      uTime: gl.getUniformLocation(program, 'uTime'),
      uProgress: gl.getUniformLocation(program, 'uProgress'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uTexture: gl.getUniformLocation(program, 'uTexture'),
    };

    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      setLoaded(true);
    };
    image.src = '/images/slot_hero.png';

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!visibleRef.current) return;
      timeRef.current += 0.016;
      gl.useProgram(program);
      gl.uniform1f(uniformsRef.current.uTime, timeRef.current);
      gl.uniform1f(uniformsRef.current.uProgress, progressRef.current);
      gl.uniform2f(uniformsRef.current.uResolution, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniformsRef.current.uTexture, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    startLoop();

    // IntersectionObserver to pause rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      observer.disconnect();
      // Clean up WebGL resources
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (posBuffer) gl.deleteBuffer(posBuffer);
        if (texture) gl.deleteTexture(texture);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const ticker = tickerRef.current;
    if (!section || !text || !ticker) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=90%',
        pin: true,
        scrub: prefersReducedMotion ? false : 0.6,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      },
    });

    // Text entrance animation on load
    gsap.fromTo(
      text.querySelectorAll('.hero-animate'),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.3 }
    );

    gsap.fromTo(
      ticker,
      { x: '-12%', opacity: 0 },
      { x: '0%', opacity: 0.25, duration: 1.2, ease: 'power2.out', delay: 0.5 }
    );

    // Scroll-driven text exit
    tl.fromTo(
      text,
      { x: 0, opacity: 1 },
      { x: '-8vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      ticker,
      { x: '0%' },
      { x: '-12%', ease: 'none' },
      0
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-casino-ink z-[10]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1, opacity: loaded ? 1 : 0, transition: 'opacity 1s ease' }}
      />

      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-casino-ink z-[1]">
          <div className="w-8 h-8 border-2 border-casino-ember/30 border-t-casino-ember rounded-full animate-spin" />
        </div>
      )}

      {/* Content overlay backdrop */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(8,6,18,0.85) 0%, transparent 60%)',
        }}
      />
      
      {/* Content text */}
      <div
        ref={textRef}
        className="absolute left-[6vw] top-1/2 -translate-y-1/2 max-w-xl z-[2]"
      >
        <p className="hero-animate font-mono text-xs text-casino-muted mb-4 tracking-widest uppercase opacity-0">
          Lobby / Online Slots
        </p>
        <h1 className="hero-animate font-serif text-5xl md:text-7xl text-casino-gold leading-[1.05] mb-6 uppercase opacity-0 [text-shadow:0_0_25px_rgba(255,215,0,0.6),_0_2px_10px_rgba(0,0,0,0.8)] relative">
          The Ultimate<br />
          Slot<br />
          Experience.
        </h1>
        <p className="hero-animate text-base md:text-lg text-casino-muted mb-8 max-w-sm leading-relaxed opacity-0">
          Spin the reels, hit the jackpot, and let the games begin.
        </p>
        <div className="hero-animate flex items-center gap-6 opacity-0">
          <a
            href="#reserve"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('reserve');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-7 py-3 bg-casino-ember text-casino-ivory rounded-full font-mono text-sm hover:bg-casino-ember/80 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all duration-300"
          >
            Start Spinning
          </a>
          <a
            href="#experience"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('experience');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-mono text-sm text-casino-neon hover:text-casino-ivory hover:scale-105 transition-all duration-300 underline underline-offset-4"
          >
            View Jackpots
          </a>
        </div>
      </div>

      {/* Ticker line */}
      <div
        ref={tickerRef}
        className="absolute bottom-[8vh] left-0 w-[200%] font-serif text-5xl md:text-7xl text-casino-ivory/10 whitespace-nowrap pointer-events-none z-[0]"
      >
        MEGA WIN — JACKPOT — FREE SPINS — MEGA WIN — JACKPOT — FREE SPINS —
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,15,0.4) 100%)',
        }}
      />
    </section>
  );
}
