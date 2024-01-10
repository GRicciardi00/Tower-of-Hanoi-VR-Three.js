
import * as THREE from 'three';

import { DragControls } from 'three/addons/controls/DragControls.js';
import { AmmoPhysics } from '/AmmoPhysics.js';

let container;
let camera, scene, renderer;
let controls, group, physics, position;
let enableSelection = false;

const objects = [];

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
init()
async function init() {
    physics = await AmmoPhysics();
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 500 );
    camera.position.z = 25;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    scene.add( new THREE.AmbientLight( 0xaaaaaa ) );

    //Adding the floor for
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry( 1000, 5, 100),
        new THREE.ShadowMaterial( { color: 0x444444 } )
    );
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    floor.userData.physics = { mass: 0 };
    scene.add( floor );

    const light = new THREE.SpotLight( 0xffffff, 10000 );
    light.position.set( 0, 25, 50 );
    light.angle = Math.PI / 9;

    light.castShadow = true;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 100;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    scene.add( light );

    group = new THREE.Group();
    scene.add( group );

    const geometry = new THREE.BoxGeometry();

    for ( let i = 0; i < 10; i ++ ) {

        const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 30 - 15;
        object.position.y = Math.random() * 15 - 7.5;
        object.position.z = Math.random() * 20 - 10;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;
        object.userData.physics = { mass: 1 };
        scene.add( object );

        objects.push( object );

    }
    
    physics.addScene( scene );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild( renderer.domElement );

    controls = new DragControls( [ ... objects ], camera, renderer.domElement );
    controls.addEventListener( 'drag', render );
    
    controls.addEventListener('dragstart', function (event) {
        const selectedObject = event.object;
        // Store the initial position of the object
        selectedObject.userData.dragStartPosition = selectedObject.position.clone();
        // Temporarily disable physics for the dragged object
        physics.removeMesh(selectedObject);
    });
    controls.addEventListener('dragend', function (event) {
        const selectedObject = event.object;
        // Re-enable physics for the dragged object
         // Calculate the velocity based on the difference in position during dragging
        const deltaPosition = new THREE.Vector3().subVectors(selectedObject.position, selectedObject.userData.dragStartPosition);
        const velocity = deltaPosition.multiplyScalar(1); // Adjust the factor to control the strength of the velocity
        // Re-add the object to the physics simulation
        physics.addMesh(selectedObject, 1);
        physics.applyCentralImpulse(selectedObject, velocity);
        physics.applyAngularDamping(selectedObject, 1.7);
        // Apply the velocity to the object

        

    });
    
    //

    window.addEventListener( 'resize', onWindowResize );
    animate();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render(event) {
    
    renderer.render( scene, camera );

}
function animate() {

    renderer.setAnimationLoop( render );

}