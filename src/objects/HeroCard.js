import Phaser from "phaser";

export default class HeroCard {

    constructor(scene, hero, x, y) {

        this.scene = scene;
        this.hero = hero;

        this.container = scene.add.container(x, y);

        this.create();

    }
    setOnClick(callback) {
        this.onClick = callback;
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
        ).setOrigin(0).setInteractive({ useHandCursor: true });;

        background.on("pointerup", () => {
            //console.log("Click Hero:", this.hero.name);

            if (this.onClick) {
                this.onClick(this.hero);
            }
        });

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
            this.hero.name, {
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );

        // Level
        const level = this.scene.add.text(
            100,
            45,
            `Lv. ${this.hero.level}`, {
                fontSize: "18px",
                color: "#ffd700"
            }
        );

        // HP
        const hp = this.scene.add.text(
            100,
            70,
            `HP : ${this.hero.hp}`, {
                fontSize: "16px",
                color: "#7CFC00"
            }
        );
        //console.log("Hero EXP:", this.hero.experience);

        // Experience
        const experience = this.scene.add.text(
            360,
            70,
            `EXP : ${this.hero.experience || 0}`, {
                fontSize: "16px",
                color: "#87ceeb"
            }
        );


        // Attack
        const atk = this.scene.add.text(
            220,
            70,
            `ATK : ${Math.round(Number(this.hero.attack_physical || 0))}`, {
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
            experience,
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