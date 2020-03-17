import {PerspectiveCamera, Scene, Group} from 'three';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

var camera:PerspectiveCamera;
var scene:Scene;
var renderer: CSS3DRenderer;
var controls: TrackballControls;

class Element extends CSS3DObject {
	<div class="col-sm-4">
			<a href ="https://github.com/QuinnCiccoretti/physvr">
				<div class="thumbnail">
					<img class = "img-thumbnail" src="./img/research-icon.png" alt="ResearchProject">
					<h2><strong>Physvr</strong></h2>
				</div>
			</a>
		</div>
	constructor( name:string, imgpath:string, link:string, x:number, y:number, z:number, ry:number ) {
		var div = document.createElement( 'div' );
		div.style.width = '480px';
		div.style.height = '360px';
		div.style.backgroundColor = '#000';

		var a = document.createElement('a');
		a.href = link;
		var img = document.createElement('img');
		img.src = 
		a.appendChild(im)



		var iframe = document.createElement( 'iframe' );
		iframe.style.width = '480px';
		iframe.style.height = '360px';
		iframe.style.border = '0px';
		iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
		div.appendChild( iframe );

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
	group.add( new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 ) );
	group.add( new Element( 'Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2 ) );
	group.add( new Element( 'IrydklNpcFI', 0, 0, - 240, Math.PI ) );
	group.add( new Element( '9ubytEsCaS0', - 240, 0, 0, - Math.PI / 2 ) );
	scene.add( group );

	controls = new TrackballControls( camera, renderer.domElement );
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
