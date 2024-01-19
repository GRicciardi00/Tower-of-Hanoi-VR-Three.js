
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Scene from './class/scene.js';
import * as ENABLE3D from '@enable3d/ammo-physics';

let scene;
let selectedObject; 
let movesMade = 0;
let makingMove = false;
let Invalid = false;
let raycaster, selected,CURRENTCOLOR;
let disk1, disk2, disk3;
let prev = { x: 0, y: 0 }
const clock = new THREE.Clock()
let physics;
const { AmmoPhysics, PhysicsLoader } = ENABLE3D
const pointer = new THREE.Vector2();
const ThreeScene = () => {
    //INIT
    scene = new Scene();
    physics = new AmmoPhysics(scene.scene);
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
    physics.add.existing(scene.table, {name: "table", mass: 0});
    scene.table.body.setCollisionFlags(1);
    //Add physics to the disks
    physics.add.existing(scene.disk1.mesh, {mass: 1, offset: {y: -0.05}});
    physics.add.existing(scene.disk2.mesh, {mass: 1, offset: {y: -0.05}});
    physics.add.existing(scene.disk3.mesh, {mass: 1, offset: {y: -0.05}});
    disk1 = scene.disk1.mesh; //small disk
    disk2 = scene.disk2.mesh; //medium disk
    disk3 = scene.disk3.mesh; //big disk
     //Initial animation -> 3 disks falling
     disk1.body.setCollisionFlags(0);
     disk2.body.setCollisionFlags(0);
     disk3.body.setCollisionFlags(0);
     //After 1 second make the disks static, so they can't move and collide
     setTimeout(() => {
         console.log("set collision to 1")
         disk1.body.setCollisionFlags(1);
         disk2.body.setCollisionFlags(1);
         disk3.body.setCollisionFlags(1);
     }, 800); // 1000 milliseconds = 1 seconds
    scene.controls.addEventListener( 'drag', function(event){
        if (selected?.body.getCollisionFlags() === 2) {
            const { x, y } = pointer
            const speed = 0.1
            const movementX = (x - prev.x) * speed
            const movementZ = (y - prev.y) * -speed
            selected.position.x += movementX
            selected.position.z += movementZ
            selected.body.needUpdate = true
            prev = { x, y }
        }
        selectedObject = event.object
        render();
    } );
    document.addEventListener( 'pointermove', onPointerMove );
    document.addEventListener( 'pointerdown', onPointerDown );
    scene.controls.addEventListener('dragstart', function (event) {
        //disable orbit control
        makingMove = true;
        orbitControls.enabled = false;
        selectedObject = event.object;
        const intersects_disks = raycaster.intersectObjects( scene.disks_mashes, true );
        if ( intersects_disks.length > 0 ) {
            //Change color of selected object
            intersects_disks[0].object.material.color.set( 0xffb3b3 );
            let disk_onTop = hasDisksOnTop(intersects_disks[0].object,scene.disks_mashes)
            console.log("disk on top variable: ",disk_onTop)
            if(disk_onTop === false){
                selected = intersects_disks[0].object;
                console.log("selected: ",selected.body.getCollisionFlags())
                selected.body.setCollisionFlags(2)
            }
        }
    });
    scene.controls.addEventListener('dragend', function (event) {
        //enable orbit control
        makingMove = false;
        orbitControls.enabled = true;
        const selectedObject = event.object;
        if (selectedObject.body.getCollisionFlags() === 2){
            movesMade +=1;
        }
        selectedObject.material.color.setHex( CURRENTCOLOR );
        selectedObject.body.setCollisionFlags(0);
        //When the object is dropped, check if it is on the table
        //If it is on the table, set the collision flag to 1 (static)
        selectedObject.body.on.collision((otherObject, event) => {
            if (otherObject.name === 'table') selectedObject.body.setCollisionFlags(1);
          })
        selected = null;
    });
    scene.setDisksPosition();
   
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
    if (makingMove == false){
        checkCollisions()
    };
    
    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()
    scene.renderer.render( scene.scene, scene.camera );

    scene.gameBoard.updateMovesAndStatus(movesMade,Invalid)
}

function animate() {
    scene.renderer.setAnimationLoop( render );
    
}

function onPointerDown(){
    let intersectsResetButton = raycaster.intersectObject(scene.gameBoard.reset);
    if ( intersectsResetButton.length > 0 ) {
        //Change color of selected object
        intersectsResetButton[0].object.material.color.set( 0xffb3b3 );
        window.location.reload();
    }
    let intersectsExitButton = raycaster.intersectObject(scene.gameBoard.exit);
    if ( intersectsExitButton.length > 0 ) {
        //Change color of selected object
        intersectsExitButton[0].object.material.color.set( 0xffb3b3 );
        window.close();
    }

}

function checkCollisions(){
    // console.log(scene.disks[0])
    //updating bounding box and geometry
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

function hasDisksOnTop(targetDisk, allDisks) {
    const targetIndex = allDisks.indexOf(targetDisk);
    if (targetIndex === -1) {
        console.error("Target disk not found in the list.");
        return false;
    }
    // Iterate over disks above the target disk
    for (let i = targetIndex + 1; i < allDisks.length; i++) {
        const upperDisk = allDisks[i];
        if (upperDisk.position.y > targetDisk.position.y) {
            console.log("disk on top")
            return true; // There is a disk on top
        }
    }
    //No disk on top
    return false; // There is no disk on top
}
window.addEventListener('DOMContentLoaded', () => {
    PhysicsLoader('/ammo', () => ThreeScene())
  })

  function updateScoreBoardPosition(){
    
  }


