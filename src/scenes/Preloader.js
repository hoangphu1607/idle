import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {

    constructor() {
        super("Preloader");
    }

    preload() {
        this.load.image("bg", "src/assets/bg/bg.png");
        this.load.image("btnUI", "src/assets/system/btnUI.png");
        this.load.image("home", "src/assets/system/home.png");
        this.load.image("sky", "src/assets/bg/sky.png");
        
        //Load champ
        this.load.image("wizard", "src/assets/champ/wizard.png");
        this.load.image("mace", "src/assets/champ/mace.png");
        this.load.image("hunter", "src/assets/champ/hunter.png");

    }

    create() {
        this.scene.start("GameScene");
        
    }
}