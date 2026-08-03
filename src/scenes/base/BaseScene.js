import Phaser from "phaser";
import BottomNavigation from "../../ui/BottomNavigation";

export default class BaseScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    createBackground(texture = "bg") {

        this.add.image(0, 0, texture)
            .setOrigin(0)
            .setDisplaySize(
                this.scale.width,
                this.scale.height
            );

    }

    createBottomNavigation(selectedTab = "headquarters") {

        this.bottomNavigation = new BottomNavigation(this);
        this.bottomNavigation.select(selectedTab);

    }

}