import Phaser from "phaser";
import MenuUI from "../ui/MenuUI.js";
import HeroScreen from "./HeroScreen.js";
import HeroDetailPopup from "./HeroDetailPopup.js";
import BaseScene from "./base/BaseScene.js";
import SaveManager from "../managers/SaveManager.js";


import MenuButton from "../objects/MenuButton.js";
export default class MenuScene extends BaseScene  {

    constructor() {
        super("MenuScene");
    }

    create() {
        const width_device = this.cameras.main.width;
        const height_device = this.cameras.main.height;
        this.add.image(0, 0, "bg").setOrigin(0, 0).setDisplaySize(width_device, height_device);

        // 1. Khởi tạo HeroScreen TRƯỚC
        this.heroScreen = new HeroScreen(this);
        this.heroDetailPopup = new HeroDetailPopup(this);

        // 2. Khởi tạo BottomNavigation SAU
        // (BottomNavigation sẽ nhận 'this' chính là MenuScene - nơi đã có this.heroScreen)
        this.createBottomNavigation("headquarters");

        //Menu
        this.menuContainer = this.add.container(0, 0);
        const btnPlay = new MenuButton(this, {
            x: 40,
            y: 100,
            width: width_device - 80,
            height: 80,
            icon: "sword",
            text: "Play",
            onClick: () => {
                //console.log("Play");
                this.scene.start("MapScene");
            }
        });

        const btnInventory = new MenuButton(this, {
            x: 40,
            y: 200,
            width: width_device - 80,
            height: 80,
            icon: "icon_bag",
            text: "Inventory",
            onClick: () => {
                //console.log("Inventory");
                this.scene.start("InventoryScene");
            }
        });

        const btnHeroes = new MenuButton(this, {
            x: 40,
            y: 300,
            width: width_device - 80,
            height: 80,
            icon: "icon_hero",
            text: "Heroes",
            onClick: () => {
                if (this.heroScreen && typeof this.heroScreen.show === "function") {
                    this.menuContainer.setVisible(false);
                    this.heroScreen.show();
                } else {
                    console.warn("heroScreen chưa được khởi tạo!");
                }
            }
        });

        const iconCoin = this.add.image(width_device - 15, 35, "icon_coin").setOrigin(1, 0).setScale(0.5);
        const coinText = this.add.text(width_device - 50, 40, SaveManager.get("player.gold").toString(), { fontSize: "24px", fill: "#fff" }).setOrigin(1, 0);
        this.events.on("updateCoin", (newCoinValue) => {
            coinText.setText(newCoinValue.toString());
        });

        this.menuContainer.add(btnPlay.container);
        this.menuContainer.add(btnInventory.container);
        this.menuContainer.add(btnHeroes.container);
        this.menuContainer.add(iconCoin);
        this.menuContainer.add(coinText);

    }

}