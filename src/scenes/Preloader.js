import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {

    constructor() {
        super("Preloader");
    }

    preload() {
        this.load.image("bg", "src/assets/bg.png");
    }

    create() {
        this.scene.start("GameScene");
    }
}