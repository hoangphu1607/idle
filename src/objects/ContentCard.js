import Phaser from "phaser";
export default class ContentCard {

    constructor(scene, content, x, y) {

        this.scene = scene;
        this.content = content;

        this.container = scene.add.container(x, y);

        this.create();
    }

    create() {

        const width = 250;
        const height = 90;

        this.background = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0xd9d9d9
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });

        this.icon = this.scene.add.image(
            35,
            height / 2,
            this.content.icon
        )
            .setDisplaySize(50, 50);

        this.title = this.scene.add.text(
            75,
            height / 2,
            this.content.name,
            {
                fontSize: "20px",
                color: "#222"
            }
        ).setOrigin(0, 0.5);

        this.container.add([
            this.background,
            this.icon,
            this.title
        ]);

        this.background.on("pointerover", () => {

            this.background.setFillStyle(0xcfcfcf);

        });

        this.background.on("pointerout", () => {

            this.background.setFillStyle(0xd9d9d9);

        });
        this.background.on("pointerup", () => {

            //console.log(this.scene.heroSelectPopup);
            this.scene.heroSelectPopup.show(this.content);

        });

    }

}