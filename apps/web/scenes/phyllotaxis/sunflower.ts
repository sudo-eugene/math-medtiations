import * as THREE from "three";
import type { NatureScene, SceneParams } from "@/lib/animations";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function createPhyllotaxisPoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = i * GOLDEN_ANGLE;
    const r = Math.sqrt(i) * (radius / Math.sqrt(count));
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = 0;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function colorFromHex(hex: string) {
  return new THREE.Color(hex);
}

let renderer: THREE.WebGLRenderer | null = null;
let scene3: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let points: THREE.Points | null = null;
let container: HTMLDivElement | null = null;

const obj: NatureScene = {
  metadata: { key: "phyllotaxis.sunflower", title: "Sunflower", family: "phyllotaxis" },
  mount(el: HTMLDivElement, params: SceneParams) {
    container = el;
    const width = el.clientWidth || window.innerWidth;
    const height = el.clientHeight || window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(colorFromHex(params.background || "#F7F5EE"));
    el.appendChild(renderer.domElement);

    scene3 = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
    camera.position.z = 10;

    const count = Math.max(2000, Math.min(40000, Math.floor(params.seedCount ?? 12000)));
    const radius = Math.min(width, height) * 0.48;

    const geometry = createPhyllotaxisPoints(count, radius);
    const material = new THREE.PointsMaterial({ color: colorFromHex(params.fg || "#1E1E1C"), size: 1.5, sizeAttenuation: false });

    points = new THREE.Points(geometry, material);
    points.rotation.z = 0;
    scene3.add(points);

    this.resize();
    renderer.render(scene3, camera);
  },
  update(t: number) {
    if (!renderer || !scene3 || !camera || !points) return;
    const speed = 0.4 * (isFinite(t) ? 1 : 0);
    points.rotation.z = (t || 0) * (typeof (window as any)._MM_SPEED === "number" ? (window as any)._MM_SPEED : (speed * (1)) * (1));
    renderer.render(scene3, camera);
  },
  resize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  },
  dispose() {
    if (renderer) {
      renderer.dispose();
      // remove canvas
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    }
    if (points) {
      (points.geometry as THREE.BufferGeometry).dispose();
      (points.material as THREE.Material).dispose();
    }
    renderer = null;
    scene3 = null;
    camera = null;
    points = null;
    container = null;
  },
};

export default obj;
