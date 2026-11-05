import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Sh from "./physic/physic";

import { createRenderer, createCamera, createWater, createSky, updateSun } from "./scene/setup";
import { createControls } from "./scene/controls";
import { createDebugGui } from "./gui/debugGui";
import Boat from "./entities/Boat";
import Island from "./entities/Island";

let camera, scene, renderer, controls, water, sky;
let boat, island;

const loader = new GLTFLoader();
const physic = new Sh();

init();
animate();

function init() {
  renderer = createRenderer();
  scene = new THREE.Scene();
  camera = createCamera();

  water = createWater(scene);
  sky = createSky(scene);
  updateSun({ renderer, scene, sky, water, elevation: 2, azimuth: 180 });

  controls = createControls(camera, renderer.domElement);

  window.addEventListener("resize", onWindowResize);

  createDebugGui(physic, { scene, sky, renderer });

  boat = new Boat({ scene, loader, physic, controls });

  island = new Island({
    scene,
    loader,
    modelPath: "/assets/low-poly_floating_island_and_rocks.glb",
    x: 300,
    y: 0,
    z: 600,
    scale: 3000,
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  boat.update();
  controls.update(); // لازم تنفذ بعد تحديث target كل فريم (بسبب damping)
  render();
}

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0;
  renderer.render(scene, camera);
}
