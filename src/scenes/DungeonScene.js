import Phaser from "phaser";
import DataManager from "../managers/DataManager";

export default class DungeonScene extends Phaser.Scene {

    constructor() {
        super("DungeonScene");
    }

    create() {

        this.dataManager = new DataManager(this);
        this.dataManager.init();

        console.log(this.dataManager.getMonster(1));

    }

}