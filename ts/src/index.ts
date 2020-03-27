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
var igControls: TrackballControls;


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
	igCamera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	igCamera.position.set( 0, 0, 3000 ).multiplyScalar(0.7);
	
	var container = document.getElementById("igcontainer");
	if(!container)
		return;
	var children = container.children;
	var n = children.length;
	var count = 0;
	var dtheta = ( 2.0 * Math.PI ) / n;
	var r = 1000;

	for(var child of <any>children){
		var vector = new Vector3();
		var phi = Math.acos( - 1 + ( 2 * count ) / (n/2) );
		var theta = Math.sqrt( count * Math.PI ) * phi;
		var elem = new Element( child, 0, 0, 0, 0 );
		elem.position.setFromSphericalCoords( 800, phi, theta );
		vector.copy( elem.position ).multiplyScalar( 2 );
		elem.lookAt( vector );
		igGroup.add( elem );
		count++;
	}
	igScene.add( igGroup );

	
	(<HTMLElement>container).appendChild( igRenderer.domElement );
	igControls = new TrackballControls( igCamera, igRenderer.domElement);
	igControls.minDistance = 500;
	igControls.maxDistance = 6000;
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
