import SaveManager from "../managers/SaveManager.js";
import items, { getItemBackgroundKey, getItemRequiredLevel } from "../assets/data/item.js";
import Phaser from "phaser";
import { HERO_SKILL_INFO, CLASS_LABELS, HERO_PASSIVE_INFO } from "../assets/data/heroSkills.js";
export default class HeroDetailPopup {

    constructor(scene) {

        this.scene = scene;
        this.currentHero = null;
        this.equipmentItemImages = {};
        this.equipmentItemQuantityTexts = {};
        this.equipmentItemLevelTexts = {};
        this.inventoryItemViews = [];
        this.actionMenu = null;
        this.toastText = null;
        this.toastTimer = null;

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        this.container.setDepth(9999);

        this.activeTab = "inventory";

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
            this.hideItemMenu();
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
            "", {
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
            "", {
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
            "", {
            fontSize: "16px",
            color: "#000000"
        }
        );

        // =========================
        // Experience
        // =========================

        // this.exp = scene.add.text(
        //     this.cx - 115,
        //     this.cy - 345,
        //     "", {
        //     fontSize: "16px",
        //     color: "#000000"
        // }
        // );

        this.expBarBg = scene.add.rectangle(
            this.cx - 185,
            this.cy - 305,
            170,
            12,
            0x2b3240
        );

        this.expBarFill = scene.add.rectangle(
            this.cx - 185 - 85,
            this.cy - 305,
            0,
            10,
            0x4ec2ff
        ).setOrigin(0, 0.5);

        this.expBarText = scene.add.text(
            this.cx - 185,
            this.cy - 330,
            "",
            {
                fontSize: "12px",
                color: "#111111",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // =========================
        // Equipment Slots
        // =========================

        this.equipmentSlots = [];

        this.createEquipmentSlots();

        // Tạm thời tắt drag item để tránh tương tác kéo thả khi đang test UI
        // this.scene.input.on("dragstart", this.handleDragStart, this);
        // this.scene.input.on("drag", this.handleDrag, this);
        // this.scene.input.on("dragend", this.handleDragEnd, this);
        // this.scene.input.on("drop", this.handleDrop, this);

        // =========================
        // Inventory (Viewport tinh chỉnh chuẩn)
        // =========================
        this.inventoryContainer = scene.add.container(0, 0);

        this.inventorySlots = [];
        this.scrollY = 0;
        this.minScrollY = 0;
        this.maxScrollY = 0;

        this.viewX = this.cx - 245;
        const tabAreaTop = this.cy - 217;
        const tabHeight = 30;
        this.viewY = tabAreaTop + tabHeight + 4; 
        this.viewWidth = 510;

        const panelBottom = this.cy + this.panelHeight / 2;
        // Chừa lề đáy popup khoảng 15px để khung nhìn đẹp mắt
        const availableHeight = panelBottom - 15 - this.viewY;
        const slotTotalHeight = 80 + 4; // slotSize + gap
        // Tính chiều cao bằng đúng số hàng hiển thị vừa vặn
        const maxFittingRows = Math.floor(availableHeight / slotTotalHeight);
        this.viewHeight = maxFittingRows * slotTotalHeight;

        // Tạo GeometryMask để cắt xén phẳng các ô cuộn
        const maskShape = scene.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(this.viewX, this.viewY, this.viewWidth, this.viewHeight);
        this.inventoryMask = maskShape.createGeometryMask();

        // Vùng nhận tương tác cuộn
        this.scrollZone = scene.add.zone(
            this.viewX + this.viewWidth / 2,
            this.viewY + this.viewHeight / 2,
            this.viewWidth,
            this.viewHeight
        ).setOrigin(0.5).setInteractive().setDepth(12);

        this.createInventoryGrid(0);
        this.tabs = {};
        this.tabObjects = [];

        this.skillContainer = scene.add.container(0, 0);
        this.skillContainer.setVisible(false);

        this.passiveContainer = scene.add.container(0, 0);
        this.passiveContainer.setVisible(false);
        this.createTabs();
        this.setupInventoryScrollEvents();

        // =========================
        // Stats
        // =========================
        this.statTexts = {};
        this.createStatText("attack_physical", "Physic Dame:", this.cx - 225, this.cy - 300);
        this.createStatText("attack_magic", "Mage Dame:", this.cx + 25, this.cy - 300);
        this.createStatText("defense", "Armor:", this.cx - 225, this.cy - 270);
        this.createStatText("magic_resistance", "Magic resistance:", this.cx + 25, this.cy - 270);
        this.createStatText("hp", "HP:", this.cx - 225, this.cy - 240);
        this.createStatText("mp", "MP:", this.cx + 25, this.cy - 240);

        // Phân cấp depth rõ ràng
        this.inventoryContainer.setDepth(5);

        // Tấm che phần trên (Avatar & Chỉ số & 3 Tab)
        const topCover = scene.add.rectangle(
            this.cx,
            this.cy - 305,
            this.panelWidth,
            240,
            0xffffff
        ).setOrigin(0.5).setDepth(15);

        // [MỚI] Tấm che phần đáy popup: che kín các ô đồ vượt quá viền dưới
        // const bottomCoverHeight = 120;
        // const bottomCoverY = (this.cy + this.panelHeight / 2) + bottomCoverHeight / 2 - 2;
        // const bottomCover = scene.add.rectangle(
        //     this.cx,
        //     bottomCoverY,
        //     this.panelWidth + 10,
        //     bottomCoverHeight,
        //     0xffffff
        // ).setOrigin(0.5).setDepth(15);

        // Nút đóng
        const closeButton = scene.add.text(
            this.cx + this.panelWidth / 2 - 20,
            this.cy - this.panelHeight / 2 + 20,
            "×", {
            fontSize: "30px",
            color: "#000000",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(100);

        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on("pointerup", () => this.hide());
        closeButton.on("pointerover", () => closeButton.setColor("#ff0000"));
        closeButton.on("pointerout", () => closeButton.setColor("#000000"));

        // =========================
        // Add Container
        // =========================
        this.container.add([
            overlay,
            panel,
            this.inventoryContainer, // Nằm dưới lớp che (Depth 5)
            topCover,                // Che mép trên (Depth 15)
            //bottomCover,             // [MỚI] Che mép dưới (Depth 15)
            this.avatar,
            this.name,
            this.role,
            this.level,
            this.expBarText,
            this.expBarBg,
            this.expBarFill,
            ...this.equipmentSlots,
            ...Object.values(this.statTexts),
            ...this.tabObjects,
            this.skillContainer,
            this.passiveContainer,
            closeButton
        ]);
    }

    // =====================================================
    // Tabs
    // =====================================================

    createTabs() {

        const tabWidth = 120;
        const tabHeight = 30;
        const gap = 6;

        const startX = this.cx - 240;
        const y = this.cy - 217;

        const defs = [
            { id: "inventory", label: "Inventory" },
            { id: "skill", label: "Skill" },
            { id: "passive", label: "Passive" }
        ];

        defs.forEach((def, index) => {

            const x = startX + index * (tabWidth + gap);

            const bg = this.scene.add.rectangle(
                x,
                y,
                tabWidth,
                tabHeight,
                0xdddddd
            )
                .setOrigin(0)
                .setStrokeStyle(1, 0x888888)
                .setInteractive({ useHandCursor: true });

            const label = this.scene.add.text(
                x + tabWidth / 2,
                y + tabHeight / 2,
                def.label, {
                fontSize: "16px",
                color: "#000000",
                fontStyle: "bold"
            }
            ).setOrigin(0.5);

            bg.setDepth(50);
            label.setDepth(51);

            bg.on("pointerup", (pointer) => {
                if (pointer.event) {
                    pointer.event.stopPropagation();
                }
                this.setTab(def.id);
            });

            this.tabs[def.id] = { bg, label };
            this.tabObjects.push(bg, label);
        });

        this.setTab("inventory");
    }

    setTab(tabId) {

        this.activeTab = tabId;
        this.hideItemMenu();

        Object.entries(this.tabs).forEach(([id, tab]) => {
            const active = id === tabId;

            tab.bg.setFillStyle(active ? 0x3366cc : 0xdddddd);
            tab.label.setColor(active ? "#ffffff" : "#000000");
        });

        // Container ẩn thì các object bên trong cũng không nhận click/drop
        this.inventoryContainer.setVisible(tabId === "inventory");
        this.inventoryContainer.setDepth(tabId === "inventory" ? 5 : 1);
        this.scrollZone.setVisible(tabId === "inventory");
        this.scrollZone.setActive(tabId === "inventory");
        this.skillContainer.setVisible(tabId === "skill");
        this.passiveContainer.setVisible(tabId === "passive");
    }

    getHeroPassiveList(hero) {
        const passiveMap = {
            mace: "mace_passive",
            mage: "mage_passive",
            nature: "nature_passive",
            tank: "mace_passive",
            dps: "mage_passive",
            healer: "nature_passive",
        };

        const heroName = String(hero?.name || "").toLowerCase();
        const heroRole = String(hero?.role || "").toLowerCase();
        const passiveId = passiveMap[heroName] || passiveMap[heroRole] || "mace_passive";

        return [{
            id: passiveId,
            info: HERO_PASSIVE_INFO[passiveId] || {
                name: passiveId,
                description: "Passive",
                icon: null,
            },
            level: this.getPassiveLevel(hero, passiveId),
        }];
    }

    getPassiveLevel(hero, passiveId) {
        if (!hero) {
            return 0;
        }

        const savedHero = SaveManager.loadHero(hero.id) || {};
        const savedPassives = savedHero.passives || {};
        const value = Number(savedPassives[passiveId] ?? 0);

        return Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;
    }

    getHeroLevel(hero) {
        if (!hero) {
            return 1;
        }

        const savedHero = SaveManager.loadHero(hero.id) || {};
        return Math.max(1, Number(savedHero.level ?? hero.level ?? 1) || 1);
    }

    getAvailablePassivePoints(hero) {
        const heroLevel = this.getHeroLevel(hero);
        const savedHero = SaveManager.loadHero(hero.id) || {};
        const currentPassives = savedHero.passives || {};
        const spentPoints = Object.values(currentPassives).reduce((sum, value) => {
            const level = Number(value) || 0;
            return sum + Math.max(0, level);
        }, 0);

        return Math.max(0, heroLevel - spentPoints);
    }

    updatePassiveLevel(hero, passiveId, delta) {
        if (!hero || !passiveId) {
            return;
        }

        const saveData = SaveManager.load();
        const heroKey = String(hero.id);
        const currentHeroSave = saveData.heroes?.[heroKey] || { ...hero, equipment: {}, passives: {} };

        const currentPassives = { ...(currentHeroSave.passives || {}) };
        const currentLevel = Number(currentPassives[passiveId] || 0);

        if (delta > 0) {
            const availablePoints = this.getAvailablePassivePoints(hero);
            if (availablePoints <= 0 || currentLevel >= 10) {
                return;
            }
        }

        if (delta < 0 && currentLevel <= 0) {
            return;
        }

        const nextLevel = Math.max(0, Math.min(10, currentLevel + delta));

        if (nextLevel === currentLevel) {
            return;
        }

        currentPassives[passiveId] = nextLevel;

        saveData.heroes = saveData.heroes || {};
        saveData.heroes[heroKey] = {
            ...currentHeroSave,
            passives: currentPassives,
        };

        SaveManager.save(saveData);
        this.renderPassives(this.currentHero);
        this.refreshStats();
    }

    renderSkills(hero) {

        this.skillContainer.removeAll(true);

        const startX = this.cx - 240;
        const startY = this.cy - 170;
        const rowWidth = 504;
        const rowHeight = 96;
        const gap = 8;

        // Tiêu đề class
        const classLabel = CLASS_LABELS[hero.role] || hero.role || "-";

        this.skillContainer.add(
            this.scene.add.text(
                startX,
                startY,
                `Class: ${classLabel}`, {
                fontSize: "18px",
                color: "#000000",
                fontStyle: "bold"
            }
            )
        );

        const skills = hero.skills || [];

        if (skills.length === 0) {
            this.skillContainer.add(
                this.scene.add.text(
                    startX,
                    startY + 34,
                    "Class này chưa có skill", { fontSize: "16px", color: "#666666" }
                )
            );
            return;
        }

        skills.forEach((skillData, index) => {

            const info = HERO_SKILL_INFO[skillData.id] || {
                name: skillData.id,
                icon: null,
                description: ""
            };

            const y = startY + 34 + index * (rowHeight + gap);

            const bg = this.scene.add.rectangle(
                startX,
                y,
                rowWidth,
                rowHeight,
                0xf0f0f0
            )
                .setOrigin(0)
                .setStrokeStyle(1, 0x888888);

            const iconFrame = this.scene.add.rectangle(
                startX + 10,
                y + 10,
                76,
                76,
                0xffffff
            )
                .setOrigin(0)
                .setStrokeStyle(2, 0xe5c07b);

            const objects = [bg, iconFrame];

            if (info.icon && this.scene.textures.exists(info.icon)) {
                const icon = this.scene.add.image(
                    startX + 48,
                    y + 48,
                    info.icon
                );

                icon.setDisplaySize(64, 64);
                objects.push(icon);
            }

            const name = this.scene.add.text(
                startX + 100,
                y + 10,
                info.name, {
                fontSize: "18px",
                color: "#000000",
                fontStyle: "bold"
            }
            );

            const cooldown = this.scene.add.text(
                startX + rowWidth - 10,
                y + 12,
                `CD: ${skillData.cooldown ?? "-"}s`, {
                fontSize: "14px",
                color: "#555555"
            }
            ).setOrigin(1, 0);

            const description = this.scene.add.text(
                startX + 100,
                y + 38,
                info.description, {
                fontSize: "14px",
                color: "#333333",
                wordWrap: { width: rowWidth - 115 }
            }
            );

            objects.push(name, cooldown, description);

            this.skillContainer.add(objects);
        });
    }

    renderPassives(hero) {
        this.passiveContainer.removeAll(true);

        const startX = this.cx - 240;
        const startY = this.cy - 170;
        const rowWidth = 504;
        const rowHeight = 96;
        const gap = 8;

        const passives = this.getHeroPassiveList(hero);
        const availablePoints = this.getAvailablePassivePoints(hero);

        this.passiveContainer.add(
            this.scene.add.text(
                startX,
                startY,
                `Class Passive: ${CLASS_LABELS[hero.role] || hero.role || "-"}`, {
                fontSize: "18px",
                color: "#000000",
                fontStyle: "bold"
            }
            )
        );

        this.passiveContainer.add(
            this.scene.add.text(
                startX + 260,
                startY,
                `Điểm còn: ${availablePoints}`, {
                fontSize: "16px",
                color: availablePoints > 0 ? "#1d6f42" : "#7a1f1f",
                fontStyle: "bold"
            }
            )
        );

        if (passives.length === 0) {
            this.passiveContainer.add(
                this.scene.add.text(
                    startX,
                    startY + 34,
                    "Không có passive", { fontSize: "16px", color: "#666666" }
                )
            );
            return;
        }

        passives.forEach((passive, index) => {
            const info = passive.info || { name: passive.id, icon: null, description: "" };
            const y = startY + 34 + index * (rowHeight + gap);

            const bg = this.scene.add.rectangle(
                startX,
                y,
                rowWidth,
                rowHeight,
                0xf0f0f0
            )
                .setOrigin(0)
                .setStrokeStyle(1, 0x888888);

            const iconFrame = this.scene.add.rectangle(
                startX + 10,
                y + 10,
                76,
                76,
                0xffffff
            )
                .setOrigin(0)
                .setStrokeStyle(2, 0xe5c07b);

            const objects = [bg, iconFrame];

            if (info.icon && this.scene.textures.exists(info.icon)) {
                const icon = this.scene.add.image(startX + 48, y + 48, info.icon);
                icon.setDisplaySize(64, 64);
                objects.push(icon);
            }

            const name = this.scene.add.text(
                startX + 100,
                y + 10,
                info.name, {
                fontSize: "18px",
                color: "#000000",
                fontStyle: "bold"
            }
            );

            const levelText = this.scene.add.text(
                startX + rowWidth - 100,
                y + 12,
                `Lv ${passive.level}/${10}`, {
                fontSize: "14px",
                color: "#333333",
                fontStyle: "bold"
            }
            ).setOrigin(1, 0);

            const description = this.scene.add.text(
                startX + 100,
                y + 38,
                info.description, {
                fontSize: "14px",
                color: "#333333",
                wordWrap: { width: rowWidth - 120 }
            }
            );

            const minusBtn = this.scene.add.text(
                startX + rowWidth - 50,
                y + 52,
                "-", {
                fontSize: "28px",
                color: passive.level > 0 ? "#000000" : "#999999",
                fontStyle: "bold"
            }
            ).setInteractive({ useHandCursor: true });
            minusBtn.on("pointerup", () => this.updatePassiveLevel(hero, passive.id, -1));
            minusBtn.setAlpha(passive.level > 0 ? 1 : 0.45);

            const plusBtn = this.scene.add.text(
                startX + rowWidth - 20,
                y + 52,
                "+", {
                fontSize: "28px",
                color: availablePoints > 0 && passive.level < 10 ? "#000000" : "#999999",
                fontStyle: "bold"
            }
            ).setInteractive({ useHandCursor: true });
            plusBtn.on("pointerup", () => this.updatePassiveLevel(hero, passive.id, 1));
            plusBtn.setAlpha(availablePoints > 0 && passive.level < 10 ? 1 : 0.45);

            objects.push(name, levelText, description, minusBtn, plusBtn);
            this.passiveContainer.add(objects);
        });
    }
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

    createStatText(key, label, x, y) {

        const text = this.scene.add.text(
            x,
            y,
            `${label} 0`, {
            fontSize: "15px",
            color: "#000000"
        }
        );

        this.statTexts[key] = text;
    }

    getExperienceToNextLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    updateExpBar() {
        if (!this.currentHero) {
            return;
        }

        const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
        const heroLevel = Number(savedHero.level ?? this.currentHero.level ?? 1);
        const currentExp = Number(savedHero.experience ?? this.currentHero.experience ?? 0);
        const requiredExp = this.getExperienceToNextLevel(heroLevel);
        const barWidth = 170;
        const fillRatio = requiredExp > 0 ? Math.min(1, currentExp / requiredExp) : 0;

        this.expBarFill.width = barWidth * fillRatio;
        this.expBarText.setText(`${currentExp}/${requiredExp}`);

        // this.exp.setText(
        //     `Exp: ${currentExp}/${requiredExp}`
        // );
    }

    refreshStats() {
        if (!this.currentHero) {
            return;
        }

        const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const effectiveHero = SaveManager.getEffectiveHero(this.currentHero);

        this.renderInventory(inventory);
        this.renderEquipment(savedHero.equipment || {});
        this.renderSkills(this.currentHero);
        this.renderPassives(this.currentHero);

        this.level.setText(
            `Lv: ${savedHero.level ?? this.currentHero.level ?? 1}`
        );

        this.updateExpBar();

        this.statTexts.attack_physical.setText(
            `Physic Dame: ${Math.round(Number(effectiveHero.attack_physical || 0))}`
        );

        this.statTexts.attack_magic.setText(
            `Mage Dame: ${Math.round(Number(effectiveHero.attack_magic || 0))}`
        );

        this.statTexts.defense.setText(
            `Armor: ${Math.round(Number(effectiveHero.armor ?? effectiveHero.defense ?? 0))}`
        );

        this.statTexts.magic_resistance.setText(
            `Magic resistance: ${Math.round(Number(effectiveHero.magic_resistance || 0))}`
        );

        this.statTexts.hp.setText(
            `HP: ${Math.round(Number(effectiveHero.hp || 0))}`
        );

        this.statTexts.mp.setText(
            `MP: ${Math.round(Number(effectiveHero.mp || 0))}`
        );
    }

    show(hero) {

        this.currentHero = hero;
        this.hideItemMenu();

        const savedHero = SaveManager.loadHero(hero.id) || {};
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const effectiveHero = SaveManager.getEffectiveHero(hero);

        this.renderInventory(inventory);
        this.renderEquipment(savedHero.equipment || {});
        this.renderSkills(hero);
        this.renderPassives(hero);
        this.setTab("inventory");

        this.avatar.setTexture(hero.avatar);
        this.name.setText(hero.name || "Unknown");
        this.role.setText(hero.role || "-");

        this.level.setText(
            `Lv: ${savedHero.level ?? hero.level ?? 1}`
        );

        this.updateExpBar();

        this.statTexts.attack_physical.setText(
            `Physic Dame: ${Math.round(Number(effectiveHero.attack_physical || 0))}`
        );

        this.statTexts.attack_magic.setText(
            `Mage Dame: ${Math.round(Number(effectiveHero.attack_magic || 0))}`
        );

        this.statTexts.defense.setText(
            `Armor: ${Math.round(Number(effectiveHero.armor ?? effectiveHero.defense ?? 0))}`
        );

        this.statTexts.magic_resistance.setText(
            `Magic resistance: ${Math.round(Number(effectiveHero.magic_resistance || 0))}`
        );

        this.statTexts.hp.setText(
            `HP: ${Math.round(Number(effectiveHero.hp || 0))}`
        );

        this.statTexts.mp.setText(
            `MP: ${Math.round(Number(effectiveHero.mp || 0))}`
        );

        this.container.setVisible(true);
        this.setInventoryScroll(0); // Đưa thanh cuộn về vị trí đầu danh sách khi mở popup
    }

    hide() {
        this.hideItemMenu();
        this.container.setVisible(false);
    }

    isStackableEquipmentSlot(slotType) {
        return slotType === "potion" || slotType === "food";
    }

    isWeaponClassCompatible(itemData, hero = this.currentHero) {
        if (!itemData || !hero) {
            return true;
        }

        if (itemData.type !== "weapon") {
            return true;
        }

        const requiredClass = String(itemData.weaponClass || itemData.class || itemData.heroClass || "").trim();

        if (!requiredClass) {
            return true;
        }

        const candidateClasses = [
            hero.name,
            hero.className,
            hero.role,
            hero.heroClass,
            hero.class,
        ].filter(Boolean).map(value => String(value).trim());

        return candidateClasses.some(className => className.toLowerCase() === requiredClass.toLowerCase());
    }

    getEquipmentEntry(equipment = {}, slotType) {
        const entry = equipment?.[slotType];

        if (typeof entry === "string") {
            return {
                itemId: entry,
                quantity: 1,
                quality: "Nomal",
                level: 1
            };
        }

        if (entry && typeof entry === "object" && entry.itemId) {
            return {
                itemId: entry.itemId,
                quantity: Number(entry.quantity) > 0 ? Number(entry.quantity) : 1,
                quality: entry.quality ?? "Nomal",
                level: Number(entry.level ?? entry.requiredLevel ?? 1)
            };
        }

        return {
            itemId: null,
            quantity: 0,
            quality: "Nomal",
            level: 1
        };
    }

    updateInventoryViewportVisibility() {
        const containerY = this.inventoryContainer.y || 0;
        const viewportTop = this.viewY;
        const viewportBottom = this.viewY + this.viewHeight;
        const slotSize = 80;

        // Chỉ hiển thị ô nền khi ô đó nằm trọn trong khung nhìn cho phép
        this.inventorySlots.forEach((slot) => {
            const slotTop = slot.y + containerY;
            const slotBottom = slotTop + slotSize;

            // ĐIỀU KIỆN CHUẨN: 
            // - Mép dưới phải lớn hơn viền trên (đã vào viewport)
            // - Mép dưới không được vượt quá viền đáy (không thò ra ngoài popup)
            const isVisible = (slotBottom > viewportTop) && (slotBottom <= viewportBottom + 4);
            slot.setVisible(isVisible);
        });

        // Chỉ hiển thị vật phẩm và chữ đi kèm khi ô đó hợp lệ
        this.inventoryItemViews.forEach((group) => {
            const itemTop = group.y + containerY;
            const itemBottom = itemTop + slotSize;

            const isVisible = (itemBottom > viewportTop) && (itemBottom <= viewportBottom + 4);
            group.elements.forEach(el => {
                if (el && el.setVisible) {
                    el.setVisible(isVisible);
                }
            });
        });
    }
    renderInventory(inventory = []) {

        this.inventoryContainer.removeAll(true);
        this.inventorySlots = [];
        this.inventoryItemViews = [];

        this.createInventoryGrid(inventory.length);

        const slotSize = 80;
        const gap = 4;
        const columns = 6;

        const startX = this.cx - 240;
        const startY = this.viewY + 4;

        inventory.forEach((inventoryItem, index) => {

            if (index >= this.inventorySlots.length) {
                return;
            }

            const itemData = items.find(
                item => item.id === inventoryItem.itemId
            );

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

            const backgroundKey = getItemBackgroundKey(inventoryItem.quality || "Nomal");
            const itemBackground = this.scene.add.image(
                x + slotSize / 2,
                y + slotSize / 2,
                backgroundKey
            );
            itemBackground.setDisplaySize(slotSize, slotSize);

            const itemImage = this.scene.add.image(
                x + slotSize / 2,
                y + slotSize / 2,
                itemData.icon
            );
            itemImage.setDisplaySize(slotSize - 6, slotSize - 6);

            itemImage.setInteractive({ useHandCursor: true });
            itemImage.itemId = inventoryItem.itemId;
            itemImage.quality = inventoryItem.quality ?? null;
            itemImage.level = Number(inventoryItem.level ?? itemData.level ?? getItemRequiredLevel(itemData));
            itemImage.dragStartX = itemImage.x;
            itemImage.dragStartY = itemImage.y;

            itemImage.on("pointerdown", (pointer) => {
                itemImage.downX = pointer.x;
                itemImage.downY = pointer.y;
            });

            itemImage.on("pointerdown", (pointer) => {
                itemImage.downX = pointer.x;
                itemImage.downY = pointer.y;
            });

            itemImage.on("pointerup", (pointer) => {
                if (pointer.event) pointer.event.stopPropagation();

                const dist = Phaser.Math.Distance.Between(
                    itemImage.downX || pointer.x,
                    itemImage.downY || pointer.y,
                    pointer.x,
                    pointer.y
                );

                // Dưới 8px mới tính là thao tác Click mở Menu
                if (dist < 8) {
                    const screenY = itemImage.y + this.inventoryContainer.y;
                    if (screenY >= this.viewY && screenY <= this.viewY + this.viewHeight) {
                        this.showItemMenu(itemImage.x, screenY, slotSize, itemData, false, null, inventoryItem);
                    }
                }
            });

            const quantity = this.scene.add.text(
                x + slotSize - 3,
                y + slotSize - 3,
                `${inventoryItem.quantity}`, {
                fontSize: "14px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3
            }).setOrigin(1, 1);

            const levelText = this.scene.add.text(
                x + 6,
                y + slotSize - 12,
                `Lv.${itemImage.level}`, {
                fontSize: "10px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3
            }).setOrigin(0, 1);

            // Gán mask để cắt rìa chuẩn xác
            if (this.inventoryMask) {
                itemBackground.setMask(this.inventoryMask);
                itemImage.setMask(this.inventoryMask);
                quantity.setMask(this.inventoryMask);
                levelText.setMask(this.inventoryMask);
            }

            this.inventoryContainer.add([
                itemBackground,
                itemImage,
                quantity,
                levelText
            ]);

            this.inventoryItemViews.push({
                y: y,
                elements: [itemBackground, itemImage, quantity, levelText]
            });
        });

        this.updateInventoryViewportVisibility();
    }

    renderEquipment(equipment = {}) {

        Object.values(this.equipmentItemImages).forEach(image => {
            image.destroy();
        });

        Object.values(this.equipmentItemQuantityTexts).forEach(text => {
            text.destroy();
        });

        Object.values(this.equipmentItemLevelTexts).forEach(text => {
            text.destroy();
        });

        this.equipmentItemImages = {};
        this.equipmentItemQuantityTexts = {};
        this.equipmentItemLevelTexts = {};

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
            // Tạm thời tắt kéo thả item
            // this.scene.input.setDraggable(itemImage);
            itemImage.itemId = itemId;
            itemImage.quality = slotEntry.quality ?? "Nomal";
            itemImage.level = Number(slotEntry.level ?? itemData.level ?? getItemRequiredLevel(itemData));
            itemImage.equipmentSlotType = slot.slotType;
            itemImage.dragStartX = itemImage.x;
            itemImage.dragStartY = itemImage.y;

            // Click vào trang bị đang mặc để mở menu
            itemImage.on("pointerup", (pointer) => {
                if (pointer.event) {
                    pointer.event.stopPropagation();
                }
                const dist = Phaser.Math.Distance.Between(
                    itemImage.dragStartX,
                    itemImage.dragStartY,
                    itemImage.x,
                    itemImage.y
                );
                if (dist < 5) {
                    this.showItemMenu(itemImage.x, itemImage.y, 48, itemData, true, slot.slotType, null, itemImage.quality, itemImage.level);
                }
            });

            const levelText = this.scene.add.text(
                slot.x - 18,
                slot.y + 18,
                `Lv.${itemImage.level}`,
                {
                    fontSize: "10px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3
                }
            ).setOrigin(0, 1);

            this.container.add(itemImage);
            this.container.add(levelText);
            this.equipmentItemImages[slot.slotType] = itemImage;
            this.equipmentItemLevelTexts[slot.slotType] = levelText;

            if (this.isStackableEquipmentSlot(slot.slotType) && equippedQuantity > 0) {
                const quantityText = this.scene.add.text(
                    slot.x + 26,
                    slot.y + 22,
                    `x${equippedQuantity}`, {
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

    // =====================================================
    // Logic Menu Popup (Trang bị / Bán)
    // =====================================================

    showItemMenu(targetX, targetY, cellSize, itemData, isEquipped = false, slotType = null, inventoryItem = null, equippedQuality = null, equippedLevel = null) {
        this.hideItemMenu();

        const menuWidth = 110;
        const menuHeight = 84;
        const margin = 8;

        const panelRight = this.cx + this.panelWidth / 2;
        const fitsRight = (targetX + cellSize / 2 + margin + menuWidth) <= (panelRight - 10);

        const menuX = fitsRight ?
            targetX + cellSize / 2 + margin :
            targetX - cellSize / 2 - margin - menuWidth;

        const menuY = Phaser.Math.Clamp(
            targetY - cellSize / 2,
            this.cy - this.panelHeight / 2 + 10,
            this.cy + this.panelHeight / 2 - menuHeight - 10
        );

        this.actionMenu = this.scene.add.container(menuX, menuY);
        this.actionMenu.setDepth(10005);

        // Nền Menu
        const bg = this.scene.add.rectangle(0, 0, menuWidth, menuHeight, 0x18212b, 0.96)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xe5c07b, 0.9)
            .setInteractive();

        bg.on("pointerup", pointer => {
            if (pointer.event) pointer.event.stopPropagation();
        });

        // Nút trên: "Tháo trang bị" nếu đang mặc, hoặc "Trang bị" nếu trong inventory
        const firstActionText = isEquipped ? "Tháo ra" : "Trang bị";
        const firstBtn = this.createMenuButton(0, 0, menuWidth, 40, firstActionText, () => {
            if (isEquipped) {
                this.unequipItem({
                    itemId: itemData.id,
                    equipmentSlotType: slotType,
                    quality: equippedQuality ?? "Nomal",
                    level: equippedLevel ?? Number(itemData.level ?? itemData.requiredLevel ?? 1)
                });
            } else {
                const targetSlot = itemData.type === "potion" || itemData.type === "consumable" ?
                    "potion" :
                    (itemData.type === "food" ? "food" : itemData.type);
                this.equipItem(itemData, targetSlot, inventoryItem);
            }
            this.hideItemMenu();
        });

        // Đường phân cách
        const divider = this.scene.add.line(0, 41, 6, 0, menuWidth - 6, 0, 0x3e4f66).setOrigin(0);

        // Nút dưới: "Bán"
        const sellBtn = this.createMenuButton(0, 42, menuWidth, 40, "Bán", () => {
            this.showSellQuantityMenu(targetX, targetY, cellSize, itemData, isEquipped, slotType, inventoryItem, equippedQuality, equippedLevel);

        });

        this.actionMenu.add([bg, firstBtn, divider, sellBtn]);
        this.container.add(this.actionMenu);
    }

    getSellableQuantity(itemData, isEquipped = false, slotType = null, inventoryItem = null, equippedQuality = null, equippedLevel = null) {
        if (isEquipped && slotType) {
            const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
            const equippedEntry = this.getEquipmentEntry(savedHero.equipment || {}, slotType);
            if (this.isStackableEquipmentSlot(slotType)) {
                return Math.max(1, Number(equippedEntry.quantity || 0));
            }
            return 1;
        }

        const quantity = Number(inventoryItem?.quantity ?? 1);
        return Math.max(1, quantity);
    }

    showSellQuantityMenu(targetX, targetY, cellSize, itemData, isEquipped = false, slotType = null, inventoryItem = null, equippedQuality = null, equippedLevel = null) {
        this.hideItemMenu();

        const maxQuantity = this.getSellableQuantity(itemData, isEquipped, slotType, inventoryItem, equippedQuality, equippedLevel);
        const unitPrice = Number(itemData.sell_price || 10);
        let selectedQuantity = 1;

        const menuWidth = 220;
        const menuHeight = 190;
        const margin = 8;

        const panelLeft = this.cx - this.panelWidth / 2;
        const panelRight = this.cx + this.panelWidth / 2;
        const panelTop = this.cy - this.panelHeight / 2;
        const panelBottom = this.cy + this.panelHeight / 2;

        const fitsRight = (targetX + cellSize / 2 + margin + menuWidth) <= (panelRight - 10);

        const menuX = Phaser.Math.Clamp(
            fitsRight ? targetX + cellSize / 2 + margin : targetX - cellSize / 2 - margin - menuWidth,
            panelLeft + 10,
            panelRight - menuWidth - 10
        );

        const menuY = Phaser.Math.Clamp(
            targetY - cellSize / 2,
            panelTop + 10,
            panelBottom - menuHeight - 10
        );

        this.actionMenu = this.scene.add.container(menuX, menuY);
        this.actionMenu.setDepth(10005);

        // Nền menu — theo phong cách Inventory
        const bg = this.scene.add.rectangle(menuWidth / 2, menuHeight / 2, menuWidth, menuHeight, 0x101820, 0.96)
            .setStrokeStyle(3, 0xf4b942, 1)
            .setInteractive();

        bg.on("pointerup", pointer => {
            if (pointer.event) pointer.event.stopPropagation();
        });

        const title = this.scene.add.text(menuWidth / 2, 14, `Bán ${itemData.name || itemData.id}`, {
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: menuWidth - 20 }
        }).setOrigin(0.5, 0);

        const priceText = this.scene.add.text(menuWidth / 2, 44, `${unitPrice} vàng / 1 cái`, {
            fontSize: "14px",
            color: "#ffd76a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const quantityLabel = this.scene.add.text(menuWidth / 2, 68, "Số lượng bán:", {
            fontSize: "14px",
            color: "#dfe6ee"
        }).setOrigin(0.5);

        // Nút trừ
        const minusBtn = this.scene.add.rectangle(menuWidth / 2 - 62, 100, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const minusText = this.scene.add.text(menuWidth / 2 - 62, 100, "-", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Ô số lượng
        const qtyBox = this.scene.add.rectangle(menuWidth / 2, 100, 90, 28, 0xf3f6fb, 1)
            .setStrokeStyle(2, 0x8aa4bf, 0.9);
        const qtyText = this.scene.add.text(menuWidth / 2, 100, `${selectedQuantity}`, {
            fontSize: "16px",
            color: "#1b1b1b",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Nút cộng
        const plusBtn = this.scene.add.rectangle(menuWidth / 2 + 62, 100, 38, 28, 0x434d60, 1)
            .setInteractive({ useHandCursor: true });
        const plusText = this.scene.add.text(menuWidth / 2 + 62, 100, "+", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const totalText = this.scene.add.text(menuWidth / 2, 130, `Nhận: ${unitPrice * selectedQuantity} vàng`, {
            fontSize: "14px",
            color: "#ffd700",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Nút Đồng ý
        const confirmBtn = this.scene.add.rectangle(menuWidth / 2 - 56, 164, 100, 32, 0x4caf50, 1)
            .setInteractive({ useHandCursor: true });
        const confirmText = this.scene.add.text(menuWidth / 2 - 56, 164, "Đồng ý", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Nút Hủy
        const cancelBtn = this.scene.add.rectangle(menuWidth / 2 + 56, 164, 100, 32, 0xe74c3c, 1)
            .setInteractive({ useHandCursor: true });
        const cancelText = this.scene.add.text(menuWidth / 2 + 56, 164, "Hủy", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const updateQuantityViews = () => {
            qtyText.setText(`${selectedQuantity}`);
            totalText.setText(`Nhận: ${unitPrice * selectedQuantity} vàng`);

            minusBtn.setFillStyle(selectedQuantity > 1 ? 0x434d60 : 0x2a2f3a);
            plusBtn.setFillStyle(selectedQuantity < maxQuantity ? 0x434d60 : 0x2a2f3a);
        };

        minusBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (selectedQuantity > 1) {
                selectedQuantity -= 1;
                updateQuantityViews();
            }
        });

        plusBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            if (selectedQuantity < maxQuantity) {
                selectedQuantity += 1;
                updateQuantityViews();
            }
        });

        confirmBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            this.sellItem(itemData, isEquipped, slotType, inventoryItem, selectedQuantity, equippedQuality, equippedLevel);
            this.hideItemMenu();
        });

        cancelBtn.on("pointerup", (pointer) => {
            if (pointer.event) pointer.event.stopPropagation();
            this.hideItemMenu();
        });

        updateQuantityViews();

        this.actionMenu.add([
            bg, title, priceText, quantityLabel,
            minusBtn, minusText, qtyBox, qtyText, plusBtn, plusText,
            totalText, confirmBtn, confirmText, cancelBtn, cancelText
        ]);
        this.container.add(this.actionMenu);
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
            if (pointer.event) {
                pointer.event.stopPropagation();
            }
            onClick();
        });

        container.add([hitArea, label]);
        container.labelText = label; // MỚI: cho phép sửa lại chữ nút từ bên ngoài
        return container;
    }

    hideItemMenu() {
        if (this.actionMenu) {
            this.actionMenu.destroy();
            this.actionMenu = null;
        }
    }

    sellItem(itemData, isEquipped = false, slotType = null, inventoryItem = null, quantity = 1, equippedQuality = null, equippedLevel = null) {
        const saleQuantity = Math.max(1, Number(quantity || 1));
        const saveData = SaveManager.load();
        const price = itemData.sell_price ? itemData.sell_price : 10;

        if (isEquipped && slotType) {
            const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
            const equippedEntry = this.getEquipmentEntry(savedHero.equipment || {}, slotType);
            const currentQuality = equippedQuality ?? equippedEntry.quality ?? "Nomal";
            const currentLevel = Number(equippedLevel ?? equippedEntry.level ?? itemData.level ?? getItemRequiredLevel(itemData));

            const itemInInventory = saveData.inventory.find(item =>
                item.itemId === itemData.id &&
                item.quality === currentQuality &&
                Number(item.level ?? getItemRequiredLevel(itemData)) === currentLevel
            );

            if (this.isStackableEquipmentSlot(slotType)) {
                const nextQuantity = Math.max(0, Number(equippedEntry.quantity || 0) - saleQuantity);
                if (nextQuantity <= 0) {
                    delete savedHero.equipment[slotType];
                } else {
                    savedHero.equipment[slotType] = {
                        ...equippedEntry,
                        quantity: nextQuantity,
                        quality: currentQuality,
                        level: currentLevel
                    };
                }

                if (itemInInventory) {
                    itemInInventory.quantity = Number(itemInInventory.quantity || 0) + saleQuantity;
                } else {
                    saveData.inventory.push({
                        itemId: itemData.id,
                        quantity: saleQuantity,
                        quality: currentQuality,
                        level: currentLevel
                    });
                }
            } else {
                this.unequipItem({
                    itemId: itemData.id,
                    equipmentSlotType: slotType,
                    quality: currentQuality,
                    level: currentLevel
                });
            }
        }

        const freshData = SaveManager.load();
        const inventory = freshData.inventory || [];
        const quality = inventoryItem?.quality ?? equippedQuality ?? null;
        const targetLevel = Number(inventoryItem?.level ?? equippedLevel ?? itemData.level ?? getItemRequiredLevel(itemData));
        const index = inventory.findIndex(item =>
            item.itemId === itemData.id &&
            (quality === null || quality === undefined || item.quality === quality) &&
            Number(item.level ?? getItemRequiredLevel(itemData)) === targetLevel
        );

        if (index !== -1) {
            const quantityLeft = Number(inventory[index].quantity || 0) - saleQuantity;
            if (quantityLeft > 0) {
                inventory[index].quantity = quantityLeft;
            } else {
                inventory.splice(index, 1);
            }

            freshData.player = freshData.player || {};
            freshData.player.gold = Number(freshData.player.gold || 0) + (price * saleQuantity);
            freshData.inventory = inventory;

            SaveManager.save(freshData);
            this.renderInventory(inventory);
        }
    }

    handleDragStart(pointer, gameObject) {

        if (!gameObject.itemId) {
            return;
        }

        this.hideItemMenu();
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

        const isClassCompatible = this.isWeaponClassCompatible(itemData, this.currentHero);

        if (!isCompatibleType || !isClassCompatible) {
            return;
        }

        gameObject.wasEquipped = true;
        this.equipItem(itemData, dropZone.slotType);
    }

    equipItem(itemData, slotType, inventoryItemContext = null) {

        if (!this.currentHero) {
            return false;
        }

        const validSlotTypes = this.equipmentSlots.map(slot => slot.slotType);

        if (!validSlotTypes.includes(slotType)) {
            return false;
        }

        const isStackableSlot = this.isStackableEquipmentSlot(slotType);

        const isCompatible = isStackableSlot ? ["potion", "food", "consumable"].includes(itemData.type) :
            itemData.type === slotType;

        if (!isCompatible) {
            return false;
        }

        if (slotType === "weapon" && !this.isWeaponClassCompatible(itemData, this.currentHero)) {
            console.warn(`Vũ khí ${itemData.name} không phù hợp với hero ${this.currentHero.name}`);
            this.showToast(`${itemData.name || itemData.id} không phù hợp với class ${this.currentHero.name}`);
            return false;
        }

        const saveData = SaveManager.load();
        saveData.heroes = saveData.heroes || {};
        saveData.inventory = saveData.inventory || [];

        const inventory = saveData.inventory;
        const selectedQuality = inventoryItemContext?.quality ?? inventory.find((item) => item.itemId === itemData.id && item.quality)?.quality ?? "Nomal";
        const inventoryItem = inventory.find((item) => {
            const matchedLevel = Number(item.level ?? getItemRequiredLevel(itemData));
            const quality = inventoryItemContext?.quality ?? item.quality ?? null;
            return item.itemId === itemData.id && matchedLevel === Number(inventoryItemContext?.level ?? item.level ?? getItemRequiredLevel(itemData)) && (quality === null || item.quality === quality);
        });

        if (!inventoryItem || inventoryItem.quantity < 1) {
            return false;
        }

        // =========================
        // Kiểm tra level: dùng level THỰC của vật phẩm sắp mặc (inventoryItem),
        // KHÔNG dùng level tĩnh của item.js (luôn = 1)
        // =========================
        const requiredLevel = Number(inventoryItem.level ?? inventoryItemContext?.level ?? getItemRequiredLevel(itemData));
        const heroLevel = Number(this.getHeroLevel(this.currentHero) || 1);

        if (heroLevel < requiredLevel) {
            console.warn(`Hero level ${heroLevel} không đủ để trang bị ${itemData.name || itemData.id} (cần Lv.${requiredLevel})`);
            this.showToast(`Cần đạt Lv.${requiredLevel} để trang bị ${itemData.name || itemData.id} (hiện tại Lv.${heroLevel})`);
            return false;
        }

        const heroKey = String(this.currentHero.id);
        const savedHero = saveData.heroes[heroKey] || this.currentHero;
        const equipment = {
            ...(savedHero.equipment || {})
        };

        const currentEntry = this.getEquipmentEntry(equipment, slotType);
        const previousItemId = currentEntry.itemId;
        const isSameItem = previousItemId === itemData.id;

        if (!isStackableSlot && isSameItem && (inventoryItemContext?.quality ?? currentEntry.quality ?? null) === (currentEntry.quality ?? inventoryItemContext?.quality ?? null)) {
            return false;
        }

        const maxEquippedQuantity = isStackableSlot ? 10 : 1;
        const currentQuantity = isSameItem ? currentEntry.quantity : 0;
        const availableSpace = Math.max(0, maxEquippedQuantity - currentQuantity);
        const transferQuantity = isStackableSlot ?
            Math.min(inventoryItem.quantity, availableSpace) :
            1;

        if (transferQuantity <= 0) {
            return false;
        }

        inventoryItem.quantity -= transferQuantity;

        if (inventoryItem.quantity <= 0) {
            saveData.inventory = inventory.filter(
                item => item !== inventoryItem
            );
        }

        if (previousItemId && !isSameItem) {
            const previousInventoryItem = saveData.inventory.find(
                item => item.itemId === previousItemId && item.quality === (currentEntry.quality ?? "Nomal") && Number(item.level ?? 1) === Number(currentEntry.level ?? 1)
            );

            if (previousInventoryItem) {
                previousInventoryItem.quantity += currentEntry.quantity;
            } else {
                saveData.inventory.push({
                    itemId: previousItemId,
                    quantity: currentEntry.quantity,
                    quality: currentEntry.quality ?? "Nomal",
                    level: Number(currentEntry.level ?? getItemRequiredLevel({ level: 1 }))
                });
            }
        }

        if (isStackableSlot) {
            equipment[slotType] = {
                itemId: itemData.id,
                quantity: currentQuantity + transferQuantity,
                quality: selectedQuality,
                level: Number(inventoryItemContext?.level ?? inventoryItem.level ?? getItemRequiredLevel(itemData))
            };
        } else {
            equipment[slotType] = {
                itemId: itemData.id,
                quantity: 1,
                quality: selectedQuality,
                level: Number(inventoryItemContext?.level ?? inventoryItem.level ?? getItemRequiredLevel(itemData))
            };
        }

        saveData.heroes[heroKey] = {
            ...savedHero,
            equipment
        };

        SaveManager.save(saveData);
        this.refreshStats();

        return true;
    }

    unequipItem(gameObject) {

        if (!this.currentHero) {
            return false;
        }

        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const targetQuality = gameObject.quality ?? "Nomal";
        const targetLevel = Number(gameObject.level ?? 1);
        const hasExistingStack = inventory.some(
            item => item.itemId === gameObject.itemId && item.quality === targetQuality && Number(item.level ?? 1) === targetLevel
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

        const currentQuality = currentEntry.quality ?? targetQuality ?? "Nomal";
        const currentLevel = Number(currentEntry.level ?? gameObject.level ?? targetLevel ?? 1);
        const matchingInventoryItem = inventory.find(
            item => item.itemId === gameObject.itemId && item.quality === currentQuality && Number(item.level ?? 1) === currentLevel
        );
        const quantityToReturn = this.isStackableEquipmentSlot(gameObject.equipmentSlotType) ?
            currentEntry.quantity :
            1;

        if (matchingInventoryItem) {
            matchingInventoryItem.quantity += quantityToReturn;
        } else {
            inventory.push({
                itemId: gameObject.itemId,
                quantity: quantityToReturn,
                quality: currentQuality,
                level: currentLevel
            });
        }

        if (this.isStackableEquipmentSlot(gameObject.equipmentSlotType)) {
            const nextQuantity = currentEntry.quantity - quantityToReturn;

            if (nextQuantity > 0) {
                equipment[gameObject.equipmentSlotType] = {
                    itemId: gameObject.itemId,
                    quantity: nextQuantity,
                    quality: currentQuality,
                    level: currentLevel
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
        this.refreshStats();

        return true;
    }

    createInventoryGrid(totalItemsCount = 0) {
        const startX = this.cx - 240;
        const startY = this.viewY + 4;

        const slotSize = 80;
        const gap = 4;
        const columns = 6;

        // Tính số hàng hiển thị vừa viewport
        const visibleRows = Math.ceil(this.viewHeight / (slotSize + gap));
        const itemRows = Math.ceil(totalItemsCount / columns);
        // Đảm bảo luôn có đủ số hàng để cuộn (tối thiểu lớn hơn visibleRows ít nhất 2 hàng)
        const rows = Math.max(visibleRows + 3, itemRows + 2, 99);

        const totalContentHeight = rows * (slotSize + gap);

        // maxScrollY = 0 (vị trí đầu danh sách)
        this.maxScrollY = 0;
        // minScrollY là khoảng âm tối đa được phép cuộn lên
        this.minScrollY = Math.min(0, this.viewHeight - totalContentHeight);

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
                ).setOrigin(0).setStrokeStyle(1, 0x888888);

                this.inventorySlots.push(slot);
                this.inventoryContainer.add(slot);
            }
        }
    }
    showToast(message, isError = true) {
        this.hideToast();

        this.toastText = this.scene.add.text(
            this.cx,
            this.cy - this.panelHeight / 2 + 55,
            message,
            {
                fontSize: "15px",
                color: isError ? "#ff6b6b" : "#8fffab",
                fontStyle: "bold",
                backgroundColor: "#101820",
                padding: { x: 10, y: 6 },
                align: "center",
                wordWrap: { width: this.panelWidth - 80 }
            }
        ).setOrigin(0.5).setDepth(10010);

        this.container.add(this.toastText);

        this.toastTimer = this.scene.time.delayedCall(1800, () => {
            this.hideToast();
        });
    }

    hideToast() {
        if (this.toastTimer) {
            this.toastTimer.remove(false);
            this.toastTimer = null;
        }

        if (this.toastText) {
            this.toastText.destroy();
            this.toastText = null;
        }
    }
    hide() {
        this.hideItemMenu();
        this.hideToast();
        this.container.setVisible(false);
    }

    setupInventoryScrollEvents() {
        let isPointerDown = false;
        let startY = 0;
        let startScrollY = 0;

        // Lắng nghe thao tác chạm xuống
        this.scene.input.on("pointerdown", (pointer) => {
            if (this.activeTab !== "inventory" || !this.container.visible) return;

            // Kiểm tra con trỏ có nằm trong vùng nhìn của Inventory hay không
            if (
                pointer.x >= this.viewX &&
                pointer.x <= this.viewX + this.viewWidth &&
                pointer.y >= this.viewY &&
                pointer.y <= this.viewY + this.viewHeight
            ) {
                isPointerDown = true;
                startY = pointer.y;
                startScrollY = this.scrollY;
                this.hideItemMenu();
            }
        });

        // Lắng nghe thao tác vuốt / kéo rê
        this.scene.input.on("pointermove", (pointer) => {
            if (!isPointerDown || this.activeTab !== "inventory" || !this.container.visible) return;

            const deltaY = pointer.y - startY;
            // Chỉ cuộn khi người dùng rê chuột/ngón tay một đoạn > 4px
            if (Math.abs(deltaY) > 4) {
                this.setInventoryScroll(startScrollY + deltaY);
            }
        });

        const stopDrag = () => {
            isPointerDown = false;
        };
        this.scene.input.on("pointerup", stopDrag);
        this.scene.input.on("pointerupoutside", stopDrag);

        // Hỗ trợ con lăn chuột (Mouse Wheel)
        this.scene.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
            if (this.activeTab !== "inventory" || !this.container.visible) return;

            if (
                pointer.x >= this.viewX &&
                pointer.x <= this.viewX + this.viewWidth &&
                pointer.y >= this.viewY &&
                pointer.y <= this.viewY + this.viewHeight
            ) {
                this.setInventoryScroll(this.scrollY - deltaY * 0.6);
                this.hideItemMenu();
            }
        });
    }

    updateInventoryScrollBar() {
        // Luôn ẩn thanh cuộn (Track và Thumb)
        if (this.inventoryScrollTrack) {
            this.inventoryScrollTrack.setVisible(false);
        }
        if (this.inventoryScrollThumb) {
            this.inventoryScrollThumb.setVisible(false);
        }
    }

    setInventoryScroll(targetY) {
        this.scrollY = Phaser.Math.Clamp(targetY, this.minScrollY, this.maxScrollY);
        this.inventoryContainer.y = this.scrollY;
        this.updateInventoryScrollBar();
        this.updateInventoryViewportVisibility();
    }
}