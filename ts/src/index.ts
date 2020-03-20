import {PerspectiveCamera, Scene, Group, Color} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

var camera:PerspectiveCamera;
var scene:Scene;
var renderer: CSS3DRenderer;
var controls: OrbitControls;

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

	var container = document.getElementById( 'projcontainer' );

	camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 500, 350, 750 );

	scene = new Scene();
	
	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	(<HTMLElement>container).appendChild( renderer.domElement );
	renderer.domElement.style.width = "100%";
	renderer.domElement.style.height = "650px";

	var group = new Group();
	var p1 = document.getElementById("imm");
	var p2 = document.getElementById("sicko");
	var p3 = document.getElementById("physvr");
	var p4 = document.getElementById("stacks");
	const separation = 150;
	const height = 200;
	group.add( new Element( p1, 0, height, separation, 0 ) );
	group.add( new Element( p2, separation, height, 0, Math.PI / 2 ) );
	group.add( new Element( p3, 0, height, - separation, Math.PI ) );
	group.add( new Element( p4, - separation, height, 0, - Math.PI / 2 ) );
	group.position.set(0, 0, -10);
	scene.add( group );
	

	controls = new OrbitControls( camera, renderer.domElement);
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.autoRotate = true;
	controls.enableDamping = true;
	//lock the vertical rotation
	controls.maxPolarAngle = 1.2;
	controls.minPolarAngle = 1.2;

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

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );

}
