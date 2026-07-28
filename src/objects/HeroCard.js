import Phaser from "phaser";

export default class HeroCard {

    constructor(scene, hero, x, y) {

        this.scene = scene;
        this.hero = hero;

        this.container = scene.add.container(x, y);

        this.create();

    }

    create() {
        // const width = this.cameras.main.width;
        // const height = this.cameras.main.height;
        // Background
        const width = this.scene.scale.width;

        const background = this.scene.add.rectangle(
            0,
            0,
            width - 40,
            100,
            0x444444
        ).setOrigin(0);

        // Avatar
        const avatar = this.scene.add.image(
            50,
            50,
            this.hero.avatar
        );

        avatar.setDisplaySize(64, 64);

        // Name
        const name = this.scene.add.text(
            100,
            15,
            this.hero.name,
            {
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );

        // Level
        const level = this.scene.add.text(
            100,
            45,
            `Lv. ${this.hero.level}`,
            {
                fontSize: "18px",
                color: "#ffd700"
            }
        );

        // HP
        const hp = this.scene.add.text(
            100,
            70,
            `HP : ${this.hero.hp}`,
            {
                fontSize: "16px",
                color: "#7CFC00"
            }
        );

        // Attack
        const atk = this.scene.add.text(
            220,
            70,
            `ATK : ${this.hero.attack}`,
            {
                fontSize: "16px",
                color: "#ff6666"
            }
        );

        this.container.add([
            background,
            avatar,
            name,
            level,
            hp,
            atk
        ]);

    }

    setSelected(selected) {

        const bg = this.container.list[0];

        if (selected) {
            bg.setFillStyle(0x6666ff);
        } else {
            bg.setFillStyle(0x444444);
        }

    }

    setHero(hero) {

        this.hero = hero;

        // Sau này dùng để refresh dữ liệu
    }

    destroy() {

        this.container.destroy(true);

    }

}