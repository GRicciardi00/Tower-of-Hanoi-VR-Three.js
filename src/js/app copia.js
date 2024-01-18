
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
let disk1, disk2, disk3,disk_onTop;

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
    physics.add.existing(scene.table, {mass: 0});
    scene.table.body.setCollisionFlags(1);
    //Add physics to the disks
    physics.add.existing(scene.disk1.mesh, {mass: 1, offset: {y: -0.06}});
    physics.add.existing(scene.disk2.mesh, {mass: 1.3, offset: {y: -0.06}});
    physics.add.existing(scene.disk3.mesh, {mass: 1.7, offset: {y: -0.06}});
    disk1 = scene.disk1.mesh; //small disk
    disk2 = scene.disk2.mesh; //medium disk
    disk3 = scene.disk3.mesh; //big disk
    scene.controls.addEventListener( 'drag', function(event){
        if (selected?.body.getCollisionFlags() === 2) {
            const { x, y } = pointer
    
            const speed = 0.03
            const movementX = (x - prev.x) * speed
            const movementZ = (y - prev.y) * -speed
    
            // since the scene has a rotation of -Math.PI / 4,
            // we adjust the movement by -Math.PI / 4
            //const v3 = new THREE.Vector3(movementX, 0, movementZ)
            //v3.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4)
    
            selected.position.x += movementX
            //console.log(selected.body.position.y- selected.position.y)
            selected.body.position.y += 0
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
        const intersects = raycaster.intersectObjects( scene.disks_mashes, true );
        if ( intersects.length > 0 ) {
            //Change color of selected object
            intersects[0].object.material.color.set( 0xffb3b3 );
            selected = intersects[0].object;
            disk_onTop = hasDisksOnTop(selected,scene.disks_mashes)
            if(!disk_onTop){
                selected.body.setCollisionFlags(2)
            }
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
    scene.setDisksPosition();
    //Initial animation -> 3 disks falling
    disk1.body.setCollisionFlags(0);
    disk2.body.setCollisionFlags(0);
    disk3.body.setCollisionFlags(0);
    //if the smallest disk collide with the other disk -> make object static
    // collision between blueBox and redBox (will set body.checkCollisions = true, on the blueBox and the redBox)
    setTimeout(() => {
        console.log("set collision to 1")
        disk1.body.setCollisionFlags(1);
        disk2.body.setCollisionFlags(1);
        disk3.body.setCollisionFlags(1);
    }, 1000); // 2000 milliseconds = 2 seconds
    window.addEventListener( 'resize', onWindowResize );
    //Checking collisions of disks to enable the movement
    //Each disk can't move if there are other disks on top on it
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
    
    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()
    scene.renderer.render( scene.scene, scene.camera );
    
    
    // if (Invalid == false){
    //     console.log("Moves: ",movesMade);
    // }
    // else if (Invalid == true){
    //     console.log("Invalid move! - Reload page to reset.");
    // }
    
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
        if(intersectsResetButton[0].object.body === disk1.body){
            intersectsResetButton[0].object.body.setCollisionFlags(2);
        selected = intersectsResetButton[0].object;
        
        
    }
    window.location.reload();
    }
    let intersectsExitButton = raycaster.intersectObject(scene.gameBoard.exit);
    if ( intersectsExitButton.length > 0 ) {
        //Change color of selected object
        intersectsExitButton[0].object.material.color.set( 0xffb3b3 );
        if(intersectsExitButton[0].object.body === disk1.body){
            intersectsExitButton[0].object.body.setCollisionFlags(2);
        selected = intersectsExitButton[0].object;
        
        
    }
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

window.addEventListener('DOMContentLoaded', () => {
    PhysicsLoader('/ammo', () => ThreeScene())
  })

  function updateScoreBoardPosition(){
    
  }

  function hasDisksOnTop(targetDisk, allDisks) {
    const targetIndex = allDisks.indexOf(targetDisk);
    if (targetIndex === -1) {
        console.error("Target disk not found in the list.");
        return true;
    }
    // Iterate over disks above the target disk
    for (let i = targetIndex + 1; i < allDisks.length; i++) {
        const upperDisk = allDisks[i];
        if (upperDisk.position.y > targetDisk.position.y) {
            console.log("no disk on top")
            return true; // There is a disk on top
        }
    }

    return false; // No disks on top
}