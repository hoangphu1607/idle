import Phaser from "phaser";
import MenuUI from "../ui/MenuUI";

export default class MenuScene extends Phaser.Scene {

    constructor() {
        super("MenuScene");
    }

    create() {
        this.menuUI = new MenuUI(this);

    }

}