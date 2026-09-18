import Phaser from "phaser";
import BaseScene from "./base/BaseScene";
import MapCard from "../objects/MapCard";
import HeroSelectPopup from "../ui/HeroSelectPopup";

export default class MapScene extends BaseScene {

    constructor() {
        super("MapScene");
    }

    create() {

        const width = this.scale.width;
        const height = this.scale.height;

        // Background tạm
        this.add.image(0, 0, "bg")
            .setOrigin(0)
            .setDisplaySize(width, height);

        this.add.text(
            width / 2,
            100,
            "MAP SELECT",
            {
                fontSize: "42px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        // Bottom Menu
        this.createBackground();

        this.createBottomNavigation("battle");

        const maps = [
            {
                id: "jungle",
                icon: "map-forest",
                title: "Jungle",
                tier: "Tier 1 - 3",
                bg: "map-forest",
                content: "open world"
            },
            {
                id: "swamp",
                icon: "map-swamp",
                title: "Swamp",
                tier: "Tier 2 - 5",
                bg: "map-swamp",
                content: "open world"
            },
            {
                id: "desert",
                icon: "map-desert",
                title: "Desert",
                tier: "Tier 3 - 6",
                bg: "map-desert",
                content: "open world"
            },
            {
                id: "plateau",
                icon: "map-plateau",
                title: "Plateau",
                tier: "Tier 5 - 8",
                bg: "map-plateau",
                content: "open world"
            },
            {
                id: "snow",
                icon: "map-snow",
                title: "Snow",
                tier: "Tier 5 - 8",
                bg: "map-snow",
                content: "open world"
            }
        ];
        
        this.heroSelectPopup = new HeroSelectPopup(this);
        maps.forEach((map, index) => {

            const card = new MapCard(this, {
                x: 40,
                y: 200 + index * 165,
                width: this.scale.width - 80,
                height: 150,
                icon: map.icon,
                title: map.title,
                subtitle: map.tier,
                bg: map.bg,
                onClick: () => {
                    
                    //console.log(map.title);
                    this.heroSelectPopup.show(map.content);


                }
            });

        });
    }

}