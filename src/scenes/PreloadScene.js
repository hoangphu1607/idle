import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super("PreloadScene");
    }

    preload() {
        // this.load.json("monsters", "assets/data/monsters.json");
        // this.load.json("heroes", "assets/data/heroes.json");
        // this.load.json("items", "assets/data/items.json");
        // this.load.json("stages", "assets/data/stages.json");
    }

    create() {
        this.scene.start("DungeonScene");
    }

}