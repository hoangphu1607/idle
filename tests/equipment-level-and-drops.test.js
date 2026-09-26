import test from "node:test";
import assert from "node:assert/strict";

Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: { userAgent: "node", platform: "linux", maxTouchPoints: 0 },
  configurable: true,
  writable: true,
});
globalThis.window.navigator = globalThis.navigator;
globalThis.document = {
  documentElement: { style: {} },
  createElement: () => ({
    style: {},
    width: 0,
    height: 0,
    getContext: () => ({
      canvas: { width: 0, height: 0 },
      clearRect() {},
      fillRect() {},
      drawImage() {},
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      fill() {},
      arc() {},
      save() {},
      restore() {},
      translate() {},
      scale() {},
      rotate() {},
      setTransform() {},
      fillText() {},
      strokeText() {},
      measureText() { return { width: 0 }; },
      getImageData() { return { data: new Uint8ClampedArray(4), width: 1, height: 1 }; },
      putImageData() {},
      createImageData() { return { data: new Uint8ClampedArray(4), width: 1, height: 1 }; },
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    })
  }),
  createElementNS: () => ({ style: {} }),
  body: { appendChild() {}, removeChild() {} },
  head: { appendChild() {}, removeChild() {} }
};
globalThis.window.document = globalThis.document;
globalThis.HTMLCanvasElement = class {};
globalThis.Image = class { constructor() { this.width = 0; this.height = 0; this.style = {}; } set src(_) {} };

const itemModule = await import("../src/assets/data/item.js");
const monsterDropsModule = await import("../src/assets/data/monsterDrops.js");

const { getItemRequiredLevel, getDifficultyLevelRange, getItemLevelMultiplier } = itemModule;
const { getMonsterDropPool } = monsterDropsModule;

test("equipment required level is exposed from item metadata", () => {
  assert.equal(getItemRequiredLevel({ requiredLevel: 10 }), 10);
  assert.equal(getItemRequiredLevel({ level: 20 }), 20);
  assert.equal(getItemRequiredLevel({}), 1);
});

test("equipment stats scale by item level thresholds", () => {
  assert.equal(getItemLevelMultiplier(1), 1);
  assert.equal(getItemLevelMultiplier(10), 2);
  assert.equal(getItemLevelMultiplier(20), 3);
  assert.equal(getItemLevelMultiplier(30), 4);
});

test("unequipping a higher-level item keeps it in the matching level stack", async () => {
  const saveStore = new Map();
  const storage = {
    getItem(key) { return saveStore.has(key) ? JSON.stringify(saveStore.get(key)) : null; },
    setItem(key, value) { saveStore.set(key, JSON.parse(value)); },
    removeItem(key) { saveStore.delete(key); }
  };

  globalThis.localStorage = storage;
  saveStore.clear();
  saveStore.set("idle_game_save", {
    version: 1,
    heroes: {
      7: {
        id: 7,
        equipment: {
          weapon: {
            itemId: "mace",
            quality: "good",
            level: 10,
          },
        },
      },
    },
    inventory: [
      { itemId: "mace", quantity: 1, quality: "good", level: 1 },
    ],
    player: { gold: 0 },
  });

  const { default: HeroDetailPopup } = await import("../src/scenes/HeroDetailPopup.js");
  const SaveManager = (await import("../src/managers/SaveManager.js")).default;

  const popup = Object.create(HeroDetailPopup.prototype);
  popup.currentHero = { id: 7, name: "Alice", level: 1 };
  popup.refreshStats = () => {};
  popup.renderInventory = () => {};
  popup.isStackableEquipmentSlot = (slotType) => slotType === "potion" || slotType === "food";
  popup.equipmentSlots = [{ slotType: "weapon" }];
  popup.unequipItem({ itemId: "mace", equipmentSlotType: "weapon", quality: "good", level: 10 });

  const inventory = SaveManager.load().inventory;
  assert.deepEqual(inventory, [{ itemId: "mace", quantity: 1, quality: "good", level: 10 }]);
  assert.equal(SaveManager.load().heroes[7].equipment.weapon, undefined);
});

test("equipping a weapon accepts case-variant item types and class names", async () => {
  const saveStore = new Map();
  const storage = {
    getItem(key) { return saveStore.has(key) ? JSON.stringify(saveStore.get(key)) : null; },
    setItem(key, value) { saveStore.set(key, JSON.parse(value)); },
    removeItem(key) { saveStore.delete(key); }
  };

  globalThis.localStorage = storage;
  saveStore.clear();
  saveStore.set("idle_game_save", {
    version: 1,
    heroes: {
      1: {
        id: 1,
        name: "Mace",
        role: "tank",
        level: 1,
        equipment: {},
      },
    },
    inventory: [{ itemId: "mace", quantity: 1, quality: "Nomal", level: 1 }],
    player: { gold: 0 },
  });

  const { default: HeroDetailPopup } = await import("../src/scenes/HeroDetailPopup.js");
  const SaveManager = (await import("../src/managers/SaveManager.js")).default;

  const popup = Object.create(HeroDetailPopup.prototype);
  popup.currentHero = { id: 1, name: "Mace", role: "tank", level: 1 };
  popup.refreshStats = () => {};
  popup.renderInventory = () => {};
  popup.renderEquipment = () => {};
  popup.hideItemMenu = () => {};
  popup.showToast = () => {};
  popup.equipmentSlots = [{ slotType: "weapon" }];

  const itemData = { id: "mace", name: "Mace", type: "Weapon", class: "Mace", level: 1, requiredLevel: 1 };
  const result = popup.equipItem(itemData, "weapon", { itemId: "mace", quantity: 1, quality: "Nomal", level: 1 });

  assert.equal(result, true);
  assert.equal(SaveManager.load().heroes[1].equipment.weapon.itemId, "mace");
});

test("easy difficulty equipment drop range stays within level 1-10", () => {
  const range = getDifficultyLevelRange("easy");
  assert.deepEqual(range, { minLevel: 1, maxLevel: 10 });
});

test("monster drop pool resolves by difficulty and item levels", () => {
  const pool = getMonsterDropPool("slime", "easy");
  assert.ok(Array.isArray(pool));
  assert.ok(pool.length > 0);
  assert.ok(pool.every((entry) => Number(entry.level) >= 1 && Number(entry.level) <= 10));
});
