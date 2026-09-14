import SaveManager from "../managers/SaveManager";
import items from "../assets/data/item";

export default class HeroDetailPopup {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        this.container.setDepth(9999);

        // =========================
        // Kích thước Popup
        // =========================

        this.panelWidth = scene.scale.width * 0.8;
        this.panelHeight = scene.scale.height * 0.8;

        this.cx = scene.scale.width / 2;
        this.cy = scene.scale.height / 2;

        // =========================
        // Overlay
        // =========================

        const overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.65
        ).setOrigin(0);

        overlay.setInteractive();

        overlay.on("pointerup", () => {
            this.hide();
        });

        // =========================
        // Panel
        // =========================

        const panel = scene.add.rectangle(
            this.cx,
            this.cy,
            this.panelWidth,
            this.panelHeight,
            0xffffff
        );

        // =========================
        // Avatar
        // =========================

        this.avatar = scene.add.image(
            this.cx - 185,
            this.cy - 410,
            "wizard"
        );

        this.avatar.setDisplaySize(70, 70);

        // =========================
        // Name
        // =========================

        this.name = scene.add.text(
            this.cx - 115,
            this.cy - 435,
            "",
            {
                fontSize: "18px",
                color: "#000000"
            }
        );

        // =========================
        // Class
        // =========================

        this.role = scene.add.text(
            this.cx - 115,
            this.cy - 405,
            "",
            {
                fontSize: "18px",
                color: "#000000"
            }
        );

        // =========================
        // Level
        // =========================

        this.level = scene.add.text(
            this.cx - 115,
            this.cy - 375,
            "",
            {
                fontSize: "16px",
                color: "#000000"
            }
        );

        // =========================
        // Experience
        // =========================

        this.exp = scene.add.text(
            this.cx - 115,
            this.cy - 345,
            "",
            {
                fontSize: "16px",
                color: "#000000"
            }
        );

        // =========================
        // Equipment Slots
        // =========================

        this.equipmentSlots = [];

        this.createEquipmentSlots();

        // =========================
        // Inventory
        // =========================

        this.inventoryContainer = scene.add.container(0, 0);

        this.inventorySlots = [];

        this.createInventoryGrid();

        // =========================
        // Stats
        // =========================

        this.statTexts = {};

        this.createStatText(
            "attack_physical",
            "Physic Dame:",
            this.cx - 225,
            this.cy - 300
        );

        this.createStatText(
            "attack_magic",
            "Mage Dame:",
            this.cx + 25,
            this.cy - 300
        );

        this.createStatText(
            "defense",
            "Armor:",
            this.cx - 225,
            this.cy - 270
        );

        this.createStatText(
            "magic_resistance",
            "Magic resistance:",
            this.cx + 25,
            this.cy - 270
        );

        this.createStatText(
            "hp",
            "HP:",
            this.cx - 225,
            this.cy - 240
        );

        this.createStatText(
            "mp",
            "MP:",
            this.cx + 25,
            this.cy - 240
        );

        // =========================
        // Close Button
        // =========================

        const closeButton = scene.add.text(
            this.cx + this.panelWidth / 2 - 20,
            this.cy - this.panelHeight / 2 + 20,
            "×",
            {
                fontSize: "30px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        closeButton.setInteractive({
            useHandCursor: true
        });

        closeButton.on("pointerup", () => {
            this.hide();
        });

        closeButton.on("pointerover", () => {
            closeButton.setColor("#ff0000");
        });

        closeButton.on("pointerout", () => {
            closeButton.setColor("#000000");
        });

        // =========================
        // Add Container
        // =========================

        this.container.add([
            overlay,
            panel,
            this.avatar,
            this.name,
            this.role,
            this.level,
            this.exp,

            ...this.equipmentSlots,

            ...Object.values(this.statTexts),
            this.inventoryContainer,
            closeButton
        ]);
    }


    // =====================================================
    // Tạo Equipment Slots
    // =====================================================

    createEquipmentSlots() {

        const startX = this.cx + 25;
        const startY = this.cy - 435;

        const slotSize = 48;
        const gap = 4;

        const columns = 4;
        const rows = 2;

        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < columns; col++) {

                const x = startX + col * (slotSize + gap);
                const y = startY + row * (slotSize + gap);

                const slot = this.scene.add.rectangle(
                    x,
                    y,
                    slotSize,
                    slotSize,
                    0xf0f0f0
                );

                slot.setStrokeStyle(1, 0x888888);

                this.equipmentSlots.push(slot);
            }
        }
    }


    // =====================================================
    // Tạo Stat Text
    // =====================================================

    createStatText(key, label, x, y) {

        const text = this.scene.add.text(
            x,
            y,
            `${label} 0`,
            {
                fontSize: "15px",
                color: "#000000"
            }
        );

        this.statTexts[key] = text;
    }


    // =====================================================
    // Show Popup
    // =====================================================

    show(hero) {

        // Lấy dữ liệu Hero từ Save
        const savedHero = SaveManager.loadHero(hero.id) || {};

        const saveData = SaveManager.load();

        const inventory = saveData.inventory || [];

        // Render Inventory
        this.renderInventory(inventory);

        this.avatar.setTexture(hero.avatar);

        this.name.setText(hero.name || "Unknown");

        this.role.setText(hero.role || "-");



        // =========================
        // Level & EXP từ Save
        // =========================

        this.level.setText(
            `Lv: ${savedHero.level ?? hero.level ?? 1}`
        );

        this.exp.setText(
            `Exp: ${savedHero.experience ?? hero.experience ?? 0}`
        );

        // =========================
        // Stats từ dữ liệu Hero
        // =========================

        this.statTexts.attack_physical.setText(
            `Physic Dame: ${hero.attack_physical || 0}`
        );

        this.statTexts.attack_magic.setText(
            `Mage Dame: ${hero.attack_magic || 0}`
        );

        this.statTexts.defense.setText(
            `Armor: ${hero.defense || 0}`
        );

        this.statTexts.magic_resistance.setText(
            `Magic resistance: ${hero.magic_resistance || 0}`
        );

        this.statTexts.hp.setText(
            `HP: ${hero.hp || 0}`
        );

        this.statTexts.mp.setText(
            `MP: ${hero.mp || 0}`
        );

        this.container.setVisible(true);
    }


    // =====================================================
    // Hide Popup
    // =====================================================

    hide() {

        this.container.setVisible(false);

    }

    renderInventory(inventory = []) {

        // Xóa toàn bộ nội dung Inventory cũ
        this.inventoryContainer.removeAll(true);

        // Tạo lại các ô trống
        this.createInventoryGrid();

        const slotSize = 48;
        const gap = 4;
        const columns = 5;

        const startX = this.cx - 225;
        const startY = this.cy - 165;

        inventory.forEach((inventoryItem, index) => {

            if (index >= this.inventorySlots.length) {
                return;
            }

            // Tìm thông tin Item trong items.js
            const itemData = items.find(
                item => item.id === inventoryItem.itemId
            );

            // Không tìm thấy Item thì bỏ qua
            if (!itemData) {
                console.warn(
                    `Item not found: ${inventoryItem.itemId}`
                );
                return;
            }

            const row = Math.floor(index / columns);
            const col = index % columns;

            const x = startX + col * (slotSize + gap);
            const y = startY + row * (slotSize + gap);

            // =========================
            // Item Icon
            // =========================

            const itemImage = this.scene.add.image(
                x + slotSize / 2,
                y + slotSize / 2,
                itemData.icon
            );

            itemImage.setDisplaySize(
                slotSize - 6,
                slotSize - 6
            );

            // =========================
            // Quantity
            // =========================

            const quantity = this.scene.add.text(
                x + slotSize - 3,
                y + slotSize - 3,
                `${inventoryItem.quantity}`,
                {
                    fontSize: "14px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3
                }
            ).setOrigin(1, 1);

            // Thêm vào Inventory Container
            this.inventoryContainer.add([
                itemImage,
                quantity
            ]);
        });
    }

    createInventoryGrid() {

        const startX = this.cx - 225;
        const startY = this.cy - 165;

        const slotSize = 48;
        const gap = 4;

        const columns = 5;
        const rows = 4;

        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < columns; col++) {

                const x = startX + col * (slotSize + gap);
                const y = startY + row * (slotSize + gap);

                const slot = this.scene.add.rectangle(
                    x,
                    y,
                    slotSize,
                    slotSize,
                    0xf0f0f0
                );

                slot.setOrigin(0);
                slot.setStrokeStyle(1, 0x888888);

                this.inventorySlots.push(slot);

                this.inventoryContainer.add(slot);
            }
        }
    }

}