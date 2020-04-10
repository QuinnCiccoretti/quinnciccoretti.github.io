"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const three_2 = require("three");
const three_3 = require("three");
const three_4 = require("three");
const GPUComputationRenderer_js_1 = require("three/examples/jsm/misc/GPUComputationRenderer.js");
/* TEXTURE WIDTH FOR SIMULATION */
var WIDTH = 16;
var BIRDS = WIDTH * WIDTH;
// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
class BirdGeometry extends three_1.BufferGeometry {
    constructor() {
        super();
        var triangles = BIRDS * 3;
        var points = triangles * 3;
        var vert_arr = new Float32Array(points * 3);
        var birdColors_arr = new Float32Array(points * 3);
        var ref_arr = new Float32Array(points * 2);
        var birdVert_arr = new Float32Array(points);
        // this.setAttribute( 'normal', new Float32Array( points * 3 ), 3 );
        var v = 0;
        function verts_push(nine_numbers) {
            for (var i = 0; i < nine_numbers.length; i++) {
                vert_arr[v++] = nine_numbers[i];
            }
        }
        var wingsSpan = 20;
        for (var f = 0; f < BIRDS; f++) {
            // Body
            verts_push([
                0, -0, -20,
                0, 4, -20,
                0, 0, 30
            ]);
            // Left Wing
            verts_push([
                0, 0, -15,
                -wingsSpan, 0, 0,
                0, 0, 15
            ]);
            // Right Wing
            verts_push([
                0, 0, 15,
                wingsSpan, 0, 0,
                0, 0, -15
            ]);
        }
        for (var v = 0; v < triangles * 3; v++) {
            var i = ~~(v / 3);
            var x = (i % WIDTH) / WIDTH;
            var y = ~~(i / WIDTH) / WIDTH;
            var c = new three_2.Color(0x444444 +
                ~~(v / 9) / BIRDS * 0x666666);
            birdColors_arr[v * 3 + 0] = c.r;
            birdColors_arr[v * 3 + 1] = c.g;
            birdColors_arr[v * 3 + 2] = c.b;
            ref_arr[v * 2] = x;
            ref_arr[v * 2 + 1] = y;
            birdVert_arr[v] = v % 9;
        }
        this.scale(0.2, 0.2, 0.2);
        var vertices = new three_1.BufferAttribute(vert_arr, 3);
        var birdColors = new three_1.BufferAttribute(birdColors_arr, 3);
        var references = new three_1.BufferAttribute(ref_arr, 2);
        var birdVertex = new three_1.BufferAttribute(birdVert_arr, 1);
        this.setAttribute('position', vertices);
        this.setAttribute('birdColor', birdColors);
        this.setAttribute('reference', references);
        this.setAttribute('birdVertex', birdVertex);
    }
}
;
var container;
var camera, scene;
var renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
var last = performance.now();
var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var birdUniforms;
function initBirdBox(container) {
    camera = new three_2.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 1.55), 1, 3000);
    camera.position.z = 350;
    scene = new three_2.Scene();
    scene.background = new three_2.Color(0xffffff);
    scene.fog = new three_2.Fog(0xffffff, 100, 1000);
    renderer = new three_3.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight / 1.55);
    renderer.domElement.style.width = "100%";
    container.appendChild(renderer.domElement);
    initComputeRenderer();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    //
    var effectController = {
        separation: 20.0,
        alignment: 20.0,
        cohesion: 20.0,
        freedom: 0.75
    };
    var valuesChanger = function () {
        velocityUniforms["separationDistance"].value = effectController.separation;
        velocityUniforms["alignmentDistance"].value = effectController.alignment;
        velocityUniforms["cohesionDistance"].value = effectController.cohesion;
        velocityUniforms["freedomFactor"].value = effectController.freedom;
    };
    valuesChanger();
    initBirds();
}
exports.initBirdBox = initBirdBox;
function initComputeRenderer() {
    gpuCompute = new GPUComputationRenderer_js_1.GPUComputationRenderer(WIDTH, WIDTH, renderer);
    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();
    fillPositionTexture(dtPosition);
    fillVelocityTexture(dtVelocity);
    var fragShaderV = document.getElementById('fragmentShaderVelocity');
    if (!fragShaderV) {
        console.log("Could not find fragment shader Velocity in the document");
        return;
    }
    velocityVariable = gpuCompute.addVariable("textureVelocity", fragShaderV.textContent, dtVelocity);
    var fragShaderP = document.getElementById('fragmentShaderPosition');
    if (!fragShaderP) {
        console.log("Could not find fragment shader Position in the document");
        return;
    }
    positionVariable = gpuCompute.addVariable("texturePosition", fragShaderP.textContent, dtPosition);
    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;
    positionUniforms["time"] = { value: 0.0 };
    positionUniforms["delta"] = { value: 0.0 };
    velocityUniforms["time"] = { value: 1.0 };
    velocityUniforms["delta"] = { value: 0.0 };
    velocityUniforms["testing"] = { value: 1.0 };
    velocityUniforms["separationDistance"] = { value: 1.0 };
    velocityUniforms["alignmentDistance"] = { value: 1.0 };
    velocityUniforms["cohesionDistance"] = { value: 1.0 };
    velocityUniforms["freedomFactor"] = { value: 1.0 };
    velocityUniforms["predator"] = { value: new three_3.Vector3() };
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);
    velocityVariable.wrapS = three_3.RepeatWrapping;
    velocityVariable.wrapT = three_3.RepeatWrapping;
    positionVariable.wrapS = three_3.RepeatWrapping;
    positionVariable.wrapT = three_3.RepeatWrapping;
    var error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }
}
function initBirds() {
    var geometry = new BirdGeometry();
    // For Vertex and Fragment
    birdUniforms = {
        "color": { value: new three_2.Color(0xff2200) },
        "texturePosition": { value: null },
        "textureVelocity": { value: null },
        "time": { value: 1.0 },
        "delta": { value: 0.0 }
    };
    var birdVS = document.getElementById('birdVS');
    if (!birdVS) {
        console.log("Could not find birdVS element");
        return;
    }
    var birdFS = document.getElementById('birdFS');
    if (!birdFS) {
        console.log("Could not find birdFS element");
        return;
    }
    // ShaderMaterial
    var material = new three_4.ShaderMaterial({
        uniforms: birdUniforms,
        vertexShader: birdVS.textContent,
        fragmentShader: birdFS.textContent,
        side: three_4.DoubleSide
    });
    var birdMesh = new three_4.Mesh(geometry, material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    scene.add(birdMesh);
}
function fillPositionTexture(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() * BOUNDS - BOUNDS_HALF;
        var y = Math.random() * BOUNDS - BOUNDS_HALF;
        var z = Math.random() * BOUNDS - BOUNDS_HALF;
        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = 1;
    }
}
function fillVelocityTexture(texture) {
    var theArray = texture.image.data;
    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = z * 10;
        theArray[k + 3] = 1;
    }
}
function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}
//
function animateBirdbox() {
    requestAnimationFrame(animateBirdbox);
    render();
}
exports.animateBirdbox = animateBirdbox;
function render() {
    var now = performance.now();
    var delta = (now - last) / 1000;
    if (delta > 1)
        delta = 1; // safety cap on large deltas
    last = now;
    positionUniforms["time"].value = now;
    positionUniforms["delta"].value = delta;
    velocityUniforms["time"].value = now;
    velocityUniforms["delta"].value = delta;
    birdUniforms["time"].value = now;
    birdUniforms["delta"].value = delta;
    velocityUniforms["predator"].value.set(0.5 * mouseX / windowHalfX, -0.5 * mouseY / windowHalfY, 0);
    mouseX = 10000;
    mouseY = 10000;
    gpuCompute.compute();
    birdUniforms["texturePosition"].value = (gpuCompute.getCurrentRenderTarget(positionVariable)).texture;
    birdUniforms["textureVelocity"].value = (gpuCompute.getCurrentRenderTarget(velocityVariable)).texture;
    renderer.render(scene, camera);
}
