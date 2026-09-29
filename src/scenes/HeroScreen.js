import { HEROES } from "../assets/data/heroes.js";
import HeroCard from "../objects/HeroCard";
import SaveManager from "../managers/SaveManager";

export default class HeroScreen {

    constructor(scene) {

        this.scene = scene;
        this.heroCards = [];
        this.unlockCost = 500;

        this.container = scene.add.container(0, 0);

        this.container.setVisible(false);

        // background

        const bg = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.7
        ).setOrigin(0);

        this.container.add(bg);
        this.createHeroList();
        this.createBackButton();

    }


    show() {

        this.refreshHeroList();
        this.container.setVisible(true);

    }

    hide() {

        this.unlockDialog?.destroy(true);
        this.unlockDialog = null;
        this.container.setVisible(false);

    }


    createHeroList() {

        const heroes = SaveManager
            .loadHeroes(HEROES)
            .map((hero) => SaveManager.getEffectiveHero(hero));

        heroes.forEach((hero, index) => {

            const card = new HeroCard(
                this.scene,
                hero,
                20,
                100 + index * 120
            );
            card.setOnClick((clickedHero) => {
                if (!clickedHero.unlocked) {
                    this.showUnlockConfirmation(clickedHero);
                    return;
                }

                this.scene.heroDetailPopup.show(clickedHero);

            });

            this.heroCards.push(card);
            this.container.add(card.container);

        });

    }

    refreshHeroList() {
        this.heroCards.forEach((card) => card.destroy());
        this.heroCards = [];
        this.createHeroList();
    }

    showUnlockConfirmation(hero) {
        this.unlockDialog?.destroy(true);

        const { width, height } = this.scene.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Đặt trực tiếp trong scene, không nằm trong this.container
        this.unlockDialog = this.scene.add.container(0, 0);
        this.unlockDialog.setDepth(9999);
        this.unlockDialog.setScrollFactor(0);

        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.75)
            .setOrigin(0)
            .setInteractive();

        const panel = this.scene.add.rectangle(centerX, centerY, 340, 210, 0x292929)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();

        const title = this.scene.add.text(centerX, centerY - 65, `Mở khóa ${hero.name}?`, {
            fontSize: "24px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5);

        const costText = this.scene.add.text(centerX, centerY - 20, `Chi phí: ${this.unlockCost} gold`, {
            fontSize: "20px", color: "#ffd700"
        }).setOrigin(0.5);

        const statusText = this.scene.add.text(centerX, centerY + 15, "Bạn có muốn mở hero này không?", {
            fontSize: "16px", color: "#ffffff"
        }).setOrigin(0.5);

        const confirmButton = this.scene.add.rectangle(centerX - 75, centerY + 70, 120, 42, 0x368a45)
            .setInteractive({ useHandCursor: true });
        const confirmLabel = this.scene.add.text(centerX - 75, centerY + 70, "Mở khóa", {
            fontSize: "18px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5); // KHÔNG setInteractive

        const cancelButton = this.scene.add.rectangle(centerX + 75, centerY + 70, 120, 42, 0x666666)
            .setInteractive({ useHandCursor: true });
        const cancelLabel = this.scene.add.text(centerX + 75, centerY + 70, "Hủy", {
            fontSize: "18px", color: "#ffffff"
        }).setOrigin(0.5); // KHÔNG setInteractive

        const closeDialog = () => {
            this.unlockDialog?.destroy(true);
            this.unlockDialog = null;
        };

        confirmButton.on("pointerdown", () => {
            const result = SaveManager.unlockHero(hero.id, this.unlockCost);

            if (!result.success) {
                statusText.setText(result.reason === "insufficient-gold"
                    ? "Không đủ gold để mở hero này."
                    : "Không thể lưu trạng thái mở khóa.");
                statusText.setColor("#ff7777");
                return;
            }

            this.scene.events.emit("updateCoin", result.gold);
            closeDialog();
            this.refreshHeroList();
        });

        cancelButton.on("pointerdown", closeDialog);

        this.unlockDialog.add([
            overlay, panel, title, costText, statusText,
            confirmButton, confirmLabel, cancelButton, cancelLabel
        ]);
    }
    createBackButton() {
        // Sử dụng this.scene.add thay vì this.add
        const backBtn = this.scene.add.container(45, 70);

        // Nền nút hình tròn
        const btnBg = this.scene.add.circle(0, 0, 24, 0x1b2838, 0.9)
            .setStrokeStyle(2, 0x8aa4bf, 1)
            .setInteractive({ useHandCursor: true });

        // Biểu tượng quay lại (sử dụng this.scene.textures)
        const backIcon = this.scene.textures.exists("back")
            ? this.scene.add.image(0, 0, "back").setDisplaySize(28, 28)
            : this.scene.add.text(0, 0, "‹", {
                fontSize: "34px",
                color: "#ffffff",
                fontStyle: "bold"
            }).setOrigin(0.5, 0.55);

        btnBg.on("pointerover", () => {
            btnBg.setFillStyle(0x2a3e57);
            btnBg.setStrokeStyle(2, 0xffffff, 1);
        });

        btnBg.on("pointerout", () => {
            btnBg.setFillStyle(0x1b2838);
            btnBg.setStrokeStyle(2, 0x8aa4bf, 1);
        });

        btnBg.on("pointerup", (pointer) => {
            if (pointer && pointer.event) {
                pointer.event.stopPropagation();
            }
            this.scene.scene.start("MenuScene"); // Chuyển Scene thông qua this.scene.scene
        });

        backBtn.add([btnBg, backIcon]);
        backBtn.setDepth(100);

        // Thêm backBtn vào container chung của HeroScreen để ẩn/hiện đồng bộ
        this.container.add(backBtn);
    }

}