import Phaser from "phaser";

export default class MenuButton {

    constructor(scene, {
        x = 0,
        y = 0,
        width = 300,
        height = 80,
        icon,
        text,
        backgroundColor = 0xd9d9d9,
        onClick = null
    }) {

        this.scene = scene;
        this.onClick = onClick;

        this.container = scene.add.container(x, y);

        this.create(
            width,
            height,
            icon,
            text,
            backgroundColor
        );
    }

    create(width, height, iconKey, text, backgroundColor) {

        // Background
        this.background = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            backgroundColor
        ).setOrigin(0);

        // Icon
        this.icon = this.scene.add.image(
            35,
            height / 2,
            iconKey
        )
        .setOrigin(0.5)
        .setDisplaySize(40, 40);

        // Text
        this.label = this.scene.add.text(
            80,
            height / 2,
            text,
            {
                fontSize: "24px",
                color: "#222",
                fontFamily: "Arial"
            }
        ).setOrigin(0, 0.5);

        this.container.add([
            this.background,
            this.icon,
            this.label
        ]);

        // Interactive
        this.background
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.background.setFillStyle(0xcfcfcf);

            })
            .on("pointerout", () => {

                this.background.setFillStyle(backgroundColor);

            })
            .on("pointerdown", () => {

                this.background.setScale(0.98);

            })
            .on("pointerup", () => {

                this.background.setScale(1);

                this.onClick?.();

            });

    }

    setText(text) {

        this.label.setText(text);

    }

    setIcon(iconKey) {

        this.icon.setTexture(iconKey);

    }

    setVisible(value) {

        this.container.setVisible(value);

    }

    destroy() {

        this.container.destroy(true);

    }

}