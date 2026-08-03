import BaseScene from "./base/BaseScene";

import { CONTENTS } from "../assets/data/contents";
import ContentCard from "../objects/ContentCard";
import HeroSelectPopup from "../ui/HeroSelectPopup";

export default class ContentScene extends BaseScene {

    constructor() {
        super("ContentScene");
    }

    create() {
        this.createBackground();
        
        this.createBottomNavigation("battle");
        this.heroSelectPopup = new HeroSelectPopup(this);

        // this.add.rectangle(
        //     this.scale.width / 2,
        //     this.scale.height / 2,
        //     this.scale.width - 60,
        //     this.scale.height - 250,
        //     0xbfe3ff
        // );

        const startX = 55;
        const startY = 120;

        const gapX = 280;
        const gapY = 110;

        CONTENTS.forEach((content,index)=>{

            const col = index % 2;
            const row = Math.floor(index / 2);

            const card = new ContentCard(
                this,
                content,
                startX + col * gapX,
                startY + row * gapY
            );

        });

    }

}