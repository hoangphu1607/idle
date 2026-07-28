import Phaser from "phaser";
import MenuUI from "../ui/MenuUI";

export default class MenuScene extends Phaser.Scene {

    constructor() {
        super("MenuScene");
    }

    create() {
        
        const width_device = this.cameras.main.width;
        const height_device = this.cameras.main.height;

        this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(width_device, height_device);
        this.menuUI = new MenuUI(this);

    }

}