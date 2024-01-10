
import * as THREE from 'three';

import { AmmoPhysics } from '/AmmoPhysics.js';
import Scene from './class/scene.js';

let container;
let camera, scene, renderer;
let controls, group, physics, position;
let enableSelection = false;

const objects = [];

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
init()
async function init() {
    physics = await AmmoPhysics();
    //Adding the floor for
    scene = new Scene();
    for (let i = 0; i < scene.disks.length; i++) {
       console.log(scene.disks[i].userData.physics.mass)
    }
    scene.setUpControl();
    /*
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    floor.userData.physics = { mass: 0 };
    scene.add( floor );
        /*

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
    */
    physics.addScene( scene.scene );
    scene.controls.addEventListener( 'drag', render );
    
    scene.controls.addEventListener('dragstart', function (event) {
        const selectedObject = event.object;
        //console.log(selectedObject);
        // Store the initial position of the object
        selectedObject.userData.dragStartPosition = selectedObject.position.clone();
        // Temporarily disable physics for the dragged object
        physics.removeMesh(selectedObject);
    });
    scene.controls.addEventListener('dragend', function (event) {
        const selectedObject = event.object;
        // Re-enable physics for the dragged object
         // Calculate the velocity based on the difference in position during dragging
        const deltaPosition = new THREE.Vector3().subVectors(selectedObject.position, selectedObject.userData.dragStartPosition);
        const velocity = deltaPosition.multiplyScalar(0.9); // Adjust the factor to control the strength of the velocity
        // Re-add the object to the physics simulation
        physics.addMesh(selectedObject, selectedObject.userData.physics.mass);
        physics.applyCentralImpulse(selectedObject, velocity);
        physics.applyAngularDamping(selectedObject, 0.75);
        // Apply the velocity to the object

        

    });

    window.addEventListener( 'resize', onWindowResize );
    animate();

}

function onWindowResize() {

    scene.camera.aspect = window.innerWidth / window.innerHeight;
    scene.camera.updateProjectionMatrix();

    scene.renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render(event) {
    
    scene.renderer.render( scene.scene, scene.camera );

}
function animate() {

    scene.renderer.setAnimationLoop( render );

}