import Phaser from "phaser";

export default class HeroSelectCard {

    constructor(scene, hero, x, y) {

        this.scene = scene;
        this.hero = hero;
        this.selected = false;

        this.container = scene.add.container(x, y);

        this.create();

    }

    create() {

        // Background
        this.background = this.scene.add.rectangle(
            0,
            0,
            90,
            100,
            0xffffff
        )
        .setOrigin(0)
        .setStrokeStyle(2, 0x999999)
        .setInteractive({ useHandCursor: true });

        // Avatar
        this.avatar = this.scene.add.image(
            45,
            28,
            this.hero.avatar
        );

        this.avatar.setDisplaySize(42, 42);

        // Name
        this.name = this.scene.add.text(
            45,
            60,
            this.hero.name,
            {
                fontSize: "16px",
                color: "#000"
            }
        ).setOrigin(0.5);

        // Level
        this.level = this.scene.add.text(
            45,
            80,
            `Lv ${this.hero.level}`,
            {
                fontSize: "14px",
                color: "#444"
            }
        ).setOrigin(0.5);

        // Experience
        this.experience = this.scene.add.text(
            45,
            96,
            `EXP ${this.hero.experience || 0}`,
            {
                fontSize: "12px",
                color: "#444"
            }
        ).setOrigin(0.5);

        // Tick
        this.check = this.scene.add.text(
            78,
            14,
            "✓",
            {
                fontSize: "22px",
                color: "#00aa00"
            }
        ).setOrigin(0.5);

        this.check.setVisible(false);

        this.container.add([
            this.background,
            this.avatar,
            this.name,
            this.level,
            this.experience,
            this.check
        ]);

        this.background.on("pointerup", () => {

            this.onClick?.(this.hero);

        });

    }

    setSelected(value) {

        this.selected = value;

        this.check.setVisible(value);

        this.background.setFillStyle(
            value ? 0xd9ffd9 : 0xffffff
        );

    }

    setOnClick(callback) {

        this.onClick = callback;

    }

}