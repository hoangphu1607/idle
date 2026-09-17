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
        this.load.image("nature", "src/assets/champ/nature.jpg");

        //Load map
        this.load.image("map-forest", "src/assets/bg/map-forest.png");
        this.load.image("map-swamp", "src/assets/bg/map-swamp.jpg");
        this.load.image("map-desert", "src/assets/bg/map-desert.jpg");
        this.load.image("map-snow", "src/assets/bg/map-snow.jpg");
        this.load.image("map-plateau", "src/assets/bg/map-plateau.jpg");

        //load icon
        this.load.image("sword", "src/assets/icon/sword.png");        
        this.load.image("roaming", "src/assets/icon/roaming.png");
        this.load.image("gather", "src/assets/icon/gather.png");
        this.load.image("dungeon_solo", "src/assets/icon/dungeon-solo.png");
        this.load.image("dungeon_group", "src/assets/icon/dungeon-group.png");

        //Monster
        this.load.image("monster_slime", "src/assets/monster/monster_slime.png");
        this.load.image("monster_wolf", "src/assets/monster/monster_wolf.png");
        this.load.image("monster_orc", "src/assets/monster/monster_orc.png");

        //Hero Skills
        this.load.image("Mage_first_skill", "src/assets/Heros_Skills/Mage_first_skill.png");
        this.load.image("Mace_first_skill", "src/assets/Heros_Skills/Mace_first_skill.png");
        this.load.image("Nature_first_skill", "src/assets/Heros_Skills/Nature_first_skill.png");

        //Monsters_Skills
        this.load.image("Slime_first_skill", "src/assets/Monsters_Skills/Slime_first_skill.png");


        //slot item
        this.load.svg("inventory_slots", "src/assets/ui/inventory_slots.svg", {
            width: 680,
            height: 100
        });

        //item
        this.load.image("item_iron_sword", "src/assets/item/item_iron_sword.png");
        this.load.image("item_health_potion", "src/assets/item/item_health_potion.png");
        this.load.image("rare_gem", "src/assets/item/rare_gem.png");
        this.load.image("item_slime_essence", "src/assets/item/slime_essence.png");

    }

    create() {

        // 2. Cắt các frame 80x80 từ dải texture 'inventory_slots'
        const texture = this.textures.get("inventory_slots");
        
        // Tọa độ X tương ứng của từng icon trong file SVG đã vẽ:
        // translate(10, 10), translate(95, 10), translate(180, 10), ...
        const slots = [
            { name: "slot_helmet", x: 10 },
            { name: "slot_armor",  x: 95 },
            { name: "slot_weapon", x: 180 },
            { name: "slot_shield", x: 265 },
            { name: "slot_boots",  x: 350 },
            { name: "slot_cloak",  x: 435 },
            { name: "slot_potion", x: 520 },
            { name: "slot_food",   x: 605 }
        ];

        // Đăng ký từng frame riêng lẻ vào hệ thống Texture của Phaser
        slots.forEach(slot => {
            texture.add(slot.name, 0, slot.x, 10, 80, 80);
        });

        this.scene.start("GameScene");

    }
}