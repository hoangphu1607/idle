import Phaser from "phaser";

export default class MapCard {

    constructor(scene, {
        x = 0,
        y = 0,
        width = 600,
        height = 90,
        icon,
        title,
        subtitle,
        onClick = null
    }) {

        this.scene = scene;
        this.onClick = onClick;

        this.container = scene.add.container(x, y);

        this.create(width, height, icon, title, subtitle);
    }

    create(width, height, iconKey, title, subtitle) {

        // Background
        this.background = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0xd9d9d9
        ).setOrigin(0);

        // Icon
        this.icon = this.scene.add.image(
            40,
            height / 2,
            iconKey
        )
        .setDisplaySize(48, 48);

        // Title
        this.title = this.scene.add.text(
            90,
            22,
            title,
            {
                fontSize: "22px",
                color: "#222222",
                fontStyle: "bold"
            }
        );

        // Subtitle
        this.subtitle = this.scene.add.text(
            90,
            48,
            subtitle,
            {
                fontSize: "18px",
                color: "#555555"
            }
        );

        this.container.add([
            this.background,
            this.icon,
            this.title,
            this.subtitle
        ]);

        // Click
        this.background
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.background.setFillStyle(0xeeeeee);

            })
            .on("pointerout", () => {

                this.background.setFillStyle(0xd9d9d9);

            })
            .on("pointerup", () => {

                this.onClick?.();

            });
    }

    setLocked(lock) {

        this.container.setAlpha(lock ? 0.5 : 1);

    }

    setVisible(value) {

        this.container.setVisible(value);

    }

    destroy() {

        this.container.destroy(true);

    }

}