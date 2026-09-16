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
        bg,
        onClick = null
    }) {

        this.scene = scene;
        this.onClick = onClick;
        this.bg = bg;

        this.container = scene.add.container(x, y);

        this.create(width, height, icon, title, subtitle, bg);
    }

    create(width, height, iconKey, title, subtitle, bgKey) {

        // Background
        const texture = this.scene.textures.get(bgKey);
        const source = texture.getSourceImage();
        const scale = Math.max(width / source.width, height / source.height);

        // Show the card as a fixed-size window over the background image.
        this.background = this.scene.add.tileSprite(
            0,
            0,
            width,
            height,
            bgKey
        )
        .setOrigin(0)
        .setTileScale(scale, scale);

        // Icon
        this.icon = this.scene.add.image(
            40,
            height / 2,
            iconKey
        )
        .setDisplaySize(48, 48);

        // Title
        this.title = this.scene.add.text(
            width - 20,
            22,
            title,
            {
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(1, 0);

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

                this.background.setTint(0xeeeeee);

            })
            .on("pointerout", () => {

                this.background.clearTint();

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