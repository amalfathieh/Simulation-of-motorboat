import vector from "../vector";
import * as THREE from "three";
import { Vector3 } from "three";

const d = 2 ;
const enginePowerR = 20000; // Newtons
const propellerEfficiencyR = 0.3;
const propellerAreaR = 0.1; // m^2

const enginePowerL = 20000; // Newtons
const propellerEfficiencyL = 0.3;
const propellerAreaL = 0.1; // m^2

const waterDensity = 1025; // kg/m^3

const boatWeight = 1000;
let cc=0;
let dt = 0.02;
// const gui = new dat.GUI();

class Ph {
  constructor() {
    this.outOfFuel = false
    this.fuelMass = 300
    
    this.payloadMass =300;
    
    this.hasHole = false;
    this.theta = 80; // زاوية اتجاه التيار بالنسبة للقارب بالدرجات

    this.destoryLeftEngine = false;
    this.destoryRightEngine = false;
    this.position = new Vector3();
    this.rotation= new Vector3();
    this.velocity = new Vector3();
    this.acceleration = new Vector3();
    this.angleRudder = 0; //زاوية الدفة
    this.propellerSpeedR = 0; // radians/second
    this.propellerSpeedL = 0; // radians/second

    this.angularAcceleration = new Vector3(0,0,0);
    this.angularVelocity = new THREE.Vector3(0, 0, 0);

    this.gravity = new Vector3(0, -9.81, 0);
    
    this.vLength = 0.0; //طويلة شعاع السرعة

    this.dragCoefficient = 0.001; //معامل السحب

    this.air_rho = 1.2; //كثافة الهواء
    this.v_water = 20; //سرعة الماء
    this.heighBoat = 1.5; //ارتفاع القارب
    this.wBoat = 0.8; //عرض القارب
    this.lengthBoat = 4; //طول القارب

    this.v_c_x = 20; // سرعة التيار بالأمتار في الثانية
    this.v_c_z = 20; // سرعة التيار بالأمتار في الثانية

    this.windSpeedX = 10; // سرعة الرياح على محور x
    this.windSpeedZ = 12; // سرعة الرياح على محور z
    this.holeMass =0 ;
  }

  totalMass(){
    const total =boatWeight + this.payloadMass + this.fuelMass + this.holeMass
    return total ;
  }
  
  update() {

    if(this.hasHole && this.totalMass() <= 7000){
      this.holeMass += 15 ;
    }
    var totalF = this.totalForce();

    this.acceleration = totalF.divideScalar(this.totalMass());

    this.velocity = this.velocity.clone().add(
      this.acceleration.clone().multiplyScalar(dt)
    );
    this.vLength = this.velocity.length();

    this.position = this.position.clone().add(
      this.velocity.clone().multiplyScalar(dt)
    );
    
    if(this.position.y >5 ){
      this.position.y =5;
    }
   
  }

  totalForce() {
    // إنشاء Vector3 جديد لتخزين إجمالي القوة
    var tf = new THREE.Vector3();
    //جمع قوة الجاذبية
    tf = tf.add(this.gravityForce());
    //جمع قوة الطفو
    tf = tf.add(this.buoyancyForce());

    if (this.velocity.x !== 0 || this.velocity.z !== 0) {
      //جمع قوة السحب
      tf = tf.add(this.dragForce());
    }
    //جمع قوة الدفع
    tf = tf.add(this.updateTraction());

    //جمع قوة التيارات
    tf = tf.add(this.CurrentInducedForce());
    // //جمع قوة الرياح
    tf = tf.add(this.windForce());

    return tf;
  }

  compute_direction(angleY) {
    return new Vector3(
      Math.sin(angleY),
      0,
      Math.cos(angleY)
    );
   
  };
  // Right Traction
  tractionForceRight() {
    const force = !(this.destoryRightEngine) * 0.3 * waterDensity * propellerAreaR * Math.pow(this.propellerSpeedR, 2) * propellerEfficiencyR;
    const maxForce = enginePowerR; 
    const thrust = Math.min(force, maxForce); 
    if(this.propellerSpeedR >30 && this.fuelMass>0 && !this.outOfFuel){
        this.fuelMass-=0.003;
    }
    else if(this.propellerSpeedR >2 && this.fuelMass>0 && !this.outOfFuel){
        this.fuelMass-=0.001;
    }
    if(this.outOfFuel == true || this.fuelMass==0){
      return 0;
    }
    return thrust;
  }

  // Left Traction
  tractionForceLeft() {
    const force = !(this.destoryLeftEngine) * 0.3 * waterDensity * propellerAreaL * Math.pow(this.propellerSpeedL, 2) * propellerEfficiencyL;
    const maxForce = enginePowerL; 
    const thrust = Math.min(force, maxForce); 
    if(this.propellerSpeedL >30 && this.fuelMass>0 && !this.outOfFuel ){
        this.fuelMass-=0.003;
    }
    else if(this.propellerSpeedL >2 && this.fuelMass>0 && !this.outOfFuel){
        this.fuelMass-=0.001;
    }
    if(this.outOfFuel == true || this.fuelMass==0){
      return 0;
  }
    return thrust;
  }

  // Total Traction
  updateTraction(){
    this.direction = this.compute_direction(this.rotation.y );
    const temp =  this.tractionForceRight() + this.tractionForceLeft()
    const T = this.direction.clone().multiplyScalar(temp);
    return T;
  } 
  dragForce() {
    var f_drag = 0.5 * waterDensity * this.dragCoefficient * (this.wBoat * this.lengthBoat) * Math.pow(this.velocity.length(), 2);
    var dragVector = this.velocity.clone().normalize().multiplyScalar(-f_drag);
    return dragVector;
  }

  volume() {
    if (this.position.y > this.heighBoat) {
      return 0;
    }
    if (this.position.y < 0) {
      var v = this.heighBoat * this.wBoat * this.lengthBoat;
      return v;
    }
    var v = (this.heighBoat - this.position.y) * this.wBoat * this.lengthBoat;
    return v;
  }

  buoyancyForce() {
    var buoyancy = this.volume() * waterDensity * this.gravity.length();
    var buoyancyVector = new Vector3(0, buoyancy, 0);
    return buoyancyVector;
  }

  gravityForce() {
    var gravityForce = -(this.totalMass() * this.gravity.length());
    var gravityForceVector = new Vector3(0, gravityForce, 0);
    return gravityForceVector;
  }
 //قوة التيارات
 CurrentInducedForce() {
  var thetaRad = (this.theta * Math.PI) / 180;

  var F_c_x =  0.5 * waterDensity * Math.pow(this.v_c_x, 2) * (this.wBoat * this.heighBoat) * this.dragCoefficient ;
  var F_c_z = 0.5* waterDensity * Math.pow(this.v_c_z, 2) * (this.wBoat * this.heighBoat) * this.dragCoefficient ;
  var F_c_Vector = new Vector3( F_c_x * Math.sin(thetaRad), 0 , F_c_z * Math.cos(thetaRad) );
  return F_c_Vector;
}

windForce() {
  var thetaRad = (this.theta * Math.PI) / 180;
  var windForceX = this.air_rho * Math.pow(this.windSpeedX, 2) * (this.wBoat * this.heighBoat) * this.dragCoefficient;
  var windForceZ = this.air_rho * Math.pow(this.windSpeedZ, 2) * (this.wBoat * this.heighBoat) * this.dragCoefficient;
  var windForceVector = new Vector3( windForceX * Math.sin(thetaRad), 0 , windForceZ * Math.cos(thetaRad) );

  return windForceVector;
}
  
// --------------------------------------------- ROTATION ---------------------------------------------

calculate_I(){
    const I = ( 1/12 * this.totalMass() * Math.pow(this.lengthBoat,2) ) + (1/4 * this.totalMass() * Math.pow((this.wBoat / 2) , 2));
    return I;
  }
  // Right Torque
  updateRightTorque(){
    const z = this.tractionForceRight() * d ;
    return new THREE.Vector3(0,0,z)
  }
  // Left Torque
  updateLeftTorque(){
    const z = this.tractionForceLeft() * d ;
    return new THREE.Vector3(0,0,z)
  }
  // Dual Torque
  updateDualTorque(){
    if(this.destoryLeftEngine ){
        const z = this.updateRightTorque().z *  d * Math.sin((this.angleRudder * Math.PI) / 180)
        return new THREE.Vector3(0,0,z);
    }
    else if(this.destoryRightEngine){
        const z = this.updateLeftTorque().z *  d * Math.sin((this.angleRudder * Math.PI) / 180)
        return new THREE.Vector3(0,0,z);
    }
    return this.updateRightTorque().sub(this.updateLeftTorque())
  }
  // Angular Acceleration
  updateAngularAcceleration(){
    return new THREE.Vector3(0,0,this.updateDualTorque().z / this.calculate_I());
  }
  // Angular Velocity
  updateAngularVelocity(){
    return new THREE.Vector3( 0 , 0 , this.angularVelocity.z + (this.updateAngularAcceleration().z * (dt)));
  }
  // Theta the angle of rotation
  updateTheta(){
    return ((this.updateAngularVelocity().z * dt) + (0.5 * Math.pow(dt,2) * this.updateAngularAcceleration().z));
  }
  
  updateRotation(){
    this.rotation.y += this.updateTheta();
    const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),this.updateTheta());
    this.velocity.applyQuaternion(q1);
  }
 
updateEnviromentVariables() {

    cc += this.updateTheta() * 180 / Math.PI ;
  const info = document.getElementById("info");
  info.innerHTML =
  
    '    totalMass : ' + this.totalMass().toFixed(2)  + '<br><br>' +
    '    this.fuelMass : ' + this.fuelMass.toFixed(2)  + '<br><br>' +
    '    angleRudder : ' + this.angleRudder.toFixed(2)  + '<br><br>' +
    '    Acceleration (' + this.acceleration.x.toFixed(1) + ', ' + this.acceleration.y.toFixed(1) + ', ' + this.acceleration.z.toFixed(0) + ') m.s⁻²' + '<br><br>' +
    '    Velocity (' + this.velocity.x.toFixed(1) + ', ' + this.velocity.y.toFixed(1) + ', ' + this.velocity.z.toFixed(0) + ') m.s⁻¹' + '<br><br>' +
    '    position (' + this.position.x.toFixed(3) + ', ' + this.position.y.toFixed(3) + ', ' + this.position.z.toFixed(3) + ') m' + '<br><br>' +
    '____________ROTATION____________'+ '<br><br>' +
    '    DualTorque(' + this.updateDualTorque().x.toFixed(0) + ', ' +  this.updateDualTorque().y.toFixed(0) + ', ' +  this.updateDualTorque().z.toFixed(0) +  ') rad.s⁻²' + '<br><br>' +
    '    AngularAcceleration(' + this.updateAngularAcceleration(2).x.toFixed(0) +', ' + this.updateAngularAcceleration().y.toFixed(0) + ', ' + this.updateAngularAcceleration().z.toFixed(2)+ ') rad.s⁻²' + '<br><br>' +
    '    AngularVelocity(' + this.updateAngularVelocity().x.toFixed(2) +', ' + this.updateAngularVelocity().y.toFixed(2) + ', ' + this.updateAngularVelocity().z.toFixed(3) + ') rad.s⁻¹' + '<br><br>' +
    '    rotation (' + this.rotation.x.toFixed(0) + ', ' + this.rotation.y.toFixed(3) + ', ' + this.rotation.z.toFixed(0) + ') rad' + '<br><br>' +
    '    Rotation Theta : ' + cc.toFixed(3) + ' degree' + '<br><br>' +
    '________________________________'+ '<br><br>' +
    '    totalForce (' + this.totalForce().x.toFixed(1) + ', ' + this.totalForce().y.toFixed(1) + ', ' + this.totalForce().z.toFixed(1) + ') N' + '<br><br>'+ 
    '    Wind force (' + this.windForce().x.toFixed(0) + ', ' + this.windForce().y.toFixed(0)  + ' , ' + this.windForce().z.toFixed(0) + ') N' + '<br><br>' +
    '    Water Force (' + this.CurrentInducedForce().x.toFixed(0) + ', ' + this.CurrentInducedForce().y.toFixed(0)  + ' , ' + this.CurrentInducedForce().z.toFixed(0) + ') N' + '<br><br>' }

}
export default Ph;
