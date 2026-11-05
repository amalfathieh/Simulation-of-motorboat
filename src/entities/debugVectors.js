import * as THREE from "three";

const arrowHelper = [];

/**
 * يرسم أو يحدّث شعاع قوة (ArrowHelper) برقم تسلسلي IndexOfVector.
 * استخدمها لتصوير قوى الدفع/السحب/التيار/الرياح فوق القارب 
 *
 * مثال استخدام داخل Boat.update() بعد physic.update():
 *   import { DrawVector } from "./debugVectors";
 *   DrawVector(this.scene, 0, physic.updateTraction(), 0x0000ff, 115, physic.position);
 */
export function DrawVector(scene, IndexOfVector, vector3, color, lengthOfVector, startingPointOfVector) {
  const dir = new THREE.Vector3(vector3.x, vector3.y, vector3.z);
  dir.normalize();

  const origin = new THREE.Vector3(
    startingPointOfVector.x,
    startingPointOfVector.y,
    startingPointOfVector.z,
  );

  if (arrowHelper[IndexOfVector] !== undefined) {
    scene.remove(arrowHelper[IndexOfVector]);
  }

  arrowHelper[IndexOfVector] = new THREE.ArrowHelper(dir, origin, lengthOfVector, color);
  scene.add(arrowHelper[IndexOfVector]);
}
