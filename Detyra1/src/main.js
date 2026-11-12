

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';


const ROOM = { width: 8, depth: 8, height: 3.5 };

const CHAIR_SCALE = 1.2;
const CHAIR_DISTANCE = 1.4;
const CHAIR_COLOR = 0x7a0c18;

const DINING = { x: 1.7, z: 1.3 };
const LIVING = { x: -1.0, z: -0.8 };

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0f14);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 2.2, 4.5);

const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0.5, 0);
controls.enableDamping = true;

//  WALLS ----------

function makeWall(width, height, color, position, rotationY) {
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      side: THREE.DoubleSide
    })
  );

  wall.position.copy(position);
  wall.rotation.y = rotationY;
  wall.receiveShadow = true;

  scene.add(wall);
}

const wallColor = 0xe6d8bf;

// Back wall
makeWall(
  ROOM.width,
  ROOM.height,
  wallColor,
  new THREE.Vector3(0, ROOM.height / 2, -ROOM.depth / 2),
  0
);

// Left wall
makeWall(
  ROOM.depth,
  ROOM.height,
  wallColor,
  new THREE.Vector3(-ROOM.width / 2, ROOM.height / 2, 0),
  Math.PI / 2
);

// Right wall - olive accent
makeWall(
  ROOM.depth,
  ROOM.height,
  0x4a5a2a,
  new THREE.Vector3(ROOM.width / 2, ROOM.height / 2, 0),
  -Math.PI / 2
);

//  PARQUET FLOOR ----------

// Create a wooden parquet texture using canvas
function makeParquetTexture() {
  const size = 512;
  const rows = 8;
  const plankW = size / rows;
  const plankL = 128;

  const canvas = document.createElement('canvas');

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');

  for (let row = 0; row < rows; row++) {

    // Every second row starts halfway through a plank
    const offset = (row % 2) * (plankL / 2);

    for (let x = -plankL; x < size + plankL; x += plankL) {

      // Slightly different shades of natural wood
      const light = 35 + Math.random() * 12;

      ctx.fillStyle = `hsl(28, 40%, ${light}%)`;

      ctx.fillRect(
        x + offset,
        row * plankW,
        plankL,
        plankW
      );

      // Wood grain lines
      ctx.strokeStyle = `hsla(28, 40%, ${light - 8}%, 0.5)`;
      ctx.lineWidth = 1;

      for (let g = 1; g <= 3; g++) {
        const y = row * plankW + (plankW / 4) * g;

        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset + plankL, y);
        ctx.stroke();
      }


    }
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  texture.repeat.set(4, 4);
  texture.anisotropy = 8;

  return texture;
}

// Apply parquet texture to the floor
const parquetTexture = makeParquetTexture();

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
  new THREE.MeshStandardMaterial({
    map: parquetTexture,
    roughness: 0.65
  })
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;

scene.add(floor);

//  LIGHTING ----------

// Ambient light
scene.add(
  new THREE.AmbientLight(0xffffff, 0.35)
);

// Main warm light
const mainLight = new THREE.PointLight(0xffd9a0, 40, 12);

mainLight.position.set(0.5, 3, 0.3);
mainLight.castShadow = true;

scene.add(mainLight);

// Pink light in the back left corner
const pinkLight = new THREE.PointLight(0xff4d9d, 8, 6);

pinkLight.position.set(-3, 1.2, -3);

scene.add(pinkLight);

// Amber light in the back right corner
const amberLight = new THREE.PointLight(0xffa033, 8, 6);

amberLight.position.set(3, 1.2, -3);

scene.add(amberLight);

//  MODELS ----------

const loader = new GLTFLoader();

// Enable shadows for downloaded models
function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

//  MAGAZINE ----------

function makeMagazineCover() {
  const canvas = document.createElement('canvas');

  canvas.width = 280;
  canvas.height = 380;

  const ctx = canvas.getContext('2d');

  // Red cover
  ctx.fillStyle = '#8b0f2a';
  ctx.fillRect(0, 0, 280, 380);

  // Title
  ctx.fillStyle = '#f1e9da';
  ctx.font = 'bold 44px serif';
  ctx.textAlign = 'center';

  ctx.fillText('INTERIORS', 140, 64);

  // Picture area
  ctx.fillRect(30, 90, 220, 170);

  ctx.fillStyle = '#36013F';
  ctx.fillRect(50, 110, 180, 130);

  // Magazine headline
  ctx.fillStyle = '#f1e9da';
  ctx.font = 'bold 20px serif';

  ctx.fillText('THE RED ISSUE', 140, 296);

  ctx.font = '14px serif';

  ctx.fillText('Warm rooms, bold colours', 140, 322);
  ctx.fillText('and cozy corners', 140, 342);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

const paper = new THREE.MeshStandardMaterial({
  color: 0xf1e9da,
  roughness: 0.9
});

const MAGAZINE_THICKNESS = 0.012;

const magazine = new THREE.Mesh(
  new THREE.BoxGeometry(0.28, MAGAZINE_THICKNESS, 0.38),
  [
    paper,
    paper,
    new THREE.MeshStandardMaterial({
      map: makeMagazineCover(),
      roughness: 0.4
    }),
    paper,
    paper,
    paper
  ]
);

magazine.castShadow = true;

scene.add(magazine);

// TABLES ----------

loader.load(
  '/models/table/coffee_table_round_01_4k.gltf',

  (gltf) => {

    // Coffee table
    const coffeeTable = gltf.scene.clone();

    coffeeTable.position.set(
      LIVING.x,
      0,
      LIVING.z
    );

    enableShadows(coffeeTable);

    scene.add(coffeeTable);

    // Calculate table height
    const tableTop = new THREE.Box3()
      .setFromObject(coffeeTable).max.y;

    // Place magazine on coffee table
    magazine.position.set(
      LIVING.x + 0.1,
      tableTop + MAGAZINE_THICKNESS / 2,
      LIVING.z
    );

    magazine.rotation.y = 0.4;

    // Dining table
    const diningTable = gltf.scene;

    diningTable.position.set(
      DINING.x,
      0,
      DINING.z
    );

    diningTable.scale.setScalar(1.6);

    enableShadows(diningTable);

    scene.add(diningTable);
  }
);

//  DINING CHAIRS ----------

const chairSpots = [
  {
    x: DINING.x,
    z: DINING.z + CHAIR_DISTANCE,
    rotY: Math.PI
  },
  {
    x: DINING.x,
    z: DINING.z - CHAIR_DISTANCE,
    rotY: 0
  },
  {
    x: DINING.x + CHAIR_DISTANCE,
    z: DINING.z,
    rotY: -Math.PI / 2
  },
  {
    x: DINING.x - CHAIR_DISTANCE,
    z: DINING.z,
    rotY: Math.PI / 2
  }
];

loader.load(
  '/models/chair/modern_arm_chair_01_4k.gltf',

  (gltf) => {

    chairSpots.forEach((spot) => {

      const chair = gltf.scene.clone();

      chair.scale.setScalar(CHAIR_SCALE);

      chair.position.set(
        spot.x,
        0,
        spot.z
      );

      chair.rotation.y = spot.rotY;

      // Change chair colour to deep red
      chair.traverse((child) => {

        if (child.isMesh) {

          child.material = child.material.clone();

          child.material.map = null;

          child.material.color.set(CHAIR_COLOR);

          child.material.needsUpdate = true;
        }
      });

      enableShadows(chair);

      scene.add(chair);
    });
  }
);

// OTTOMAN chair ----------

loader.load(
  '/models/sofachair/Ottoman_01_4k.gltf',

  (gltf) => {

    gltf.scene.position.set(-2.6, 0, 2.5);

    gltf.scene.rotation.y = -Math.PI / 2;

    gltf.scene.scale.setScalar(1.0);

    gltf.scene.traverse((child) => {

      if (child.isMesh) {

        child.material = child.material.clone();

        child.material.map = null;

        child.material.color.set(0xffcfca);

        child.material.needsUpdate = true;
      }
    });

    enableShadows(gltf.scene);

    scene.add(gltf.scene);
  }
);

// STRIPED RUG ----------

function makeStripeTexture() {

  const size = 520;
  const stripes = 18;

  const canvas = document.createElement('canvas');

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');

  for (let i = 0; i < stripes; i++) {

    ctx.fillStyle = i % 2 === 0
      ? '#f1e9da'
      : '#111111';

    ctx.fillRect(
      i * (size / stripes),
      0,
      size / stripes,
      size
    );
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

const rug = new THREE.Mesh(
  new THREE.PlaneGeometry(4.0, 4.0),
  new THREE.MeshStandardMaterial({
    map: makeStripeTexture(),
    roughness: 1
  })
);

rug.rotation.x = -Math.PI / 2;

rug.position.set(
  LIVING.x,
  0.01,
  LIVING.z
);

rug.receiveShadow = true;

scene.add(rug);

// SOFAS ----------

function makeSofa(width) {

  const sofa = new THREE.Group();

  const fabric = new THREE.MeshStandardMaterial({
    color: 0xffcfca,
    roughness: 1
  });

  // Helper to create rounded sofa parts
  const addPart = (w, h, d, x, y, z) => {

    const part = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 4, 0.08),
      fabric
    );

    part.position.set(x, y, z);

    sofa.add(part);
  };

  // Seat
  addPart(width, 0.5, 1.0, 0, 0.25, 0);

  // Left back cushion
  addPart(
    width / 2 - 0.05,
    0.6,
    0.3,
    -width / 4,
    0.8,
    -0.35
  );

  // Right back cushion
  addPart(
    width / 2 - 0.05,
    0.6,
    0.3,
    width / 4,
    0.8,
    -0.35
  );

  // Round pillow
  const pillow = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 24, 16),
    fabric
  );

  pillow.position.set(
    -width / 2 + 0.3,
    0.67,
    -0.05
  );

  sofa.add(pillow);

  enableShadows(sofa);

  return sofa;
}

// Big sofa against back wall
const sofaBack = makeSofa(3.0);

sofaBack.position.set(0, 0, -2.45);

scene.add(sofaBack);

// Smaller sofa against left wall
const sofaSide = makeSofa(2.2);

sofaSide.position.set(-2.8, 0, 0.3);

sofaSide.rotation.y = Math.PI / 2;

scene.add(sofaSide);

//  SIDEBOARD ----------

const woodMat = new THREE.MeshStandardMaterial({
  color: 0x36013F,
  roughness: 0.6
});

const sideboard = new THREE.Mesh(
  new THREE.BoxGeometry(4.0, 0.6, 0.45),
  woodMat
);

sideboard.position.set(0, 0.5, -3.75);

scene.add(sideboard);

// MARBLE BUST ----------

loader.load(
  '/models/sculpture/marble_bust_01_4k.gltf',

  (gltf) => {

    gltf.scene.position.set(-0.2, 0.8, -3.75);

    gltf.scene.scale.setScalar(1.5);

    enableShadows(gltf.scene);

    scene.add(gltf.scene);
  }
);

//  YELLOW VASE ----------

const vase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.10, 0.09, 0.7, 60),
  new THREE.MeshStandardMaterial({
    color: 0xd4a017,
    roughness: 0.9
  })
);

vase.position.set(0.8, 0.95, -3.75);

scene.add(vase);

// CERAMIC VASE ----------

loader.load(
  '/models/ceramicvase/ceramic_vase_01_4k.gltf',

  (gltf) => {

    const vaseModel = gltf.scene;

    vaseModel.position.set(-2.4, 0, -3.3);

    vaseModel.scale.setScalar(2.2);

    enableShadows(vaseModel);

    scene.add(vaseModel);
  },

  undefined,

  (error) => {

    const msg = document.createElement('div');

    msg.textContent =
      'Vase failed to load: ' + (error.message || error);

    msg.style.cssText =
      'position:fixed;top:10px;left:10px;background:#fff;color:#c00;padding:8px;font:14px sans-serif;z-index:10';

    document.body.appendChild(msg);
  }
);

// APPLE ----------

const apple = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 24, 16),
  new THREE.MeshStandardMaterial({
    color: 0x7a1020,
    roughness: 0.2
  })
);

apple.position.set(0.4, 0.87, -3.7);

scene.add(apple);

//  BOOK ----------

const book = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.04, 0.2),
  new THREE.MeshStandardMaterial({
    color: 0xe8e0d0,
    roughness: 0.8
  })
);

book.position.set(-1.0, 0.825, -3.75);

scene.add(book);

// BURGUNDY MUSHROOM LAMPS ----------

const burgundyGloss = new THREE.MeshStandardMaterial({
  color: 0x8b0f2a,
  emissive: 0x3a0510,
  roughness: 0.2,
  metalness: 0.1,
  side: THREE.DoubleSide
});

function makeLamp(x, z) {

  const lampGroup = new THREE.Group();

  // Round base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.22, 0.04, 32),
    burgundyGloss
  );

  base.position.y = 0.02;

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 1.1, 16),
    burgundyGloss
  );

  stem.position.y = 0.6;

  // Mushroom shade
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.3,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    ),
    burgundyGloss
  );

  shade.position.y = 1.15;

  lampGroup.add(base, stem, shade);

  lampGroup.position.set(x, 0, z);

  scene.add(lampGroup);

  // Warm light under the shade
  const glow = new THREE.PointLight(0xffc27a, 6, 4);

  glow.position.set(x, 1.05, z);

  scene.add(glow);
}

// Left lamp
makeLamp(-3, -2.7);

// Right lamp
makeLamp(3, -2.7);

//  FRAMED PICTURES ----------

function makeFrame(
  frameColor,
  artColor,
  w,
  h,
  x,
  y,
  z,
  rotY
) {

  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.05),
    new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness: 0.5
    })
  );

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.82, h * 0.82),
    new THREE.MeshStandardMaterial({
      color: artColor,
      roughness: 0.9
    })
  );

  art.position.z = 0.026;

  group.add(frame, art);

  group.position.set(x, y, z);

  group.rotation.y = rotY;

  scene.add(group);
}

// Picture colours
const PURPLE = 0x490A54;
const RED = 0xb3202a;
const BLACK = 0x111111;
const WHITE = 0xffffff;

// Back wall pictures
makeFrame(
  BLACK,
  WHITE,
  0.7,
  0.9,
  0.0,
  2.05,
  -3.97,
  0
);

makeFrame(
  WHITE,
  RED,
  0.8,
  1.1,
  -1.1,
  1.95,
  -3.97,
  0
);

makeFrame(
  WHITE,
  PURPLE,
  0.8,
  1.1,
  1.1,
  1.95,
  -3.97,
  0
);

// Left wall picture
makeFrame(
  RED,
  PURPLE,
  2.5,
  0.7,
  -3.97,
  1.9,
  0.3,
  Math.PI / 2
);



window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});



function animate() {

  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();
