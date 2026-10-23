import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202030);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 11);
camera.lookAt(0, 1, 0);  

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 8, 6);
scene.add(light);

// Base and forearm
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2.4, 0.6, 32),
  new THREE.MeshStandardMaterial({ color: 0x555566, metalness: 0.5, roughness: 0.4 })
);
base.position.y = -3.3;
scene.add(base);

const forearm = new THREE.Mesh(
  new THREE.CylinderGeometry(0.8, 1, 3, 32),
  new THREE.MeshStandardMaterial({ color: 0x8888aa, metalness: 0.5, roughness: 0.4 })
);
forearm.position.y = -1.8;
scene.add(forearm);

// Materials
const handMaterial = new THREE.MeshStandardMaterial({ color: 0xd9dbe6, metalness: 0.7, roughness: 0.3 });
const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x3a6ea5, metalness: 0.3, roughness: 0.4 });

// Palm (rounded box)
const palm = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.9, 2.2, 6, 0.3), handMaterial);
scene.add(palm);


const wrist = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 32), jointMaterial);
wrist.position.y = -0.6;
scene.add(wrist);


const fingers = [];
function addFinger(radius, len1, len2, x, y, tilt) {

  const pivot1 = new THREE.Object3D();
  pivot1.position.set(x, y, 0);
  pivot1.rotation.z = tilt;            // sideways tilt (used for the thumb)
  palm.add(pivot1);

  const seg1Height = len1 + 2 * radius;
  const seg1 = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len1, 8, 16), handMaterial);
  seg1.position.y = seg1Height / 2;    // base of the segment sits on the pivot
  pivot1.add(seg1);


  const pivot2 = new THREE.Object3D();
  pivot2.position.y = seg1Height - radius * 0.3;
  pivot1.add(pivot2);

  const joint = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.05, 16, 16), jointMaterial);
  pivot2.add(joint);

  const r2 = radius * 0.9;
  const seg2Height = len2 + 2 * r2;
  const seg2 = new THREE.Mesh(new THREE.CapsuleGeometry(r2, len2, 8, 16), handMaterial);
  seg2.position.y = seg2Height / 2 - r2 * 0.3;
  pivot2.add(seg2);

  fingers.push({ pivot1, pivot2, bend: 0 });
}

// (radius, length1, length2, x, y, tilt)
addFinger(0.26, 0.5, 0.45, -2.2, -0.1, Math.PI / 4);   // Thumb (left side)
addFinger(0.24, 0.55, 0.55, -1.3, 0.4, 0);                      // Index
addFinger(0.25, 0.85, 0.7, -0.45, 0.4, 0);             // Middle (longest)
addFinger(0.24, 0.75, 0.6, 0.45, 0.4, 0);              // Ring
addFinger(0.21, 0.5, 0.45, 1.3, 0.4, 0);               // Pinky (shortest)

// Keyboard: hold 1-5 to bend a finger, hold Space to bend all
const keysDown = {};
window.addEventListener('keydown', (e) => { keysDown[e.key] = true; });
window.addEventListener('keyup', (e) => { keysDown[e.key] = false; });


function animate() {
  requestAnimationFrame(animate);

  fingers.forEach((f, i) => {
    const pressed = keysDown[String(i + 1)] || keysDown[' '];
    const target = pressed ? 1.5 : 0;
    f.bend += (target - f.bend) * 0.15;   
    f.pivot1.rotation.x = f.bend;
    f.pivot2.rotation.x = f.bend * 0.9;
  });

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});