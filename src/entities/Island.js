import * as THREE from "three";
import { obstacles } from "./obstacles";

export default class Island {
  /**
   * @param {object} opts
   * @param {THREE.Scene} opts.scene
   * @param {GLTFLoader} opts.loader
   * @param {string} opts.modelPath - مسار ملف الـ glb
   * @param {number} opts.x
   * @param {number} opts.y
   * @param {number} opts.z
   * @param {number} [opts.scale=1]
   * @param {number|null} [opts.collisionRadius=null] - إذا null، يُحسب تلقائياً من bounding box الموديل
   */
  constructor({ scene, loader, modelPath, x, y, z, scale = 1, collisionRadius = null }) {
    this.position = new THREE.Vector3(x, y, z);
    this.model = null;
    this.radius = collisionRadius;

    loader.load(modelPath, (gltf) => {
      gltf.scene.scale.set(scale, scale, scale);
      gltf.scene.position.set(x, y, z);
      scene.add(gltf.scene);
      this.model = gltf.scene;

      // حساب نصف قطر الاصطدام تلقائياً من حجم الموديل الفعلي بعد الـ scale
      if (!this.radius) {
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        this.radius = Math.max(size.x, size.z) / 2;
      }

      // تُسجَّل كعائق فعّال فقط بعد اكتمال التحميل وحساب الـ radius
      obstacles.push(this);
    });
  }
}
