building = false;

avatars = {};
function addAvatar(id, x, y, z, r, gender, name) {
	BABYLON.SceneLoader.ImportMesh('', 'models/', 'avatar.babylon', scene, function(meshes) {
		var avatar = meshes[0];
		avatar.position = new BABYLON.Vector3(x, y, z);
		avatar.ellipsoid = new BABYLON.Vector3(5,4,5);
		avatar.ellipsoidOffset = new BABYLON.Vector3(0,8,0);
		meshes[0].rotation.y = r;
		meshes[0].scaling = new BABYLON.Vector3(.1, .1, .1);
		// meshes[0].checkCollisions = true;
		//shadowGenerator.getShadowMap().renderList.push(meshes[1]);
		meshes[1].name = name;
		meshes[1].type = 'avatar';
		meshes[1].isPickable = true;
		for (s in meshes[1].material.subMaterials) {
			if (meshes[1].material.subMaterials[s].name != 'Eyelashes') {
				meshes[1].material.subMaterials[s].emissiveColor = new BABYLON.Color3(.5,.4,.3);
			}
		}
		avatars['player' + id] = avatar;
		scene.getMeshByName('Genesis2Female.Shape').dispose();
	});
}

npcData = {
	'horse': {scale: .25, offset: 0},
	'deer': {scale: 5, offset: 0},
}
NPC = [];
function addNPC(type, x, z, r, name) {
	BABYLON.SceneLoader.ImportMesh('', 'models/', type + '.babylon?' + Math.random() * 100, scene, function(meshes, particles, skeletons) {
	console.log(meshes);
		var npc = scene.getMeshByName(type);
		var s = npcData[type].scale;
		npc.scaling = new BABYLON.Vector3(s, s, s);
		npc.position = new BABYLON.Vector3(x, calcElevation(x, z) + npcData[type].offset, z);
		npc.ellipsoid = new BABYLON.Vector3(5,8,5);
		npc.ellipsoidOffset = new BABYLON.Vector3(0,8,0);
		npc.rotation.y = r;
		//npc.checkCollisions = true;
		//shadowGenerator.getShadowMap().renderList.push(meshes[0]);
		npc.type = 'npc';
		npc.species = type;
		npc.hp = 80;
		if (skeletons[0]) {
			//scene.stopAnimation(npc);
		}
		//npc.
		npc.isPickable = true;
//		for (s in meshes[1].material.subMaterials) {
//			if (meshes[1].material.subMaterials[s].name != 'Eyelashes') {
//				meshes[1].material.subMaterials[s].emissiveColor = new BABYLON.Color3(.5,.4,.3);
//			}
//		}
//		avatars['player' + id] = avatar;
		NPC.push(npc);
	});
}


foliageData = {
	tree3: {name: 'Beech Tree', type: 'tree'}
};
foliage = [];
function addFoliage(type, count, radius, name) {
	BABYLON.SceneLoader.ImportMesh('', 'models/', type + '.babylon?3', scene, function(meshes) {
		meshes[1].material.subMaterials[1].diffuseTexture.hasAlpha = true;
		for (i = 0; i < count; i++) {
			var clone = meshes[0].createInstance(name);
			clone.type = 'tree';
			var x = Math.random() * radius - radius;
			var y = Math.random() * radius - radius;
			var r = Math.random() * Math.PI * 2;
			var s = Math.random() * .4 + .8;
			clone.position.x = x;
			clone.position.z = y;
			clone.rotation.y = r;
			clone.scaling = new BABYLON.Vector3(s,s,s);
			clone.checkCollisions = true;
			// shadowGenerator.getShadowMap().renderList.push(clone);
			clone.receiveShadows = true;
			//clone.position.y = calcElevation(clone.position.x, clone.position.z) - 30;
			trees.push(clone);
			
			var leaves = meshes[1].createInstance('Beech Tree Leaves');
			// console.log(leaves);
			leaves.parent = clone;
		}
		meshes[0].dispose();
		meshes[1].dispose();
	});
}
function positionFoliage() {
}


function calcObjectDistanceFromAvatar(mesh) {
	var x = Math.abs(mesh.position.x - avatar.position.x);
	var y = Math.abs(mesh.position.y - avatar.position.y);
	var z = Math.abs(mesh.position.z - avatar.position.z);
	var xz = Math.sqrt(Math.pow(x, 2) + Math.pow(z ,2));
	var xyz = Math.sqrt(Math.pow(xz, 2) + Math.pow(y ,2));
	return xyz;
}
function calcDistance(a, b) {
	var x = Math.abs(b.x - a.x);
	var y = Math.abs(b.y - a.y);
	var z = Math.abs(b.z - a.z);
	var xz = Math.sqrt(Math.pow(x, 2) + Math.pow(z ,2));
	var xyz = Math.sqrt(Math.pow(xz, 2) + Math.pow(y ,2));
	return xyz;
}
function calcOrientation(mesh, x, z) {
	dx = (mesh.position.x - x);
	dz = (mesh.position.z - z);
	var r = Math.atan(dx / dz);
	// r += Math.PI;
	if (dz < 0) {
		r -= Math.PI;
	}
	mesh.rotation.y = r;
}
ray = new BABYLON.Ray(new BABYLON.Vector3(0, 600, 0), new BABYLON.Vector3(0, -1,0), 1000);
var ground, camera;
function calcElevation(x, z) {
	ray.origin.x = x;
	ray.origin.z = z;
	var i = ground.intersects(ray);
	if (!i || !i.pickedPoint) {
		return false;
	}
	return i.pickedPoint.y;
}
Player = {
	cast: {
		spellName: '',
		currentTime: 0,
	}
}

// colors
black = new BABYLON.Color3(0,0,0);
gray = new BABYLON.Color3(.5,.5,.5);
white = new BABYLON.Color3(1,1,1);

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = new BABYLON.Scene(engine);
//scene.gravity = new BABYLON.Vector3(0, -.2, 0);
//scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
scene.collisionsEnabled = false;
//scene.clearColor = new BABYLON.Color3(.286,.45,.67) //daylight
//scene.clearColor = new BABYLON.Color3(0,.05,.1) // night
scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
scene.fogColor = new BABYLON.Color3(.3,.35,.4); // daylight
//scene.fogColor = black; // night
scene.fogDensity = 0.001;
scene.shadowsEnabled = true;

var assetsManager = new BABYLON.AssetsManager(scene);
var tasks = [];
//assetsManager.addMeshTask('avatar', '', 'models/', 'avatar.babylon');
//assetsManager.addMeshTask('blacksmith', '', 'models/', 'blacksmith.babylon');
//assetsManager.addMeshTask('house', '', 'models/', 'house.babylon');
//assetsManager.addMeshTask('inn', '', 'models/', 'inn.babylon');
//assetsManager.addTextureTask('V5BreeTorsoM', "models/V5BreeInMouthM.jpg");
//assetsManager.addTextureTask('V5BreeTorsoM', "models/V5BreeTorsoM.jpg");
//assetsManager.addTextureTask('grass texture', "textures/Sitework.Planting.Grass.Thick.jpg");
//assetsManager.addTextureTask('grass texture2', "textures/grass2.png");
assetsManager.addImageTask("height map", "textures/map1.jpg?1");
var shadowGenerator, ground;
assetsManager.onFinish = function() {

	engine.hideLoadingUI();
	$('#region-name').show();
	setTimeout(function() {$('#region-name').fadeOut(1000)}, 2500);

	//skybox

	var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skybox.material = skyboxMaterial;
	skybox.rotation.y = Math.PI * .35;
	skybox.infiniteDistance = true;
	skybox.isPickable = false;
	skybox.applyFog = false;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox2/", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	// Sun/moon
	var sun = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-.6, -2, 1), scene);
	sun.position = new BABYLON.Vector3(20, 40, -20);
	sun.intensity = 1;
	//sun.diffuse = new BABYLON.Color3(.2,.4,.6);
	//shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);
	//shadowGenerator.getShadowMap().refreshRate = 30;
	//shadowGenerator.usePoissonSampling = true;
	scene.shadowsEnabled = false;
	//shadowGenerator.getShadowMap().renderList = scene.meshes;

	// ambient light
	var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
	light0.diffuse = new BABYLON.Color3(1, 1, 1);
	light0.specular = new BABYLON.Color3(1, 1, 1);
	light0.groundColor = new BABYLON.Color3(.5, .5, .5);
	light0.intensity = .3;

	// ground
	var groundDivs = 32;
	var tileSize = 8192;
	//var ground = BABYLON.Mesh.CreateGround("ground", tileSize, tileSize, 2, scene, true);
	ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/map1.jpg?1", tileSize, tileSize, groundDivs, -100, 600, scene, false);
	roads = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/map1.jpg?1", tileSize, tileSize, groundDivs, -100, 600, scene, false);
	//ground.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, {mass:0, restitution:0.001});
	ground.checkCollisions = true;
	// ground.isPickable = false;
	//console.log(calcElevation(0,0));

	$('body').append('<canvas id="mapcanvas" style="position: absolute; top: -1024px; right: 0; z-index: 8; "/>');
	mapdata = $('#mapcanvas')[0];
	mapdata.width = $('#mapdata')[0].width;
	mapdata.height = $('#mapdata')[0].height;
	mapdata.getContext('2d').drawImage($('#mapdata')[0], 0, 0, mapdata.width, mapdata.height);
	mapdata = $('#mapcanvas')[0].getContext('2d').getImageData(0,0,1024,1024).data;



/*	var water = BABYLON.Mesh.CreateGround("water", 8192, 8192, 1, scene, true);
	water.material = new BABYLON.StandardMaterial('water', scene);
	water.material.diffuseColor = new BABYLON.Color3(.1,.1,.1);
	water.position.y = -32;
	water.material.reflectionTexture = new BABYLON.MirrorTexture('mirror', 1024, scene, true);
	water.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, -32);
	water.material.reflectionTexture.renderList = scene.meshes;
	water.material.reflectionTexture.level = 1;
	water.material.alpha = .7;
	water.material.backFaceCulling = false;
	water.isPickable = false;*/

	avatar = null;
	cTarget = null;
	velocity = new BABYLON.Vector3(0,0,0);
	buildDummy = null;
	BABYLON.SceneLoader.ImportMesh('', 'models/', 'avatar.babylon', scene, function(meshes, particles, skeletons) {
		avatar = meshes[0];
		avatar.position = new BABYLON.Vector3(-50, 100, 0);
		avatar.ellipsoid = new BABYLON.Vector3(5,8,5);
		avatar.ellipsoidOffset = new BABYLON.Vector3(0,16,0);
		meshes[0].rotation.y = 0;
		//meshes[1].rotation.y = Math.PI;
		meshes[0].scaling = new BABYLON.Vector3(.1, .1, .1);
		meshes[0].checkCollisions = true;
		// meshes[0].material.specularColor = new BABYLON.Color3(0,0,0);
		//shadowGenerator.getShadowMap().renderList.push(meshes[1]);
		meshes[1].name = 'Player';
		meshes[1].type = 'avatar';
		meshes[1].isPickable = true;
		for (s in meshes[1].material.subMaterials) {
			if (meshes[1].material.subMaterials[s].name != 'Eyelashes') {
				meshes[1].material.subMaterials[s].emissiveColor = new BABYLON.Color3(.5,.4,.3);
			}
		}

		// scene.beginAnimation(skeletons[0], 0, 61, true, 2);
		
		cTarget = new BABYLON.Mesh.CreateBox('cTarget', 1, scene);
		cTarget.position = avatar.position;
		cTarget.position.addInPlace(new BABYLON.Vector3(0, 8, 0));
		cTarget.rotation = avatar.rotation;
		
		camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 50, cTarget, scene);
		scene.activeCamera = camera;
		camera.attachControl(canvas);
		camera.targetScreenOffset.y = -16;
		camera.ellipsoid = new BABYLON.Vector3(3, 3, 3);
		camera.checkCollisions = true;
		camera.alpha = -avatar.rotation.y + Math.PI * .5;
		camera.beta = Math.PI * .5;

		// camera2 = new BABYLON.ArcRotateCamera("Build Camera", Math.PI * .25, Math.PI * .25, 500, avatar, scene);
		// camera2.ellipsoid = new BABYLON.Vector3(3, 3, 3);
		// camera.checkCollisions = true;

		engine.runRenderLoop(renderLoop);

	});

	// grass texture
	var grass = new BABYLON.StandardMaterial("grass", scene);
	grass.diffuseTexture = new BABYLON.Texture("textures/Sitework.Planting.Grass.Thick.jpg", scene);
	grass.diffuseTexture.uScale = 320;
	grass.diffuseTexture.vScale = 320;
	grass.bumpTexture= new BABYLON.Texture('textures/grassbump.jpg', scene);
	grass.bumpTexture.uScale = 320;
	grass.bumpTexture.vScale = 320;

	//grass.bumpTexture = new BABYLON.Texture("textures/Sitework.Planting.Grass.Thick.bump.png", scene);
	//grass.bumpTexture.uScale = 80;
	//grass.bumpTexture.vScale = 80;

	grass.specularColor = new BABYLON.Color3(.4,.5,.3);
	ground.material = grass;
	ground.receiveShadows = true;
	roads.material = new BABYLON.StandardMaterial('roads', scene);
	roads.material.diffuseTexture = new BABYLON.Texture('textures/ashwood.jpg', scene);
	roads.material.diffuseTexture.uScale = 320;
	roads.material.diffuseTexture.vScale = 240;
//	roads.material.diffuseTexture.wAng = Math.PI / 4;
/*	roads.material.bumpTexture = new BABYLON.Texture('textures/roadsbump.jpg', scene);
	roads.material.bumpTexture.uScale = 160;
	roads.material.bumpTexture.vScale = 160;
	roads.material.bumpTexture.wAng = Math.PI / 4;
	roads.material.specularPower = 10;*/
	roads.material.specularColor = black; // new BABYLON.Color3(.5,.4,.3);
	roads.material.opacityTexture = new BABYLON.Texture('textures/roads.jpg', scene);
	roads.material.opacityTexture.uScale = 1;
	roads.material.opacityTexture.vScale = 1;
	roads.material.opacityTexture.uOffset = .125;
	roads.material.opacityTexture.wAng = Math.PI;
	//roads.material.zOffset = 1;
	roads.material.opacityTexture.getAlphaFromRGB = true;

	// road = BABYLON.Mesh.CreateDecal("road", ground, new BABYLON.Vector2(0,0), 0, 10, 0);


	var foliageRadius = 250;
	farGrass = [];
	closeGrass = [];
	scene.executeWhenReady(function() {
		BABYLON.SceneLoader.ImportMesh('', 'models/', 'grass.babylon?2', scene, function(meshes) {
			meshes[0].scaling = new BABYLON.Vector3(1.5,1.5,1.5);
			for (i = 0; i < Math.pow(foliageRadius, 1.6) * .01; i++) {
				var clone = meshes[0].createInstance('grass' + i);
				var x = Math.random() * (foliageRadius * 2) - foliageRadius;
				var z = Math.random() * (foliageRadius * 2) - foliageRadius;
				clone.type = 'foliage';
				clone.position.x = x;
				clone.position.z = z;
				clone.position.y = 0;
				clone.rotation.y = Math.random() * Math.PI * 2;
				clone.receiveShadows = true;
				clone.isPickable = false;
				//clone.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_Y;
				farGrass.push(clone);
			}

			meshes[0].material.diffuseTexture.wAngle = Math.PI;
			for (i = 0; i < Math.pow(foliageRadius, 1.5) * .01; i++) {
				var clone = meshes[0].createInstance('grass' + i);
				clone.type = 'foliage';
				clone.position.x = Math.random() * (foliageRadius) - foliageRadius * .5;
				clone.position.y = 0;
				clone.position.z = Math.random() * (foliageRadius) - foliageRadius * .5;
				clone.rotation.y = Math.random() * Math.PI * 2;
				clone.receiveShadows = true;
				clone.isPickable = false;
				closeGrass.push(clone);
			}
		});

		var ferns = new BABYLON.Mesh.CreatePlane("ferns", 30.0, scene);
		ferns.scaling.y = .6;
		ferns.material = new BABYLON.StandardMaterial("ferns", scene);
		ferns.material.diffuseTexture = new BABYLON.Texture("textures/ferns.png", scene);
		ferns.material.diffuseTexture.hasAlpha = true;
		ferns.material.specularColor = black;
		ferns.material.backFaceCulling = false;
		//ferns.material.diffuseTexture.vOffset = .01;
		//ferns.material.emissiveColor = new BABYLON.Color3(.5,.5,.5);
		ferns.position.y = -100;
		
		for (i = 0; i < 30; i++) {
			var clone = ferns.createInstance('ferns' + i);
			clone.type = 'foliage';
			var x = Math.random() * (foliageRadius * 2) - foliageRadius;
			var z = Math.random() * (foliageRadius * 2) - foliageRadius;
			var s = Math.random() * .8 + .4;
			clone.position.x = x;
			clone.position.y = 10;
			clone.position.z = z;
			clone.rotation.y = 0; // Math.random() * Math.PI * 2;
			clone.scaling = new BABYLON.Vector3(s,s,s);
			clone.receiveShadows = true;
			clone.isPickable = false;
			clone.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_Y;
			farGrass.push(clone);
		}

	});

	addStructure('inn', 400, -250, 0);
	addStructure('blacksmith', 400, -500, 3.1415);
	addStructure('silo', 50, 0, 0);

	trees = [];
	BABYLON.SceneLoader.ImportMesh('', 'models/', 'tree3.babylon?3', scene, function(meshes) {
		meshes[1].material.subMaterials[1].diffuseTexture.hasAlpha = true;
		for (i = 0; i < 50; i++) {
			var clone = meshes[0].createInstance('Beech Tree');
			clone.type = 'tree';
			var x = Math.random() * 2000 - 3000;
			var y = Math.random() * 2000 - 3000;
			var r = Math.random() * Math.PI * 2;
			var s = Math.random() * .4 + .8;
			clone.position.x = x;
			clone.position.z = y;
			clone.rotation.y = r;
			clone.scaling = new BABYLON.Vector3(s,s,s);
			clone.checkCollisions = true;
			// shadowGenerator.getShadowMap().renderList.push(clone);
			clone.receiveShadows = true;
			//clone.position.y = calcElevation(clone.position.x, clone.position.z) - 30;
			trees.push(clone);
			
			var leaves = meshes[1].createInstance('Beech Tree Leaves');
			leaves.parent = clone;
		}
		meshes[0].isVisible = false;
	});
	BABYLON.SceneLoader.ImportMesh('', 'models/', 'bush1.babylon?5', scene, function(meshes) {
		meshes[0].material.diffuseTexture.hasAlpha = true;
		for (i = 0; i < 80; i++) {
			var clone = meshes[0].createInstance('Bush');
			clone.type = 'bush';
			clone.position.x = Math.random() * 2000 - 3000;
			clone.position.y = 0;
			clone.position.z = Math.random() * 2000 - 3000;
			clone.rotation.y = Math.random() * Math.PI * 2;
			var scale = Math.random() * 1.4 + .3;
			clone.scaling = new BABYLON.Vector3(scale, scale, scale);
			//clone.receiveShadows = true;
			// clone.position.y = calcElevation(clone.position.x, clone.position.z) + 30;
			trees.push(clone);
		}
		meshes[0].isVisible = false;
	});

	runecircle = null;
	BABYLON.SceneLoader.ImportMesh('SelectMarker', 'models/', 'selectmarker.babylon?1', scene, function(meshes) {
		runecircle = meshes[0];
		runecircle.scaling = new BABYLON.Vector3(3,3,3);
		runecircle.visibility = 0;
	});


/*	BABYLON.SceneLoader.ImportMesh('', 'models/', 'battlement-s2.babylon?1', scene, function(meshes) {
//		meshes[0].position.z = 1500;
		for (i = 0; i < 4; i++) {
			var clone = meshes[0].createInstance('Battlement' + i);
			clone.type = 'battlement';
			clone.position.x = i * 124.5;
			clone.position.y = 10;
			clone.position.z = 300;
			clone.scaling = new BABYLON.Vector3(.265,.256,.256);
			clone.checkCollisions = true;
			//shadowGenerator.getShadowMap().renderList.push(clone);
			clone.receiveShadows = true;

			var clone = meshes[0].createInstance('Battlement' + i);
			clone.type = 'battlement';
			clone.position.x = i * 124.5 + 41.5;
			clone.position.y = 10;
			clone.position.z = 300;
			clone.scaling = new BABYLON.Vector3(.265,.256,.256);
			clone.checkCollisions = true;
			//shadowGenerator.getShadowMap().renderList.push(clone);
			clone.receiveShadows = true;

			var clone = meshes[1].createInstance('Battlement' + i);
			clone.type = 'battlement';
			clone.position.x = i * 124.5 + 83;
			clone.position.y = 10;
			clone.position.z = 300;
			clone.scaling = new BABYLON.Vector3(.265,.256,.256);
			clone.checkCollisions = true;
			//shadowGenerator.getShadowMap().renderList.push(clone);
			clone.receiveShadows = true;
		}
		meshes[0].position.y = -1000;
		meshes[1].position.y = -1000;
	});*/


	addNPC('deer', -350, 0, 0, 'Deer');
	addNPC('horse', 290, -270, Math.PI, 'Horse');

	frameNumber = 0;
	delta = 0;
	// BABYLON.SceneOptimizer.OptimizeAsync(scene);
	function renderLoop() {
		frameNumber++;
		delta = engine.getDeltaTime() / 20;
		if (frameNumber == 1000) {
			frameNumber = 0;
		}
		// check which meshes get shadowed
/*		if (frameNumber % 10 == 0 && shadowGenerator) {
			shadowGenerator.getShadowMap().renderList = [];
			for (m in scene.meshes) {
				if (calcDistance(avatar.position, scene.meshes[m].position) < 500 && scene.meshes[m].type != 'foliage') {
				//console.log(scene.meshes[m].name);
					shadowGenerator.getShadowMap().renderList.push(scene.meshes[m]);
				}
			}
		}*/
		
		// animate fire
		for (var f in fires) {
			fires[f].intensity = Math.random() * .5 + 2;
		}
		
		// move NPC
		if (scene.getMeshByName('deer') && scene.getMeshByName('deer').target) {
			var deer = scene.getMeshByName('deer');
			calcOrientation(deer, deer.target.x, deer.target.z);
			var x = Math.sin(deer.rotation.y) * -.1 * delta;
			var z = Math.cos(deer.rotation.y) * -.1 * delta;
			deer.moveWithCollisions(new BABYLON.Vector3(x, -1, z));
			if (calcDistance(deer.position, deer.target) < 2) {
				deer.target = false;
				scene.stopAnimation(deer.skeleton);
			}
		}
		
		// player cast spell
		if (Player.cast.spellName != '') {
			$('#castbar').show();
			Player.cast.currentTime += engine.getDeltaTime();
			var percent = Player.cast.currentTime / Player.cast.castTime * 100;
			$('#castbar b').width(percent + '%');
			$('#castbar i').html(Player.cast.spellName + '<br>' + Math.round((Player.cast.castTime - Player.cast.currentTime) / 100) / 10);
			if (percent >= 100) {
				Player.cast.spellName = '';
				// $('#castbar b').width(0);
				$('#wood').text(parseInt($('#wood').text()) + 10);
				$('#castbar').fadeOut(200);
			}
		}

		// move foliage
		if (avatar.position && camera.alpha) {
			foliageCenter = new BABYLON.Vector2(camera.position.x - Math.cos(camera.alpha) * (foliageRadius), camera.position.z - Math.sin(camera.alpha) * (foliageRadius));
			if (farGrass && frameNumber % 7 == 0) {
				for (i in farGrass) {
					var changed = false;
					if (farGrass[i].position.z > foliageCenter.y + foliageRadius) {
						changed = true;
						farGrass[i].position.z -= foliageRadius * 2;
					} else if (farGrass[i].position.z < foliageCenter.y - foliageRadius) {
						changed = true;
						farGrass[i].position.z += foliageRadius * 2;
					}
					if (farGrass[i].position.x > foliageCenter.x + foliageRadius) {
						changed = true;
						farGrass[i].position.x -= foliageRadius * 2;
					} else if (farGrass[i].position.x < foliageCenter.x - foliageRadius) {
						changed = true;
						farGrass[i].position.x += foliageRadius * 2;
					}
					if (changed) {
						if (getZone(farGrass[i].position.x, farGrass[i].position.z)) {
							farGrass[i].isVisible = false;
						} else {
							farGrass[i].isVisible = true;
							farGrass[i].position.y = calcElevation(farGrass[i].position.x, farGrass[i].position.z) + (farGrass[i].name.substr(0,5) == 'ferns' ? 10 : 4.5);
						}
					}
				}
			}
			
			foliageCenter = new BABYLON.Vector2(camera.position.x - Math.cos(camera.alpha) * (foliageRadius * .6), camera.position.z - Math.sin(camera.alpha) * (foliageRadius * .6));
			if (closeGrass && frameNumber % 6 == 0) {
				for (i in closeGrass) {
					var changed = false;
					if (closeGrass[i].position.z > foliageCenter.y + foliageRadius * .5) {
						changed = true;
						closeGrass[i].position.z -= foliageRadius;
					} else if (closeGrass[i].position.z < foliageCenter.y - foliageRadius * .5) {
						changed = true;
						closeGrass[i].position.z += foliageRadius;
					}
					if (closeGrass[i].position.x > foliageCenter.x + foliageRadius * .5) {
						changed = true;
						closeGrass[i].position.x -= foliageRadius;
					} else if (closeGrass[i].position.x < foliageCenter.x - foliageRadius * .5) {
						changed = true;
						closeGrass[i].position.x += foliageRadius;
					}
					if (changed) {
						if (getZone(closeGrass[i].position.x, closeGrass[i].position.z)) {
							closeGrass[i].isVisible = false;
						} else {
							closeGrass[i].isVisible = true;
							closeGrass[i].position.y = calcElevation(closeGrass[i].position.x, closeGrass[i].position.z) + 4.5;
						}
					}
				}

			}
		
			foliageCenter = new BABYLON.Vector2(camera.position.x - Math.cos(camera.alpha) * foliageRadius * 4, camera.position.z - Math.sin(camera.alpha) * foliageRadius * 4);
			if (trees && frameNumber % 19 == 0) {
				for (i in trees) {
					var changed = false;
					if (trees[i].position.z > foliageCenter.y + foliageRadius * 4) {
						changed = true;
						trees[i].position.z -= foliageRadius * 8;
					} else if (trees[i].position.z < foliageCenter.y - foliageRadius * 4) {
						changed = true;
						trees[i].position.z += foliageRadius * 8;
					}
					if (trees[i].position.x > foliageCenter.x + foliageRadius * 4) {
						changed = true;
						trees[i].position.x -= foliageRadius * 8;
					} else if (trees[i].position.x < foliageCenter.x - foliageRadius * 4) {
						changed = true;
						trees[i].position.x += foliageRadius * 8;
					}
					if (changed) {
						if (getZone(trees[i].position.x, trees[i].position.z)) {
							trees[i].isVisible = false;
							trees[i].position.y = 3000;
						} else {
							trees[i].isVisible = true;
							trees[i].position.y = calcElevation(trees[i].position.x, trees[i].position.z) + (trees[i].type == 'tree' ? 0 : 10);
						}
					}
				}
			}
			
		}
				
		
		if (selected) {
			$('#tooltip').html(selected.name + ' ' + Math.round(calcDistance(avatar.position, selected.position)) / 10 + 'm');
		}
		// move player if keypress
		if (cDelta[0] != 0) {
			var x = Math.sin(avatar.rotation.y) * -cDelta[0] * delta;
			var z = Math.cos(avatar.rotation.y) * -cDelta[0] * delta;
			//avatar.position.x += x * delta;
			//avatar.position.z += z * delta;
			var g = avatar.position.y < -46 ? 0 : -2; // flaot in water
			velocity = new BABYLON.Vector3(x * delta, g,z * delta);
		} else {
			velocity = new BABYLON.Vector3(0,-2,0);
		}
		if (cDelta[1] != 0) {
			avatar.rotation.y += cDelta[1] * delta;
		}
		
		// move avatar
		if (avatar) {
			avatar.moveWithCollisions(velocity);
			if (avatar.target) {
				calcOrientation(avatar, avatar.target.x, avatar.target.z);
			}
			if (avatar.target && calcDistance(avatar.position, avatar.target) < 20) {
				avatar.target = false;
				cDelta[0] = 0;
			}
		}
				
		// move camera
		if (cDelta[0] != 0 || cDelta[1] != 0) {
			var f = -avatar.rotation.y + Math.PI * .5;
			if (f > camera.alpha) {
				camera.alpha += Math.abs(f - camera.alpha) * .1 * delta;
				//camera2.alpha += Math.abs(f - camera.alpha) * .1 * delta;
			} else if (f < camera.alpha) {
				camera.alpha -= Math.abs(camera.alpha - f) * .1 * delta;
				//camera2.alpha -= Math.abs(camera.alpha - f) * .1 * delta;
			}
		}

		// rotate runecircle
		if (runecircle) {
			runecircle.rotation.y += .01 * delta;
		}
		//runewave.rotation.y += .01;
		scene.render();
	}
	
	// Resize
	window.addEventListener("resize", function () {
		engine.resize();
	});

	// select
	selected = null;
	canvas.addEventListener("click", function (e) {
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);
		
		// click
		if (pickResult.pickedMesh) {
			var mesh = pickResult.pickedMesh;
			if (mesh.name == 'ground' && building) { // build structure
				addStructure('lamppost', buildDummy.position.x, buildDummy.position.z, 0);
				buildDummy.dispose();
				saveStructure(buildDummy.position.x, buildDummy.position.z, buildDummy.rotation.y, 'lamppost');
				buildMode(); // exit buildmode
			} else if (mesh.name == 'ground') {
				runecircle.visibility = 0;
				$('#target-uf').hide();
				return;
			}
			selected = mesh;

			if (mesh.type == 'avatar' || mesh.type == 'npc') {
				runecircle.material.subMaterials[1].alpha = 1;
				var gold = new BABYLON.Color3(1,.9,.5)
				runecircle.material.subMaterials[0].emissiveColor = gold;
				runecircle.material.subMaterials[1].emissiveColor = gold;
				runecircle.material.subMaterials[0].diffuseColor = gold;
				runecircle.material.subMaterials[1].diffuseColor = gold;
				if (mesh.type == 'avatar') {
				runecircle.scaling = new BABYLON.Vector3(.4,.4,.4);
					runecircle.position = mesh.parent.position;
				} else {
					runecircle.scaling = new BABYLON.Vector3(.6,.6,.6);
					runecircle.position = mesh.position;
				}
				runecircle.visibility = 1;
				$('#target-uf').show().find('h3').text(mesh.name);
				
			} else {
				runecircle.visibility = 0;
				$('#target-uf').hide();
			}

			$('#tooltip').html(mesh.name + '<br>' + mesh.type + '<br>' + (mesh.type == 'tree' ? 'Wood: 100' : ''));
		} else {
			selected = null;
			$('#tooltip').text('');
			$('#target-uf').hide();
			runecircle.visibility = 0;
		}
	});

	canvas.addEventListener("contextmenu", function (e) {
		e.preventDefault();
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);
		if (pickResult.pickedMesh) {
			var mesh = pickResult.pickedMesh;
			selected = mesh;

			if (mesh.name == 'ground') {
				calcOrientation(avatar, pickResult.pickedPoint.x, pickResult.pickedPoint.z);
				ray.origin.x = pickResult.pickedPoint.x;
				ray.origin.z = pickResult.pickedPoint.x;
				avatar.target = new BABYLON.Vector3(pickResult.pickedPoint.x, scene.getMeshByName('ground').intersects(ray).pickedPoint.y, pickResult.pickedPoint.z);
				cDelta[0] = .5;
			} else if (mesh.type == 'tree' && calcObjectDistanceFromAvatar(mesh) < 50) {
				Player.cast.spellName = 'Gather Wood';
				Player.cast.castTime = 1500;
				Player.cast.currentTime = 0;
			}
		} else {
			selected = null;
			$('#tooltip').text('');
			runecircle.visibility = 0;
		}
		return false;
	});


	cDelta = [0,0];
	window.addEventListener('keydown', function onKeyDown(event) {
		switch (event.keyCode) {
			case 32:

				var a = new BABYLON.Animation("a", "position.y", 20, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

				// Animation keys
				var keys = [];
				keys.push({ frame: 0, value: camera.position.y });
				keys.push({ frame: 10, value: camera.position.y + 8 });
				a.setKeys(keys);

				var easingFunction = new BABYLON.SineEase();
				easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
				a.setEasingFunction(easingFunction);

				camera.animations.push(a);

				scene.beginAnimation(camera, 0, 10, false);
			break;
			case 65:
				avatar.target = false;
				cDelta[1] = -.08;
			break;
			case 68:
				avatar.target = false;
				cDelta[1] = .08;
			break;
			case 83:
				avatar.target = false;
				cDelta[0] = -.2;
			break;
			case 87:
				avatar.target = false;
				cDelta[0] = .5;
			break;
			case 67:
				$('#character-sheet').show();
			break;
		}
	}, false);
	window.addEventListener('keyup', function onKeyDown(event) {
		switch (event.keyCode) {
			case 65:
			case 68:
				cDelta[1] = 0;
			break;
			case 83:
			case 87:
				cDelta[0] = 0;
			break;
		}
	}, false);

	window.addEventListener("pointermove", function() {
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);
		if (pickResult.pickedMesh) {
			var mesh = pickResult.pickedMesh;
			if (building && mesh.name == 'ground') {
				var x = pickResult.pickedPoint.x;
				var z = pickResult.pickedPoint.z;
				buildDummy.position.x = x;
				buildDummy.position.z = z;
				buildDummy.position.y = calcElevation(x, z);
				for (m in scene.meshes) {
					if (scene.meshes[m].type && scene.meshes[m].type == 'battlement') {
						var x2 = scene.meshes[m].position.x;
						var z2 = scene.meshes[m].position.z;
						if (x2 > x - 80 && x2 < x + 80 && z2 > z - 80 && z2 < z + 80) {
							buildDummy.position.x = x2 - 80;
							buildDummy.position.z = scene.meshes[m].position.z;
						}
					}
				}
			} else if (!building && mesh.name != 'ground') {
				var tooltip = '<h2>' + mesh.name + '</h2>';
				if (mesh.type == 'tree') {
					tooltip += '<dl><dt>Wood</dt><dd>1000</dd></dl>';
					tooltip += '<p>Right-click to gather. </p>';
				}
				$('#tooltip').html(tooltip);
				return;
			}
		}
		$('#tooltip').text('');
	}, false);
	
};
assetsManager.load();

$('#buildmode-button').click(function() {
	buildMode();
});
function buildMode() {
	if (building) {
		building = false;
		//scene.activeCamera = scene.cameras[0];
		//scene.cameras[0].attachControl(canvas);
		scene.cameras[0].radius = 50;
		scene.cameras[0].beta = Math.PI * .5;
		scene.fogEnabled = true;
		for (t in trees) {
			trees[t].isVisible = true;
		}
		return;
	}
	building = true;
	//scene.activeCamera = scene.cameras[1];
	//scene.cameras[1].attachControl(canvas);
	scene.fogEnabled = false;
	scene.cameras[0].radius = 250;
	scene.cameras[0].beta = Math.PI * .25;
	for (t in trees) {
		trees[t].isVisible = false;
	}
	BABYLON.SceneLoader.ImportMesh('', 'models/', 'lamppost.babylon', scene, function(meshes) {
		buildDummy = meshes[0];
		buildDummy.isPickable = false;
		buildDummy.checkCollisions = false;
		buildDummy.scaling = new BABYLON.Vector3(.512,.512,.512);
		buildDummy.visibility = .4;
		buildDummy.position.x = 0;
		buildDummy.position.y = -1000;
		buildDummy.position.z = 0;
	});
	return;
}

function siloInterface() {
}