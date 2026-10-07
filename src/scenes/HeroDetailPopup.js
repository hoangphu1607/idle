import SaveManager from "../managers/SaveManager.js";
import items, { getItemBackgroundKey, getItemLevelBackgroundKey, getItemRequiredLevel, getDecomposeMaterials } from "../assets/data/item.js";
import ItemActionMenu from "../ui/ItemActionMenu.js";
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
        this.toastText = null;
        this.toastTimer = null;

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        this.container.setDepth(9999);

        // Khởi tạo ItemActionMenu và gán cha là this.container
        this.itemMenu = new ItemActionMenu(scene, this.container);

        this.activeTab = "inventory";

        this.panelWidth = scene.scale.width * 0.8;
        this.panelHeight = scene.scale.height * 0.8;
        this.cx = scene.scale.width / 2;
        this.cy = scene.scale.height / 2;

        const overlay = scene.add.rectangle(
            0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.65
        ).setOrigin(0).setInteractive();

        overlay.on("pointerup", () => this.hide());

        const panel = scene.add.rectangle(
            this.cx, this.cy, this.panelWidth, this.panelHeight, 0xffffff
        ).setInteractive();

        panel.on("pointerup", (pointer) => {
            pointer.event.stopPropagation();
            this.itemMenu.hideAll();
        });

        this.avatar = scene.add.image(this.cx - 185, this.cy - 410, "wizard").setDisplaySize(70, 70);
        this.name = scene.add.text(this.cx - 115, this.cy - 435, "", { fontSize: "18px", color: "#000000" });
        this.role = scene.add.text(this.cx - 115, this.cy - 405, "", { fontSize: "18px", color: "#000000" });
        this.level = scene.add.text(this.cx - 115, this.cy - 375, "", { fontSize: "16px", color: "#000000" });

        this.expBarBg = scene.add.rectangle(this.cx - 185, this.cy - 305, 170, 12, 0x2b3240);
        this.expBarFill = scene.add.rectangle(this.cx - 185 - 85, this.cy - 305, 0, 10, 0x4ec2ff).setOrigin(0, 0.5);
        this.expBarText = scene.add.text(this.cx - 185, this.cy - 330, "", { fontSize: "12px", color: "#111111", fontStyle: "bold" }).setOrigin(0.5);

        this.equipmentSlots = [];
        this.createEquipmentSlots();

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
        const availableHeight = panelBottom - 15 - this.viewY;
        const slotTotalHeight = 80 + 4;
        const maxFittingRows = Math.floor(availableHeight / slotTotalHeight);
        this.viewHeight = maxFittingRows * slotTotalHeight;

        this.scrollZone = scene.add.zone(
            this.viewX + this.viewWidth / 2,
            this.viewY + this.viewHeight / 2,
            this.viewWidth,
            this.viewHeight
        ).setOrigin(0.5).setInteractive().setDepth(12);

        this.createInventoryGrid(0);
        this.tabs = {};
        this.tabObjects = [];

        this.skillContainer = scene.add.container(0, 0).setVisible(false);
        this.passiveContainer = scene.add.container(0, 0).setVisible(false);
        this.createTabs();
        this.setupInventoryScrollEvents();

        this.statTexts = {};
        this.createStatText("attack_physical", "Physic Dame:", this.cx - 225, this.cy - 300);
        this.createStatText("attack_magic", "Mage Dame:", this.cx + 25, this.cy - 300);
        this.createStatText("defense", "Armor:", this.cx - 225, this.cy - 270);
        this.createStatText("magic_resistance", "Magic resistance:", this.cx + 25, this.cy - 270);
        this.createStatText("hp", "HP:", this.cx - 225, this.cy - 240);
        this.createStatText("mp", "MP:", this.cx + 25, this.cy - 240);

        this.inventoryContainer.setDepth(5);

        const topCover = scene.add.rectangle(
            this.cx,
            this.cy - 305,
            this.panelWidth,
            240,
            0xffffff
        ).setOrigin(0.5).setDepth(15);

        const closeButton = scene.add.text(
            this.cx + this.panelWidth / 2 - 20,
            this.cy - this.panelHeight / 2 + 20,
            "×", { fontSize: "30px", color: "#000000", fontStyle: "bold" }
        ).setOrigin(0.5).setDepth(100);

        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on("pointerup", () => this.hide());
        closeButton.on("pointerover", () => closeButton.setColor("#ff0000"));
        closeButton.on("pointerout", () => closeButton.setColor("#000000"));

        this.container.add([
            overlay,
            panel,
            this.inventoryContainer,
            topCover,
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
            const bg = this.scene.add.rectangle(x, y, tabWidth, tabHeight, 0xdddddd)
                .setOrigin(0).setStrokeStyle(1, 0x888888).setInteractive({ useHandCursor: true });

            const label = this.scene.add.text(x + tabWidth / 2, y + tabHeight / 2, def.label, {
                fontSize: "16px", color: "#000000", fontStyle: "bold"
            }).setOrigin(0.5);

            bg.setDepth(50);
            label.setDepth(51);

            bg.on("pointerup", (pointer) => {
                if (pointer.event) pointer.event.stopPropagation();
                this.setTab(def.id);
            });

            this.tabs[def.id] = { bg, label };
            this.tabObjects.push(bg, label);
        });

        this.setTab("inventory");
    }

    setTab(tabId) {
        this.activeTab = tabId;
        this.itemMenu.hideAll();

        Object.entries(this.tabs).forEach(([id, tab]) => {
            const active = id === tabId;
            tab.bg.setFillStyle(active ? 0x3366cc : 0xdddddd);
            tab.label.setColor(active ? "#ffffff" : "#000000");
        });

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
            info: HERO_PASSIVE_INFO[passiveId] || { name: passiveId, description: "Passive", icon: null },
            level: this.getPassiveLevel(hero, passiveId),
        }];
    }

    getPassiveLevel(hero, passiveId) {
        if (!hero) return 0;
        const savedHero = SaveManager.loadHero(hero.id) || {};
        const savedPassives = savedHero.passives || {};
        const value = Number(savedPassives[passiveId] ?? 0);
        return Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;
    }

    getHeroLevel(hero) {
        if (!hero) return 1;
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
        if (!hero || !passiveId) return;

        const saveData = SaveManager.load();
        const heroKey = String(hero.id);
        const currentHeroSave = saveData.heroes?.[heroKey] || { ...hero, equipment: {}, passives: {} };

        const currentPassives = { ...(currentHeroSave.passives || {}) };
        const currentLevel = Number(currentPassives[passiveId] || 0);

        if (delta > 0) {
            const availablePoints = this.getAvailablePassivePoints(hero);
            if (availablePoints <= 0 || currentLevel >= 10) return;
        }

        if (delta < 0 && currentLevel <= 0) return;

        const nextLevel = Math.max(0, Math.min(10, currentLevel + delta));
        if (nextLevel === currentLevel) return;

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
        const classLabel = CLASS_LABELS[hero.role] || hero.role || "-";

        this.skillContainer.add(
            this.scene.add.text(
                startX, startY, `Class: ${classLabel}`, { fontSize: "18px", color: "#000000", fontStyle: "bold" }
            )
        );

        const skills = hero.skills || [];
        if (skills.length === 0) {
            this.skillContainer.add(
                this.scene.add.text(startX, startY + 34, "Class này chưa có skill", { fontSize: "16px", color: "#666666" })
            );
            return;
        }

        skills.forEach((skillData, index) => {
            const info = HERO_SKILL_INFO[skillData.id] || { name: skillData.id, icon: null, description: "" };
            const y = startY + 34 + index * (rowHeight + gap);

            const bg = this.scene.add.rectangle(startX, y, rowWidth, rowHeight, 0xf0f0f0).setOrigin(0).setStrokeStyle(1, 0x888888);
            const iconFrame = this.scene.add.rectangle(startX + 10, y + 10, 76, 76, 0xffffff).setOrigin(0).setStrokeStyle(2, 0xe5c07b);
            const objects = [bg, iconFrame];

            if (info.icon && this.scene.textures.exists(info.icon)) {
                const icon = this.scene.add.image(startX + 48, y + 48, info.icon);
                icon.setDisplaySize(64, 64);
                objects.push(icon);
            }

            const name = this.scene.add.text(startX + 100, y + 10, info.name, { fontSize: "18px", color: "#000000", fontStyle: "bold" });
            const cooldown = this.scene.add.text(startX + rowWidth - 10, y + 12, `CD: ${skillData.cooldown ?? "-"}s`, { fontSize: "14px", color: "#555555" }).setOrigin(1, 0);
            const description = this.scene.add.text(startX + 100, y + 38, info.description, { fontSize: "14px", color: "#333333", wordWrap: { width: rowWidth - 115 } });

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
            this.scene.add.text(startX, startY, `Class Passive: ${CLASS_LABELS[hero.role] || hero.role || "-"}`, {
                fontSize: "18px", color: "#000000", fontStyle: "bold"
            })
        );

        this.passiveContainer.add(
            this.scene.add.text(startX + 260, startY, `Điểm còn: ${availablePoints}`, {
                fontSize: "16px", color: availablePoints > 0 ? "#1d6f42" : "#7a1f1f", fontStyle: "bold"
            })
        );

        if (passives.length === 0) {
            this.passiveContainer.add(
                this.scene.add.text(startX, startY + 34, "Không có passive", { fontSize: "16px", color: "#666666" })
            );
            return;
        }

        passives.forEach((passive, index) => {
            const info = passive.info || { name: passive.id, icon: null, description: "" };
            const y = startY + 34 + index * (rowHeight + gap);

            const bg = this.scene.add.rectangle(startX, y, rowWidth, rowHeight, 0xf0f0f0).setOrigin(0).setStrokeStyle(1, 0x888888);
            const iconFrame = this.scene.add.rectangle(startX + 10, y + 10, 76, 76, 0xffffff).setOrigin(0).setStrokeStyle(2, 0xe5c07b);
            const objects = [bg, iconFrame];

            if (info.icon && this.scene.textures.exists(info.icon)) {
                const icon = this.scene.add.image(startX + 48, y + 48, info.icon);
                icon.setDisplaySize(64, 64);
                objects.push(icon);
            }

            const name = this.scene.add.text(startX + 100, y + 10, info.name, { fontSize: "18px", color: "#000000", fontStyle: "bold" });
            const levelText = this.scene.add.text(startX + rowWidth - 100, y + 12, `Lv ${passive.level}/${10}`, { fontSize: "14px", color: "#333333", fontStyle: "bold" }).setOrigin(1, 0);
            const description = this.scene.add.text(startX + 100, y + 38, info.description, { fontSize: "14px", color: "#333333", wordWrap: { width: rowWidth - 120 } });

            const minusBtn = this.scene.add.text(startX + rowWidth - 50, y + 52, "-", {
                fontSize: "28px", color: passive.level > 0 ? "#000000" : "#999999", fontStyle: "bold"
            }).setInteractive({ useHandCursor: true });
            minusBtn.on("pointerup", () => this.updatePassiveLevel(hero, passive.id, -1));
            minusBtn.setAlpha(passive.level > 0 ? 1 : 0.45);

            const plusBtn = this.scene.add.text(startX + rowWidth - 20, y + 52, "+", {
                fontSize: "28px", color: availablePoints > 0 && passive.level < 10 ? "#000000" : "#999999", fontStyle: "bold"
            }).setInteractive({ useHandCursor: true });
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
            "slot_weapon", "slot_shield", "slot_helmet", "slot_armor",
            "slot_boots", "slot_cloak", "slot_potion", "slot_food"
        ];
        const slotTypes = [
            "weapon", "shield", "helmet", "armor",
            "boots", "cloak", "potion", "food"
        ];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const x = startX + col * (slotSize + gap);
                const y = startY + row * (slotSize + gap);

                const slot = this.scene.add.image(x, y, "inventory_slots", slotFrames[row * columns + col]);
                slot.setDisplaySize(slotSize, slotSize);
                slot.slotType = slotTypes[row * columns + col];
                slot.setInteractive();
                slot.input.dropZone = true;
                this.equipmentSlots.push(slot);
            }
        }
    }

    createStatText(key, label, x, y) {
        const text = this.scene.add.text(x, y, `${label} 0`, { fontSize: "15px", color: "#000000" });
        this.statTexts[key] = text;
    }

    getExperienceToNextLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    updateExpBar() {
        if (!this.currentHero) return;

        const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
        const heroLevel = Number(savedHero.level ?? this.currentHero.level ?? 1);
        const currentExp = Number(savedHero.experience ?? this.currentHero.experience ?? 0);
        const requiredExp = this.getExperienceToNextLevel(heroLevel);
        const barWidth = 170;
        const fillRatio = requiredExp > 0 ? Math.min(1, currentExp / requiredExp) : 0;

        this.expBarFill.width = barWidth * fillRatio;
        this.expBarText.setText(`${currentExp}/${requiredExp}`);
    }

    refreshStats() {
        if (!this.currentHero) return;

        const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const effectiveHero = SaveManager.getEffectiveHero(this.currentHero);

        this.renderInventory(inventory);
        this.renderEquipment(savedHero.equipment || {});
        this.renderSkills(this.currentHero);
        this.renderPassives(this.currentHero);

        this.level.setText(`Lv: ${savedHero.level ?? this.currentHero.level ?? 1}`);
        this.updateExpBar();

        this.statTexts.attack_physical.setText(`Physic Dame: ${Math.round(Number(effectiveHero.attack_physical || 0))}`);
        this.statTexts.attack_magic.setText(`Mage Dame: ${Math.round(Number(effectiveHero.attack_magic || 0))}`);
        this.statTexts.defense.setText(`Armor: ${Math.round(Number(effectiveHero.armor ?? effectiveHero.defense ?? 0))}`);
        this.statTexts.magic_resistance.setText(`Magic resistance: ${Math.round(Number(effectiveHero.magic_resistance || 0))}`);
        this.statTexts.hp.setText(`HP: ${Math.round(Number(effectiveHero.hp || 0))}`);
        this.statTexts.mp.setText(`MP: ${Math.round(Number(effectiveHero.mp || 0))}`);
    }

    show(hero) {
        this.currentHero = hero;
        this.itemMenu.hideAll();

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
        this.level.setText(`Lv: ${savedHero.level ?? hero.level ?? 1}`);

        this.updateExpBar();
        this.statTexts.attack_physical.setText(`Physic Dame: ${Math.round(Number(effectiveHero.attack_physical || 0))}`);
        this.statTexts.attack_magic.setText(`Mage Dame: ${Math.round(Number(effectiveHero.attack_magic || 0))}`);
        this.statTexts.defense.setText(`Armor: ${Math.round(Number(effectiveHero.armor ?? effectiveHero.defense ?? 0))}`);
        this.statTexts.magic_resistance.setText(`Magic resistance: ${Math.round(Number(effectiveHero.magic_resistance || 0))}`);
        this.statTexts.hp.setText(`HP: ${Math.round(Number(effectiveHero.hp || 0))}`);
        this.statTexts.mp.setText(`MP: ${Math.round(Number(effectiveHero.mp || 0))}`);

        this.container.setVisible(true);
        this.setInventoryScroll(0);
    }

    hide() {
        this.itemMenu.hideAll();
        this.hideToast();
        this.container.setVisible(false);
    }

    normalizeEquipmentType(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    isStackableEquipmentSlot(slotType) {
        const normalizedSlotType = this.normalizeEquipmentType(slotType);
        return normalizedSlotType === "potion" || normalizedSlotType === "food";
    }

    isWeaponClassCompatible(itemData, hero = this.currentHero) {
        if (!itemData || !hero) return true;
        if (this.normalizeEquipmentType(itemData.type) !== "weapon") return true;

        const requiredClass = String(itemData.weaponClass || itemData.class || itemData.heroClass || "").trim();
        if (!requiredClass) return true;

        const candidateClasses = [
            hero.name, hero.className, hero.role, hero.heroClass, hero.class
        ].filter(Boolean).map(value => String(value).trim().toLowerCase());

        return candidateClasses.some(className => className === requiredClass.toLowerCase());
    }

    getEquipmentEntry(equipment = {}, slotType) {
        const entry = equipment?.[slotType];
        if (typeof entry === "string") {
            return { itemId: entry, quantity: 1, quality: "Nomal", level: 1 };
        }
        if (entry && typeof entry === "object" && entry.itemId) {
            return {
                itemId: entry.itemId,
                quantity: Number(entry.quantity) > 0 ? Number(entry.quantity) : 1,
                quality: entry.quality ?? "Nomal",
                level: Number(entry.level ?? entry.requiredLevel ?? 1),
                tier: entry.tier ?? null
            };
        }
        return { itemId: null, quantity: 0, quality: "Nomal", level: 1, tier: null };
    }

    updateInventoryViewportVisibility() {
        const containerY = this.inventoryContainer.y || 0;
        const viewportTop = this.viewY;
        const viewportBottom = this.viewY + this.viewHeight;
        const slotSize = 80;

        this.inventorySlots.forEach((slot) => {
            const slotTop = slot.y + containerY;
            const slotBottom = slotTop + slotSize;
            const isVisible = (slotBottom > viewportTop) && (slotBottom <= viewportBottom + 4);
            slot.setVisible(isVisible);
        });

        this.inventoryItemViews.forEach((group) => {
            const itemTop = group.y + containerY;
            const itemBottom = itemTop + slotSize;
            const isVisible = (itemBottom > viewportTop) && (itemBottom <= viewportBottom + 4);
            group.elements.forEach(el => {
                if (el && el.setVisible) el.setVisible(isVisible);
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
            if (index >= this.inventorySlots.length) return;

            const itemData = items.find(item => item.id === inventoryItem.itemId);
            if (!itemData) return;

            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = startX + col * (slotSize + gap);
            const y = startY + row * (slotSize + gap);

            const itemLevelBackground = this.scene.add.image(
                x + slotSize / 2,
                y + slotSize / 2,
                getItemLevelBackgroundKey(inventoryItem.level ?? itemData.level ?? itemData.requiredLevel)
            );
            itemLevelBackground.setDisplaySize(slotSize, slotSize);

            const itemQualityBackground = this.scene.add.image(
                x + slotSize / 2,
                y + slotSize / 2,
                getItemBackgroundKey(inventoryItem.quality || "Nomal")
            );
            itemQualityBackground.setDisplaySize(slotSize + 12, slotSize + 12);

            const itemImage = this.scene.add.image(x + slotSize / 2, y + slotSize / 2, itemData.icon);
            itemImage.setDisplaySize(slotSize - 6, slotSize - 6);
            itemImage.setInteractive({ useHandCursor: true });
            itemImage.itemId = inventoryItem.itemId;
            itemImage.quality = inventoryItem.quality ?? "Nomal";
            itemImage.level = Number(inventoryItem.level ?? itemData.level ?? getItemRequiredLevel(itemData));

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

                if (dist < 8) {
                    const screenY = itemImage.y + this.inventoryContainer.y;
                    if (screenY >= this.viewY && screenY <= this.viewY + this.viewHeight) {
                        this.openItemMenu(itemImage.x, screenY, slotSize, itemData, false, null, inventoryItem);
                    }
                }
            });

            const quantity = this.scene.add.text(x + slotSize - 3, y + slotSize - 3, `${inventoryItem.quantity}`, {
                fontSize: "14px", color: "#ffffff", fontStyle: "bold", stroke: "#000000", strokeThickness: 3
            }).setOrigin(1, 1);

            const levelText = this.scene.add.text(
                x + 6,
                y + slotSize - 12,
                inventoryItem.tier ?? `Lv.${itemImage.level}`,
                {
                fontSize: "10px", color: "#ffffff", fontStyle: "bold", stroke: "#000000", strokeThickness: 3
                }
            ).setOrigin(0, 1);

            this.inventoryContainer.add([itemLevelBackground, itemQualityBackground, itemImage, quantity, levelText]);
            this.inventoryItemViews.push({
                y: y,
                elements: [itemQualityBackground, itemLevelBackground, itemImage, quantity, levelText]
            });
        });

        this.updateInventoryViewportVisibility();
    }

    renderEquipment(equipment = {}) {
        Object.values(this.equipmentItemImages).forEach(image => image.destroy());
        Object.values(this.equipmentItemQuantityTexts).forEach(text => text.destroy());
        Object.values(this.equipmentItemLevelTexts).forEach(text => text.destroy());

        this.equipmentItemImages = {};
        this.equipmentItemQuantityTexts = {};
        this.equipmentItemLevelTexts = {};

        this.equipmentSlots.forEach(slot => {
            const slotEntry = this.getEquipmentEntry(equipment, slot.slotType);
            const itemId = slotEntry.itemId;
            const equippedQuantity = slotEntry.quantity;
            const itemData = items.find(item => item.id === itemId);

            if (!itemData || !this.scene.textures.exists(itemData.icon)) return;

            const itemImage = this.scene.add.image(slot.x, slot.y, itemData.icon);
            itemImage.setDisplaySize(38, 38);
            itemImage.setDepth(slot.depth + 1);
            itemImage.setInteractive({ useHandCursor: true });
            itemImage.itemId = itemId;
            itemImage.quality = slotEntry.quality ?? "Nomal";
            itemImage.level = Number(slotEntry.level ?? itemData.level ?? getItemRequiredLevel(itemData));
            itemImage.tier = slotEntry.tier ?? null;
            itemImage.equipmentSlotType = slot.slotType;

            itemImage.on("pointerup", (pointer) => {
                if (pointer.event) pointer.event.stopPropagation();
                this.openItemMenu(
                    itemImage.x,
                    itemImage.y,
                    48,
                    itemData,
                    true,
                    slot.slotType,
                    null,
                    itemImage.quality,
                    itemImage.level,
                    itemImage.tier
                );
            });

            const levelText = this.scene.add.text(
                slot.x - 18,
                slot.y + 18,
                itemImage.tier ?? `Lv.${itemImage.level}`,
                {
                    fontSize: "10px", color: "#ffffff", fontStyle: "bold", stroke: "#000000", strokeThickness: 3
                }
            ).setOrigin(0, 1);

            this.container.add([itemImage, levelText]);
            this.equipmentItemImages[slot.slotType] = itemImage;
            this.equipmentItemLevelTexts[slot.slotType] = levelText;

            if (this.isStackableEquipmentSlot(slot.slotType) && equippedQuantity > 0) {
                const quantityText = this.scene.add.text(slot.x + 26, slot.y + 22, `x${equippedQuantity}`, {
                    fontSize: "12px", color: "#ffffff", fontStyle: "bold", stroke: "#000000", strokeThickness: 3
                }).setOrigin(1, 1);

                this.container.add(quantityText);
                this.equipmentItemQuantityTexts[slot.slotType] = quantityText;
            }
        });
    }

    // =====================================================
    // Logic Phân tách trang bị trong Popup
    // =====================================================
    decomposeItem(itemData, isEquipped = false, slotType = null, inventoryItem = null, equippedQuality = null, equippedLevel = null, equippedTier = null) {
        const saveData = SaveManager.load();
        const targetLevel = Number(inventoryItem?.level ?? equippedLevel ?? itemData.level ?? getItemRequiredLevel(itemData));
        const targetQuality = inventoryItem?.quality ?? equippedQuality ?? "Nomal";
        const targetTier = inventoryItem?.tier ?? equippedTier ?? null;

        if (isEquipped && slotType && this.currentHero) {
            // Trường hợp 1: Món đồ đang được Hero trang bị trên người
            const heroKey = String(this.currentHero.id);
            const savedHero = saveData.heroes?.[heroKey] || this.currentHero;
            const equipment = { ...(savedHero.equipment || {}) };
            const currentEntry = this.getEquipmentEntry(equipment, slotType);

            if (this.isStackableEquipmentSlot(slotType)) {
                const nextQty = Number(currentEntry.quantity || 0) - 1;
                if (nextQty <= 0) {
                    delete equipment[slotType];
                } else {
                    equipment[slotType] = { ...currentEntry, quantity: nextQty };
                }
            } else {
                delete equipment[slotType];
            }

            saveData.heroes = saveData.heroes || {};
            saveData.heroes[heroKey] = { ...savedHero, equipment };
        } else {
            // Trường hợp 2: Món đồ nằm trong danh sách Inventory của Popup
            const inventory = saveData.inventory || [];
            const itemIndex = inventory.findIndex(item =>
                item.itemId === itemData.id &&
                (item.quality || "Nomal") === targetQuality &&
                Number(item.level ?? getItemRequiredLevel(itemData)) === targetLevel &&
                (item.tier ?? null) === targetTier
            );

            if (itemIndex !== -1) {
                if (inventory[itemIndex].quantity > 1) {
                    inventory[itemIndex].quantity -= 1;
                } else {
                    inventory.splice(itemIndex, 1);
                }
            }
            saveData.inventory = inventory;
        }

        // Lấy danh sách nguyên liệu nhận được (kế thừa đúng level)
        const materials = getDecomposeMaterials(itemData, targetLevel);
        const inventory = saveData.inventory || [];

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

        // Cập nhật lại UI sau khi phân tách
        this.refreshStats();
        this.showToast(`Đã phân tách thành công ${itemData.name}!`, false);
    }

    // =====================================================
    // Gọi ItemActionMenu để mở Menu
    // =====================================================
    openItemMenu(targetX, targetY, cellSize, itemData, isEquipped = false, slotType = null, inventoryItem = null, equippedQuality = null, equippedLevel = null, equippedTier = null) {
        const firstActionText = isEquipped ? "Tháo ra" : "Trang bị";
        const maxSellQty = this.getSellableQuantity(itemData, isEquipped, slotType, inventoryItem, equippedQuality, equippedLevel);

        const actions = [
            {
                label: firstActionText,
                onClick: () => {
                    if (isEquipped) {
                        this.unequipItem({
                            itemId: itemData.id,
                            equipmentSlotType: slotType,
                            quality: equippedQuality ?? "Nomal",
                            level: equippedLevel ?? Number(itemData.level ?? itemData.requiredLevel ?? 1),
                            tier: equippedTier
                        });
                    } else {
                        const normalType = this.normalizeEquipmentType(itemData.type);
                        const targetSlot = normalType === "potion" || normalType === "consumable" ?
                            "potion" : (normalType === "food" ? "food" : normalType);
                        this.equipItem(itemData, targetSlot, inventoryItem);
                    }
                }
            }
        ];

        // Nếu item có decomposition thì thêm action Phân tách
        if (itemData.decomposition) {
            actions.push({
                label: "Phân tách",
                onClick: () => {
                    this.itemMenu.showDecomposeConfirmModal({
                        itemData,
                        inventoryItem: inventoryItem || {
                            level: equippedLevel,
                            quality: equippedQuality,
                            tier: equippedTier
                        },
                        onConfirm: () => {
                            this.decomposeItem(
                                itemData,
                                isEquipped,
                                slotType,
                                inventoryItem,
                                equippedQuality,
                                equippedLevel,
                                equippedTier
                            );
                        }
                    });
                }
            });
        }

        // Action Bán
        actions.push({
            label: "Bán",
            onClick: () => {
                this.itemMenu.showSellConfirmModal({
                    targetX,
                    targetY,
                    cellSize,
                    itemData,
                    maxQuantity: maxSellQty,
                    onConfirm: (qty) => {
                        this.sellItem(
                            itemData,
                            isEquipped,
                            slotType,
                            inventoryItem,
                            qty,
                            equippedQuality,
                            equippedLevel,
                            equippedTier
                        );
                    }
                });
            }
        });

        this.itemMenu.showActionMenu({
            targetX,
            targetY,
            cellSize,
            itemData,
            inventoryItem,
            actions
        });
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
        return Math.max(1, Number(inventoryItem?.quantity ?? 1));
    }

    sellItem(itemData, isEquipped = false, slotType = null, inventoryItem = null, quantity = 1, equippedQuality = null, equippedLevel = null, equippedTier = null) {
        const saleQuantity = Math.max(1, Number(quantity || 1));
        const price = itemData.sell_price ? itemData.sell_price : 10;

        if (isEquipped && slotType) {
            const savedHero = SaveManager.loadHero(this.currentHero.id) || {};
            const equippedEntry = this.getEquipmentEntry(savedHero.equipment || {}, slotType);
            const currentQuality = equippedQuality ?? equippedEntry.quality ?? "Nomal";
            const currentLevel = Number(equippedLevel ?? equippedEntry.level ?? itemData.level ?? getItemRequiredLevel(itemData));

            this.unequipItem({
                itemId: itemData.id,
                equipmentSlotType: slotType,
                quality: currentQuality,
                level: currentLevel,
                tier: equippedTier
            });
        }

        const freshData = SaveManager.load();
        const inventory = freshData.inventory || [];
        const quality = inventoryItem?.quality ?? equippedQuality ?? null;
        const targetLevel = Number(inventoryItem?.level ?? equippedLevel ?? itemData.level ?? getItemRequiredLevel(itemData));
        const targetTier = inventoryItem?.tier ?? equippedTier ?? null;

        const index = inventory.findIndex(item =>
            item.itemId === itemData.id &&
            (quality === null || quality === undefined || item.quality === quality) &&
            Number(item.level ?? getItemRequiredLevel(itemData)) === targetLevel &&
            (item.tier ?? null) === targetTier
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

    equipItem(itemData, slotType, inventoryItemContext = null) {
        if (!this.currentHero) return false;

        const normalizedSlotType = this.normalizeEquipmentType(slotType);
        const validSlotTypes = this.equipmentSlots.map(slot => this.normalizeEquipmentType(slot.slotType));
        if (!validSlotTypes.includes(normalizedSlotType)) return false;

        const normalizedItemType = this.normalizeEquipmentType(itemData?.type);
        const isStackableSlot = this.isStackableEquipmentSlot(normalizedSlotType);
        const isCompatible = isStackableSlot ? ["potion", "food", "consumable"].includes(normalizedItemType) :
            normalizedItemType === normalizedSlotType;

        if (!isCompatible) {
            this.showToast(`Trang bị không phù hợp ô ${normalizedSlotType}`);
            return false;
        }

        if (normalizedSlotType === "weapon" && !this.isWeaponClassCompatible(itemData, this.currentHero)) {
            this.showToast(`${itemData.name || itemData.id} không phù hợp với class ${this.currentHero.name}`);
            return false;
        }

        const saveData = SaveManager.load();
        saveData.heroes = saveData.heroes || {};
        saveData.inventory = saveData.inventory || [];
        const inventory = saveData.inventory;

        const targetQuality = inventoryItemContext?.quality || "Nomal";
        const targetLevel = Number(inventoryItemContext?.level ?? itemData.level ?? getItemRequiredLevel(itemData));
        const targetTier = inventoryItemContext?.tier ?? null;

        const inventoryItem = inventory.find((item) => {
            const itemLvl = Number(item.level ?? getItemRequiredLevel(itemData));
            const itemQ = item.quality || "Nomal";
            return item.itemId === itemData.id &&
                itemLvl === targetLevel &&
                itemQ === targetQuality &&
                (item.tier ?? null) === targetTier;
        });

        if (!inventoryItem || inventoryItem.quantity < 1) {
            this.showToast("Không tìm thấy vật phẩm trong túi đồ!");
            return false;
        }

        const requiredLevel = Number(inventoryItem.level ?? targetLevel);
        const heroLevel = Number(this.getHeroLevel(this.currentHero) || 1);

        if (heroLevel < requiredLevel) {
            this.showToast(`Cần đạt Lv.${requiredLevel} để trang bị (hiện tại Lv.${heroLevel})`);
            return false;
        }

        const heroKey = String(this.currentHero.id);
        const savedHero = saveData.heroes[heroKey] || this.currentHero;
        const equipment = { ...(savedHero.equipment || {}) };

        const currentEntry = this.getEquipmentEntry(equipment, slotType);
        const previousItemId = currentEntry.itemId;
        const isSameItem = previousItemId === itemData.id &&
            currentEntry.quality === targetQuality &&
            currentEntry.level === targetLevel &&
            (currentEntry.tier ?? null) === targetTier;

        if (!isStackableSlot && isSameItem && (currentEntry.quality || "Nomal") === targetQuality) {
            return false;
        }

        const maxEquippedQuantity = isStackableSlot ? 10 : 1;
        const currentQuantity = isSameItem ? currentEntry.quantity : 0;
        const availableSpace = Math.max(0, maxEquippedQuantity - currentQuantity);
        const transferQuantity = isStackableSlot ? Math.min(inventoryItem.quantity, availableSpace) : 1;

        if (transferQuantity <= 0) return false;

        inventoryItem.quantity -= transferQuantity;
        if (inventoryItem.quantity <= 0) {
            saveData.inventory = inventory.filter(item => item !== inventoryItem);
        }

        if (previousItemId && !isSameItem) {
            const prevQuality = currentEntry.quality || "Nomal";
            const prevLevel = Number(currentEntry.level ?? 1);
            const prevItemInInv = saveData.inventory.find(item =>
                item.itemId === previousItemId &&
                (item.quality || "Nomal") === prevQuality &&
                Number(item.level ?? 1) === prevLevel &&
                (item.tier ?? null) === (currentEntry.tier ?? null)
            );

            if (prevItemInInv) {
                prevItemInInv.quantity += currentEntry.quantity;
            } else {
                saveData.inventory.push({
                    itemId: previousItemId,
                    quantity: currentEntry.quantity,
                    quality: prevQuality,
                    level: prevLevel,
                    ...(currentEntry.tier ? { tier: currentEntry.tier } : {})
                });
            }
        }

        equipment[slotType] = {
            itemId: itemData.id,
            quantity: isStackableSlot ? (currentQuantity + transferQuantity) : 1,
            quality: targetQuality,
            level: targetLevel,
            ...(targetTier ? { tier: targetTier } : {})
        };

        saveData.heroes[heroKey] = { ...savedHero, equipment };
        SaveManager.save(saveData);
        this.refreshStats();
        return true;
    }

    unequipItem(gameObject) {
        if (!this.currentHero) return false;

        const saveData = SaveManager.load();
        const inventory = saveData.inventory || [];
        const targetQuality = gameObject.quality ?? "Nomal";
        const targetLevel = Number(gameObject.level ?? 1);
        const targetTier = gameObject.tier ?? null;
        const hasExistingStack = inventory.some(
            item => item.itemId === gameObject.itemId &&
                item.quality === targetQuality &&
                Number(item.level ?? 1) === targetLevel &&
                (item.tier ?? null) === targetTier
        );
        const inventoryCapacity = 6 * 4;

        if (!hasExistingStack && inventory.length >= inventoryCapacity) return false;

        const heroKey = String(this.currentHero.id);
        const savedHero = saveData.heroes[heroKey] || this.currentHero;
        const equipment = { ...(savedHero.equipment || {}) };
        const currentEntry = this.getEquipmentEntry(equipment, gameObject.equipmentSlotType);

        if (currentEntry.itemId !== gameObject.itemId) return false;

        const currentQuality = currentEntry.quality ?? targetQuality ?? "Nomal";
        const currentLevel = Number(currentEntry.level ?? gameObject.level ?? targetLevel ?? 1);
        const matchingInventoryItem = inventory.find(
            item => item.itemId === gameObject.itemId &&
                item.quality === currentQuality &&
                Number(item.level ?? 1) === currentLevel &&
                (item.tier ?? null) === targetTier
        );
        const quantityToReturn = this.isStackableEquipmentSlot(gameObject.equipmentSlotType) ? currentEntry.quantity : 1;

        if (matchingInventoryItem) {
            matchingInventoryItem.quantity += quantityToReturn;
        } else {
            inventory.push({
                itemId: gameObject.itemId,
                quantity: quantityToReturn,
                quality: currentQuality,
                level: currentLevel,
                ...(targetTier ? { tier: targetTier } : {})
            });
        }

        if (this.isStackableEquipmentSlot(gameObject.equipmentSlotType)) {
            const nextQuantity = currentEntry.quantity - quantityToReturn;
            if (nextQuantity > 0) {
                equipment[gameObject.equipmentSlotType] = {
                    itemId: gameObject.itemId,
                    quantity: nextQuantity,
                    quality: currentQuality,
                    level: currentLevel,
                    ...(targetTier ? { tier: targetTier } : {})
                };
            } else {
                delete equipment[gameObject.equipmentSlotType];
            }
        } else {
            delete equipment[gameObject.equipmentSlotType];
        }

        saveData.inventory = inventory;
        saveData.heroes[heroKey] = { ...savedHero, equipment };
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

        const visibleRows = Math.ceil(this.viewHeight / (slotSize + gap));
        const itemRows = Math.ceil(totalItemsCount / columns);
        const rows = Math.max(visibleRows + 3, itemRows + 2, 10);
        const totalContentHeight = rows * (slotSize + gap);

        this.maxScrollY = 0;
        this.minScrollY = Math.min(0, this.viewHeight - totalContentHeight);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const x = startX + col * (slotSize + gap);
                const y = startY + row * (slotSize + gap);

                const slot = this.scene.add.rectangle(
                    x, y, slotSize, slotSize, 0xf0f0f0
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
        this.toastTimer = this.scene.time.delayedCall(1800, () => this.hideToast());
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

    setupInventoryScrollEvents() {
        let isPointerDown = false;
        let startY = 0;
        let startScrollY = 0;
        let dragStarted = false;
        const DRAG_THRESHOLD = 6;

        this.scrollZone.on("pointerdown", (pointer) => {
            isPointerDown = true;
            dragStarted = false;
            startY = pointer.y;
            startScrollY = this.scrollY;
            this.itemMenu.hideAll();
        });

        this.scene.input.on("pointermove", (pointer) => {
            if (!isPointerDown || this.activeTab !== "inventory") return;

            const deltaY = pointer.y - startY;
            if (!dragStarted) {
                if (Math.abs(deltaY) < DRAG_THRESHOLD) return;
                dragStarted = true;
            }

            this.setInventoryScroll(startScrollY + deltaY);
        });

        const stopDrag = () => {
            isPointerDown = false;
            dragStarted = false;
        };
        this.scene.input.on("pointerup", stopDrag);
        this.scene.input.on("pointerupoutside", stopDrag);

        this.scene.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
            if (this.activeTab !== "inventory" || !this.container.visible) return;
            if (
                pointer.x >= this.viewX &&
                pointer.x <= this.viewX + this.viewWidth &&
                pointer.y >= this.viewY &&
                pointer.y <= this.viewY + this.viewHeight
            ) {
                this.setInventoryScroll(this.scrollY - deltaY * 0.5);
                this.itemMenu.hideAll();
            }
        });
    }

    setInventoryScroll(targetY) {
        this.scrollY = Phaser.Math.Clamp(targetY, this.minScrollY, this.maxScrollY);
        this.inventoryContainer.y = this.scrollY;
        this.updateInventoryViewportVisibility();
    }
}