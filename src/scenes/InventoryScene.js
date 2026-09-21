import BaseScene from "./base/BaseScene";
import SaveManager from "../managers/SaveManager.js";
import items from "../assets/data/item.js";

export default class InventoryScene extends BaseScene {

    constructor() {
        super("InventoryScene");
        this.actionMenu = null;
        this.infoModal = null;
        this.confirmModal = null;
        this.saleQuantity = 1;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground();

        this.add.text(width / 2, 70, "Inventory", {
            fontSize: "42px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.input.on("pointerdown", (pointer) => {
            const containers = [
                { container: this.actionMenu, hide: () => this.hideActionMenu() },
                { container: this.infoModal, hide: () => this.hideInfoModal() },
                { container: this.confirmModal, hide: () => this.hideConfirmModal() }
            ];

            containers.forEach(({ container, hide }) => {
                if (!container) {
                    return;
                }

                const bounds = container.getBounds();
                const inside = pointer.x >= bounds.x &&
                    pointer.x <= bounds.right &&
                    pointer.y >= bounds.y &&
                    pointer.y <= bounds.bottom;

                if (!inside) {
                    hide();
                }
            });
        });

        this.renderInventory();

        this.createBottomNavigation("Inventory");
    }

    hideActionMenu() {
        if (this.actionMenu) {
            this.actionMenu.destroy(true);
            this.actionMenu = null;
        }
    }

    hideInfoModal() {
        if (this.infoModal) {
            this.infoModal.destroy(true);
            this.infoModal = null;
        }
    }

    hideConfirmModal() {
        if (this.confirmModal) {
            this.confirmModal.destroy(true);
            this.confirmModal = null;
        }
        this.saleQuantity = 1;
    }

    showItemInfo(itemData) {
        this.hideActionMenu();
        this.hideConfirmModal();

        const modalWidth = 320;
        const modalHeight = 220;
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;

        this.infoModal = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0x5ec5ff, 1);

        const title = this.add.text(0, -78, itemData.name, {
            fontSize: "22px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const desc = this.add.text(0, -32, itemData.description || "Không có mô tả.", {
            fontSize: "14px",
            color: "#dfe6ee",
            align: "center",
            wordWrap: { width: modalWidth - 30 }
        }).setOrigin(0.5);

        const meta = this.add.text(0, 18, `Loại: ${itemData.type || "-"}   |   Giá: ${Number(itemData.price ?? itemData.gold ?? 10)}`, {
            fontSize: "13px",
            color: "#ffd76a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const closeBtn = this.add.rectangle(0, 78, 120, 32, 0x4d90ff, 1)
            .setInteractive({ useHandCursor: true });
        const closeText = this.add.text(0, 78, "Đóng", {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        closeBtn.on("pointerup", () => {
            this.hideInfoModal();
        });

        this.infoModal.add([bg, title, desc, meta, closeBtn, closeText]);
        this.inventoryContainer.add(this.infoModal);
    }

    sellItem(itemId, quantity = 1) {
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const itemIndex = inventory.findIndex(item => item.itemId === itemId);

        if (itemIndex === -1) {
            return;
        }

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
        this.hideConfirmModal();
        this.renderInventory();
    }

    showSellConfirmModal(itemData, inventoryItem) {
        this.hideActionMenu();
        this.hideInfoModal();
        this.hideConfirmModal();

        const maxQty = Number(inventoryItem.quantity || 1);
        this.saleQuantity = Math.min(1, maxQty);

        const modalWidth = 340;
        const modalHeight = 200;
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;

        this.confirmModal = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0xf4b942, 1);

        const title = this.add.text(0, -70, `Đồng ý bán vật phẩm ${itemData.name} với giá`, {
            fontSize: "18px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: modalWidth - 30 }
        }).setOrigin(0.5);

        const priceText = this.add.text(0, -38, `${Number(itemData.price ?? itemData.gold ?? 10)} gold / 1 cái`, {
            fontSize: "16px",
            color: "#ffd76a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const quantityLabel = this.add.text(0, -2, "Số lượng bán:", {
            fontSize: "15px",
            color: "#dfe6ee",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const minusBtn = this.add.rectangle(-62, 32, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const minusText = this.add.text(-62, 32, "-", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const qtyBox = this.add.rectangle(0, 32, 90, 28, 0xf3f6fb, 1)
            .setStrokeStyle(2, 0x8aa4bf, 0.9);
        const qtyText = this.add.text(0, 32, `${this.saleQuantity}`, {
            fontSize: "16px",
            color: "#1b1b1b",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const plusBtn = this.add.rectangle(62, 32, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const plusText = this.add.text(62, 32, "+", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const confirmBtn = this.add.rectangle(-82, 72, 120, 32, 0x4caf50, 1)
            .setInteractive({ useHandCursor: true });
        const confirmText = this.add.text(-82, 72, "Đồng ý", {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const cancelBtn = this.add.rectangle(82, 72, 120, 32, 0xe74c3c, 1)
            .setInteractive({ useHandCursor: true });
        const cancelText = this.add.text(82, 72, "Hủy", {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const updateQty = () => {
            qtyText.setText(`${this.saleQuantity}`);
        };

        minusBtn.on("pointerup", () => {
            this.saleQuantity = Math.max(1, this.saleQuantity - 1);
            updateQty();
        });

        plusBtn.on("pointerup", () => {
            this.saleQuantity = Math.min(maxQty, this.saleQuantity + 1);
            updateQty();
        });

        confirmBtn.on("pointerup", () => {
            const total = this.saleQuantity * Number(itemData.price ?? itemData.gold ?? 10);
            if (this.saleQuantity <= 0 || this.saleQuantity > maxQty) {
                return;
            }
            this.sellItem(itemData.id, this.saleQuantity);
            this.hideConfirmModal();
            this.renderInventory();
            console.log(`Đã bán ${this.saleQuantity} ${itemData.name} với tổng ${total} gold`);
        });

        cancelBtn.on("pointerup", () => {
            this.hideConfirmModal();
        });

        this.confirmModal.add([
            bg,
            title,
            priceText,
            quantityLabel,
            minusBtn,
            minusText,
            qtyBox,
            qtyText,
            plusBtn,
            plusText,
            confirmBtn,
            confirmText,
            cancelBtn,
            cancelText
        ]);

        this.inventoryContainer.add(this.confirmModal);
    }

    showActionMenu(itemData, inventoryItem, x, y) {
        this.hideActionMenu();
        this.hideInfoModal();
        this.hideConfirmModal();

        const menuWidth = 180;
        const menuHeight = 110;
        const menuX = Math.min(x + 30, this.scale.width - menuWidth - 20);
        const menuY = Math.max(y - 10, 150);

        this.actionMenu = this.add.container(menuX, menuY);

        const bg = this.add.rectangle(0, 0, menuWidth, menuHeight, 0x18212b, 0.96)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xe5c07b, 0.9);

        const buttonWidth = menuWidth - 30;
        const centerX = menuWidth / 2;

        const infoBtn = this.add.rectangle(centerX, 20, buttonWidth, 32, 0x4d90ff, 1)
            .setInteractive({ useHandCursor: true });
        const infoText = this.add.text(centerX, 20, "Xem thông tin", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const sellBtn = this.add.rectangle(centerX, 68, buttonWidth, 32, 0x4caf50, 1)
            .setInteractive({ useHandCursor: true });
        const sellText = this.add.text(centerX, 68, "Bán", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        infoBtn.on("pointerup", () => {
            this.showItemInfo(itemData);
        });

        sellBtn.on("pointerup", () => {
            this.showSellConfirmModal(itemData, inventoryItem);
        });

        this.actionMenu.add([bg, infoBtn, infoText, sellBtn, sellText]);
        this.inventoryContainer.add(this.actionMenu);
    }

    renderInventory() {
        const width = this.scale.width;
        const inventory = SaveManager.load().inventory || [];

        if (this.inventoryContainer) {
            this.inventoryContainer.destroy(true);
        }

        this.inventoryContainer = this.add.container(0, 0);

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

            if (!itemData) {
                return;
            }

            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = startX + col * (slotSize + gap) + slotSize / 2;
            const y = startY + row * (slotSize + gap) + slotSize / 2;

            const bg = this.add.rectangle(
                x,
                y,
                slotSize,
                slotSize,
                0xf3f6fb,
                0.92
            );
            bg.setStrokeStyle(2, 0x8aa4bf, 0.9);
            bg.setInteractive({ useHandCursor: true });

            const itemImage = this.add.image(x, y, itemData.icon);
            itemImage.setDisplaySize(slotSize - 16, slotSize - 16);
            itemImage.setInteractive({ useHandCursor: true });

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

            const nameText = this.add.text(
                x,
                y + slotSize / 2 + 20,
                itemData.name,
                {
                    fontSize: "12px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    wordWrap: { width: slotSize + 12 }
                }
            ).setOrigin(0.5);

            bg.on("pointerup", () => {
                this.showActionMenu(itemData, inventoryItem, x, y);
            });

            itemImage.on("pointerup", () => {
                this.showActionMenu(itemData, inventoryItem, x, y);
            });

            this.inventoryContainer.add([bg, itemImage, quantityText, nameText]);
        });
    }
}