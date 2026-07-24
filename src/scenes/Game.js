import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        const bg = this.add.image(0, 0, "bg")
            .setOrigin(0);

        bg.setDisplaySize(
            this.scale.width,
            this.scale.height
        );
    }
}