import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

// Stars
const starPositions = [];
for (let i = 0; i < 2000; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400
  );
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 })));

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Light: the Sun shines in all directions
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
scene.add(new THREE.PointLight(0xffffff, 3, 0, 0));


function makeSphere(radius, color) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({ color })
  );
}

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffcc00 })
);
scene.add(sun);

// Earth
const earthPivot = new THREE.Object3D();
scene.add(earthPivot);
const earth = makeSphere(1, 0x2266ff);
earth.position.x = 10;
earthPivot.add(earth);

// Moon (child of Earth)
const moonPivot = new THREE.Object3D();
earth.add(moonPivot);
const moon = makeSphere(0.3, 0xaaaaaa);
moon.position.x = 2;
moonPivot.add(moon);

// Mars
const marsPivot = new THREE.Object3D();
scene.add(marsPivot);
const mars = makeSphere(0.6, 0xc1440e);
mars.position.x = 16;
marsPivot.add(mars);

// Phobos (child of Mars)
const phobosPivot = new THREE.Object3D();
mars.add(phobosPivot);
const phobos = makeSphere(0.15, 0x888888);
phobos.position.x = 1.2;
phobosPivot.add(phobos);


const planets = [];
function addPlanet(radius, color, distance, orbitSpeed) {
  const pivot = new THREE.Object3D();
  scene.add(pivot);
  const planet = makeSphere(radius, color);
  planet.position.x = distance;
  pivot.add(planet);
  planets.push({ pivot, planet, orbitSpeed });
  return planet;
}

addPlanet(0.4, 0xb5b5b5, 5.5, 0.04);     // Mercury
addPlanet(0.9, 0xe8c27a, 7.8, 0.025);    // Venus
addPlanet(2.2, 0xd9a066, 24, 0.004);     // Jupiter
const saturn = addPlanet(1.8, 0xe3c07a, 32, 0.003);   // Saturn
addPlanet(1.3, 0x7fd8e6, 39, 0.002);     // Uranus
addPlanet(1.2, 0x3a5fcd, 45, 0.0015);    // Neptune

// Saturn's ring
const saturnRing = new THREE.Mesh(
  new THREE.RingGeometry(2.5, 3.8, 64),
  new THREE.MeshBasicMaterial({ color: 0xccaa77, side: THREE.DoubleSide })
);
saturnRing.rotation.x = Math.PI / 2.3;
saturn.add(saturnRing);

// Animation
function animate() {
  requestAnimationFrame(animate);

  sun.rotation.y += 0.002;

  earthPivot.rotation.y += 0.01;   
  earth.rotation.y += 0.03;        
  moonPivot.rotation.y += 0.05;    

  marsPivot.rotation.y += 0.006;   
  mars.rotation.y += 0.025;       
  phobosPivot.rotation.y += 0.08; 

  planets.forEach((p) => {
    p.pivot.rotation.y += p.orbitSpeed;   
    p.planet.rotation.y += 0.02;         
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});