import test from "node:test";
import assert from "node:assert/strict";

import Inventory from "../src/managers/Inventory.js";
import { ITEM_QUALITIES } from "../src/assets/data/item.js";

test("Inventory stacks by itemId and quality separately", () => {
    const inventory = new Inventory([]);

    inventory.addItem("mace", 1, "good");
    inventory.addItem("mace", 1, "good");
    inventory.addItem("mace", 1, "masterpiece");

    assert.equal(inventory.getAllItems().length, 2);

    const entries = inventory.getAllItems().map((entry) => ({
        itemId: entry.itemId,
        quality: entry.quality,
        quantity: entry.quantity
    }));

    assert.deepEqual(entries.sort((a, b) => a.quality.localeCompare(b.quality)), [
        { itemId: "mace", quality: "good", quantity: 2 },
        { itemId: "mace", quality: "masterpiece", quantity: 1 }
    ]);
});

test("Drop items get a valid quality and persist it in inventory", () => {
    const inventory = new Inventory([]);
    const originalRandom = Math.random;

    try {
        Math.random = () => 0.6;

        inventory.addDrops([
            {
                itemId: "mace",
                chance: 1,
                minQuantity: 1,
                maxQuantity: 1
            }
        ]);

        const [entry] = inventory.getAllItems();
        assert.ok(entry);
        assert.ok(ITEM_QUALITIES.includes(entry.quality));
        assert.equal(entry.itemId, "mace");
        assert.equal(entry.quality, "good");
    } finally {
        Math.random = originalRandom;
    }
});
