
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Theme } from '../App';

interface DiffusionBackgroundProps {
  theme: Theme;
}

const DiffusionBackground: React.FC<DiffusionBackgroundProps> = ({ theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  // Colors
  const lightColors = {
    color1: new THREE.Color(0xf0faff),
    color2: new THREE.Color(0xe0f2fe),
    color3: new THREE.Color(0xbae6fd),
    color4: new THREE.Color(0x38bdf8),
  };

  const darkColors = {
    color1: new THREE.Color(0x020617),
    color2: new THREE.Color(0x0f172a),
    color3: new THREE.Color(0x1e293b),
    color4: new THREE.Color(0x2563eb),
  };

  useEffect(() => {
    if (!materialRef.current) return;
    const colors = theme === 'light' ? lightColors : darkColors;
    materialRef.current.uniforms.u_color1.value = colors.color1;
    materialRef.current.uniforms.u_color2.value = colors.color2;
    materialRef.current.uniforms.u_color3.value = colors.color3;
    materialRef.current.uniforms.u_color4.value = colors.color4;
  }, [theme]);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    clockRef.current = clock;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_resolution;
      
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;
      
      float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      #define OCTAVES 6
      float fbm (in vec2 st) {
          float value = 0.0;
          float amplitude = .5;
          for (int i = 0; i < OCTAVES; i++) {
              value += amplitude * noise(st);
              st *= 2.1;
              amplitude *= .5;
          }
          return value;
      }

      float pattern( in vec2 p, out vec2 q, out vec2 r ) {
          q.x = fbm( p + vec2(0.0,0.0) );
          q.y = fbm( p + vec2(5.2,1.3) );

          r.x = fbm( p + 4.0*q + vec2(1.7,9.2) );
          r.y = fbm( p + 4.0*q + vec2(8.3,2.8) );

          return fbm( p + 4.0*r );
      }
      
      void main() {
        vec2 st = vUv;
        float aspect = u_resolution.x / u_resolution.y;
        st.x *= aspect;
        
        float slow_time = u_time * 0.12;
        vec2 q, r;
        float f = pattern(st * 1.8 + slow_time, q, r);
        
        vec3 color = mix(u_color1, u_color2, clamp((f*f)*4.0,0.0,1.0));
        color = mix(color, u_color3, clamp(length(q),0.0,1.0));
        color = mix(color, u_color4, clamp(length(r.x),0.0,1.0));
        
        color = color * (0.8 + 0.2 * f);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const colors = theme === 'light' ? lightColors : darkColors;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight) },
        u_color1: { value: colors.color1 },
        u_color2: { value: colors.color2 },
        u_color3: { value: colors.color3 },
        u_color4: { value: colors.color4 },
      },
      vertexShader,
      fragmentShader,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!currentMount || !rendererRef.current || !materialRef.current) return;
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      if (width === 0 || height === 0) return; // Avoid 0-size errors/warnings
      rendererRef.current.setSize(width, height);
      materialRef.current.uniforms.u_resolution.value.set(width, height);
    };

    // Use ResizeObserver to detect container size changes (handles initial load and window resize)
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(currentMount);

    // Initial size check
    handleResize();

    const animate = () => {
      if (materialRef.current && clockRef.current) {
        materialRef.current.uniforms.u_time.value = clockRef.current.getElapsedTime();
      }
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default DiffusionBackground;
