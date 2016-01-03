



/// <reference path="Key.js"/>
/// <reference path="../../libs/babylon.js"/>

var Render = function() {	
    
    if ( !(this instanceof Render) )
        throw new Error("Constructor called as a function, (public/game.js)");
        
    var _this = this;
    this.assets = {};  
    this.lastPosition;
    this.lastRotation; 
    
	window.addEventListener('DOMContentLoaded', function(){

		_this.canvas = document.getElementById('gameCanvas');

		_this.engine = new BABYLON.Engine(_this.canvas, true);
	  
        _this.scene = new BABYLON.Scene(_this.engine);
        
        _this.loader =  new BABYLON.AssetsManager(_this.scene);
    
        _this.loadMesh();
 
        _this.loader.onFinish = function (tasks) {
            
            //_this.initPointerLock();

            _this.createLights();
             
            _this.loadLevel();
            
            _this.initPhysics();
                    
            _this.renderLoop();
            
            _this.registerEventListener();

        };

        _this.loader.load();
        
	});
}
  
  
 
//Initilize Methods (they need to be called in this order)
//========================================================================

Render.prototype.loadMesh = function(){
    var _this = this;
    //Disable default loading screen by the asset manager
    //this.loader.useDefaultLoadingScreen = false; 
    var meshTask = this.loader.addMeshTask("gun", "", "assets/", "gun.babylon"); 
    meshTask.onSuccess = function(task) {
        _this.assets[task.name] = task.loadedMeshes;
        for (var i=0; i<task.loadedMeshes.length; i++ ){
            var mesh = task.loadedMeshes[i];
            mesh.isVisible = false; 
        }
    };
    
    //Load Textures
}

Render.prototype.createLights = function(){
    //Lightsa
    this.lightHem = new BABYLON.HemisphericLight("lightHem", new BABYLON.Vector3(0, 100, 0), this.scene);
    this.lightHem.intensity = 0.4;
	this.lightDir = new BABYLON.DirectionalLight("lightDir", new BABYLON.Vector3(-2, -4, 2), this.scene);    
	this.lightDir.diffuse = new BABYLON.Color3(1, 1, 1);	
	this.lightDir.specular = new BABYLON.Color3(0, 0, 0);
	this.lightDir.position = new BABYLON.Vector3(250, 400, 0);
    this.lightDir.intensity = 1.8;
    
    //Shadows
    this.shadowGenerator = new BABYLON.ShadowGenerator(4096, this.lightDir);
    this.shadowGenerator.useVarianceShadowMap = true; 
    this.shadowGenerator.setDarkness(0.3);
    //this.shadowGenerator.bias = 0.001;
}

Render.prototype.createCamera = function(){ 
    // Need a free camera for collisions
    this.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -20), this.scene);
    this.camera.speed = 0.4;
    this.camera.attachControl(this.canvas, true);
    this.camera.keysUp = [87]; // W
	this.camera.keysDown = [83]; // S 
	this.camera.keysLeft = [65]; // A
	this.camera.keysRight = [68]; // D
    //Todo: Have a fixed mouse in the center of the screen
}

Render.prototype.loadLevel = function(){    
    //this.ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, this.scene);
    // Terrain
	this.ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/map.jpg", 400, 400, 30, 0, 20, this.scene, true);   
    var groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
	groundMaterial.diffuseTexture = new BABYLON.Texture("assets/terre.png", this.scene);
	groundMaterial.diffuseTexture.uScale = 5.0;
	groundMaterial.diffuseTexture.vScale = 5.0;
	this.ground.material = groundMaterial;
    this.ground.position = new BABYLON.Vector3(0, -10, 0);
    this.ground.receiveShadows = true; 
    
    //Simple Box
    this.box = new BABYLON.Mesh.CreateBox("crate", 6, this.scene);
    this.box.material = new BABYLON.StandardMaterial("Mat", this.scene);
    this.box.material.diffuseTexture = new BABYLON.Texture("assets/crate.png", this.scene);
    this.box.material.diffuseTexture.hasAlpha = true;
    this.box.position = new BABYLON.Vector3(5, -4, -10);  
    this.shadowGenerator.getShadowMap().renderList.push(this.box);

    //Skybox
    BABYLON.Engine.ShadersRepository = "shaders/";
    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, this.scene);
    var shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;

    //Create Fog 
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.009;
    this.scene.fogColor = new BABYLON.Color3(0.8,0.83,0.8);
    
}

Render.prototype.initPhysics = function(){
    //Set gravity for the scene (G force like, on Y-axis)
    this.scene.gravity = new BABYLON.Vector3(0, -0.01, 0);

    // Enable Collisions
    this.scene.collisionsEnabled = true;

    //Then apply collisions and gravity to the active camera
    this.camera.checkCollisions = true;
    this.camera.useOctreeForCollisions = true;
    this.camera.applyGravity = true;
 
    //Set the ellipsoid around the camera (e.g. your player's size)
    this.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5); 
    this.camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.2, 0);
    //finally, say which mesh will be collisionable
    this.ground.checkCollisions = true; 
    this.ground.useOctreeForCollisions = true;
    this.box.checkCollisions = true; 

}

Render.prototype.initPointerLock = function() {
    var _this = this;
    // Request pointer lock
    var canvas = this.scene.getEngine().getRenderingCanvas();
    // On click event, request pointer lock
    this.canvas.addEventListener("click", function(evt) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }, false);

    // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
    var pointerlockchange = function (event) {
        _this.controlEnabled = (
                           document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
        // If the user is alreday locked
        if (!_this.controlEnabled) {
            _this.camera.detachControl(canvas);
        } else {
            _this.camera.attachControl(canvas);
        }
    };

    // Attach events to the document
    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
}

Render.prototype.registerEventListener = function(){
	var _this = this; 
	// the canvas/window resize event handler
	window.addEventListener('resize', function(){
		_this.engine.resize();
	}); 
	
	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
}

Render.prototype.renderLoop = function(){
    var _this = this;
    this.engine.runRenderLoop(function(){
        
        _this.scene.render();  

        _this.checkKeys();
        //Updates the local player to move with the camera and tells the controlle to broadcast that info to all other players
        if(_this.lastPosition != undefined && _this.lastRotation != undefined)
            _this.updateLocalPlayer();
    });
}



//Loading Methods called by the Controller, (communication with the server)
//========================================================
Render.prototype.loadLocalPlayer = function(player){ 
    this.createCamera();
    this.camera.position.x = player.getX();  
    this.camera.position.z = player.getZ();
    this.camera.position.y = 1;
    this.lastPosition = new BABYLON.Vector3(this.camera.position.x, this.camera.position.y , this.camera.position.z);
    this.lastRotation = new BABYLON.Vector3(this.camera.rotation.x, this.camera.rotation.y , this.camera.rotation.z);
}

Render.prototype.loadOponent = function(player){
    var oponentMat = new BABYLON.StandardMaterial("oponentMat", this.scene);
    var color= player.getColor();
    oponentMat.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);

    var oponent= new BABYLON.Mesh.CreateBox(player.getID(), 2.0 ,this.scene);
    oponent.position.x = player.getX();
    oponent.position.y = -9;     
    oponent.position.z = player.getZ();    
    oponent.material = oponentMat;

    oponent.checkCollisions = true;


    /*
    BABYLON.SceneLoader.ImportMesh(player.getID(), "mesh/", "player.babylon", this.scene, function (newMeshes, particleSystems, skeletons) {
        var oponent = newMeshes[0];

        oponent.position.x = player.getX(); 
        oponent.position.y = player.getY() - 0.5;  
        oponent.position.z = player.getZ();  

        this.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
        oponent.checkCollisions = true;
    }); 
    */
}

Render.prototype.removeOponent = function(id){	 
	var oponent = this.scene.getMeshByName(id);
	oponent.dispose();
} 

Render.prototype.movePlayer = function(id, pos, rot){	  
    var oponent = this.scene.getMeshByName(id);  
    oponent.position = new BABYLON.Vector3(pos.x, pos.y - 1, pos.z);
    //oponent.rotation = new BABYLON.Vector3(rot.x, rot.y, rot.z);
    oponent.rotation.y = rot.y;
}

 
//Other Methods, these Methods relay on the init methods been executed beforehand !!
//=====================================================w===
Render.prototype.updateLocalPlayer = function(){
    var xOffset = Math.abs(this.lastPosition.x - this.camera.position.x);
    var yOffset = Math.abs(this.lastPosition.y - this.camera.position.y);
    var zOffset = Math.abs(this.lastPosition.z - this.camera.position.z);
    
    var xRotOffset = Math.abs(this.lastRotation.x - this.camera.rotation.x);
    var yRotOffset = Math.abs(this.lastRotation.y - this.camera.rotation.y);
    var zRotOffset = Math.abs(this.lastRotation.z - this.camera.rotation.z);
    
    var posOffset = xOffset + yOffset + zOffset;
    var rotOffset = yRotOffset + xRotOffset + zRotOffset;
     
    if(posOffset > 0.1 || rotOffset > 0.01){ 
        controller.sendLocalPlayerMovment(this.camera.position, this.camera.rotation);
        this.lastPosition = new BABYLON.Vector3(this.camera.position.x , this.camera.position.y , this.camera.position.z);
        this.lastRotation = new BABYLON.Vector3(this.camera.rotation.x , this.camera.rotation.y , this.camera.rotation.z);
    } 
}

Render.prototype.checkKeys = function(){
    if(Key.isDown(Key.JUMP)){
        var cam = this.scene.cameras[0];

        cam.animations = [];

        var a = new BABYLON.Animation(
            "a",
            "position.y", 20,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Animation keys
        var keys = [];
        keys.push({ frame: 0, value: cam.position.y });
        keys.push({ frame: 10, value: cam.position.y + 2 });
        keys.push({ frame: 20, value: cam.position.y });
        a.setKeys(keys);

        var easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        a.setEasingFunction(easingFunction);

        cam.animations.push(a);

        this.scene.beginAnimation(cam, 0, 20, false);
    }
}

