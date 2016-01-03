
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
    camera.ellipsoid = new BABYLON.Vector3(1.5, 2, 4.5);  
	//Tried to move the ellipsoid a little forward because of the weapon ... but it doesnt make any difference :/
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 1);
}
 
Physics.prototype.initMesh = function(mesh){ 
    mesh.checkCollisions = true;
}