import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {

        // Background
        const bg = this.add.image(0, 0, "bg").setOrigin(0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Wizard
        const wizard = this.add.image(
            this.scale.width / 2,
            this.scale.height * 0.7,
            "wizard"
        ).setOrigin(0.5, 1);

        // HP
        this.maxHP = 1000;
        this.currentHP = 1000;

        // HP Bar
        this.hpBar = this.add.graphics();
        this.createHPBar(this.scale.width / 2 - 125,wizard.y - wizard.displayHeight - 40);

        this.time.delayedCall(3000, () => {
            this.currentHP -= 500;

            if (this.currentHP < 0) {
                this.currentHP = 0;
            }

            this.createHPBar(this.scale.width / 2 - 125,wizard.y - wizard.displayHeight - 40);

            console.log(`HP: ${this.currentHP}/${this.maxHP}`);
        });
    }

    createHPBar(x, y) {

        const width = 250;
        const height = 20;

        this.hpBar.clear();

        // Viền
        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRoundedRect(x - 2, y - 2, width + 4, height + 4, 8);

        // Nền
        this.hpBar.fillStyle(0x555555);
        this.hpBar.fillRoundedRect(x, y, width, height, 6);

        // Máu
        const hpWidth = (this.currentHP / this.maxHP) * width;

        this.hpBar.fillStyle(0xff4040);
        this.hpBar.fillRoundedRect(x, y, hpWidth, height, 6);
    }
}