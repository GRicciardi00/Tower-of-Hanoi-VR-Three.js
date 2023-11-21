import * as THREE from 'three';

export default class Floor {
    constructor(radius, height, color,  innerRadius = 1) {

        this.geometry = new THREE.CylinderGeometry( radius, radius, height, 32 ); 
        this.material = new THREE.MeshBasicMaterial( {color: color} ); 
        this.cylinder = new THREE.Mesh( this.geometry, this.material ); 



/*
    this.outerCylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    this.outerCylinderMaterial = new THREE.MeshBasicMaterial({ color: color });
    this.outerCylinder = new THREE.Mesh(this.outerCylinderGeometry, this.outerCylinderMaterial);


    this.holeGeometry = new THREE.RingGeometry(innerRadius, 2, 32);
    this.holeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.hole = new THREE.Mesh(this.holeGeometry, this.holeMaterial);

    this.cylinderWithHole = new THREE.Group();
    this.cylinderWithHole.add(this.outerCylinder);
    this.cylinderWithHole.add(this.hole);*/

    }

}
