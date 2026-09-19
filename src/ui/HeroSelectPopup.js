import HeroSelectCard from "../objects/HeroSelectCard";
import { HEROES } from "../assets/data/heroes";
import SaveManager from "../managers/SaveManager";

export default class HeroSelectPopup {

    constructor(scene) {

        this.scene = scene;

        this.selectedHeroes = [];
        this.maxSelect = 8;
        this.minSelect = 1;
        this.cards = [];

        this.container = scene.add.container(0, 0);

        this.container.setDepth(9);
        this.container.setVisible(false);

        this.create();

    }

    create() {
        this.panelWidth = 520;
        this.panelHeight = 700;

        const overlay = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.6
        ).setOrigin(0);

        const panel = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.panelWidth,
            this.panelHeight,
            0xffffff
        );

        const title = this.scene.add.text(
            this.scene.scale.width / 2,
            170,
            "HERO",
            {
                fontSize: "26px",
                color: "#000"
            }
        ).setOrigin(0.5);

        this.container.add([
            overlay,
            panel,
            title
        ]);
        this.txtCount = this.scene.add.text(
            500,
            295,
            "0 / 1",
            {
                fontSize: "20px",
                color: "#ff6600",
                fontStyle: "bold"
            }
        );

        this.container.add(this.txtCount);
        this.createHeroGrid();

        // Confirm Button
        this.btnConfirm = this.scene.add.image(
            this.scene.scale.width / 2,
            860,
            "btnUI"
        )
            .setInteractive({ useHandCursor: true });
        this.btnConfirm.setScale(0.45);

        this.defaultScale = 0.45;


        // Text
        this.btnConfirmText = this.scene.add.text(
            this.btnConfirm.x,
            this.btnConfirm.y,
            "CONFIRM",
            {
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.container.add([
            this.btnConfirm,
            this.btnConfirmText
        ]);

        this.btnConfirm.on("pointerover", () => {

            this.btnConfirm.setScale(this.defaultScale * 1.05);

        });

        this.btnConfirm.on("pointerout", () => {

            this.btnConfirm.setScale(this.defaultScale);

        });

        this.btnConfirm.on("pointerdown", () => {

            this.btnConfirm.setScale(this.defaultScale * 0.95);

        });

        this.btnConfirm.on("pointerup", () => {

            this.btnConfirm.setScale(this.defaultScale * 1.05);

            if (this.selectedHeroes.length < this.minSelect) {

                //console.log(`Cần chọn ít nhất ${this.minSelect} Hero`);

                return;
            }

            //console.log(this.selectedHeroes);

            this.hide();
            this.scene.scene.start("BattleScene", {
                heroes: this.selectedHeroes,
                content: this.content,
                mapId: this.mapId,
                mapName: this.mapName,
            });
        });

    }

    createHeroGrid() {

        const columns = 5;
        const cardWidth = 90;
        const cardHeight = 100;

        const panelLeft = (this.scene.scale.width - this.panelWidth) / 2;

        const startY = 320;

        // Khoảng cách giữa các card
        const gapX =
            (this.panelWidth - columns * cardWidth) / (columns + 1);

        const heroes = SaveManager.loadHeroes(HEROES);

        heroes.forEach((hero, index) => {

            const col = index % columns;
            const row = Math.floor(index / columns);

            const x =
                panelLeft +
                gapX +
                col * (cardWidth + gapX);

            const y =
                startY +
                row * (cardHeight + 15);

            const card = new HeroSelectCard(
                this.scene,
                hero,
                x,
                y
            );

            card.setOnClick((hero) => {

                this.toggleHero(hero, card);

            });

            this.cards.push(card);

            this.container.add(card.container);

        });

    }

    toggleHero(hero, card) {

        if (card.selected) {

            card.setSelected(false);

            this.selectedHeroes =
                this.selectedHeroes.filter(
                    h => h.id !== hero.id
                );

        } else {

            if (this.selectedHeroes.length >= this.maxSelect) {

                return;

            }

            card.setSelected(true);

            this.selectedHeroes.push(hero);

        }

        this.updateCounter();

    }

    show(content, mapId = "jungle", mapName = "Jungle") {

        this.content = content || {};
        this.mapId = mapId;
        this.mapName = mapName;

        switch (this.content) {

            case "open world":
                this.minSelect = 1;
                this.maxSelect = 7;
                break;

            default:
                this.minSelect = 1;
                this.maxSelect = 1;
                break;

        }

        this.selectedHeroes = [];

        this.cards.forEach(card => {

            card.setSelected(false);

        });

        this.updateCounter();

        this.container.setVisible(true);

    }

    updateCounter() {

        this.txtCount.setText(
            `${this.selectedHeroes.length} / ${this.maxSelect}`
        );

    }
    hide() {

        this.container.setVisible(false);

    }



}