import * as THREE from 'three/build/three.module';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer;
let object;

const meshes = [];

const PLANES_NUMBER = 2;
const ANGLE_BY_PANEL = 360 / (PLANES_NUMBER + 1);
const RADUIS_X = 1450;
const RADUIS_Z = 170;

let mouse = new THREE.Vector2();

let container = document.querySelector('.rotate-container')

const canvas = document.querySelector('.canvas');
const stats = new Stats();
stats.setMode(0);
stats.dom.style.scale = 1.5;
stats.dom.style.transform = 'translateX(10px) translateY(8px) ';
container.appendChild(stats.dom);

let targetObject;

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
camera.position.z = 1700;

scene = new THREE.Scene();
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.2);
camera.add(pointLight);

function loadModel() {
    object.traverse(function (child) {

        if (child.isMesh) {
            const material = new THREE.MeshPhongMaterial({ color: '#f6b606', specular: '#f6b606', shininess: 20, opacity: 0.9, transparent: false });
            child.material = material;
        }

    });

    targetObject = object;

    scene.add(object);
    editMeshsPostiton(PLANES_NUMBER)
    removeHidden();
    animate();
    if (window.innerWidth <= window.innerHeight) {
        renderer.setSize(window.innerHeight, window.innerWidth);
    }
}

function editMeshsPostiton(planeNumbers) {
    let currentAngle = 270;
    meshes[planeNumbers] = object;
    meshes[planeNumbers].userData.angle = currentAngle;
    meshes[planeNumbers].position.set(RADUIS_X * cos(currentAngle),-430,RADUIS_Z * sin(currentAngle))
    currentAngle = currentAngle + ANGLE_BY_PANEL;
    
    for (var i = 0; i < planeNumbers; ++i) {
        let planeMesh = new THREE.PlaneGeometry(1500, 1000, 1, 1);
        let texture = new THREE.TextureLoader().load(`textures/image${i}.jpg` ); 
        let planeMaterial = new THREE.MeshBasicMaterial({map:texture});
        meshes[i] = new THREE.Mesh(planeMesh, planeMaterial);
        meshes[i].userData.angle = currentAngle;
        meshes[i].position.set(RADUIS_X * cos(currentAngle),0,RADUIS_Z * sin(currentAngle))
        scene.add(meshes[i]);
        currentAngle = currentAngle + ANGLE_BY_PANEL;
    }
}


function scrollObjectsRight() {
    meshes.forEach((mesh) => {
        let tween = new TWEEN.Tween(mesh.position);
        let newAngle = mesh.userData.angle + ANGLE_BY_PANEL;
        let newX = RADUIS_X * cos(newAngle);
        let newZ = RADUIS_Z * sin(newAngle);
        tween.to({ x: newX, z:  newZ }, 500).start();
        mesh.userData.angle = newAngle % 360;
        console.log(mesh.userData.angle)
        if(mesh.userData.angle === 270 || mesh.userData.angle === -90){
            targetObject = mesh;
        }
     })
}
function scrollObjectsLeft() {
    meshes.forEach((mesh) => {
        let tween = new TWEEN.Tween(mesh.position);
        let newAngle = mesh.userData.angle - ANGLE_BY_PANEL;
        let newX = RADUIS_X * cos(newAngle);
        let newZ = RADUIS_Z * sin(newAngle);
        tween.to({ x: newX, z:  newZ }, 500).start();
        mesh.userData.angle = newAngle % 360;
        console.log(mesh.userData.angle)
        if(mesh.userData.angle === 270 || mesh.userData.angle === -90){
            targetObject = mesh;
        }
    })
}

if (window.innerWidth <= window.innerHeight) {
    container.style = "transform: rotate(90deg);"
    container.innerWidth = window.innerHeight;
    container.innerHeight = window.innerWidth;
    camera.aspect = window.innerHeight / window.innerWidth;
    camera.updateProjectionMatrix();
}

function onProgress(xhr) {
    if (xhr.lenghtComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + Math.round(percentComplete, 2) + '% downloaded')
    }
}

function onError() { }

const manager = new THREE.LoadingManager(loadModel);

const loader = new OBJLoader(manager);
loader.load('models/moy-logo.obj', function (obj) {
    object = obj;
}, onProgress, onError);

renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

const controls = new OrbitControls( camera, renderer.domElement );

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', onWindowResize);

document.addEventListener('mousemove', onDocumentMouseMove);

document.querySelectorAll('.scroll-button')[0].addEventListener('click', scrollObjectsLeft);
document.querySelectorAll('.scroll-button')[1].addEventListener('click', scrollObjectsRight);

const raycaster = new THREE.Raycaster();

function animate() {

    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    render();
}

function onWindowResize() {

    if (window.innerWidth <= window.innerHeight) {
        container.style = "transform: rotate(90deg)"
        container.innerWidth = window.innerHeight;
        container.innerHeight = window.innerWidth;
        renderer.setSize(window.innerHeight, window.innerWidth);
        camera.aspect = window.innerHeight / window.innerWidth;
        camera.updateProjectionMatrix();
    } else {
        if (container.innerWidth === window.innerHeight) {
            container.style = "transform: rotate(0)"
            container.innerWidth = window.innerWidth;
            container.innerHeight = window.innerHeight;

        }
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function render() {
    if (window.innerWidth >= window.innerHeight) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.find((intersect) => intersect.object === targetObject)) {
            var tween = new TWEEN.Tween(targetObject.scale)
            tween.to({ x: 1.1, y: 1.1 }, 50).start()
        }

        if ((!intersects.find((intersect) => intersect.object === targetObject))) {
            var tween = new TWEEN.Tween(targetObject.scale)
            tween.to({ x: 1, y: 1 }, 50).start()
        }
    }

    stats.update();
    renderer.render(scene, camera);

}

function removeHidden() {
    let els = document.querySelectorAll(".hidden");
    for (let el of els) {
        el.classList.remove("hidden");
    }
    let svg = document.querySelector(".loading-svg")
    document.body.removeChild(svg);
}

function cos(angle){
    return Math.cos(angle * Math.PI / -180).toFixed(15)
}
function sin(angle){
    return Math.sin(angle * Math.PI / -180).toFixed(15)
}


