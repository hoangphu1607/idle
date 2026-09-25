import test from "node:test";
import assert from "node:assert/strict";

Object.defineProperty(globalThis, "window", {
  value: {},
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: { userAgent: "node", maxTouchPoints: 0 },
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "document", {
  value: {
    documentElement: {},
    createElement() {
      return {
        getContext() {
          return {
            fillRect() {},
            clearRect() {},
            drawImage() {},
            beginPath() {},
            moveTo() {},
            lineTo() {},
            closePath() {},
            stroke() {},
            fill() {},
          };
        },
      };
    },
  },
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "HTMLCanvasElement", { value: class {}, configurable: true });
Object.defineProperty(globalThis, "Image", { value: class {}, configurable: true });
Object.defineProperty(globalThis, "HTMLImageElement", { value: class {}, configurable: true });
Object.defineProperty(globalThis, "Audio", { value: class {}, configurable: true });

const { default: HeroDetailPopup } = await import("../src/scenes/HeroDetailPopup.js");
const SaveManager = (await import("../src/managers/SaveManager.js")).default;

const saveStore = new Map();
const storage = {
  getItem(key) {
    return saveStore.has(key) ? JSON.stringify(saveStore.get(key)) : null;
  },
  setItem(key, value) {
    saveStore.set(key, JSON.parse(value));
  },
  removeItem(key) {
    saveStore.delete(key);
  },
};

globalThis.localStorage = storage;

test("unequip preserves item quality when returning to inventory", () => {
  const saveData = {
    version: 1,
    heroes: {
      7: {
        id: 7,
        equipment: {
          weapon: {
            itemId: "mace",
            quality: "good",
          },
        },
      },
    },
    inventory: [],
    player: { gold: 0 },
  };

  saveStore.clear();
  saveStore.set("idle_game_save", saveData);

  const popup = Object.create(HeroDetailPopup.prototype);
  popup.currentHero = { id: 7, name: "Alice" };
  popup.refreshStats = () => {};
  popup.renderInventory = () => {};
  popup.isStackableEquipmentSlot = (slotType) => slotType === "potion" || slotType === "food";
  popup.equipmentSlots = [{ slotType: "weapon" }];

  const result = popup.unequipItem({ itemId: "mace", equipmentSlotType: "weapon" });

  assert.equal(result, true);
  const inventory = SaveManager.load().inventory;
  assert.deepEqual(inventory, [{ itemId: "mace", quantity: 1, quality: "good" }]);
  assert.equal(SaveManager.load().heroes[7].equipment.weapon, undefined);
});
