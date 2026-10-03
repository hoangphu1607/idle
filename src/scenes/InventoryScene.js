import BaseScene from "./base/BaseScene";
import SaveManager from "../managers/SaveManager.js";
import items, { getItemBackgroundKey, getItemLevelBackgroundKey, getItemRequiredLevel, getDecomposeMaterials } from "../assets/data/item.js";
import ItemActionMenu from "../ui/ItemActionMenu.js";
import Phaser from "phaser";

export default class InventoryScene extends BaseScene {

    constructor() {
        super("InventoryScene");
        this.itemMenu = null;
    }

    create() {
        const width = this.scale.width;
        this.createBackground();
        this.createBackButton();

        this.add.text(width / 2, 70, "Inventory", {
            fontSize: "42px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.itemMenu = new ItemActionMenu(this);

        this.renderInventory();
        this.createBottomNavigation("Inventory");
    }

    /**
     * Logic Phân tách trang bị
     */
    decomposeItem(inventoryItem, itemData) {
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];

        const targetLevel = Number(inventoryItem.level ?? itemData.level ?? getItemRequiredLevel(itemData));
        const targetQuality = inventoryItem.quality || "Nomal";

        // Tìm vị trí của item bị phân tách
        const itemIndex = inventory.findIndex(item =>
            item.itemId === inventoryItem.itemId &&
            (item.quality || "Nomal") === targetQuality &&
            Number(item.level ?? getItemRequiredLevel(itemData)) === targetLevel
        );

        if (itemIndex === -1) return;

        // Trừ 1 số lượng item đang phân tách
        if (inventory[itemIndex].quantity > 1) {
            inventory[itemIndex].quantity -= 1;
        } else {
            inventory.splice(itemIndex, 1);
        }

        // Lấy nguyên liệu nhận được (kế thừa đúng level của trang bị bị tách)
        const materials = getDecomposeMaterials(itemData, targetLevel);

        // Thêm các nguyên liệu vào inventory
        materials.forEach(mat => {
            const existingMat = inventory.find(i =>
                i.itemId === mat.itemId &&
                Number(i.level ?? 1) === mat.level &&
                (i.quality || "Nomal") === mat.quality
            );

            if (existingMat) {
                existingMat.quantity = Number(existingMat.quantity || 0) + mat.quantity;
            } else {
                inventory.push({
                    itemId: mat.itemId,
                    quantity: mat.quantity,
                    level: mat.level,
                    quality: mat.quality
                });
            }
        });

        saveData.inventory = inventory;
        SaveManager.save(saveData);
        this.renderInventory();
    }

    sellItem(itemId, quantity = 1, quality = null) {
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const itemIndex = inventory.findIndex(item => item.itemId === itemId && (quality === null || quality === undefined || item.quality === quality));

        if (itemIndex === -1) return;

        const itemData = items.find(item => item.id === itemId);
        const price = Number(itemData?.sell_price ?? itemData?.price ?? itemData?.gold ?? 10);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const actualQuantity = Math.min(safeQuantity, inventory[itemIndex].quantity || 0);

        const remaining = inventory[itemIndex].quantity - actualQuantity;
        if (remaining > 0) {
            inventory[itemIndex].quantity = remaining;
        } else {
            inventory.splice(itemIndex, 1);
        }

        saveData.player = saveData.player || {};
        saveData.player.gold = Number(saveData.player.gold || 0) + price * actualQuantity;
        saveData.inventory = inventory;

        SaveManager.save(saveData);
        this.renderInventory();
    }

    renderInventory() {
        const width = this.scale.width;
        const inventory = SaveManager.load().inventory || [];

        if (this.inventoryContainer) {
            this.inventoryContainer.destroy(true);
        }

        this.inventoryContainer = this.add.container(0, 0);
        this.itemMenu.setParentContainer(this.inventoryContainer);

        const slotSize = 80;
        const gap = 12;
        const columns = 6;
        const startX = width / 2 - (columns * slotSize + (columns - 1) * gap) / 2;
        const startY = 140;

        if (inventory.length === 0) {
            const emptyText = this.add.text(width / 2, startY + 80, "Không có vật phẩm", {
                fontSize: "22px",
                color: "#dfe6ee",
                fontStyle: "bold"
            }).setOrigin(0.5);

            this.inventoryContainer.add(emptyText);
            return;
        }

        inventory.forEach((inventoryItem, index) => {
            const itemData = items.find(item => item.id === inventoryItem.itemId);
            if (!itemData) return;

            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = startX + col * (slotSize + gap) + slotSize / 2;
            const y = startY + row * (slotSize + gap) + slotSize / 2;

            const levelBg = this.add.image(
                x,
                y,
                getItemLevelBackgroundKey(inventoryItem.level ?? itemData.level ?? itemData.requiredLevel)
            );
            levelBg.setDisplaySize(slotSize, slotSize);

            const qualityBg = this.add.image(x, y, getItemBackgroundKey(inventoryItem.quality || "Nomal"));
            qualityBg.setDisplaySize(slotSize + 12, slotSize + 12);
            qualityBg.setInteractive({ useHandCursor: true });

            const itemImage = this.add.image(x, y, itemData.icon);
            itemImage.setDisplaySize(slotSize - 16, slotSize - 16);
            itemImage.setInteractive({ useHandCursor: true });

            const levelValue = Number(inventoryItem.level ?? itemData.level ?? getItemRequiredLevel(itemData));
            const levelText = this.add.text(
                x - slotSize / 2 + 8,
                y + slotSize / 2 - 8,
                `Lv.${levelValue}`,
                {
                    fontSize: "10px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3,
                }
            ).setOrigin(0, 1);

            const quantityText = this.add.text(
                x + slotSize / 2 - 6,
                y + slotSize / 2 - 6,
                `${inventoryItem.quantity}`,
                {
                    fontSize: "14px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3,
                }
            ).setOrigin(1, 1);

            const handlePointerDown = (pointer) => {
                itemImage.downX = pointer.x;
                itemImage.downY = pointer.y;
            };

            const handlePointerUp = (pointer) => {
                if (pointer.event) pointer.event.stopPropagation();
                const dist = Phaser.Math.Distance.Between(
                    itemImage.downX || pointer.x,
                    itemImage.downY || pointer.y,
                    pointer.x,
                    pointer.y
                );
                if (dist < 8) {
                    // Danh sách action cơ bản
                    const actions = [
                        {
                            label: "Chi tiết",
                            onClick: () => this.itemMenu.showItemInfo(itemData, inventoryItem)
                        }
                    ];

                    // Nếu item có decomposition thì hiện nút Phân tách
                    if (itemData.decomposition) {
                        actions.push({
                            label: "Phân tách",
                            onClick: () => this.itemMenu.showDecomposeConfirmModal({
                                itemData,
                                inventoryItem,
                                onConfirm: () => this.decomposeItem(inventoryItem, itemData)
                            })
                        });
                    }

                    // Nút Bán
                    actions.push({
                        label: "Bán",
                        onClick: () => this.itemMenu.showSellConfirmModal({
                            targetX: x,
                            targetY: y,
                            cellSize: slotSize,
                            itemData,
                            maxQuantity: inventoryItem.quantity,
                            onConfirm: (qty) => this.sellItem(itemData.id, qty, inventoryItem.quality)
                        })
                    });

                    this.itemMenu.showActionMenu({
                        targetX: x,
                        targetY: y,
                        cellSize: slotSize,
                        itemData,
                        inventoryItem,
                        actions
                    });
                }
            };

            qualityBg.on("pointerdown", handlePointerDown);
            qualityBg.on("pointerup", handlePointerUp);
            itemImage.on("pointerdown", handlePointerDown);
            itemImage.on("pointerup", handlePointerUp);

            this.inventoryContainer.add([levelBg, qualityBg, itemImage, levelText, quantityText]);
        });
    }

    createBackButton() {
        const backBtn = this.add.container(45, 70);
        const btnBg = this.add.circle(0, 0, 24, 0x1b2838, 0.9)
            .setStrokeStyle(2, 0x8aa4bf, 1)
            .setInteractive({ useHandCursor: true });

        const backIcon = this.textures.exists("back")
            ? this.add.image(0, 0, "back").setDisplaySize(28, 28)
            : this.add.text(0, 0, "‹", { fontSize: "34px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5, 0.55);

        btnBg.on("pointerover", () => {
            btnBg.setFillStyle(0x2a3e57);
            btnBg.setStrokeStyle(2, 0xffffff, 1);
        });

        btnBg.on("pointerout", () => {
            btnBg.setFillStyle(0x1b2838);
            btnBg.setStrokeStyle(2, 0x8aa4bf, 1);
        });

        btnBg.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            this.scene.start("MenuScene");
        });

        backBtn.add([btnBg, backIcon]);
        backBtn.setDepth(100);
    }
}