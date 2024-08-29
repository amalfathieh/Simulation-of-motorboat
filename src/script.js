import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Sh from "./physic/physic";
// import * as dat from "lil-gui";

let camera, scene, renderer;
let controls, water, sun;
var gui = new dat.GUI();
let xc = 0,
  zc = 0,
  xv = 0,
  zx = 0;
const loader = new GLTFLoader();
const physic = new Sh();
class Boat {
  constructor() {
    loader.load("assets/tow_boat.glb", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(12, 12, 12);
      gltf.scene.position.set(1, -0.5, 50);
      // gltf.scene.rotation.set(0, -29.85, 0);
      gltf.scene.rotation.set(0, 3.5, 0);

      this.boatModel = gltf.scene;
      this.boatModel.rotation.y = 0;
    });
  }

  update() {
    if (this.boatModel) {
      physic.updateRotation();
      physic.update();
      this.boatModel.position.y = physic.position.y;
      this.boatModel.position.y += 6;
      this.boatModel.position.x = physic.position.x;

      this.boatModel.position.z = physic.position.z;

      // xc = physic.position.x + 20 * Math.sin(physic.rotation.y + 180);
      // zc = physic.position.z + 200 * Math.cos(physic.rotation.y + 180);
      camera.position.set(physic.position.x, 30, physic.position.z -100);
      // camera.lookAt(xv , 0 ,zv);
      // xv = physic.position.x * (Math.sin(physic.rotation.y ));
      // zv = physic.position.z *(Math.cos(physic.rotation.y ));
      physic.updateEnviromentVariables();

      this.boatModel.rotation.y = physic.rotation.y;
      //----------------------------------رسم اشعة القوة------------------------------------
      // // ازرق الدفع
      // DrawVector(
      //   0,
      //   physic.updateTraction(),
      //   0x0000ff,
      //   115,
      //   new THREE.Vector3(
      //     physic.position.x,
      //     physic.position.y,
      //     physic.position.z
      //   )
      // );
      // // احمر السحب
      // DrawVector(
      //   1,
      //   physic.dragForce(),
      //   0xff0000,
      //   115,
      //   new THREE.Vector3(
      //     physic.position.x,
      //     physic.position.y,
      //     physic.position.z
      //   )
      // );
      //زهري التيارات
      // DrawVector(
      //   2,
      //   physic.CurrentInducedForce(),
      //   0xff0080,
      //   115,
      //   new THREE.Vector3(
      //     physic.position.x,
      //     physic.position.y,
      //     physic.position.z
      //   )
      // );
      // //الرياح اصفر
      // DrawVector(
      //   3,
      //   physic.windForce(),
      //   0xffff00,
      //   115,
      //   new THREE.Vector3(
      //     physic.position.x,
      //     physic.position.y,
      //     physic.position.z
      //   )
      // );
      // //00CC00 اخضر
      //
    }
  }
}

const boat = new Boat();

//-------------------------------------تابع رسم اشعة القوة---------------------------------------

const arrowHelper = [];
function DrawVector(
  IndexOfVector,
  vector3,
  color,
  lengthOfVector,
  startingPointOfVector
) {
  var dir = new THREE.Vector3(vector3.x, vector3.y, vector3.z);
  dir.normalize();
  var origin = new THREE.Vector3(
    startingPointOfVector.x,
    startingPointOfVector.y,
    startingPointOfVector.z
  );
  var length = lengthOfVector;
  var hex = color;
  //ازاله الشعاع اذا كان موجود
  if (arrowHelper[IndexOfVector] !== undefined) {
    scene.remove(arrowHelper[IndexOfVector]);
  }
  //اضافة الشاع الجديد وتحديث المتغير
  arrowHelper[IndexOfVector] = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper[IndexOfVector]);
}

init();
animate();

function init() {
  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    95,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  // camera.position.set(-10000, 500, 150);

  /////////////////////////////////////////////////////////////////////////////////////////////
  camera.position.set(0, 30, -120);

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "assets/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  // //اضافة خطوط المحاور في الرسم
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(85 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  updateSun();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;

  window.addEventListener("resize", onWindowResize);

  const sunParams = {
    timeOfDay: "Day",
  };
  gui.add(sunParams, "timeOfDay", ["Day", "Night"]).onChange(updateTimeOfDay);

  // دالة تحديث وقت النهار / الليل
  function updateTimeOfDay() {
    if (sunParams.timeOfDay === "Day") {
      // إضاءة النهار (مثال)
      scene.background = new THREE.Color(0x87ceeb); // لون أزرق سماء
      sky.material.uniforms["turbidity"].value = 10; // قيمة تدرج السماء
      renderer.toneMappingExposure = 0.5; // شدة الإضاءة
    } else {
      // إضاءة الليل (مثال)
      scene.background = new THREE.Color(0x111111); // لون رمادي غامق
      sky.material.uniforms["turbidity"].value = 1; // قيمة تدرج السماء
      renderer.toneMappingExposure = 0.1; // شدة الإضاءة
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  // xc = physic.position.x + 20 * Math.sin(physic.rotation.y + 180);
  // zc = physic.position.z + 200 * Math.cos(physic.rotation.y + 180);
  // camera.position.set(xc, 30, zc);
  // camera.lookAt(xv, 0, zv);
  boat.update();
}

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}

//---------------------------------------------------------Debug GUI--------------------------------------------------------
gui.add(physic, "payloadMass", 0, 3000, 10).name("payloadMass");
gui.add(physic, "hasHole");
gui.add(physic, "theta", 0, 360, 0.1).name("Wind Angle");
gui.add(physic, "windSpeedX", 10, 120, 1).name("Wind Speed X");
gui.add(physic, "windSpeedZ", 8, 120, 1).name("Wind Speed Z");
gui.add(physic, "v_c_x", 10, 80, 0.5).name("Water Speed X");
gui.add(physic, "v_c_z", 8, 80, 0.5).name("Water Speed Z");

const engineFolder = gui.addFolder("Engine Settings");
engineFolder.add(physic, "outOfFuel");

engineFolder.add(physic, "destoryLeftEngine").name("Destroy Left Engine");
engineFolder.add(physic, "destoryRightEngine").name("Destroy Right Engine");
engineFolder.add(physic, "propellerSpeedL", 0, 50, 0.1).name("Propeller Left");
engineFolder.add(physic, "propellerSpeedR", 0, 50, 0.1).name("Propeller Right");
engineFolder.add(physic, "angleRudder", -30, 30, 0.1).name("Angle Rudder");

engineFolder.open();
// engineFolder.close();
