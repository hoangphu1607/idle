import { HEROES } from "../assets/data/heroes.js";
import HeroCard from "../objects/HeroCard";
export default class HeroScreen {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(0, 0);

        this.container.setVisible(false);

        // background

        const bg = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.7
        ).setOrigin(0);

        this.container.add(bg);
        this.createHeroList();

    }


    show() {

        this.container.setVisible(true);

    }

    hide() {

        this.container.setVisible(false);

    }
    

    createHeroList() {

        HEROES.forEach((hero, index) => {

            const card = new HeroCard(
                this.scene,
                hero,
                20,
                30 + index * 120
            );
            card.setOnClick((hero) => {

                this.scene.heroDetailPopup.show(hero);

            });

            this.container.add(card.container);

        });

    }

}