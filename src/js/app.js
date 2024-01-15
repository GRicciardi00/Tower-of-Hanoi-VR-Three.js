
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AmmoPhysics } from '/AmmoPhysics.js';
import Scene from './class/scene.js';


let scene;
let physics;
let selectedObject; 
let makingMove = false;
let movesMade = 0; 
let Invalid = false;
let raycaster, sphereInter, CURRENTCOLOR;


const pointer = new THREE.Vector2();
init()
async function init() {
    
    scene = new Scene();
    physics = await AmmoPhysics(scene.scene);
    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 3;
    // for (let i = 0; i < scene.disks.length; i++) {
    //    console.log(scene.disks_mashes[i].userData.physics.mass)
    // }
    //setup main orbit control
    const orbitControls = new OrbitControls( scene.camera, scene.renderer.domElement );
    scene.setUpControl();
    CURRENTCOLOR = scene.disks_mashes[0].material.color.getHex();
    physics.addScene( scene.scene );
    scene.controls.addEventListener( 'drag', function(event){
        selectedObject = event.object
        //Taking the position of the object dragged
        const intersects = raycaster.intersectObject(selectedObject, true);
        if (intersects.length > 0) {
            // Get the intersection point in world coordinates
            const intersectionPoint = intersects[0].point;
            // Update the position of the dragged object
            physics.setMeshPosition(selectedObject, intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
        }
        render();

    } );
    document.addEventListener( 'pointermove', onPointerMove );
    scene.controls.addEventListener('dragstart', function (event) {
        //disable orbit control
        makingMove = true;
        orbitControls.enabled = false;
        selectedObject = event.object;
        // Store the initial position of the object
        selectedObject.userData.dragStartPosition = selectedObject.position.clone();
        // Temporarily disable physics for the dragged object
        physics.removeMesh(selectedObject);
        const intersects_0 = raycaster.intersectObjects( scene.disks_mashes, true );
        if ( intersects_0.length > 0 ) {
            intersects_0[0].object.material.color.set( 0xff0000 );
        }
    });
    scene.controls.addEventListener('dragend', function (event) {
        //enable orbit control
        makingMove = false;
        movesMade +=1;
        orbitControls.enabled = true;
        const selectedObject = event.object;
        selectedObject.material.color.setHex( CURRENTCOLOR );
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
//Raycaster logic
function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, scene.camera );
    
}
function render(event) {
    //taking mouse position
    
    if (makingMove == false){
        checkCollisions()
    };
    //else makingMove == true -> Player is making a move


    scene.renderer.render( scene.scene, scene.camera );
    
    if (Invalid == false){
        console.log("Moves: ",movesMade);
    }
    else if (Invalid == true){
        console.log("Invalid move! - Reload page to reset.");
    }
    
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
        // console.log("Disk 1 intersect Disk 2!")
        // console.log(scene.disks[0].mesh.position.y)
        if (scene.disks[0].mesh.position.y>scene.disks[1].mesh.position.y){
            Invalid = true;
        }
    }
    if (scene.disk1BB.intersectsBox(scene.disk3BB)){
        // console.log("Disk 1 intersect Disk 3!")
        if (scene.disks[0].mesh.position.y>scene.disks[2].mesh.position.y){
            Invalid = true;
        }
    }
    if (scene.disk2BB.intersectsBox(scene.disk3BB)){
        // console.log("Disk 2 intersect Disk 3!")
        if (scene.disks[1].mesh.position.y>scene.disks[2].mesh.position.y){
            Invalid = true;
        }
    }
    // console.log(scene.disk1BB)
}
