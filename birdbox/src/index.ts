import {BufferGeometry, BufferAttribute} from 'three';
import {Color, Scene, PerspectiveCamera, Fog} from 'three';
import {WebGLRenderer, Vector3, RepeatWrapping} from 'three';
import {ShaderMaterial, Mesh, DoubleSide, Texture} from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

/* TEXTURE WIDTH FOR SIMULATION */
var WIDTH = 32;

var BIRDS = WIDTH * WIDTH;

// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
class BirdGeometry extends BufferGeometry {
	constructor(){
		super();
		var triangles = BIRDS * 3;
		var points = triangles * 3;
		var vert_arr = new Float32Array( points * 3 );
		var birdColors_arr = new Float32Array( points * 3 );
		var ref_arr = new Float32Array( points * 2 );
		var birdVert_arr = new Float32Array( points );
		
		
		// this.setAttribute( 'normal', new Float32Array( points * 3 ), 3 );


	var v = 0;

	function verts_push(nine_numbers:number[]) {

		for ( var i = 0; i < nine_numbers.length; i ++ ) {

			vert_arr[ v++ ] = nine_numbers[ i ];

		}

	}

	var wingsSpan = 20;

	for ( var f = 0; f < BIRDS; f ++ ) {

		// Body
		verts_push([
			0, - 0, - 20,
			0, 4, - 20,
			0, 0, 30
		]);

		// Left Wing
		verts_push([
			0, 0, - 15,
			- wingsSpan, 0, 0,
			0, 0, 15
		]);

		// Right Wing
		verts_push([
			0, 0, 15,
			wingsSpan, 0, 0,
			0, 0, - 15
		]);

	}

	for ( var v = 0; v < triangles * 3; v ++ ) {

		var i = ~ ~ ( v / 3 );
		var x = ( i % WIDTH ) / WIDTH;
		var y = ~ ~ ( i / WIDTH ) / WIDTH;

		var c = new Color(
			0x444444 +
			~ ~ ( v / 9 ) / BIRDS * 0x666666
		);

		birdColors_arr[ v * 3 + 0 ] = c.r;
		birdColors_arr[ v * 3 + 1 ] = c.g;
		birdColors_arr[ v * 3 + 2 ] = c.b;

		ref_arr[ v * 2 ] = x;
		ref_arr[ v * 2 + 1 ] = y;

		birdVert_arr[ v ] = v % 9;

	}

	this.scale( 0.2, 0.2, 0.2 );
	var vertices = new BufferAttribute( vert_arr, 3 );
	var birdColors = new BufferAttribute(birdColors_arr , 3 );
	var references = new BufferAttribute( ref_arr, 2 );
	var birdVertex = new BufferAttribute(birdVert_arr , 1 );
	this.setAttribute( 'position', vertices );
	this.setAttribute( 'birdColor', birdColors );
	this.setAttribute( 'reference', references );
	this.setAttribute( 'birdVertex', birdVertex );
	}
	

};

var container;
var camera:PerspectiveCamera, scene:Scene;
var renderer: WebGLRenderer;
var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;

var last = performance.now();

var gpuCompute:GPUComputationRenderer;
var velocityVariable:any;
var positionVariable:any;
var positionUniforms:any;
var velocityUniforms:any;
var birdUniforms:any;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 350;

	scene = new Scene();
	scene.background = new Color( 0xffffff );
	scene.fog = new Fog( 0xffffff, 100, 1000 );

	renderer = new WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	initComputeRenderer();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );


	var effectController = {
		separation: 20.0,
		alignment: 20.0,
		cohesion: 20.0,
		freedom: 0.75
	};

	var valuesChanger = function () {

		velocityUniforms[ "separationDistance" ].value = effectController.separation;
		velocityUniforms[ "alignmentDistance" ].value = effectController.alignment;
		velocityUniforms[ "cohesionDistance" ].value = effectController.cohesion;
		velocityUniforms[ "freedomFactor" ].value = effectController.freedom;

	};

	valuesChanger();

	initBirds();

}

function initComputeRenderer() {

	gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

	var dtPosition = gpuCompute.createTexture();
	var dtVelocity = gpuCompute.createTexture();
	fillPositionTexture( dtPosition );
	fillVelocityTexture( dtVelocity );

	var fragShaderV = document.getElementById( 'fragmentShaderVelocity' );
	if(!fragShaderV){
		console.log("Could not find fragment shader Velocity in the document");
		return;
	}
	velocityVariable = gpuCompute.addVariable( "textureVelocity", <string>fragShaderV.textContent, dtVelocity );


	var fragShaderP = document.getElementById( 'fragmentShaderPosition' );
	if(!fragShaderP){
		console.log("Could not find fragment shader Position in the document");
		return;
	}
	positionVariable = gpuCompute.addVariable( "texturePosition", <string>fragShaderP.textContent, dtPosition );
	

	gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
	gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

	positionUniforms = positionVariable.material.uniforms;
	velocityUniforms = velocityVariable.material.uniforms;

	positionUniforms[ "time" ] = { value: 0.0 };
	positionUniforms[ "delta" ] = { value: 0.0 };
	velocityUniforms[ "time" ] = { value: 1.0 };
	velocityUniforms[ "delta" ] = { value: 0.0 };
	velocityUniforms[ "testing" ] = { value: 1.0 };
	velocityUniforms[ "separationDistance" ] = { value: 1.0 };
	velocityUniforms[ "alignmentDistance" ] = { value: 1.0 };
	velocityUniforms[ "cohesionDistance" ] = { value: 1.0 };
	velocityUniforms[ "freedomFactor" ] = { value: 1.0 };
	velocityUniforms[ "predator" ] = { value: new Vector3() };
	velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

	velocityVariable.wrapS = RepeatWrapping;
	velocityVariable.wrapT = RepeatWrapping;
	positionVariable.wrapS = RepeatWrapping;
	positionVariable.wrapT = RepeatWrapping;

	var error = gpuCompute.init();
	if ( error !== null ) {

	    console.error( error );

	}

}

function initBirds() {

	var geometry = new BirdGeometry();

	// For Vertex and Fragment
	birdUniforms = {
		"color": { value: new Color( 0xff2200 ) },
		"texturePosition": { value: null },
		"textureVelocity": { value: null },
		"time": { value: 1.0 },
		"delta": { value: 0.0 }
	};
	var birdVS = document.getElementById( 'birdVS' );
	if(!birdVS){
		console.log("Could not find birdVS element")
		return;
	}
	var birdFS = document.getElementById( 'birdFS' );
	if(!birdFS){
		console.log("Could not find birdFS element")
		return;
	}

	// ShaderMaterial
	var material = new ShaderMaterial( {
		uniforms: birdUniforms,
		vertexShader: <string>birdVS.textContent,
		fragmentShader: <string>birdFS.textContent,
		side: DoubleSide

	} );

	var birdMesh = new Mesh( geometry, material );
	birdMesh.rotation.y = Math.PI / 2;
	birdMesh.matrixAutoUpdate = false;
	birdMesh.updateMatrix();

	scene.add( birdMesh );

}

function fillPositionTexture( texture:Texture) {

	var theArray = texture.image.data;

	for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

		var x = Math.random() * BOUNDS - BOUNDS_HALF;
		var y = Math.random() * BOUNDS - BOUNDS_HALF;
		var z = Math.random() * BOUNDS - BOUNDS_HALF;

		theArray[ k + 0 ] = x;
		theArray[ k + 1 ] = y;
		theArray[ k + 2 ] = z;
		theArray[ k + 3 ] = 1;

	}

}

function fillVelocityTexture( texture:Texture ) {

	var theArray = texture.image.data;

	for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

		var x = Math.random() - 0.5;
		var y = Math.random() - 0.5;
		var z = Math.random() - 0.5;

		theArray[ k + 0 ] = x * 10;
		theArray[ k + 1 ] = y * 10;
		theArray[ k + 2 ] = z * 10;
		theArray[ k + 3 ] = 1;

	}

}


function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event:MouseEvent ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event:TouchEvent) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}

function onDocumentTouchMove( event:TouchEvent ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	var now = performance.now();
	var delta = ( now - last ) / 1000;

	if ( delta > 1 ) delta = 1; // safety cap on large deltas
	last = now;

	positionUniforms[ "time" ].value = now;
	positionUniforms[ "delta" ].value = delta;
	velocityUniforms[ "time" ].value = now;
	velocityUniforms[ "delta" ].value = delta;
	birdUniforms[ "time" ].value = now;
	birdUniforms[ "delta" ].value = delta;

	velocityUniforms[ "predator" ].value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );

	mouseX = 10000;
	mouseY = 10000;

	gpuCompute.compute();

	birdUniforms[ "texturePosition" ].value = (<any>(gpuCompute.getCurrentRenderTarget( positionVariable ))).texture;
	birdUniforms[ "textureVelocity" ].value = (<any>(gpuCompute.getCurrentRenderTarget( velocityVariable ))).texture;

	renderer.render( scene, camera );

}