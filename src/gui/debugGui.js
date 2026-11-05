import * as dat from "dat.gui";
import * as THREE from "three";

function updateTimeOfDay(value, { scene, sky, renderer }) {
  if (value === "Day") {
    scene.background = new THREE.Color(0x87ceeb); // لون أزرق سماء
    sky.material.uniforms["turbidity"].value = 10;
    renderer.toneMappingExposure = 0.5;
  } else {
    scene.background = new THREE.Color(0x111111); // لون رمادي غامق
    sky.material.uniforms["turbidity"].value = 1;
    renderer.toneMappingExposure = 0.1;
  }
}

/**
 * @param {Ph} physic - نسخة فيزياء القارب
 * @param {object} envRefs - { scene, sky, renderer } لتبديل النهار/الليل
 */
export function createDebugGui(physic, envRefs) {
  const gui = new dat.GUI();

  const sunParams = { timeOfDay: "Day" };
  gui
    .add(sunParams, "timeOfDay", ["Day", "Night"])
    .onChange((value) => updateTimeOfDay(value, envRefs));

  gui.add(physic, "payloadMass", 0, 3000, 10).name("payloadMass");
  gui.add(physic, "hasHole");
  gui.add(physic, "theta", 0, 360, 0.1).name("Current Angle");
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

  return gui;
}
