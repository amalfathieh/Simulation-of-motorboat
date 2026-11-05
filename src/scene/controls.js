import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * ينشئ OrbitControls بأسلوب "third person" (تحكم بالماوس حوالين هدف متحرك).
 * الـ target بيتحدث كل فريم من Boat.update() ليتبع القارب،
 * فتقدر تلف الكاميرا بالماوس وبنفس الوقت تضل ملتصقة بالقارب وقت تحركه.
 */
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();
  return controls;
}
