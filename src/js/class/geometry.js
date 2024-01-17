import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/**
 * Class representing a disk with a hole in the center.
 */
export class Disk {
  /**
   * Create a disk with a hole.
   * @param {number} id - The id of the disk.
   * @param {number} radius - The radius of the disk.
   * @param {number} holeRadius - The hole radius of the disk (default 0.5).
   * @param {number} height - The height of the disk (default 0.5).
   * @param {string} texturePath - The file path for the disk texture image.
   */
  constructor(id, radius, holeRadius = 0.1, height = 0.1, texturePath) {
    this.id = id;
    this.radius = radius;
    this.holeRadius = holeRadius;
    this.height = height;
    this.texturePath = texturePath;
    this.createDisk();
    this.setDefaultPosition();
  }
  
  /**
   * Create the geometry and material for the disk.
   */
  createDisk() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.texturePath);

    // Create the geometry of the disk
    const diskShape = new THREE.Shape();
    diskShape.moveTo(0, 0);
    diskShape.absarc(0, 0, this.radius, 0, Math.PI * 2, false);

    // Create the geometry of the hole
    const holeShape = new THREE.Path();
    holeShape.moveTo(0, 0);
    holeShape.absarc(0, 0, this.holeRadius, 0, Math.PI * 2, true);

    // Subtract the hole from the disk geometry
    diskShape.holes.push(holeShape);

    // Use ExtrudeGeometry to create the extruded geometry
    const extrudeSettings = {
      depth: this.height, // Extrusion thickness
      bevelEnabled: false, // No bevel to get a flat shape
    };

    const diskGeometry = new THREE.ExtrudeGeometry(diskShape, extrudeSettings);
    
    // Create the material with the  texture
    const diskMaterial = new THREE.MeshBasicMaterial({ map: texture });

    // Create the mesh
    this.mesh = new THREE.Mesh(diskGeometry, diskMaterial);
    this.mesh.userData.id = this.id;
    // Add edges with a line material
    const edgesGeometry = new THREE.EdgesGeometry(diskGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    // Add the edges to the main mesh
    //this.mesh.add(edges);
  }

  setDefaultPosition() {
    this.mesh.rotation.x = -Math.PI / 2; // -90° rotation X axis
    this.mesh.position.set(0, 0, 0);
  }

  /**
   * Set the position of the disk.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} z - The z-coordinate.
   */
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Set the rotation of the disk.
   * @param {number} x - The rotation around the x-axis in radians.
   * @param {number} y - The rotation around the y-axis in radians.
   * @param {number} z - The rotation around the z-axis in radians.
   */
  setRotation(x, y, z) {
    this.mesh.rotation.set(x, y, z);
  }

  /**
   * Get the height of the disk.
   * @returns {number} The height of the disk.
   */
  getHeightDisk() {
    return this.height ;
  }

}




export class MainStructure {
  /**
   * Create the main structure with a base rectangle and three cylinders on top.
   * @param {number} baseWidth - The width of the base rectangle.
   * @param {number} baseDepth - The depth of the base rectangle.
   * @param {number} baseHeight - The height of the base rectangle.
   * @param {number} cylinderRadius - The radius of the cylinders.
   * @param {number} cylinderHeight - The height of the cylinders.
   * @param {string} baseTexturePath - The file path for the base texture image.
   * @param {string} cylinderTexturePath - The file path for the cylinder texture image.
   */
  constructor(baseWidth, baseDepth, baseHeight, cylinderRadius, cylinderHeight, baseTexturePath, cylinderTexturePath) {
    this.baseWidth = baseWidth;
    this.baseDepth = baseDepth;
    this.baseHeight = baseHeight;
    this.cylinderRadius = cylinderRadius;
    this.cylinderHeight = cylinderHeight;
    this.baseTexturePath = baseTexturePath;
    this.cylinderTexturePath = cylinderTexturePath;

    this.createMainStructure();
    this.setDefaultPosition();
  }

  /**
   * Create the geometry and material for the main structure.
   */
  createMainStructure() {
    const loader = new THREE.TextureLoader();

    // Calculate the extended width of the base rectangle
    const extendedWidth = this.baseWidth + 2 * this.cylinderRadius;

    // Calculate the width of each section
    const sectionWidth = this.baseWidth / 3;

    // Load textures
    const baseTexture = loader.load(this.baseTexturePath);
    const cylinderTexture = loader.load(this.cylinderTexturePath);

    // Create the base rectangle geometry with extended sides
    const baseGeometry = new THREE.BoxGeometry(extendedWidth, this.baseHeight, this.baseDepth);
    const baseMaterial = new THREE.MeshBasicMaterial({ map: baseTexture });
    this.baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    this.baseMesh.userData.physics = { mass: 0 };
    // Create the cylinder geometry
    const cylinderGeometry = new THREE.CylinderGeometry(this.cylinderRadius, this.cylinderRadius, this.cylinderHeight, 32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ map: cylinderTexture });

    // Create cylinders and position them in the middle of each section
    this.cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.cylinder1.position.set(-extendedWidth / 2 + this.cylinderRadius + sectionWidth / 2, this.baseHeight / 2 + this.cylinderHeight / 2, 0);
    this.cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.cylinder2.position.set(-extendedWidth / 2 + this.cylinderRadius + sectionWidth + sectionWidth / 2, this.baseHeight / 2 + this.cylinderHeight / 2, 0);
    this.cylinder3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    this.cylinder3.position.set(-extendedWidth / 2 + this.cylinderRadius + 2 * sectionWidth + sectionWidth / 2, this.baseHeight / 2 + this.cylinderHeight / 2, 0);
    // Create a group to hold all the objects
    this.mainStructure = new THREE.Group();
    this.mainStructure.add(this.baseMesh);
    this.mainStructure.add(this.cylinder1);
    this.mainStructure.add(this.cylinder2);
    this.mainStructure.add(this.cylinder3);
  }

  setDefaultPosition() {
    this.mainStructure.position.set(0, 0, 0);
  }

  /**
   * Set the position of the main structure.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {number} z - The z-coordinate.
   */
  setPosition(x, y, z) {
    this.mainStructure.position.set(x, y, z);
  }

  /**
   * Set the rotation of the main structure.
   * @param {number} x - The rotation around the x-axis in radians.
   * @param {number} y - The rotation around the y-axis in radians.
   * @param {number} z - The rotation around the z-axis in radians.
   */
  setRotation(x, y, z) {
    this.mainStructure.rotation.set(x, y, z);
  }

  /**
   * Get the position of the left cylinder.
   * @returns {THREE.Vector3} The position of the left cylinder.
   */
  getLeftCylinderPosition() {
    return this.cylinder1.position.clone();
  }

  /**
   * Get the position of the center cylinder.
   * @returns {THREE.Vector3} The position of the center cylinder.
   */
  getCenterCylinderPosition() {
    return this.cylinder2.position.clone();
  }

  /**
   * Get the position of the right cylinder.
   * @returns {THREE.Vector3} The position of the right cylinder.
   */
  getRightCylinderPosition() {
    return this.cylinder3.position.clone();
  }
  /**
   * Get the height of the base.
   * @returns {number} The height of the base.
   */
  getHeightBase() {
    return this.baseHeight;
  }



}

export class Board {
  constructor(color = 'grey', boardHeight = 1, boardWidth = 1) {
      this.color = color;
      this.boardHeight = boardHeight;
      this.boardWidth = boardWidth;
      this.moves = 0; // Initialize moves
      this.status = 'valid'; // Initialize status

      // Create the board geometry and material
      const boardGeometry = new THREE.PlaneGeometry(this.boardWidth, this.boardHeight);
      const boardMaterial = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide });
      this.board = new THREE.Mesh(boardGeometry, boardMaterial);

      // Create buttons
      this.createButtons();
      this.createText();
  }

  createButtons() {
      // Define button dimensions
      const buttonWidth = 0.6;
      const buttonHeight = 0.2;
      const buttonDepth = 0.1;
      const buttonGeometry = new THREE.BoxGeometry(buttonWidth, buttonHeight, buttonDepth);

      // Example: Exit Button
      const exitMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red color
      this.exit = new THREE.Mesh(buttonGeometry, exitMaterial);
      this.exit.position.set(-this.boardWidth / 2 + buttonWidth, this.boardHeight / 2 - buttonHeight, 0.1);
      

      // Example: Reset Button
      const resetMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // blue color
      this.reset = new THREE.Mesh(buttonGeometry, resetMaterial);
      this.reset.position.set(-this.boardWidth / 2 + 3 * buttonWidth, this.boardHeight / 2 - buttonHeight, 0.1);
      

      const playMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // blue color
      this.play = new THREE.Mesh(buttonGeometry, playMaterial);
      this.play.position.set(-this.boardWidth / 2 + 5 * buttonWidth, this.boardHeight / 2 - buttonHeight, 0.1);

      const loader = new FontLoader();
      loader.load('./assets/helvetiker_regular.typeface.json', (font)=>{
          const textOptions = {
              font: font,
              size: 0.05,
              height: 0.05,
          };
      // Create text geometry for each button
      const exitTextGeometry = new TextGeometry('Exit', textOptions);
      const resetTextGeometry = new TextGeometry('Reset', textOptions);
      const play_pauseTextGeometry = new TextGeometry('Play/Pause', textOptions);

      // Create meshes for the text
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const exitText = new THREE.Mesh(exitTextGeometry, textMaterial);
      const resetText = new THREE.Mesh(resetTextGeometry, textMaterial);
      const playPauseText = new THREE.Mesh(play_pauseTextGeometry, textMaterial);

      // Position the text on the buttons
      exitText.position.set(-0.1, -0.05, 0.05); // Adjust these values as needed
      resetText.position.set(-0.1, -0.05, 0.05);
      playPauseText.position.set(-0.1, -0.05, 0.05);

      // Add the text to the buttons
      console.log(this.exit)
      this.exit.add(exitText);
      this.reset.add(resetText);
      this.play.add(playPauseText);
      });

      this.board.add(this.exit);
      this.board.add(this.reset);
      this.board.add(this.play);
  }

  createText() {
        const loader = new FontLoader();
        loader.load('./assets/helvetiker_regular.typeface.json', (font) => {
            const textOptions = {
                font: font,
                size: 0.3,
                height: 0.05,
            };

            // Moves Text
            const movesTextGeometry = new TextGeometry('Moves maded: ' + this.moves, textOptions);
            const movesTextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const movesText = new THREE.Mesh(movesTextGeometry, movesTextMaterial);
            movesText.position.set(-this.boardWidth / 2, 0, 0); // Adjust position as needed
            this.board.add(movesText);

            // Status Text
            const statusTextGeometry = new TextGeometry('Status: ' + this.status, textOptions);
            const statusTextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const statusText = new THREE.Mesh(statusTextGeometry, statusTextMaterial);
            statusText.position.set(-this.boardWidth / 2, -this.boardHeight / 4, 0); // Adjust position as needed
            this.board.add(statusText);
        });
    }

    // Method to update moves and status
    updateMovesAndStatus(moves, invalid) {
        this.moves = moves;
        if (invalid == true){
          this.status = 'invalid';
        }
        else{
          this.status = 'valid';
        }
    }
}