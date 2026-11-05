import { obstacles } from "./obstacles";

import { DrawVector } from "./debugVectors";
export default class Boat {
  /**
   * @param {object} deps
   * @param {THREE.Scene} deps.scene
   * @param {GLTFLoader} deps.loader
   * @param {Ph} deps.physic - نسخة فيزياء القارب
   * @param {OrbitControls} deps.controls - تُستخدم لتحديث target كل فريم
   */
  constructor({ scene, loader, physic, controls }) {
    this.scene = scene;
    this.loader = loader;
    this.physic = physic;
    this.controls = controls;
    this.boatModel = null;

    // نصف قطر تقريبي لجسم القارب (لحساب الاصطدام مع العوائق) — عدّله حسب حجم الموديل الفعلي
    this.boatRadius = 15;

    this.loader.load("/assets/tow_boat.glb", (gltf) => {
      this.scene.add(gltf.scene);
      gltf.scene.scale.set(12, 12, 12);
      gltf.scene.position.set(1, -0.5, 50);
      gltf.scene.rotation.set(0, 3.5, 0);

      this.boatModel = gltf.scene;
      this.boatModel.rotation.y = 0;
    });
  }

  /**
   * يمنع القارب من اختراق أي عائق مسجّل بـ obstacles (جزر مثلاً).
   * يصحح الموقع على حافة العائق، ويلغي فقط مركبة السرعة الداخلة باتجاهه
   * (فيصير "انزلاق" على الحافة بدل ارتجاج أو توقف كامل).
   */
  checkCollisions() {
    const physic = this.physic;

    for (const obs of obstacles) {
      const dx = physic.position.x - obs.position.x;
      const dz = physic.position.z - obs.position.z;
      let dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = this.boatRadius + obs.radius;

      if (dist < minDist) {
        if (dist === 0) dist = 0.001; // تجنب القسمة على صفر

        const nx = dx / dist;
        const nz = dz / dist;

        // تصحيح الموقع إلى حافة العائق
        physic.position.x = obs.position.x + nx * minDist;
        physic.position.z = obs.position.z + nz * minDist;

        // إلغاء مركبة السرعة الداخلة باتجاه العائق فقط
        const dot = physic.velocity.x * nx + physic.velocity.z * nz;
        if (dot < 0) {
          physic.velocity.x -= dot * nx;
          physic.velocity.z -= dot * nz;
        }
      }
    }
  }

  update() {
    if (!this.boatModel) return;

    const physic = this.physic;

    physic.updateRotation();
    physic.update();
    // DrawVector( this.scene, 0, physic.updateTraction(), 0x0000ff, 115, physic.position, );

    this.checkCollisions();

    this.boatModel.position.y = physic.position.y + 6;
    this.boatModel.position.x = physic.position.x;
    this.boatModel.position.z = physic.position.z;

    physic.updateEnviromentVariables();

    this.boatModel.rotation.y = physic.rotation.y;

    // تحديث هدف الكاميرا ليتبع القارب — OrbitControls بيحسب موقع الكاميرا الفعلي
    this.controls.target.set(
      this.boatModel.position.x,
      this.boatModel.position.y,
      this.boatModel.position.z,
    );
  }
}
