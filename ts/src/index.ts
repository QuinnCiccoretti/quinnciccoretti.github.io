import {PerspectiveCamera, Scene, Group, Color} from 'three';
import {parseEntry} from 'igcss3d';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
animate();

function init(){

	var igcontainer = document.getElementById( 'igcontainer' );
	igRenderer = new CSS3DRenderer();
	igRenderer.setSize( window.innerWidth, window.innerHeight / 1.55);
	(<HTMLElement>igcontainer).appendChild( igRenderer.domElement );
	igRenderer.domElement.style.width = "100%";
	initIgScene();

	var projcontainer = document.getElementById( 'projcontainer' );
	projectRenderer = new CSS3DRenderer();
	projectRenderer.setSize( window.innerWidth, window.innerHeight / 1.55);
	(<HTMLElement>projcontainer).appendChild( projectRenderer.domElement );
	projectRenderer.domElement.style.width = "100%";

	initProjectScene();
	
}
function initIgScene(){
	// [id of post, is a video]
	var posts : [string, boolean][] = [
		["B8nKBHnHqvz", true],
		["B2pyY0enhh6", false],
		["B3QDxpGH5Bv", true],
		["B1RLa30H_v7", false],
		["B0U0Z--nX0z", true],
		["BxSmkgeAcY4", true],
		["BwcJzeNhd6t", false],
		["BwNwTqThu9u", true],
		["BvP8V2XBN0a", true],
		["Bu2OJqFBiGP", false],
		["BteKLDehfGZ", false],
		["BsFVfqNBcn2", true],
		["BqEWG5GBXDB", false],
		["BpI03Fgjr5q", false],
		["Bo3VqCbDCMW", false],
		["Bnb2fY4jshG", true],
		["BnNWeC3DuAv", true]
	];
	for(var post of posts){
		if(post[1]){
			parseEntry(post).then((child)=>{
				document.body.appendChild(child);
			});
		}else{
			parseEntry(post).then((child)=>{
				document.body.appendChild(child);
				setTimeout(function(){
					//call a weirdly declared separate script
					//to appropriately embed videos
					//forgive me for my sins
					(<any>instgrm).Embeds.process();
				}, 1000);
				
				
			});
		}
	}
	


	igCamera = new PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	igCamera.position.set( 500, 350, 750 ).multiplyScalar(0.7);
	igScene = new Scene();

	
	

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
