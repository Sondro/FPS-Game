var Terrain = function(render){
    this.render = render;

    // Terrain
    this.groundDivs = 64;
	this.tileSize = 1000; 
    this.bottomPoint = -5;
    this.topPoint = 19;  
	//this.ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/map2.jpg", tileSize, tileSize, groundDivs, -100, 600, this.render.scene, false);
	this.ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/textures/map.jpg", this.tileSize, this.tileSize, this.groundDivs, this.bottomPoint, this.topPoint, this.render.scene, true);   
   
   //played a little bit with multimatiriel, but it doesnt seem to work very well
   //I dont know a decent way to create submesh, for example depending on the normals or the height
    var groundMaterial1 = new BABYLON.StandardMaterial("groundMat", this.render.scene);
	groundMaterial1.diffuseTexture = new BABYLON.Texture("assets/textures/gras1.jpg", this.render.scene);
	groundMaterial1.diffuseTexture.uScale = 10.0;
	groundMaterial1.diffuseTexture.vScale = 10.0;
    
    var groundMaterial2 = new BABYLON.StandardMaterial("groundMat", this.render.scene);
	groundMaterial2.diffuseTexture = new BABYLON.Texture("assets/textures/gras2.jpg", this.render.scene);
	groundMaterial2.diffuseTexture.uScale = 10.0;
	groundMaterial2.diffuseTexture.vScale = 10.0;
    
    var groundMaterial3 = new BABYLON.StandardMaterial("groundMat", this.render.scene);
	groundMaterial3.diffuseTexture = new BABYLON.Texture("assets/textures/gras3.jpg", this.render.scene);
	groundMaterial3.diffuseTexture.uScale = 10.0;
	groundMaterial3.diffuseTexture.vScale = 10.0;
    
    // Multimaterial
    var multimat = new BABYLON.MultiMaterial("multi", this.render.scene);
    multimat.subMaterials.push(groundMaterial1);
    multimat.subMaterials.push(groundMaterial2);
    multimat.subMaterials.push(groundMaterial3);
     
    this.ground.subMeshes = [];
    var verticesCount = this.ground.getTotalVertices();
    this.ground.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 900, this.ground));
    this.ground.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, 900, 900, this.ground));
    this.ground.subMeshes.push(new BABYLON.SubMesh(2, 0, verticesCount, 1800, 2088, this.ground));
    
    this.ground.material = multimat;
    
    this.render.lights.addShadowReciver(this.ground);

    this.render.physics.initMesh(this.ground); 
}
 
//Calculate the elvation of the player
Terrain.prototype.calcElevation = function(x , z){
    var ray = new BABYLON.Ray(new BABYLON.Vector3(0, this.topPoint + 10 , 0), new BABYLON.Vector3(0, this.bottomPoint - 10,0), ((this.topPoint - this.bottomPoint)+20));
	ray.origin.x = x;
	ray.origin.z = z; 
	var i = this.ground.intersects(ray);
    
	if (!i || !i.pickedPoint) {
		return false;
	} 

	return i.pickedPoint.y;

}
    
