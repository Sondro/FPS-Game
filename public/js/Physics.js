
var Physics = function(scene) {	  
     
    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new BABYLON.Vector3(0, -0.04, 0);
    // Enable Collisions 
    scene.collisionsEnabled = true;  
}
 
Physics.prototype.initLocalPlayer = function(camera){
    //ToDo: Take height into account!
    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.useOctreeForCollisions = true;
    camera.applyGravity = true;
  
    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new BABYLON.Vector3(1.2, 2, 1.2);  
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);
}
 
Physics.prototype.initMesh = function(mesh){ 
    mesh.checkCollisions = true;
}