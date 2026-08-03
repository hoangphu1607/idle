import Phaser from "phaser";

export default class BattleCell {

    constructor(scene, x, y, size) {

        this.scene = scene;

        this.rect = scene.add.rectangle(
            x,
            y,
            size,
            size,
            0xdddddd
        )
        .setOrigin(0)
        .setStrokeStyle(2, 0x999999);

    }

}