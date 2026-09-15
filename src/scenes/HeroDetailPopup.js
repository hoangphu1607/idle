import SaveManager from "../managers/SaveManager";
import items from "../assets/data/item";

export default class HeroDetailPopup {

    constructor(scene) {

        this.scene = scene;
        this.currentHero = null;
        this.equipmentItemImages = {};
        this.equipmentItemQuantityTexts = {};
        this.inventoryItemViews = [];

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

        panel.setInteractive();
        panel.on("pointerup", pointer => {
            pointer.event.stopPropagation();
        });

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

        this.scene.input.on("dragstart", this.handleDragStart, this);
        this.scene.input.on("drag", this.handleDrag, this);
        this.scene.input.on("dragend", this.handleDragEnd, this);
        this.scene.input.on("drop", this.handleDrop, this);

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

        const slotFrames = [
            "slot_weapon",
            "slot_shield",
            "slot_helmet",
            "slot_armor",
            "slot_boots",
            "slot_cloak",
            "slot_potion",
            "slot_food"
        ];

        const slotTypes = [
            "weapon",
            "shield",
            "helmet",
            "armor",
            "boots",
            "cloak",
            "potion",
            "food"
        ];

        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < columns; col++) {

                const x = startX + col * (slotSize + gap);
                const y = startY + row * (slotSize + gap);

                const slot = this.scene.add.image(
                    x,
                    y,
                    "inventory_slots",
                    slotFrames[row * columns + col]
                );

                slot.setDisplaySize(slotSize, slotSize);
                slot.slotType = slotTypes[row * columns + col];
                slot.setInteractive();
                slot.input.dropZone = true;

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

        this.currentHero = hero;

        // Lấy dữ liệu Hero từ Save
        const savedHero = SaveManager.loadHero(hero.id) || {};

        const saveData = SaveManager.load();

        const inventory = saveData.inventory || [];

        // Render Inventory
        this.renderInventory(inventory);
        this.renderEquipment(savedHero.equipment || {});

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

    isStackableEquipmentSlot(slotType) {
        return slotType === "potion" || slotType === "food";
    }

    getEquipmentEntry(equipment = {}, slotType) {
        const entry = equipment?.[slotType];

        if (typeof entry === "string") {
            return {
                itemId: entry,
                quantity: 1
            };
        }

        if (entry && typeof entry === "object" && entry.itemId) {
            return {
                itemId: entry.itemId,
                quantity: Number(entry.quantity) > 0 ? Number(entry.quantity) : 1
            };
        }

        return {
            itemId: null,
            quantity: 0
        };
    }

    renderInventory(inventory = []) {

        // Xóa toàn bộ nội dung Inventory cũ
        this.inventoryContainer.removeAll(true);
        this.inventorySlots = [];
        this.inventoryItemViews = [];

        // Tạo lại các ô trống
        this.createInventoryGrid();

        const slotSize = 80;
        const gap = 4;
        const columns = 6;

        const startX = this.cx - 240;
        const startY = this.cy - 180;

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

            itemImage.setInteractive({ useHandCursor: true });
            this.scene.input.setDraggable(itemImage);
            itemImage.itemId = inventoryItem.itemId;
            itemImage.dragStartX = itemImage.x;
            itemImage.dragStartY = itemImage.y;

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

            this.inventoryItemViews.push(itemImage);
        });
    }

    renderEquipment(equipment = {}) {

        Object.values(this.equipmentItemImages).forEach(image => {
            image.destroy();
        });

        Object.values(this.equipmentItemQuantityTexts).forEach(text => {
            text.destroy();
        });

        this.equipmentItemImages = {};
        this.equipmentItemQuantityTexts = {};

        this.equipmentSlots.forEach(slot => {
            const slotEntry = this.getEquipmentEntry(equipment, slot.slotType);
            const itemId = slotEntry.itemId;
            const equippedQuantity = slotEntry.quantity;
            const itemData = items.find(item => item.id === itemId);

            if (!itemData || !this.scene.textures.exists(itemData.icon)) {
                return;
            }

            const itemImage = this.scene.add.image(
                slot.x,
                slot.y,
                itemData.icon
            );

            itemImage.setDisplaySize(38, 38);
            itemImage.setDepth(slot.depth + 1);
            itemImage.setInteractive({ useHandCursor: true });
            this.scene.input.setDraggable(itemImage);
            itemImage.itemId = itemId;
            itemImage.equipmentSlotType = slot.slotType;
            itemImage.dragStartX = itemImage.x;
            itemImage.dragStartY = itemImage.y;

            this.container.add(itemImage);
            this.equipmentItemImages[slot.slotType] = itemImage;

            if (this.isStackableEquipmentSlot(slot.slotType) && equippedQuantity > 0) {
                const quantityText = this.scene.add.text(
                    slot.x + 26,
                    slot.y + 22,
                    `x${equippedQuantity}`,
                    {
                        fontSize: "12px",
                        color: "#ffffff",
                        fontStyle: "bold",
                        stroke: "#000000",
                        strokeThickness: 3
                    }
                ).setOrigin(1, 1);

                this.container.add(quantityText);
                this.equipmentItemQuantityTexts[slot.slotType] = quantityText;
            }
        });
    }

    handleDragStart(pointer, gameObject) {

        if (!gameObject.itemId) {
            return;
        }

        gameObject.setDepth(10001);
        this.draggedItem = gameObject;
        gameObject.wasEquipped = false;
        gameObject.wasUnequipped = false;
    }

    handleDrag(pointer, gameObject, dragX, dragY) {

        if (gameObject === this.draggedItem) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        }
    }

    handleDragEnd(pointer, gameObject) {

        if (gameObject !== this.draggedItem) {
            return;
        }

        if (!gameObject.wasEquipped && !gameObject.wasUnequipped) {
            gameObject.x = gameObject.dragStartX;
            gameObject.y = gameObject.dragStartY;
            gameObject.setDepth(this.inventoryContainer.depth + 1);
        }

        this.draggedItem = null;
    }

    handleDrop(pointer, gameObject, dropZone) {

        if (gameObject !== this.draggedItem) {
            return;
        }

        if (gameObject.equipmentSlotType && dropZone.inventorySlot) {
            gameObject.wasUnequipped = this.unequipItem(gameObject);
            return;
        }

        if (!dropZone.slotType || gameObject.equipmentSlotType) {
            return;
        }

        const itemData = items.find(item => item.id === gameObject.itemId);
        const isStackableSlot = this.isStackableEquipmentSlot(dropZone.slotType);
        const isCompatibleType = itemData && (
            itemData.type === dropZone.slotType ||
            (isStackableSlot && (
                itemData.type === "potion" ||
                itemData.type === "food" ||
                itemData.type === "consumable"
            ))
        );

        if (!isCompatibleType) {
            return;
        }

        gameObject.wasEquipped = true;
        this.equipItem(itemData, dropZone.slotType);
    }

    equipItem(itemData, slotType) {

        if (!this.currentHero) {
            return;
        }

        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const inventoryItem = inventory.find(
            item => item.itemId === itemData.id
        );

        if (!inventoryItem || inventoryItem.quantity < 1) {
            return;
        }

        const heroKey = String(this.currentHero.id);
        const savedHero = saveData.heroes[heroKey] || this.currentHero;
        const equipment = {
            ...(savedHero.equipment || {})
        };
        const currentEntry = this.getEquipmentEntry(equipment, slotType);
        const previousItemId = currentEntry.itemId;
        const isStackableSlot = this.isStackableEquipmentSlot(slotType);
        const maxEquippedQuantity = isStackableSlot ? 10 : 1;
        const currentQuantity = currentEntry.itemId === itemData.id ? currentEntry.quantity : 0;
        const availableSpace = Math.max(0, maxEquippedQuantity - currentQuantity);
        const transferQuantity = isStackableSlot
            ? Math.min(inventoryItem.quantity, availableSpace)
            : 1;

        if (transferQuantity <= 0 || inventoryItem.quantity < transferQuantity) {
            return;
        }

        inventoryItem.quantity -= transferQuantity;

        if (inventoryItem.quantity <= 0) {
            saveData.inventory = inventory.filter(
                item => item !== inventoryItem
            );
        }

        if (previousItemId && previousItemId !== itemData.id) {
            const previousInventoryItem = saveData.inventory.find(
                item => item.itemId === previousItemId
            );

            if (previousInventoryItem) {
                previousInventoryItem.quantity += 1;
            } else {
                saveData.inventory.push({
                    itemId: previousItemId,
                    quantity: 1
                });
            }
        }

        if (isStackableSlot) {
            const nextQuantity = currentEntry.itemId === itemData.id
                ? currentQuantity + transferQuantity
                : transferQuantity;

            equipment[slotType] = {
                itemId: itemData.id,
                quantity: nextQuantity
            };
        } else {
            equipment[slotType] = itemData.id;
        }

        saveData.heroes[heroKey] = {
            ...savedHero,
            equipment
        };

        SaveManager.save(saveData);
        this.renderInventory(saveData.inventory);
        this.renderEquipment(equipment);
    }

    unequipItem(gameObject) {

        if (!this.currentHero) {
            return false;
        }

        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const hasExistingStack = inventory.some(
            item => item.itemId === gameObject.itemId
        );
        const inventoryCapacity = 6 * 4;

        if (!hasExistingStack && inventory.length >= inventoryCapacity) {
            return false;
        }

        const heroKey = String(this.currentHero.id);
        const savedHero = saveData.heroes[heroKey] || this.currentHero;
        const equipment = {
            ...(savedHero.equipment || {})
        };
        const currentEntry = this.getEquipmentEntry(equipment, gameObject.equipmentSlotType);

        if (currentEntry.itemId !== gameObject.itemId) {
            return false;
        }

        const inventoryItem = inventory.find(
            item => item.itemId === gameObject.itemId
        );
        const quantityToReturn = this.isStackableEquipmentSlot(gameObject.equipmentSlotType)
            ? currentEntry.quantity
            : 1;

        if (inventoryItem) {
            inventoryItem.quantity += quantityToReturn;
        } else {
            inventory.push({
                itemId: gameObject.itemId,
                quantity: quantityToReturn
            });
        }

        if (this.isStackableEquipmentSlot(gameObject.equipmentSlotType)) {
            const nextQuantity = currentEntry.quantity - quantityToReturn;

            if (nextQuantity > 0) {
                equipment[gameObject.equipmentSlotType] = {
                    itemId: gameObject.itemId,
                    quantity: nextQuantity
                };
            } else {
                delete equipment[gameObject.equipmentSlotType];
            }
        } else {
            delete equipment[gameObject.equipmentSlotType];
        }

        saveData.inventory = inventory;
        saveData.heroes[heroKey] = {
            ...savedHero,
            equipment
        };

        SaveManager.save(saveData);
        this.renderInventory(inventory);
        this.renderEquipment(equipment);

        return true;
    }

    createInventoryGrid() {

        const startX = this.cx - 240;
        const startY = this.cy - 180;

        const slotSize = 80;
        const gap = 4;

        const columns = 6;
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

                slot.setInteractive();
                slot.input.dropZone = true;
                slot.inventorySlot = true;

                this.inventoryContainer.add(slot);
            }
        }
    }

}