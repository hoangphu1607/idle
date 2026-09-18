import Phaser from "phaser";
import SaveManager from "../managers/SaveManager";

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

        this.hasManaBar = this.unit.team !== "enemy";

        if (this.hasManaBar) {
            this.expText = this.scene.add.text(
                -this.cellSize / 2,
                -this.cellSize / 2 - 28,
                `EXP ${this.unit.experience || 0}`,
                {
                    fontSize: "10px",
                    color: "#87ceeb"
                }
            );
        }

        // HP Background
        this.hpBg = this.scene.add.rectangle(
            0,
            this.cellSize / 2 + 5,
            this.cellSize,
            6,
            0x333333
        );

        // HP Fill
        this.hpBar = this.scene.add.rectangle(
            -this.cellSize / 2,
            this.cellSize / 2 + 5,
            this.cellSize,
            6,
            0xff3333
        ).setOrigin(0, 0.5);

        if (this.hasManaBar) {
            this.mpBg = this.scene.add.rectangle(
                0,
                this.cellSize / 2 + 12,
                this.cellSize,
                6,
                0x333333
            );
            this.mpBar = this.scene.add.rectangle(
                -this.cellSize / 2,
                this.cellSize / 2 + 12,
                this.cellSize,
                6,
                0x3399ff
            ).setOrigin(0, 0.5);
        }

        // Level
        this.level = this.scene.add.text(
            -this.cellSize / 2,
            -this.cellSize / 2 - 16,
            `Lv.${this.unit.level}`,
            {
                fontSize: "12px",
                color: "#ffffff"
            }
        );

        this.container.add([
            this.hpBg,
            this.hpBar,

            this.sprite,
            //this.level
        ]);

        if (this.hasManaBar) {
            this.container.add(this.expText);
        }

        this.container.add(this.level);

        if (this.hasManaBar) {
            this.container.add([this.mpBg, this.mpBar]);
        }

        this.sprite.setInteractive({ useHandCursor: true });

        this.sprite.on("pointerup", () => {
            //console.log(this.unit);
        });

    }

    refresh() {

        if (this.hasManaBar && this.unit.id !== undefined) {
            const savedHero = SaveManager.get(`heroes.${this.unit.id}`, {});
            const experience = savedHero.experience ?? this.unit.experience ?? 0;

            this.unit.experience = experience;
            this.expText.setText(`EXP ${experience}`);

            const level = savedHero.level ?? this.unit.level ?? 1;
            this.unit.level = level;
            this.level.setText(`Lv.${level}`);
        }

        const hpPercent = this.unit.hp / this.unit.maxHp;

        this.hpBar.width = this.cellSize * hpPercent;

        if (this.hasManaBar) {
            const mpPercent = this.unit.mp / this.unit.maxMp;
            this.mpBar.width = this.cellSize * mpPercent;
        }

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