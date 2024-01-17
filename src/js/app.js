
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Scene from './class/scene.js';
import * as ENABLE3D from '@enable3d/ammo-physics';

let scene;
let selectedObject; 
let makingMove = false;
let movesMade = 0; 
let Invalid = false;
let raycaster, CURRENTCOLOR;
const clock = new THREE.Clock()
let physics
const { AmmoPhysics, PhysicsLoader } = ENABLE3D
const pointer = new THREE.Vector2();
const ThreeScene = () => {
    //INIT
    scene = new Scene();
    raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 3;
    //setup main orbit control
    const orbitControls = new OrbitControls( scene.camera, scene.renderer.domElement );
    scene.setUpControl();
    CURRENTCOLOR = scene.disks_mashes[0].material.color.getHex();
    physics = new AmmoPhysics(scene.scene);
    //Add physics to the scene
    physics.debug.enable();
    // static ground
    physics.add.existing(scene.table, {mass: 0});
    //Add physics to the disks
    for (let i = 0; i < scene.disks.length; i++) {
        physics.add.existing(scene.disks_mashes[i], {mass: 1});
    }
    scene.controls.addEventListener( 'drag', function(event){
        selectedObject = event.object
        render();

    } );
    document.addEventListener( 'pointermove', onPointerMove );
    scene.controls.addEventListener('dragstart', function (event) {
        //disable orbit control
        makingMove = true;
        orbitControls.enabled = false;
        selectedObject = event.object;
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
    /*
    if (makingMove == false){
        checkCollisions()
    };
    //else makingMove == true -> Player is making a move
    */
    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()
    scene.renderer.render( scene.scene, scene.camera );
    /*
    if (Invalid == false){
        console.log("Moves: ",movesMade);
    }
    else if (Invalid == true){
        console.log("Invalid move! - Reload page to reset.");
    }
    */
    
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

window.addEventListener('DOMContentLoaded', () => {
    PhysicsLoader('/ammo', () => ThreeScene())
  })