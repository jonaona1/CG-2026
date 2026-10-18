import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);

camera.position.z = 3;
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

// Cone
const redConeGeometry = new THREE.ConeGeometry(1, 1, 3);
const redConeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const redCone = new THREE.Mesh(redConeGeometry, redConeMaterial);
scene.add(redCone);

redCone.position.y = 1; 
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);


const pointLight = new THREE.PointLight( 0xffffff, 3, 100 );
pointLight.position.set( 3, 3, 4 );
scene.add( pointLight );



const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    //cube.rotation.y += 0.01;
    //cube.rotation.x += 0.01;
      //controls.update();

    renderer.render(scene, camera);
}
animate();