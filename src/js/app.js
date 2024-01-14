
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AmmoPhysics } from '/AmmoPhysics.js';
import Scene from './class/scene.js';


let scene;
let physics;
let selectedObject;

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
init()
async function init() {
    physics = await AmmoPhysics();
    scene = new Scene();
    // for (let i = 0; i < scene.disks.length; i++) {
    //    console.log(scene.disks_mashes[i].userData.physics.mass)
    // }
    //setup main orbit control
    const orbitControls = new OrbitControls( scene.camera, scene.renderer.domElement );
    scene.setUpControl();
    
    physics.addScene( scene.scene );
    scene.controls.addEventListener( 'drag', render );
    
    scene.controls.addEventListener('dragstart', function (event) {
        //disable orbit control
        orbitControls.enabled = false;
        if(orbitControls.enabled === false){
            console.log("orbit control disabled")
        }
        selectedObject = event.object;
        console.log(selectedObject);
        // Store the initial position of the object
        selectedObject.userData.dragStartPosition = selectedObject.position.clone();
        // Temporarily disable physics for the dragged object
        physics.removeMesh(selectedObject);
    });
    scene.controls.addEventListener('dragend', function (event) {
        //enable orbit control
        orbitControls.enabled = true;
        const selectedObject = event.object;
        // Re-enable physics for the dragged object
         // Calculate the velocity based on the difference in position during dragging
        const deltaPosition = new THREE.Vector3().subVectors(selectedObject.position, selectedObject.userData.dragStartPosition);
        const velocity = deltaPosition.multiplyScalar(0.9); // Adjust the factor to control the strength of the velocity
        // Re-add the object to the physics simulation
        physics.addMesh(selectedObject, selectedObject.userData.physics.mass);
        // Apply the velocity to the object
        physics.applyCentralImpulse(selectedObject, velocity);
        physics.applyAngularDamping(selectedObject, 0.75);
        

        

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
    checkCollisions()
    scene.renderer.render( scene.scene, scene.camera );
    
}
function animate() {

    scene.renderer.setAnimationLoop( render );
    
}

function checkCollisions(){
    // console.log(scene.disks[0])
    scene.disk1BB.copy(scene.disks[0].mesh.geometry.boundingBox).applyMatrix4(scene.disks[0].mesh.matrixWorld);
    scene.disk2BB.copy(scene.disks[1].mesh.geometry.boundingBox).applyMatrix4(scene.disks[1].mesh.matrixWorld);
    scene.disk3BB.copy(scene.disks[2].mesh.geometry.boundingBox).applyMatrix4(scene.disks[2].mesh.matrixWorld);
    if (scene.disk1BB.intersectsBox(scene.disk2BB)){
        console.log("Disk 1 intersect Disk 2!")
    }
    if (scene.disk1BB.intersectsBox(scene.disk3BB)){
        console.log("Disk 1 intersect Disk 3!")
    }
    if (scene.disk2BB.intersectsBox(scene.disk3BB)){
        console.log("Disk 2 intersect Disk 3!")
    }
    // console.log(scene.disk1BB)
}