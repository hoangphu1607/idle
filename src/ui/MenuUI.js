import Phaser from "phaser";
import BottomNavigation from "./BottomNavigation.js";
export default class MenuUI {

    constructor(scene) {
        this.scene = scene;
        this.bottomNavigation = new BottomNavigation(scene);
        this.create();
    }

    create() {

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        const ps_Btn_x = width / 2;
        const ps_Btn_y = height * 0.8;

        // Button
        this.button = this.scene.add.image(
            ps_Btn_x,
            ps_Btn_y,
            "btnUI"
        ).setScale(0.8);

        this.button.setInteractive();

        // Text
        this.buttonText = this.scene.add.text(
            ps_Btn_x,
            ps_Btn_y,
            "START",
            {
                fontSize: "36px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // Click
        this.button.on("pointerup", () => {

            //console.log("Start Game");

            this.scene.scene.start("GameScene");

        });

    }

}