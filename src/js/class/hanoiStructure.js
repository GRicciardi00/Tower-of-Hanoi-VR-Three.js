import { Disk, MainStructure } from './geometry';

/**
 * Class representing the game structure for the Tower of Hanoi game.
 */
export class GameStructure {
  /**
   * Create a new instance of the game structure.
   */
  constructor() {
    this.textureBase = "../../assets/textures/wood_base.jpg";
    this.textureCylindre = "../../assets/textures/wood_cylindre.jpg";
    this.textureDisk = "../../assets/textures/wood_disk.jpg";
  }

  /**
   * Initialize the Tower of Hanoi game with the main structure and disks.
   * @param {THREE.Scene} scene - The scene in which to initialize the game.
   * @returns {Object} An object containing references to the main structure and disks.
   */
  initializeTowerOfHanoiGame(scene) {
    // Example initialization logic (customize as needed)
    const mainStructure = new MainStructure(5, 1, 0.1, 0.05, 0.7, this.textureBase, this.textureCylindre)

   
    const disk1 = new Disk(0.6, undefined, undefined, this.textureDisk);
    const disk2 = new Disk(0.4, undefined, undefined, this.textureDisk);
    const disk3 = new Disk(0.2, undefined, undefined, this.textureDisk);

    let leftCylinderPosition = mainStructure.getLeftCylinderPosition();
    let centerCylinderPosition = mainStructure.getCenterCylinderPosition();
    let rightCylinderPosition = mainStructure.getRightCylinderPosition();

    const baseHeight = mainStructure.getHeightBase();
    const diskHeight = disk1.getHeightDisk();

    disk1.setPosition(leftCylinderPosition.x, baseHeight - diskHeight / 2 , 0);
    disk2.setPosition(leftCylinderPosition.x, baseHeight + diskHeight / 2 , 0)
    disk3.setPosition(leftCylinderPosition.x, baseHeight +   3 * diskHeight / 2, 0)
    mainStructure.setPosition(0, 0, 0);


    scene.add(mainStructure.mainStructure);
    scene.add(disk1.mesh);
    scene.add(disk2.mesh);
    scene.add(disk3.mesh);

    // Return references to the main structure and disks
    return {
      mainStructure: mainStructure,
      disks: [disk1, disk2, disk3]
    };
  }

  
}
