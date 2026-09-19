import Phaser from "phaser";
import BottomNavigation from "../ui/BottomNavigation.js";
import HeroScreen from "./HeroScreen.js";
import HeroDetailPopup from "./HeroDetailPopup.js";
import ContentScene from "./ContentScene.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        const width_device = this.cameras.main.width;
        const height_device = this.cameras.main.height;


        // 1. Khởi tạo HeroScreen TRƯỚC
        this.heroScreen = new HeroScreen(this);
        this.heroDetailPopup = new HeroDetailPopup(this);

        // 2. Khởi tạo BottomNavigation SAU (truyền 'this' là GameScene đã có sẵn heroScreen)
        this.bottomNavigation = new BottomNavigation(this);
        this.bottomNavigation.select("headquarters");

        this.scene.start("MenuScene");
    }
}