import Phaser from "phaser";
import BottomNavigation from "../ui/BottomNavigation";
import HeroScreen from "./HeroScreen";
import HeroDetailPopup from "./HeroDetailPopup";


export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }


    create() {
        const width_device = this.cameras.main.width;
        const height_device = this.cameras.main.height;

        this.add.image(0, 0, "sky").setOrigin(0, 0).setDisplaySize(width_device, height_device);
        this.heroScreen = new HeroScreen(this);
        this.bottomNavigation = new BottomNavigation(this);
        this.bottomNavigation.select("headquarters");
        this.heroDetailPopup = new HeroDetailPopup(this);
    }

}