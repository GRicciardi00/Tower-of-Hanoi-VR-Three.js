import Scene from "./class/scene";


const scene = new Scene();



function display() {
    scene.renderer.render(scene.scene, scene.camera);
    scene.updateRaycast();
    requestAnimationFrame(display);

}
display();