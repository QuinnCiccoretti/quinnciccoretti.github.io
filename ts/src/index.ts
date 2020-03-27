import {PerspectiveCamera, Scene, Group, Color, Vector3} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

var projectCamera : PerspectiveCamera;
var igCamera:PerspectiveCamera;

var igScene:Scene;
var projectScene:Scene;

var projectRenderer: CSS3DRenderer;
var igRenderer: CSS3DRenderer;

var projectControls: OrbitControls;
var igControls: OrbitControls;


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


function init(){
	var igcontainer = document.getElementById( 'igcontainer' );
	igRenderer = new CSS3DRenderer();
	igRenderer.setSize( window.innerWidth, window.innerHeight / 1.55);
	igRenderer.domElement.style.width = "100%";
	initIgScene();

	var projcontainer = document.getElementById( 'projcontainer' );
	projectRenderer = new CSS3DRenderer();
	projectRenderer.setSize( window.innerWidth, window.innerHeight / 1.55);
	(<HTMLElement>projcontainer).appendChild( projectRenderer.domElement );
	projectRenderer.domElement.style.width = "100%";

	initProjectScene();
	animate();
	
}

function initIgScene(){
	igScene = new Scene();
	var igGroup = new Group();
	igGroup.position.set(0,0,0);
	igCamera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	igCamera.position.set( 100, 150, 750 ).multiplyScalar(0.7);
	var container = document.getElementById("igcontainer");
	if(!container)
		return;
	var children = container.children;
	var n = children.length;
	var count = 0;
	var dtheta = ( 2.0 * Math.PI ) / n;
	var origin = new Vector3();
	var ogdiv = document.createElement("div");
	ogdiv.innerHTML = "I am the origin";
	igGroup.add(new Element(ogdiv, 0,0,0,0));
	for(var child of <any>children){

		var r = 500;
		var theta = count*dtheta;
		var x = r*Math.cos(theta);
		var z = r*Math.sin(theta);
		console.log(x,z);
		var elem = new Element( child, x, 0, z, 0 );
		elem.lookAt( origin );
		igGroup.add( elem );
		count++;
	}
	igScene.add( igGroup );
	
	(<HTMLElement>container).appendChild( igRenderer.domElement );
	igControls = new OrbitControls( igCamera, igRenderer.domElement);
	igControls.enableZoom = false;
	igControls.enablePan = false;
	igControls.autoRotate = true;
	igControls.enableDamping = true;
	//lock the vertical rotation
	igControls.maxPolarAngle = 1.4;
	igControls.minPolarAngle = 1.0;
}
function initProjectScene() {
	projectCamera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	projectCamera.position.set( 500, 350, 750 ).multiplyScalar(0.7);
	projectScene = new Scene();

	var group = new Group();
	var p1 = document.getElementById("imm");
	var p2 = document.getElementById("sicko");
	var p3 = document.getElementById("physvr");
	var p4 = document.getElementById("stacks");
	const separation = 150;
	const height = 50;
	group.add( new Element( p1, 0, height, separation, 0 ) );
	group.add( new Element( p2, separation, height, 0, Math.PI / 2 ) );
	group.add( new Element( p3, 0, height, - separation, Math.PI ) );
	group.add( new Element( p4, - separation, height, 0, - Math.PI / 2 ) );
	projectScene.add( group );
	

	projectControls = new OrbitControls( projectCamera, projectRenderer.domElement);
	projectControls.enableZoom = false;
	projectControls.enablePan = false;
	projectControls.autoRotate = true;
	projectControls.enableDamping = true;
	//lock the vertical rotation
	projectControls.maxPolarAngle = 1.4;
	projectControls.minPolarAngle = 1.0;

}

function animate() {

	requestAnimationFrame( animate );
	projectControls.update();
	projectRenderer.render( projectScene, projectCamera );

	igControls.update();
	igRenderer.render( igScene, igCamera );

}
