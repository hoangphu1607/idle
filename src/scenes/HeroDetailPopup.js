export default class HeroDetailPopup {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);

        const overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.6
        ).setOrigin(0);

        const panel = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height / 2,
            550,
            700,
            0xffffff
        );

        this.avatar = scene.add.image(
            scene.scale.width / 2,
            300,
            "wizard"
        );

        this.avatar.setScale(0.8);

        this.name = scene.add.text(
            scene.scale.width / 2,
            500,
            "",
            {
                fontSize: "36px",
                color: "#000"
            }
        ).setOrigin(0.5);

        this.level = scene.add.text(
            scene.scale.width / 2,
            560,
            "",
            {
                fontSize: "24px",
                color: "#000"
            }
        ).setOrigin(0.5);

        overlay.setInteractive();

        overlay.on("pointerup", () => {

            this.hide();

        });

        this.container.add([
            overlay,
            panel,
            this.avatar,
            this.name,
            this.level
        ]);

    }

    show(hero){

        this.avatar.setTexture(hero.avatar);
        this.name.setText(hero.name);
        this.level.setText("Lv. " + hero.level);

        this.container.setVisible(true);

    }

    hide(){

        this.container.setVisible(false);

    }

}