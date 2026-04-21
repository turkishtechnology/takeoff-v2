import { useEffect, useRef, type JSX } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import styles from './TakeoffLogo3D.module.css';

export interface CanvasProps {
  color?: string;
  rotationSpeed?: number;
  depth?: number;
  glow?: boolean;
}

const TAKEOFF_PATH =
  'M64.24 0H35.04C25.36 0 16.6 3.92 10.26 10.26C3.91999 16.6 0 25.36 0 35.04C0 54.39 15.69 70.08 35.04 70.08C54.39 70.08 70.08 54.39 70.08 35.04V5.84C70.08 2.62 67.46 0 64.24 0ZM51.56 51.56C47.33 55.79 41.49 58.4 35.04 58.4C22.13 58.4 11.68 47.95 11.68 35.04C11.68 28.59 14.29 22.75 18.52 18.52C22.75 14.29 28.59 11.68 35.04 11.68C41.49 11.68 47.33 14.29 51.56 18.52C55.79 22.75 58.4 28.59 58.4 35.04C58.4 41.49 55.79 47.33 51.56 51.56Z';

export default function TakeoffLogoCanvas({ color = '#e6001f', rotationSpeed = 0.4, depth = 20, glow = true }: CanvasProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getSize = (): { width: number; height: number } => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      return { width: w, height: h };
    };

    const { width, height } = getSize();

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 35);

    // Renderer (alpha: true so parent background shows through)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.className = styles.canvas;

    // Ambient light (wireframe doesn't need much, but keeps material responsive)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Logo SVG → extruded wireframe
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 71"><path d="${TAKEOFF_PATH}" /></svg>`;
    const loader = new SVGLoader();
    const svgData = loader.parse(svgMarkup);

    const group = new THREE.Group();
    group.scale.set(0.18, -0.18, 0.18);

    const innerGroup = new THREE.Group();
    innerGroup.position.set(-35.5, -35.5, -depth / 2);

    const colorObj = new THREE.Color(color);
    const material = new THREE.MeshBasicMaterial({
      color: colorObj,
      wireframe: true,
      transparent: true,
      opacity: 0.92,
    });

    const disposables: Array<{ dispose: () => void }> = [material];

    svgData.paths.forEach(path => {
      const shapes = path.toShapes(true);
      shapes.forEach(shape => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: false,
        });
        disposables.push(geometry);
        const mesh = new THREE.Mesh(geometry, material);
        innerGroup.add(mesh);
      });
    });

    // Optional glow ghost — a second pass at ~110% scale, low opacity, additive blend
    if (glow) {
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: colorObj,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposables.push(glowMaterial);

      const glowInner = new THREE.Group();
      glowInner.position.set(-35.5, -35.5, -depth / 2);
      svgData.paths.forEach(path => {
        const shapes = path.toShapes(true);
        shapes.forEach(shape => {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false,
          });
          disposables.push(geometry);
          const mesh = new THREE.Mesh(geometry, glowMaterial);
          mesh.scale.set(1.08, 1.08, 1.02);
          glowInner.add(mesh);
        });
      });
      group.add(glowInner);
    }

    group.add(innerGroup);
    scene.add(group);

    // Animation
    const clock = new THREE.Clock();
    const animate = (): void => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      group.rotation.y += delta * rotationSpeed;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = (): void => {
      const next = getSize();
      renderer.setSize(next.width, next.height, false);
      camera.aspect = next.width / next.height;
      camera.updateProjectionMatrix();
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', onResize);
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', onResize);
      }
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, rotationSpeed, depth, glow]);

  return <div ref={containerRef} className={styles.canvas} aria-hidden="true" />;
}
