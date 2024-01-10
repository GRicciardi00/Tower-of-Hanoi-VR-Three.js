import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GameStructure } from './hanoiStructure';



export default class Scene{
    constructor() {
    
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);


        this.setUpControls();      
        this.setUpCamera();
        this.setUpAudio();
        this.setUpBackground();
        //this.addAxesHelper();



        // Hanoi Game
        this.gameStructure = new GameStructure();
        this.gameState = this.gameStructure.initializeTowerOfHanoiGame(this.scene);
        

        // Light
        const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
        topLight.position.set(5, 5, 5) //top-left-ish
        topLight.castShadow = true;
        this.scene.add(topLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 5);
        this.scene.add(ambientLight);

      
    }


    addAxesHelper(){
        this.axesHelper = new THREE.AxesHelper(5);
        this.axesHelper.setColors(new THREE.Color(0x0000ff), new THREE.Color(0xffff00), new THREE.Color(0x00ff00)); /**x : bleu y : jaune z : vert */
        this.scene.add(this.axesHelper);
    }

    setUpCamera(){
        this.camera.position.set(0, 1, 2); 
        this.camera.lookAt(0, 0, 0);
    }

    setUpControls(){
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.update();
    }

    setUpAudio(){
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // Create a global audio object
        const audio = new THREE.Audio(listener);

        // Create an AudioLoader
        const audioLoader = new THREE.AudioLoader();

        // Load your soundtrack
        audioLoader.load('../../assets/sakura.mp3', (buffer) => {
            audio.setBuffer(buffer);
            audio.setLoop(true);
            audio.setVolume(2); 
            audio.play();
        });
    }
  

    setUpBackground(){
        const loader = new GLTFLoader();
        loader.load('../../assets/models/back.glb', 
            (gltf) => {
                const model = gltf.scene;
                model.position.z = 1
                this.scene.add(model);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Erreur lors du chargement du modèle :', error);
            }
        );
    }


}






