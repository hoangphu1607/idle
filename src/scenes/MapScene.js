import Phaser from "phaser";
import BaseScene from "./base/BaseScene";
import MapCard from "../objects/MapCard";

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
                icon: "map-forest",
                title: "Jungle",
                tier: "Tier 1 - 3",
                bg: "map-forest"
            },
            {
                icon: "map-swamp",
                title: "Swamp",
                tier: "Tier 2 - 5",
                bg: "map-swamp"
            },
            {
                icon: "map-desert",
                title: "Desert",
                tier: "Tier 3 - 6",
                bg: "map-desert"
            },
            {
                icon: "map-plateau",
                title: "Plateau",
                tier: "Tier 5 - 8",
                bg: "map-plateau"
            },
            {
                icon: "map-snow",
                title: "Snow",
                tier: "Tier 5 - 8",
                bg: "map-snow"
            }
        ];

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

                    console.log(map.title);
                    this.scene.start("ContentScene");


                }
            });

        });
    }

}