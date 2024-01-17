
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Scene from './class/scene.js';
import * as ENABLE3D from '@enable3d/ammo-physics';

let scene;
let selectedObject; 
let makingMove = false;
let movesMade = 0; 
let Invalid = false;
let raycaster, selected,CURRENTCOLOR;
let prev = { x: 0, y: 0 }
const clock = new THREE.Clock()
let physics;
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
    scene.table.body.setCollisionFlags(1);
    //Add physics to the disks
    for (let i = 0; i < scene.disks_mashes.length; i++) {
        physics.add.existing(scene.disks_mashes[i], {shape: 'hacd',mass: 1,});
        // Adjust the position
        scene.disks_mashes[i].position.copy(physics.position);

        // Adjust the rotation
        scene.disks_mashes[i].rotation.copy(physics.rotation);

        // Adjust the scale
        scene.disks_mashes[i].scale.copy(physics.scale);
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
        const intersects = raycaster.intersectObjects( scene.disks_mashes, true );
        if ( intersects.length > 0 ) {
            //Change color of selected object
            intersects[0].object.material.color.set( 0xffb3b3 );
            intersects[0].object.body.setCollisionFlags(2);
            selected = intersects[0].object;
        }
        
    });
    scene.controls.addEventListener('dragend', function (event) {
        //enable orbit control
        makingMove = false;
        movesMade +=1;
        orbitControls.enabled = true;
        const selectedObject = event.object;
        selectedObject.material.color.setHex( CURRENTCOLOR );
        selectedObject.body.setCollisionFlags(0);
        selected = null;
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
    if (selected?.body.getCollisionFlags() === 2) {
        const { x, y } = pointer

        const speed = 1
        const movementX = (x - prev.x) * speed
        const movementZ = (y - prev.y) * -speed

        // since the scene has a rotation of -Math.PI / 4,
        // we adjust the movement by -Math.PI / 4
        const v3 = new THREE.Vector3(movementX, 0, movementZ)
        v3.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4)

        selected.position.x += v3.x
        selected.position.y += v3.y
        selected.position.z += v3.z
        selected.body.needUpdate = true
        prev = { x, y }
    }
    /*
    if (Invalid == false){
        console.log("Moves: ",movesMade);
    }
    else if (Invalid == true){
        console.log("Invalid move! - Reload page to reset.");
    }
    */
    updateScoreBoardPosition();
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

  function updateScoreBoardPosition(){
    
  }