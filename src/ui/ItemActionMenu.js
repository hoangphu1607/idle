import SaveManager from "../managers/SaveManager.js";
import items, { getItemRequiredLevel, getDecomposeMaterials, getItemBackgroundKey } from "../assets/data/item.js";
import Phaser from "phaser";

export default class ItemActionMenu {
    constructor(scene, parentContainer = null) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.actionMenu = null;
        this.confirmModal = null;
        this.infoModal = null;
        this.decomposeModal = null;
        this.saleQuantity = 1;

        // Bấm ra ngoài để đóng menu/modal
        this.scene.input.on("pointerdown", (pointer) => {
            const containers = [
                { container: this.actionMenu, hide: () => this.hideActionMenu() },
                { container: this.infoModal, hide: () => this.hideInfoModal() },
                { container: this.confirmModal, hide: () => this.hideConfirmModal() },
                { container: this.decomposeModal, hide: () => this.hideDecomposeModal() }
            ];

            containers.forEach(({ container, hide }) => {
                if (!container) return;

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
    }

    hideAll() {
        this.hideActionMenu();
        this.hideInfoModal();
        this.hideConfirmModal();
        this.hideDecomposeModal();
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

    hideDecomposeModal() {
        if (this.decomposeModal) {
            this.decomposeModal.destroy(true);
            this.decomposeModal = null;
        }
    }

    setParentContainer(container) {
        this.parentContainer = container;
    }

    createMenuButton(x, y, btnWidth, btnHeight, textStr, onClick) {
        const container = this.scene.add.container(x, y);

        const hitArea = this.scene.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0.001)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });

        const label = this.scene.add.text(btnWidth / 2, btnHeight / 2, textStr, {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        hitArea.on("pointerover", () => label.setColor("#ffd700"));
        hitArea.on("pointerout", () => label.setColor("#ffffff"));
        hitArea.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            onClick();
        });

        container.add([hitArea, label]);
        return container;
    }

    showActionMenu({ targetX, targetY, cellSize = 80, itemData, inventoryItem, actions = [] }) {
        this.hideAll();

        const menuWidth = 120;
        const buttonHeight = 40;
        const menuHeight = Math.max(44, actions.length * buttonHeight + (actions.length - 1) * 2);
        const margin = 8;

        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        const fitsRight = (targetX + cellSize / 2 + margin + menuWidth) <= (screenWidth - 10);
        const menuX = fitsRight ?
            targetX + cellSize / 2 + margin :
            targetX - cellSize / 2 - margin - menuWidth;

        const menuY = Phaser.Math.Clamp(
            targetY - cellSize / 2,
            60,
            screenHeight - menuHeight - 60
        );

        this.actionMenu = this.scene.add.container(menuX, menuY);
        this.actionMenu.setDepth(10005);

        const bg = this.scene.add.rectangle(0, 0, menuWidth, menuHeight, 0x18212b, 0.96)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xe5c07b, 0.9)
            .setInteractive();

        bg.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
        });

        const elements = [bg];

        actions.forEach((act, index) => {
            const btnY = index * (buttonHeight + 2);
            const btn = this.createMenuButton(0, btnY, menuWidth, buttonHeight, act.label, () => {
                act.onClick();
                this.hideActionMenu();
            });
            elements.push(btn);

            if (index < actions.length - 1) {
                const divider = this.scene.add.line(
                    0,
                    btnY + buttonHeight + 1,
                    6,
                    0,
                    menuWidth - 6,
                    0,
                    0x3e4f66
                ).setOrigin(0);
                elements.push(divider);
            }
        });

        this.actionMenu.add(elements);
        if (this.parentContainer) {
            this.parentContainer.add(this.actionMenu);
        }
    }

    /**
     * Modal xác nhận Phân tách trang bị
     */
    showDecomposeConfirmModal({ itemData, inventoryItem, onConfirm = () => {} }) {
        this.hideAll();

        const modalWidth = 320;
        const modalHeight = 220;
        const x = this.scene.scale.width / 2;
        const y = this.scene.scale.height / 2;

        const itemLevel = Number(inventoryItem?.level ?? itemData?.level ?? 1);

        this.decomposeModal = this.scene.add.container(x, y);
        this.decomposeModal.setDepth(10015);

        const bg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0xff79c6, 1)
            .setInteractive();

        bg.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
        });

        const title = this.scene.add.text(0, -78, "Phân tách trang bị", {
            fontSize: "18px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const desc = this.scene.add.text(
            0,
            -42,
            `Phân tách ${itemData.name} Lv.${itemLevel}?\nNguyên liệu nhận được sẽ kế thừa Lv.${itemLevel}.`,
            {
                fontSize: "13px",
                color: "#dfe6ee",
                align: "center",
                wordWrap: { width: modalWidth - 30 }
            }
        ).setOrigin(0.5);

        // Hiển thị danh sách nguyên liệu nhận được dự kiến
        const matsConfig = itemData?.decomposition?.materials || [];
        const matSummary = matsConfig.map(m => {
            const matDef = items.find(i => i.id === m.itemId);
            const name = matDef?.name || m.itemId;
            const range = Array.isArray(m.quantity) ? `${m.quantity[0]}~${m.quantity[m.quantity.length - 1]}` : m.quantity;
            return `• ${name} Lv.${itemLevel} (x${range})`;
        }).join("\n");

        const previewText = this.scene.add.text(0, 10, matSummary || "Nguyên liệu ngẫu nhiên", {
            fontSize: "14px",
            color: "#ffd76a",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);

        // Nút Đồng ý
        const confirmBtn = this.scene.add.rectangle(-65, 75, 100, 32, 0x4caf50, 1)
            .setInteractive({ useHandCursor: true });
        const confirmText = this.scene.add.text(-65, 75, "Phân tách", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Nút Hủy
        const cancelBtn = this.scene.add.rectangle(65, 75, 100, 32, 0xe74c3c, 1)
            .setInteractive({ useHandCursor: true });
        const cancelText = this.scene.add.text(65, 75, "Hủy", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        confirmBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            onConfirm();
            this.hideDecomposeModal();
        });

        cancelBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            this.hideDecomposeModal();
        });

        this.decomposeModal.add([
            bg, title, desc, previewText,
            confirmBtn, confirmText, cancelBtn, cancelText
        ]);

        if (this.parentContainer) {
            this.parentContainer.add(this.decomposeModal);
        }
    }

    showSellConfirmModal({ targetX, targetY, cellSize = 80, itemData, maxQuantity = 1, onConfirm = () => {} }) {
        this.hideAll();

        const unitPrice = Number(itemData?.sell_price ?? itemData?.price ?? itemData?.gold ?? 10);
        this.saleQuantity = 1;

        const menuWidth = 240;
        const menuHeight = 200;
        const margin = 8;
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        const fitsRight = (targetX + cellSize / 2 + margin + menuWidth) <= (screenWidth - 15);
        const menuX = Phaser.Math.Clamp(
            fitsRight ? targetX + cellSize / 2 + margin : targetX - cellSize / 2 - margin - menuWidth,
            15,
            screenWidth - menuWidth - 15
        );

        const menuY = Phaser.Math.Clamp(
            targetY - cellSize / 2,
            60,
            screenHeight - menuHeight - 60
        );

        this.confirmModal = this.scene.add.container(menuX, menuY);
        this.confirmModal.setDepth(10010);

        const bg = this.scene.add.rectangle(menuWidth / 2, menuHeight / 2, menuWidth, menuHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0xf4b942, 1)
            .setInteractive();

        bg.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
        });

        const title = this.scene.add.text(menuWidth / 2, 14, `Bán ${itemData.name || itemData.id}`, {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: menuWidth - 20 }
        }).setOrigin(0.5, 0);

        const priceText = this.scene.add.text(menuWidth / 2, 46, `${unitPrice} vàng / 1 cái`, {
            fontSize: "14px",
            color: "#ffd76a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const quantityLabel = this.scene.add.text(menuWidth / 2, 72, "Số lượng bán:", {
            fontSize: "14px",
            color: "#dfe6ee"
        }).setOrigin(0.5);

        const minusBtn = this.scene.add.rectangle(menuWidth / 2 - 62, 105, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const minusText = this.scene.add.text(menuWidth / 2 - 62, 105, "-", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const qtyBox = this.scene.add.rectangle(menuWidth / 2, 105, 90, 28, 0xf3f6fb, 1)
            .setStrokeStyle(2, 0x8aa4bf, 0.9);
        const qtyText = this.scene.add.text(menuWidth / 2, 105, `${this.saleQuantity}`, {
            fontSize: "16px",
            color: "#1b1b1b",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const plusBtn = this.scene.add.rectangle(menuWidth / 2 + 62, 105, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const plusText = this.scene.add.text(menuWidth / 2 + 62, 105, "+", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const totalText = this.scene.add.text(menuWidth / 2, 138, `Nhận: ${unitPrice * this.saleQuantity} vàng`, {
            fontSize: "14px",
            color: "#ffd700",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const confirmBtn = this.scene.add.rectangle(menuWidth / 2 - 58, 172, 100, 32, 0x4caf50, 1)
            .setInteractive({ useHandCursor: true });
        const confirmText = this.scene.add.text(menuWidth / 2 - 58, 172, "Đồng ý", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const cancelBtn = this.scene.add.rectangle(menuWidth / 2 + 58, 172, 100, 32, 0xe74c3c, 1)
            .setInteractive({ useHandCursor: true });
        const cancelText = this.scene.add.text(menuWidth / 2 + 58, 172, "Hủy", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const updateQuantityViews = () => {
            qtyText.setText(`${this.saleQuantity}`);
            totalText.setText(`Nhận: ${unitPrice * this.saleQuantity} vàng`);
            minusBtn.setFillStyle(this.saleQuantity > 1 ? 0x434d60 : 0x2a2f3a);
            plusBtn.setFillStyle(this.saleQuantity < maxQuantity ? 0x434d60 : 0x2a2f3a);
        };

        minusBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (this.saleQuantity > 1) {
                this.saleQuantity -= 1;
                updateQuantityViews();
            }
        });

        plusBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (this.saleQuantity < maxQuantity) {
                this.saleQuantity += 1;
                updateQuantityViews();
            }
        });

        confirmBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            onConfirm(this.saleQuantity);
            this.hideConfirmModal();
        });

        cancelBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            this.hideConfirmModal();
        });

        updateQuantityViews();

        this.confirmModal.add([
            bg, title, priceText, quantityLabel,
            minusBtn, minusText, qtyBox, qtyText, plusBtn, plusText,
            totalText, confirmBtn, confirmText, cancelBtn, cancelText
        ]);

        if (this.parentContainer) {
            this.parentContainer.add(this.confirmModal);
        }
    }

    showItemInfo(itemData, inventoryItem = null) {
        this.hideAll();

        const modalWidth = 320;
        const modalHeight = 220;
        const x = this.scene.scale.width / 2;
        const y = this.scene.scale.height / 2;
        const quality = inventoryItem?.quality ?? itemData.quality ?? "Nomal";
        const qualityLabel = (quality && quality !== "undefined") ? (quality === "Nomal" ? "Nomal" : quality.charAt(0).toUpperCase() + quality.slice(1)) : "Nomal";

        this.infoModal = this.scene.add.container(x, y);
        this.infoModal.setDepth(10020);

        const bg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0x5ec5ff, 1);

        const title = this.scene.add.text(0, -78, itemData.name, {
            fontSize: "22px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const desc = this.scene.add.text(0, -32, itemData.description || "Không có mô tả.", {
            fontSize: "14px",
            color: "#dfe6ee",
            align: "center",
            wordWrap: { width: modalWidth - 30 }
        }).setOrigin(0.5);

        const meta = this.scene.add.text(0, 18, `Loại: ${itemData.type || "-"}   |   Quality: ${qualityLabel}   |   Giá: ${Number(itemData.sell_price ?? itemData.price ?? itemData.gold ?? 10)}`, {
            fontSize: "13px",
            color: "#ffd76a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const closeBtn = this.scene.add.rectangle(0, 78, 120, 32, 0x4d90ff, 1)
            .setInteractive({ useHandCursor: true });
        const closeText = this.scene.add.text(0, 78, "Đóng", {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        closeBtn.on("pointerup", () => {
            this.hideInfoModal();
        });

        this.infoModal.add([bg, title, desc, meta, closeBtn, closeText]);
        if (this.parentContainer) {
            this.parentContainer.add(this.infoModal);
        }
    }
    
}