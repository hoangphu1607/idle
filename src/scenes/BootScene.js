import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {

    constructor() {
        super("BootScene");
    }

    create() {

        this.add.text(
            360,
            640,
            "Hello Idle Game",
            {
                fontSize: "40px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

    }

}