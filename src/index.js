//Dependencies Webpack  and threeJS, npm install webpack webpack-cli, npm install threeJS
// npm run-script build to compile, work on this file.
// dont change package.json


//Llamada de la librerias
const THREE = require('three');
// CommonJS:
const dat = require('dat.gui');
const Stats = require('stats.js');

//controles orbitales
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//Model loaders
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
//Basis Texture loader
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';

import CameraControls from 'camera-controls';


// CameraControls.install( { THREE: THREE } );
const canvas = document.getElementById('canvas');
const clock = new THREE.Clock();
 // Optional: Pre-fetch Draco WASM/JS module.
// dracoLoader.preload();
//Scene and render
var renderer, scene, bgScene, camera, cameraControls;
var bgMesh;

var controls;
var mixer, mixer2;
//Lights
var spotLight, light, hemisLight;
var spotLightHelper;

//Interface
var gui;
var obj;
var stats;

//movement speed variable
let speedMovement = 300;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;




function init() 
{
	
	//DAT GUI
	gui = new dat.gui.GUI();
	obj = {
		explode: function () {
		alert('Bang!');
		},
	
		//spotlight
		posX: -25, 
		posY: 8, 
		posZ: 7,
		colorL: "#ffffff", // RGB array
		penunmbra: 0.2,
		helpSpot:true,
		intSpot:1,
		
		intAmbien:1,
		color0: "#443333", 
		intHemis:1,
		colorg: "#111122", 
	};
	
	renderer = new THREE.WebGLRenderer({ canvas });
	scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0x443333, 1, 4 );

	const fov = 35;
	const aspect =  window.innerWidth/ window.innerHeight;  // the canvas default
	const near = 0.1;
	const far = 500;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	
	//Lights
	// spotLight = new THREE.SpotLight( 0xffff00 );
	light = new THREE.AmbientLight( obj.color0 ); // soft white light
	hemisLight = new THREE.HemisphereLight( obj.color0, obj.colorg, 1 );
	

	stats = new Stats();
}

function addLights() 
{
	
	//Hemisphere light
	scene.add( hemisLight );
	spotLight = new THREE.SpotLight();
    spotLight.angle = Math.PI / 16;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.position.set( obj.posX, obj.posY, obj.posZ );
	scene.add( spotLight );
	spotLightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( spotLightHelper );
	
}

function addGUI() 
{
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );

	var guiSL = gui.addFolder('SpotLight');
	guiSL.add(obj, 'helpSpot').onChange(function (val) {
		spotLightHelper.visible = val;
	});
	guiSL.add(obj, 'posX').onChange(function (val) {
		spotLight.position.x = val;
		spotLightHelper.update();
	});
	guiSL.add(obj, 'posY').onChange(function (val) {
		spotLight.position.y = val;
		spotLightHelper.update();

	});
	guiSL.add(obj, 'posZ').onChange(function (val) {
		spotLight.position.z = val;
		spotLightHelper.update();

	});
	//Ambient Light
	var guiAL = gui.addFolder('AmbientLight');
	guiAL.addColor(obj, 'color0').onChange(function (val) {
		light.color.set(val);
		hemisLight.color.set(val);
	});
	guiAL.add(obj, 'intAmbien').min(0).max(1).step(0.1).onChange(function (val) {
		light.intensity = val;
	}).name('Intensity');

	//Hemisphere Light
	var guiHL = gui.addFolder('HemisphereLight');
	guiHL.addColor(obj, 'colorg').onChange(function (val) {
		hemisLight.groundColor.set(val);
	});
	guiHL.add(obj, 'intHemis').min(0).max(1).step(0.1).onChange(function (val) {
		hemisLight.intensity = val;
	}).name('Intensity');
	
}

//Move the camera according to a direction, and speed received as parameter event received
//the delta factor will divide the movement speed by 100 but will make it feel smoother to the controler
function movement(direction, speed){
	let delta = clock.getDelta()
	let moveZ = Number(moveForward) -Number(moveBackward);
	let moveX = Number(moveRight) - Number(moveLeft);

	if (moveForward || moveBackward) {
		cameraControls.forward(speed*delta*moveZ,true);
	}
	if (moveLeft || moveRight) {
		cameraControls.truck(speed*delta*moveX,0,true);
	}

}
function main() {

	
	//Renderer
	renderer.setClearColor(0x222222);
	renderer.autoClearColor = false;
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
	//Camera
	camera.position.x = 14;
	camera.position.y = 2;
	camera.position.z = 6;
	camera.lookAt( 0, 0.1, 0 );
    controls = new OrbitControls( camera, renderer.domElement );

	// cameraControls = new CameraControls( camera, renderer.domElement );
	// cameraControls.setLookAt( 40, 40, 40, 0.0001, 2, 0, false );
	// cameraControls.maxDistance = 0.0001;
	// cameraControls.minDistance = 0;
	// cameraControls.mouseButtons.wheel =CameraControls.ACTION.NONE;
	// cameraControls.truckSpeed = 2.0;

	addLights();
	loadDraco('model/draco/alocasia_s.drc');
	loadGLTF('model/gltf/Duck.gltf', [1, -0.05, 0], [0.5, 0.5, 0.5]);
	loadGLTF('model/glb/Flamingo.glb', [-2, 2, 1], [0.01, 0.01, 0.01]);
	loadFBX('model/fbx/avatar1.fbx', [2, 0, -1], [0.01, 0.01, 0.01]).then(function(obj1){
		console.log('termine!');
		mixer = new THREE.AnimationMixer( obj1 );
		var action = mixer.clipAction( obj1.animations[ 0 ] );
		action.play();
		
	})
	loadFBX('model/fbx/avatar2.fbx', [4, 0, -1], [0.01, 0.01, 0.01]).then(function(obj1){
		console.log('termine!');
		mixer2 = new THREE.AnimationMixer( obj1 );
		var action = mixer2.clipAction( obj1.animations[ 0 ] );
		action.play();
		
	})
	
    var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 80, 80 ),
		new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
		);
    plane.rotation.x = - Math.PI / 2;
    // plane.position.y = 0.03;
    plane.receiveShadow = true;
	scene.add( plane );
	

	var loader = new BasisTextureLoader();
	var material1 = new THREE.MeshBasicMaterial();
	loader.setTranscoderPath( 'js/libs/basis/' );
	loader.detectSupport( renderer );
	loader.load( 'assets/PavingStones.basis', function ( texture ) {

		texture.encoding = THREE.sRGBEncoding;
		material1.map = texture;
		material1.needsUpdate = true;
		// return material;

	}, undefined, function ( error ) {
		console.error( error );
		// return new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } );
	} );
	
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry( 0.5,0.5,0.5 ),
		material1);
    cube.position.set(-3,2,1);
    // cube.position.y = 0.03;
    cube.receiveShadow = true;
    scene.add( cube );

	

	addGUI();
	// controls.target.copy( plane.position );
	// controls.update();
	
}

function loadFBX(path,pos,scale) {
	const promise = new Promise(function (resolve, reject) {
		var loader = new FBXLoader();
		loader.load( path, function ( object ) {
	
			// mixer = new THREE.AnimationMixer( object );
			console.log(object);
			object.scale.set(scale[0], scale[1], scale[2]);
			object.position.set(pos[0], pos[1], pos[2]);
			// var action = mixer.clipAction( object.animations[ 0 ] );
			// action.play();
				
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			} );
			scene.add( object );
			console.log(object);
			if (object == null) {
				reject();
			}else{
				resolve(object);
			}
	
		} );
		
	})
	return promise;
}

function loadGLTF(path, pos,scale) {
	// Instantiate a loader
	var loader = new GLTFLoader();

	// Optional: Provide a DRACOLoader instance to decode compressed mesh data
	var dracoLoader = new DRACOLoader();
	// dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
	dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
	loader.setDRACOLoader( dracoLoader );

	// Load a glTF resource
	loader.load(
		// resource URL
		path,
		// called when the resource is loaded
		function ( gltf ) {
			//Transformations
			gltf.scene.scale.set(scale[0], scale[1], scale[2]);
			gltf.scene.position.set(pos[0], pos[1], pos[2]);
			gltf.scene.castShadow = true;
			gltf.scene.receiveShadow = true;

			scene.add( gltf.scene );
			console.log(gltf);
			
			gltf.animations; // Array<THREE.AnimationClip>
			gltf.scene; // THREE.Group
			gltf.scenes; // Array<THREE.Group>
			gltf.cameras; // Array<THREE.Camera>
			gltf.asset; // Object

		},
		// called while loading is progressing
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		});	
}

function loadDraco(path) {
	var dracoLoader = new DRACOLoader();
	// It is recommended to always pull your Draco JavaScript and WASM decoders
	// from this URL. Users will benefit from having the Draco decoder in cache
	// as more sites start using the static URL.
	dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
	
	dracoLoader.setDecoderConfig( { type: 'js' } );

	dracoLoader.load( path, function ( geometry ) {

		geometry.computeVertexNormals();

		var material = new THREE.MeshStandardMaterial( { color: 0x606060 } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		// mesh.position.y = 0.3;
		scene.add( mesh );

		// Release decoder resources.
		dracoLoader.dispose();

	} );
}

function loadBasisTexture(path){
	var loader = new BasisTextureLoader();
	loader.setTranscoderPath( 'js/libs/basis/' );
	loader.detectSupport( renderer );
	loader.load( path, function ( texture ) {
		var material = new THREE.MeshBasicMaterial();

		texture.encoding = THREE.sRGBEncoding;
		material.map = texture;
		material.needsUpdate = true;
		return material;

	}, undefined, function ( error ) {
		console.error( error );
		return new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } );
	} );

}

//Event function when a key is pressed
let onKeyDown = function ( event ) {
	switch ( event.keyCode ) {
		case 38: // up
		case 87: // w
			moveForward = true;
			movement(moveForward, speedMovement);
			break;
		case 37: // left
		case 65: // a
			moveLeft = true;
			movement(moveLeft, speedMovement);
			break;
		case 40: // down
		case 83: // s
			moveBackward = true;
			movement(moveBackward, speedMovement);
			break;
		case 39: // right
		case 68: // d
			moveRight = true;
			movement(moveRight, speedMovement);
			break;
		
		}

};
//event function that works when a key is released
let onKeyUp = function ( event ) {
	switch ( event.keyCode ) {
		case 38: // up
		case 87: // w
			moveForward = false;
			break;
		case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			moveRight = false;
			break;
		}
};


function displayWindowSize(){
	// Get width and height of the window excluding scrollbars
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	
	// Display result inside a div element
	// console.log("Width: " + w + ", " + "Height: " + h);
	renderer.setSize(w, h);
	// camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * THREE.Math.RAD2DEG;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}

// Attaching the event listener function to window's resize event
window.addEventListener("resize", displayWindowSize);
// document.addEventListener( 'keydown', onKeyDown, false );
// document.addEventListener( 'keyup', onKeyUp, false );

function animate() 
{
	// const hasControlsUpdated = cameraControls.update( delta );
	requestAnimationFrame(animate);
	render();
	// controls.update();
	stats.update();	
	controls.update();
	renderer.render(scene, camera);
}


function render() 
{
	const delta = clock.getDelta();
	//Para la animacion
	if ( mixer ) mixer.update( delta );
	if ( mixer2 ) mixer2.update( delta );
	
	
}

init();
main();
animate();