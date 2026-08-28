import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {

    constructor() {
        super("Preloader");
    }

    preload() {
        this.load.image("bg", "src/assets/bg/bg.png");
        this.load.image("btnUI", "src/assets/system/btnUI.png");
        this.load.image("home", "src/assets/system/home.png");
        this.load.image("sky", "src/assets/bg/sky.png");

        //Load champ
        this.load.image("wizard", "src/assets/champ/wizard.png");
        this.load.image("mace", "src/assets/champ/mace.png");
        this.load.image("hunter", "src/assets/champ/hunter.png");

        //load icon
        this.load.image("sword", "src/assets/icon/sword.png");
        this.load.image("safe-zone", "src/assets/icon/safe-zone.png");
        this.load.image("yellow-zone", "src/assets/icon/yellow-zone.png");
        this.load.image("red-zone", "src/assets/icon/red-zone.png");
        this.load.image("black-zone", "src/assets/icon/black-zone.png");
        this.load.image("roaming", "src/assets/icon/roaming.png");
        this.load.image("gather", "src/assets/icon/gather.png");
        this.load.image("dungeon_solo", "src/assets/icon/dungeon-solo.png");
        this.load.image("dungeon_group", "src/assets/icon/dungeon-group.png");

        //Monster
        this.load.image("monster_slime", "src/assets/monster/monster_slime.png");
        this.load.image("monster_wolf", "src/assets/monster/monster_wolf.png");
        this.load.image("monster_orc", "src/assets/monster/monster_orc.png");

        //Skill
        this.load.image("Mage_first_skill", "src/assets/skills/Mage_first_skill.png");

    }

    create() {
        this.scene.start("GameScene");

    }
}