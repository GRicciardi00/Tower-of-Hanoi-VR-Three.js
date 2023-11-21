import * as THREE from 'three';
import Floor from './geometry';

export default class Scene{
    static pointer = new THREE.Vector2();
    constructor() {
    
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);
      
    
        this.camera.position.set(0, 0, 10); 
        this.camera.lookAt(0, 0, 0);

        this.createHanoiTable();

        this.raycaster = new THREE.Raycaster();
        

        window.addEventListener( 'pointermove', this.onPointerMove );
    
    }

    createHanoiTable() {
        this.floor = new Floor(2, 1, 0xff0000, 0.1);
        this.scene.add(this.floor.cylinder);

        this.intersectObjects = [this.floor.cylinder];


    }


    setupCamera(z) {
        this.camera.position.z = z;
  
    }

    onPointerMove( event ) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        
        Scene.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        Scene.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    }

    onPointerClick(event){

    }

    updateRaycast() {
        // Update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(Scene.pointer, this.camera);
    
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.intersectObjects);
    
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
    
            // Log information about the intersected object
            console.log('Intersected Object:', intersectedObject);
    
            // Optionally, you can perform additional actions with the intersected object
            this.handleIntersectedObject(intersectedObject);
        }
    
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    handleIntersectedObject(object) {
        // Customize this method to perform actions with the intersected object
        // For example, change the color, trigger events, etc.
        object.material.color.set(0xff0000);
    }
    





    
}