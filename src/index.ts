import {PerspectiveCamera, Scene, Group, Color} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

var camera:PerspectiveCamera;
let scene = new Scene();
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
var cage = document.getElementById('cage');
document.addEventListener('DOMContentLoaded', function(){
  init();
  animate();
});

function init() {

	let container = document.getElementById( 'projcontainer' );
  if(!container){
    return;
  }
	camera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 500, 350, 750 ).multiplyScalar(0.7);
	
	renderer = new CSS3DRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight / 1.55);
	(<HTMLElement>container).appendChild( renderer.domElement );
	renderer.domElement.style.width = "100%";
	// renderer.domElement.style.height = "100%";

	let group = new Group();
	let p1 = document.getElementById("imm");
	let p2 = document.getElementById("sicko");
	let p3 = document.getElementById("physvr");
	let p4 = document.getElementById("stacks");
  let p5 = document.getElementById("rc");
	const radius = 180;
	const height = 50;
  let plist =[p1, p2, p3, p4, p5];
  let nProjects = plist.length;
  for(let i = 0; i < nProjects; i++){
     let theta = 2 * Math.PI * i / nProjects;
     let x = radius * Math.cos(theta);
     let y = radius * Math.sin(theta);
     let child = plist[i];
     group.add( new Element( <HTMLElement>child, x, height, y, - theta + (Math.PI/2)) );

  }

  scene.add( group );
	

	controls = new OrbitControls( camera, renderer.domElement);
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.autoRotate = true;
	controls.enableDamping = true;
	//lock the vertical rotation
	controls.maxPolarAngle = 1.4;
	controls.minPolarAngle = 1.0;

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
window.onresize = function(){
  renderer.setSize( window.innerWidth, window.innerHeight / 1.55);
}