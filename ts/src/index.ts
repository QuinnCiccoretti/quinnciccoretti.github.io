import {PerspectiveCamera, Scene, Group, Color} from 'three';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

var camera:PerspectiveCamera;
var scene:Scene;
var renderer: CSS3DRenderer;
var controls: TrackballControls;

class Element extends CSS3DObject {
	constructor( div:HTMLElement|null, x:number, y:number, z:number, ry:number ) {
		if(!div){
			div = document.createElement('div');
		}
		div.style.width = '300px';
		div.style.height = '300px';
		// div.style.backgroundColor = "#ff0000";

		super(div);
		this.position.set( x, y, z );
		this.rotation.y = ry;
	}

};

init();
animate();

function init() {

	var container = document.getElementById( 'container' );

	camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 500, 350, 750 );

	scene = new Scene();
	
	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	(<HTMLElement>container).appendChild( renderer.domElement );

	var group = new Group();
	var p1 = document.getElementById("imm");
	var p2 = document.getElementById("sicko");
	var p3 = document.getElementById("physvr");
	var p4 = document.getElementById("stacks");
	var separation = 150;
	group.add( new Element( p1, 0, 0, separation, 0 ) );
	group.add( new Element( p2, separation, 0, 0, Math.PI / 2 ) );
	group.add( new Element( p3, 0, 0, - separation, Math.PI ) );
	group.add( new Element( p4, - separation, 0, 0, - Math.PI / 2 ) );
	scene.add( group );
	

	controls = new TrackballControls( camera, renderer.domElement );
	controls.noZoom = true;
	controls.rotateSpeed = 4;

	window.addEventListener( 'resize', onWindowResize, false );

	// Block iframe events when dragging camera

	// var blocker = document.getElementById( 'blocker' );
	// blocker.style.display = 'none';

	// controls.addEventListener( 'start', function () {

	// 	blocker.style.display = '';

	// } );
	// controls.addEventListener( 'end', function () {

	// 	blocker.style.display = 'none';

	// } );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );

}
