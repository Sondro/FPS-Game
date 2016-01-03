/**
 * This is the Main Game Class for the Client, Babylon.js will be initilized here
 * the Level will be loaded and all the Players will be initilized and/or added in a later process
 */
 
var Render = function(controller) {	  
        
    var _this = this;
    this.assets = {};  
    this.controller = controller;
    this.remotePlayers = [];
    this.localPlayer;
 
    if(document.readyState == "complete"){
        this.init();
    } 
    else{
        window.addEventListener('DOMContentLoaded', function(){
            _this.init();
        });
    }
} 
 
//Initilize Methods
//========================================================================
Render.prototype.init = function(){
    var _this = this;
    
    this.canvas = document.getElementById('gameCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.engine.displayLoadingUI(); //Will be disabled before render loop starts
    
    this.scene = new BABYLON.Scene(this.engine);

    this.sounds = new Sounds(this);
    this.physics = new Physics(this.scene); 
    this.createCamera();
    this.loadLevel();

    this.scene.executeWhenReady(function () {
        _this.moveMesh();
        //This Tells the server to send information to the client
        //This triggers a InitGame Method, from there on renderLoop and EventHandlers ... is started
        _this.controller.requestAllPlayers(); 
    });
}

Render.prototype.createCamera = function(){
    //The local player is represetend by the camera as this is going to be a fps
    this.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -20), this.scene);
    this.camera.attachControl(this.canvas, true);
}

Render.prototype.loadLevel = function(){  
    //Maybe I need a some sort of Level Load Class in case I want to have diffrent environments? Not sure yet
    this.lights = new Lights(this.scene, false); 
    this.sky = new Sky(this); 
          
    this.terrain = new Terrain(this);
     
    this.objectLoader = new ObjectLoader(this);
    this.objectLoader.loadBoxes(); 
    this.objectLoader.loadTrees();
    this.objectLoader.loadBushes();
    this.objectLoader.loadGun(); 
    this.objectLoader.loadSoldire();
    
}
//After mesh is loaded, it needs to be moved, but this can only be done, when the loading is done, for example to get the height of the heightfield at a certain point
Render.prototype.moveMesh = function(){  
    this.objectLoader.moveBoxes();
    this.objectLoader.moveTrees(); 
    this.objectLoader.moveBushes();
}
 
//Event Listeners
Render.prototype.registerEventListener = function(){
	var _this = this; 
	// the canvas/window resize event handler
	window.addEventListener('resize', function(){
		_this.engine.resize();
	}); 
}

//Render Loop
Render.prototype.renderLoop = function(){
    var _this = this;
    this.engine.hideLoadingUI()
    this.engine.runRenderLoop(function(){
        _this.scene.render();  
        //Update the position of the Local player and send it to the Server
        _this.localPlayer.updatePosition();
        //Checking for Key presses and the actions bound to that key
        _this.localPlayer.checkControlls();
        //Check if player is free falling somewhere to kill him/her/it off ... gotta be geneder nutral right!?
        _this.localPlayer.checkFreeFall();
        //Check if player is jumping and determine when jump is over
        _this.localPlayer.checkJump();
        //show fps for
        $("#fps").html(_this.engine.getFps().toFixed(0) + " fps");
    }); 
}

 
//Methods called by the Controller to communicate with the Server
//=================================================================
Render.prototype.loadLocalPlayer = function(player){  
    this.localPlayer = new LocalPlayer(this, player); 

    //Now that the local player is loaded, eventlistener and renderloop can be started
    this.registerEventListener();
    this.renderLoop();
}

Render.prototype.loadOponent = function(player){
    var remotePlayer = new RemotePlayer(this, player);
    this.remotePlayers.push(remotePlayer); 
}

Render.prototype.removeOponent = function(id){	 
    var remotePlayer = this.findRemotePlayer(id);
    remotePlayer.remove();
    this.remotePlayers.splice(this.remotePlayers.indexOf(remotePlayer), 1);

} 

Render.prototype.movePlayer = function(id, pos, rot){	  
    var remotePlayer = this.findRemotePlayer(id);
    remotePlayer.move(pos,rot);
}

Render.prototype.updateHitPoints = function(){	  
    this.localPlayer.updateHitPoints(); 
}

Render.prototype.localPlayerGotKilled = function(killer){
    var remotePlayer;
    if(killer == this.localPlayer.player.getID()){
        //Here we have a classic ... suicide
        remotePlayer = this.localPlayer;
    }
    else{
        remotePlayer = this.findRemotePlayer(killer);
        remotePlayer.player.addKill();
    }
    this.localPlayer.player.addDeath();
    this.localPlayer.gotKilled(remotePlayer);
}
 
Render.prototype.remotePlayerDied = function(id, killer){
    var remotePlayerKiller;
    if(killer == this.localPlayer.player.getID()){
        remotePlayerKiller = this.localPlayer;
        this.localPlayer.player.addKill();
        this.sounds.onKill();
        //Play sound for killing someone
    }
    else{
        remotePlayerKiller = this.findRemotePlayer(killer); 
        remotePlayerKiller.player.addKill();
    } 
    var remotePlayerDied = this.findRemotePlayer(id);
    remotePlayerDied.player.addDeath();
    remotePlayerDied.gotKilled(remotePlayerKiller);
}

Render.prototype.respawnLocalPlayer = function(){
    this.localPlayer.respawn();
}
Render.prototype.respawnRemotePlayer = function(id){
    var remotePlayer = this.findRemotePlayer(id);
    remotePlayer.respawn();
}
Render.prototype.shotFired = function(pos){
    this.sounds.gunFire3D(new BABYLON.Vector3(pos.x , pos.y , pos.z));
}

 
//Helper Methods
//=======================================================================
Render.prototype.findRemotePlayer = function(id){
    for (var i = 0; i < this.remotePlayers.length; i++) {
        if (this.remotePlayers[i].player.getID() == id)
            return this.remotePlayers[i]; 
    };
    throw new Error("Player not found " + id);
    return false;
}

