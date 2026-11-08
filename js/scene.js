/* GO FRESH — WebGL egg: iridescent shell, holographic wireframe, orbit rings, particle field */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const canvas = document.querySelector('.gl');
const egg = window.__egg || (window.__egg = { x: 0, y: 0, s: 1, explode: 0, alpha: 1, spin: 0, ready: true });
const ready = () => { window.__sceneReady = true; dispatchEvent(new Event('gf:scene-ready')); };

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  ready();
  throw e;
}

const mobile = matchMedia('(max-width: 900px)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 0, 9);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
scene.environmentIntensity = 1;

const LIME = new THREE.Color('#C8FF3D');
const YOLK = new THREE.Color('#FFB21A');

/* ---------- Egg profile ---------- */
function eggProfile(n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI;
    const y = -Math.cos(t) * 1.25;
    const r = Math.sin(t) * .92 * (1 - .13 * (y / 1.25));
    pts.push(new THREE.Vector2(Math.max(r, .0001), y));
  }
  return pts;
}

const root = new THREE.Group();
scene.add(root);

// Shell — pearlescent, iridescent
const shellMat = new THREE.MeshPhysicalMaterial({
  color: 0xdcd6ea, metalness: .7, roughness: .16,
  clearcoat: 1, clearcoatRoughness: .04,
  iridescence: 1, iridescenceIOR: 2.0, iridescenceThicknessRange: [250, 1100],
  sheen: .6, sheenColor: new THREE.Color('#C8FF3D'), sheenRoughness: .4,
  envMapIntensity: 1.5, transparent: true,
});
const shell = new THREE.Mesh(new THREE.LatheGeometry(eggProfile(80), 128), shellMat);
root.add(shell);

// Holographic wireframe cage
const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.LatheGeometry(eggProfile(14), 22)),
  new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false })
);
wire.scale.setScalar(1.16);
root.add(wire);

// Orbit rings
const ringMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.05, .007, 8, 256), ringMat(LIME, .9));
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.45, .005, 8, 256), ringMat(YOLK, .7));
const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.9, .003, 8, 256), ringMat(0xffffff, .25));
ring1.rotation.set(1.25, .2, 0); ring2.rotation.set(1.1, -.5, .3); ring3.rotation.set(1.4, .1, -.4);
const rings = new THREE.Group(); rings.add(ring1, ring2, ring3); root.add(rings);

// Satellite "data eggs" riding the rings
const satGeo = new THREE.SphereGeometry(.05, 16, 16);
const sats = [ring1, ring2].map((r, i) => {
  const m = new THREE.Mesh(satGeo, new THREE.MeshBasicMaterial({ color: i ? YOLK : LIME }));
  r.add(m); return m;
});

// Particle field
const COUNT = mobile ? 1600 : 3600;
const pos = new Float32Array(COUNT * 3);
const rnd = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
  const rad = 2.2 + Math.pow(Math.random(), 1.6) * 2.4;
  const s = Math.sqrt(1 - u * u);
  pos.set([s * Math.cos(th) * rad, u * rad * 1.1, s * Math.sin(th) * rad], i * 3);
  rnd.set([Math.random(), Math.random(), Math.random()], i * 3);
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
pGeo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3));
const pMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uExplode: { value: 0 }, uPixel: { value: renderer.getPixelRatio() }, uA: { value: LIME }, uB: { value: YOLK }, uAlpha: { value: 1 } },
  vertexShader: /* glsl */`
    attribute vec3 aRnd;
    uniform float uTime, uExplode, uPixel;
    varying float vMix; varying float vFade;
    void main() {
      vec3 p = position * (1.0 + uExplode * (0.6 + aRnd.x * 2.2));
      float t = uTime * (0.25 + aRnd.y * 0.35);
      p.x += sin(t + aRnd.z * 6.28) * 0.08;
      p.y += cos(t * 1.3 + aRnd.x * 6.28) * 0.08;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.0 + aRnd.z * 2.4) * uPixel * (9.0 / -mv.z);
      vMix = aRnd.z; vFade = 0.35 + 0.65 * sin(uTime * (0.6 + aRnd.x) + aRnd.y * 6.28) * 0.5 + 0.5;
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 uA, uB; uniform float uAlpha;
    varying float vMix; varying float vFade;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.0, d);
      vec3 c = mix(uA, uB, step(0.62, vMix));
      if (vMix > 0.92) c = vec3(1.0);
      gl_FragColor = vec4(c, a * vFade * uAlpha * 0.9);
    }`,
});
const points = new THREE.Points(pGeo, pMat);
scene.add(points);

// Rim lights
const l1 = new THREE.PointLight(LIME, 70, 20); l1.position.set(-4, 2.5, 3); scene.add(l1);
const l2 = new THREE.PointLight(YOLK, 70, 20); l2.position.set(4, -2, 3); scene.add(l2);
scene.add(new THREE.AmbientLight(0xffffff, .25));

/* ---------- Loop ---------- */
const clock = new THREE.Clock();
let rotY = 0, spinVel = 0, intro = 0;
const mouse = { x: 0, y: 0 };
const aspectScale = () => Math.min(1, camera.aspect / 1.6);

function frame() {
  const dt = Math.min(clock.getDelta(), .05);
  const t = clock.elapsedTime;
  if (egg.ready) intro = Math.min(1, intro + dt * .8);
  const ie = 1 - Math.pow(1 - intro, 3);

  const m = window.__mouse || { x: 0, y: 0 };
  mouse.x += (m.x - mouse.x) * .05; mouse.y += (m.y - mouse.y) * .05;

  spinVel += ((egg.spin || 0) * .004 - spinVel) * .1;
  rotY += dt * .35 + spinVel;
  window.__eggRot = rotY * 57.2958;

  const xs = egg.x * (mobile ? 1 : aspectScale());
  root.position.set(xs + mouse.x * .3, egg.y - mouse.y * .2 + Math.sin(t * .9) * .06, 0);
  const sc = egg.s * (.4 + .6 * ie);
  root.scale.setScalar(sc);
  shell.rotation.set(Math.sin(t * .5) * .12 + mouse.y * .3, rotY, Math.sin(t * .35) * .08 + mouse.x * -.2);
  wire.rotation.set(shell.rotation.x, -rotY * .6, shell.rotation.z);
  rings.rotation.y = t * .15;
  ring1.rotation.z = t * .4; ring2.rotation.z = -t * .3; ring3.rotation.z = t * .1;
  sats[0].position.set(Math.cos(t * 1.2) * 2.05, Math.sin(t * 1.2) * 2.05, 0);
  sats[1].position.set(Math.cos(-t * .8) * 2.45, Math.sin(-t * .8) * 2.45, 0);

  const a = egg.alpha * ie;
  shellMat.opacity = a; shell.visible = a > .01;
  wire.material.opacity = .22 * a + egg.explode * .1 * a;
  ring1.material.opacity = .9 * a; ring2.material.opacity = .7 * a; ring3.material.opacity = .25 * a;
  ring1.scale.setScalar(1 + egg.explode * .5); ring2.scale.setScalar(1 + egg.explode * .8); ring3.scale.setScalar(1 + egg.explode * 1.1);

  points.position.copy(root.position);
  points.scale.setScalar(Math.max(egg.s, .55) * (1 + egg.explode * .4));
  points.rotation.y = t * .03 + rotY * .1;
  points.rotation.x = mouse.y * .2;
  pMat.uniforms.uTime.value = t;
  pMat.uniforms.uExplode.value = egg.explode * .9 + (1 - ie) * 1.5;
  pMat.uniforms.uAlpha.value = ie * (.55 + .45 * Math.max(egg.alpha, .4));

  l1.position.x = -4 + Math.sin(t * .6) * 1.5;
  l2.position.y = -2 + Math.cos(t * .5) * 1.5;

  renderer.render(scene, camera);
}

let running = true;
renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  renderer.setAnimationLoop(running ? frame : null);
  if (running) clock.getDelta();
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

// compile shaders before revealing
renderer.compile(scene, camera);
ready();
