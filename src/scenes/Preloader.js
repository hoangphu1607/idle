import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {

    constructor() {
        super("Preloader");
    }

    preload() {
        this.load.image("bg", "src/assets/bg.png");
        this.load.image("wizard", "src/assets/wizard.png");
        this.load.image("btnUI", "src/assets/system/btnUI.png");
        this.load.image("home", "src/assets/system/home.png");
    }

    create() {
        this.scene.start("MenuScene");
        
    }
}