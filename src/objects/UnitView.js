import Phaser from "phaser";

export default class UnitView {

    constructor(scene, unit, x, y, cellSize) {

        this.scene = scene;
        this.unit = unit;
        this.cellSize = cellSize;

        this.container = scene.add.container(x, y);

        this.create();

    }

    create() {

        // Avatar
        this.sprite = this.scene.add.image(
            0,
            0,
            this.unit.avatar
        );

        this.sprite.setDisplaySize(
            this.cellSize - 8,
            this.cellSize - 8
        );

        // HP Background
        this.hpBg = this.scene.add.rectangle(
            0,
            -this.cellSize / 2 - 8,
            this.cellSize,
            6,
            0x333333
        );
        this.mpBg = this.scene.add.rectangle(
            0,
            -this.cellSize / 2,
            this.cellSize,
            6,
            0x333333
        );

        // HP Fill
        this.hpBar = this.scene.add.rectangle(
            -this.cellSize / 2,
            -this.cellSize / 2 - 8,
            this.cellSize,
            6,
            0xff3333
        ).setOrigin(0, 0.5);
        this.mpBar = this.scene.add.rectangle(
            -this.cellSize / 2,
            -this.cellSize / 2,
            this.cellSize,
            6,
            0x3399ff
        ).setOrigin(0, 0.5);

        // Level
        this.level = this.scene.add.text(
            -this.cellSize / 2,
            this.cellSize / 2 - 14,
            `Lv.${this.unit.level}`,
            {
                fontSize: "12px",
                color: "#ffffff"
            }
        );

        this.container.add([
            this.hpBg,
            this.hpBar,

            this.mpBg,
            this.mpBar,

            this.sprite,
            this.level
        ]);

        this.sprite.setInteractive({ useHandCursor: true });

        this.sprite.on("pointerup", () => {
            console.log(this.unit);
        });

    }

    refresh() {

        const hpPercent = this.unit.hp / this.unit.maxHp;
        const mpPercent = this.unit.mp / this.unit.maxMp;

        this.hpBar.width = this.cellSize * hpPercent;
        this.mpBar.width = this.cellSize * mpPercent;

    }

    moveTo(x, y, duration = 300) {

        this.scene.tweens.add({
            targets: this.container,
            x,
            y,
            duration
        });

    }

    destroy() {

        this.container.destroy(true);

    }

}