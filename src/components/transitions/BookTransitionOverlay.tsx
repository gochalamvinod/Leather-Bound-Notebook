import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export type TransitionType = 'open-new' | 'open-resume' | 'close';

export interface BookTransitionOverlayProps {
  type: TransitionType;
  resumePageIndex?: number;
  totalPages?: number;
  coverTheme?: string;
  onComplete: () => void;
}

const THEME_COLORS: Record<string, { base: string; dark: string; light: string; accent: string }> = {
  green: { base: '#047857', dark: '#022c22', light: '#10b981', accent: '#34d399' },
  brown: { base: '#78350f', dark: '#2e1005', light: '#b45309', accent: '#d97706' },
  navy: { base: '#1e40af', dark: '#0f172a', light: '#3b82f6', accent: '#60a5fa' },
  burgundy: { base: '#881337', dark: '#3b0718', light: '#be123c', accent: '#fb7185' },
  black: { base: '#1f2937', dark: '#090d16', light: '#4b5563', accent: '#9ca3af' },
  obsidian: { base: '#1f2937', dark: '#090d16', light: '#4b5563', accent: '#9ca3af' },
};

function generateCoverExteriorCanvas(theme: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext('2d')!;

  const colors = THEME_COLORS[theme] || THEME_COLORS.green;

  // Rich Leather Background Gradient
  const bgGrad = ctx.createRadialGradient(280, 260, 50, 360, 480, 600);
  bgGrad.addColorStop(0, colors.light);
  bgGrad.addColorStop(0.35, colors.base);
  bgGrad.addColorStop(1, colors.dark);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 720, 960);

  // Micro-Porous Leather Grain Texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let i = 0; i < 7000; i++) {
    ctx.fillRect(Math.random() * 720, Math.random() * 960, 1.5, 1.5);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 5000; i++) {
    ctx.fillRect(Math.random() * 720, Math.random() * 960, 2, 2);
  }

  // Deep Embossed Outer Gold Border with Bevel
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
  ctx.lineWidth = 5;
  ctx.strokeRect(32, 32, 656, 896);

  // Inner Stitched Dashed Filigree Border
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 7]);
  ctx.strokeRect(50, 50, 620, 860);
  ctx.setLineDash([]);

  // Four Polished Brass Corner Rivets
  const rivets = [
    [38, 38],
    [682, 38],
    [38, 922],
    [682, 922],
  ];
  rivets.forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Central Gold Monogram Crest (Forward Facing, Crisp Emboss)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 20;

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 46px Cinzel, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEATHERBOUND', 360, 440);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 20px Montserrat, sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('— NOTEBOOK —', 360, 495);

  ctx.font = '14px Montserrat, sans-serif';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.fillText('ENCRYPTED MASTER VAULT', 360, 535);

  // Brass Clasp on Right Edge
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.roundRect(650, 440, 60, 90, [14, 0, 0, 14]);
  ctx.fill();
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(685, 485, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

function generatePageCanvas(pageNumber: number, isLeft: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext('2d')!;

  // Pure Smooth Ivory Paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 720, 960);

  // Paper fiber texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.012)';
  for (let i = 0; i < 3000; i++) {
    ctx.fillRect(Math.random() * 720, Math.random() * 960, 1.5, 1.5);
  }

  // Spine Gutter Shadow Gradient
  const gutterGrad = ctx.createLinearGradient(isLeft ? 620 : 0, 0, isLeft ? 720 : 100, 0);
  gutterGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gutterGrad.addColorStop(1, 'rgba(0, 0, 0, 0.09)');
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(isLeft ? 620 : 0, 0, 100, 960);

  // Faint Ruled Lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 90; y < 880; y += 34) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(680, y);
    ctx.stroke();
  }

  // Red Margin Line
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const marginX = isLeft ? 620 : 100;
  ctx.moveTo(marginX, 0);
  ctx.lineTo(marginX, 960);
  ctx.stroke();

  // Page Header & Number
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.font = '16px Montserrat, sans-serif';
  ctx.textAlign = isLeft ? 'left' : 'right';
  ctx.fillText(`Page ${pageNumber}`, isLeft ? 60 : 660, 920);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Procedural 3D Golden Fountain Pen Model
 * Features polished 24K gold nib, fluted grip, lacquer barrel, and clip
 */
function createGoldenFountainPen(penLength: number): THREE.Group {
  const pen = new THREE.Group();

  // 1. Polished Gold Material
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0x452204,
    metalness: 0.95,
    roughness: 0.15,
  });

  // 2. Midnight Lacquer Barrel Material
  const barrelMat = new THREE.MeshPhysicalMaterial({
    color: 0x140d07,
    metalness: 0.4,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  // 3. Lower Grip Section
  const gripGeo = new THREE.CylinderGeometry(0.18, 0.24, penLength * 0.22, 32);
  const grip = new THREE.Mesh(gripGeo, goldMat);
  grip.position.y = -penLength * 0.08;
  grip.castShadow = true;
  pen.add(grip);

  // 4. Central Lacquer Barrel
  const barrelGeo = new THREE.CylinderGeometry(0.24, 0.22, penLength * 0.48, 32);
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.position.y = -penLength * 0.43;
  barrel.castShadow = true;
  pen.add(barrel);

  // 5. Dual Gold Filigree Bands
  const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, penLength * 0.03, 32), goldMat);
  band1.position.y = -penLength * 0.2;
  pen.add(band1);

  const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, penLength * 0.03, 32), goldMat);
  band2.position.y = -penLength * 0.66;
  pen.add(band2);

  // 6. Golden Fountain Pen Nib
  const nibShape = new THREE.Shape();
  nibShape.moveTo(-0.18, 0);
  nibShape.lineTo(0.18, 0);
  nibShape.lineTo(0.11, penLength * 0.22);
  nibShape.lineTo(0, penLength * 0.32); // Pointed Iridium Nib Tip
  nibShape.lineTo(-0.11, penLength * 0.22);
  nibShape.closePath();

  const nibGeo = new THREE.ExtrudeGeometry(nibShape, {
    steps: 1,
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 3,
  });
  nibGeo.center();

  const nib = new THREE.Mesh(nibGeo, goldMat);
  nib.position.set(0, penLength * 0.21, 0);
  nib.castShadow = true;
  pen.add(nib);

  // 7. Golden Pocket Clip
  const clipGeo = new THREE.BoxGeometry(0.045, penLength * 0.28, 0.09);
  const clip = new THREE.Mesh(clipGeo, goldMat);
  clip.position.set(0, -penLength * 0.42, 0.25);
  pen.add(clip);

  // 8. Dynamic Nib Tip Glow Light
  const tipGlow = new THREE.PointLight(0xffedd5, 1.5, 6);
  tipGlow.position.set(0, penLength * 0.36, 0.3);
  pen.add(tipGlow);

  return pen;
}

export const BookTransitionOverlay: React.FC<BookTransitionOverlayProps> = ({
  type,
  resumePageIndex = 0,
  totalPages = 6,
  coverTheme = 'green',
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showThankYou] = useState<boolean>(type === 'close');
  const isFinishedRef = useRef<boolean>(false);

  const finishSequence = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    // Directly go to login page with 1ms buffer (no fade out lag)
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Exact Bounding Box of the Live DOM #book to ensure 100% pixel-perfect corner alignment
    const bookEl = document.getElementById('book') || document.querySelector('.book');
    const rect = bookEl ? bookEl.getBoundingClientRect() : {
      left: (width - Math.min(width * 0.96, 1360)) / 2,
      top: 60,
      width: Math.min(width * 0.96, 1360),
      height: height - 130,
    };

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Warm Ambient, Key Light & Dynamic Rim Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.5);
    keyLight.position.set(10, 16, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-10, -6, 10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xfef08a, 0.7, 30);
    rimLight.position.set(0, 10, 8);
    scene.add(rimLight);

    // Exact 3D Dimensions matching the screen's DOM #book
    const vFOV = (camera.fov * Math.PI) / 180;
    const worldHeightAtZ0 = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const worldWidthAtZ0 = worldHeightAtZ0 * camera.aspect;

    const targetSpreadWidth = (rect.width / width) * worldWidthAtZ0;
    const targetSpreadHeight = (rect.height / height) * worldHeightAtZ0;
    const targetPageWidth = targetSpreadWidth / 2;

    const rectCenterX = rect.left + rect.width / 2;
    const rectCenterY = rect.top + rect.height / 2;
    const targetWorldX = ((rectCenterX - width / 2) / width) * worldWidthAtZ0;
    const targetWorldY = -((rectCenterY - height / 2) / height) * worldHeightAtZ0;

    const bookGroup = new THREE.Group();
    bookGroup.position.set(targetWorldX, targetWorldY, 0);
    scene.add(bookGroup);

    const pageWidth = targetPageWidth;
    const pageHeight = targetSpreadHeight;

    // Textures
    const coverExtTexture = generateCoverExteriorCanvas(coverTheme);

    const coverExtMat = new THREE.MeshStandardMaterial({
      map: coverExtTexture,
      roughness: 0.42,
      metalness: 0.15,
      side: THREE.FrontSide,
    });

    // 1. Leather Backing Frame (Stationary Left & Right Spread)
    const leftBackCover = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth, pageHeight), coverExtMat);
    leftBackCover.position.set(-pageWidth / 2, 0, -0.14);
    leftBackCover.receiveShadow = true;
    bookGroup.add(leftBackCover);

    const rightBackCover = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth, pageHeight), coverExtMat);
    rightBackCover.position.set(pageWidth / 2, 0, -0.14);
    rightBackCover.receiveShadow = true;
    bookGroup.add(rightBackCover);

    // 2. Open Spread Pages (Left and Right Ivory Pages)
    const leftPageTex = generatePageCanvas(1, true);
    const leftPageMat = new THREE.MeshStandardMaterial({ map: leftPageTex, roughness: 0.8, side: THREE.FrontSide });
    const leftPageMesh = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth * 0.985, pageHeight * 0.985), leftPageMat);
    leftPageMesh.position.set(-pageWidth / 2, 0, -0.06);
    leftPageMesh.receiveShadow = true;
    bookGroup.add(leftPageMesh);

    const targetSpreadPage = type === 'open-resume' ? Math.max(2, resumePageIndex) : 2;
    const rightPageTex = generatePageCanvas(targetSpreadPage, false);
    const rightPageMat = new THREE.MeshStandardMaterial({ map: rightPageTex, roughness: 0.8, side: THREE.FrontSide });
    const rightPageMesh = new THREE.Mesh(new THREE.PlaneGeometry(pageWidth * 0.985, pageHeight * 0.985), rightPageMat);
    rightPageMesh.position.set(pageWidth / 2, 0, -0.06);
    rightPageMesh.receiveShadow = true;
    bookGroup.add(rightPageMesh);

    // 3. Central Embossed Leather Spine Crease
    const spineGeo = new THREE.CylinderGeometry(0.12, 0.12, pageHeight, 24);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x3d2806,
    });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(0, 0, -0.02);
    bookGroup.add(spineMesh);

    // 4. 3D Procedural Golden Fountain Pen
    const penGroup = createGoldenFountainPen(pageHeight * 0.84);
    penGroup.position.set(targetWorldX, targetWorldY, 1.2);
    scene.add(penGroup);

    // Initial Layout Configuration
    if (type === 'close') {
      bookGroup.scale.set(1, 1, 1);
      penGroup.scale.set(0.001, 0.001, 0.001);
      penGroup.visible = false;
    } else {
      // Opening: Starts as Golden Fountain Pen in center, book spread starts at scale.x = 0
      bookGroup.scale.set(0.001, 1, 0.001);
      penGroup.scale.set(1, 1, 1);
      penGroup.visible = true;
      penGroup.rotation.z = -0.08;
    }

    // Pure Pen-to-Book Morphing Timing (Smooth, fluid 60fps)
    const morphDuration = type === 'close' ? 1400 : 1600; // ms
    const totalDuration = morphDuration + (type === 'close' ? 800 : 300);

    const startTime = performance.now();
    let animId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      if (type === 'open-new' || type === 'open-resume') {
        // Pure Pen Expanding Symmetrically to Both Sides into Book Spread
        const t = Math.min(elapsed / morphDuration, 1);
        
        // Quintic ease-out for ultra smooth expansion
        const easedExpand = 1 - Math.pow(1 - t, 4);

        // 1. Book scales outward horizontally to both sides (scale.x: 0 -> 1)
        const bookScaleX = Math.min(1, Math.max(0.001, easedExpand));
        bookGroup.scale.set(bookScaleX, 1, 1);

        // 2. Pen dissolves into center spine as wings expand
        if (t < 0.65) {
          penGroup.visible = true;
          const penFade = Math.max(0.001, 1 - (t / 0.65));
          penGroup.scale.set(penFade, penFade, penFade);
          penGroup.rotation.z = (1 - t) * -0.08;
        } else {
          penGroup.visible = false;
          penGroup.scale.set(0.001, 0.001, 0.001);
        }
      } else if (type === 'close') {
        // Pure Book Contracting Symmetrically Inwards from Both Sides into Pen
        const t = Math.min(elapsed / morphDuration, 1);

        // Quartic ease-in-out for smooth closing contraction
        const easedContract = t < 0.5
          ? 8 * t * t * t * t
          : 1 - Math.pow(-2 * t + 2, 4) / 2;

        // 1. Book contracts horizontally from both sides towards spine (scale.x: 1 -> 0)
        const bookScaleX = Math.max(0.001, 1 - easedContract);
        bookGroup.scale.set(bookScaleX, 1, 1);

        // 2. Golden Fountain Pen smoothly emerges from spine center
        if (t > 0.35) {
          penGroup.visible = true;
          const penEmergeT = Math.min(1, (t - 0.35) / 0.65);
          const penScale = Math.min(1, Math.max(0.001, penEmergeT * 1.06));
          penGroup.scale.set(penScale, penScale, penScale);
          penGroup.rotation.z = Math.sin(elapsed * 0.003) * 0.05;
        }
      }

      renderer.render(scene, camera);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        finishSequence();
      }
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      coverExtTexture.dispose();
      leftPageTex.dispose();
      rightPageTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, resumePageIndex, totalPages, coverTheme, finishSequence]);

  return (
    <div className="book-transition-overlay">
      <div ref={containerRef} className="book-three-container" />

      {type === 'close' && showThankYou && (
        <div className="thank-you-banner">
          <div className="thank-you-content">
            <div className="thank-you-icon">🖋️</div>
            <h2 className="thank-you-title">Thank You for Writing</h2>
            <p className="thank-you-subtitle">
              Your notebook is securely encrypted and safely locked.
            </p>
            <div className="thank-you-divider">
              <span className="ty-line" />
              <span className="ty-emblem">✨</span>
              <span className="ty-line" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTransitionOverlay;
