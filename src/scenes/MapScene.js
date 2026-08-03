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
                icon: "safe-zone",
                title: "Safe Zone",
                tier: "Tier 1 - 3"
            },
            {
                icon: "yellow-zone",
                title: "Yellow Zone",
                tier: "Tier 2 - 5"
            },
            {
                icon: "red-zone",
                title: "Red Zone",
                tier: "Tier 3 - 6"
            },
            {
                icon: "black-zone",
                title: "Black Zone",
                tier: "Tier 5 - 8"
            }
        ];

        maps.forEach((map, index) => {

            const card = new MapCard(this, {
                x: 40,
                y: 150 + index * 110,
                width: this.scale.width - 80,
                height: 80,
                icon: map.icon,
                title: map.title,
                subtitle: map.tier,
                onClick: () => {

                    console.log(map.title);
                    this.scene.start("ContentScene");


                }
            });

        });
    }

}