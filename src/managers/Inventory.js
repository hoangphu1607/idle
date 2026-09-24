import { QUALITY_ITEMS, getRandomItemQuality } from "../assets/data/item.js";

export default class Inventory {

    constructor(items = []) {

        this.items = (items || []).map((item) => this.normalizeItem(item));

    }

    normalizeItem(item) {
        if (!item || typeof item !== "object") {
            return item;
        }

        const normalized = {
            ...item,
            quantity: Number(item.quantity ?? 1)
        };

        if (normalized.quality === undefined) {
            normalized.quality = QUALITY_ITEMS.has(normalized.itemId) ? "Nomal" : undefined;
        }

        return normalized;
    }

    addItem(itemId, quantity = 1, quality = null) {

        if (quantity <= 0) return;

        const resolvedQuality = quality ?? (QUALITY_ITEMS.has(itemId) ? "Nomal" : undefined);

        const existingItem = this.items.find(
            item => item.itemId === itemId && item.quality === resolvedQuality
        );

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            this.items.push({
                itemId,
                quantity,
                ...(resolvedQuality ? { quality: resolvedQuality } : {})
            });

        }

        //console.log(`Added ${itemId} x${quantity}`);

    }

    addDrops(dropItems = []) {

        dropItems.forEach((drop) => {
            const chance = Number(drop.chance ?? 1);

            if (Math.random() > chance) {
                return;
            }

            const minQuantity = Math.max(1, Number(drop.minQuantity ?? 1));
            const maxQuantity = Math.max(minQuantity, Number(drop.maxQuantity ?? minQuantity));
            const quantity = Math.floor(
                Math.random() * (maxQuantity - minQuantity + 1) + minQuantity
            );

            const quality = QUALITY_ITEMS.has(drop.itemId)
                ? getRandomItemQuality(drop.itemId)
                : undefined;

            this.addItem(drop.itemId, quantity, quality);
        });

        return this.items;
    }

    removeItem(itemId, quantity = 1, quality = null) {

        const item = this.items.find((entry) => {
            if (entry.itemId !== itemId) {
                return false;
            }

            if (quality === null || quality === undefined) {
                return true;
            }

            return entry.quality === quality;
        });

        if (!item) return false;

        if (item.quantity < quantity) {
            return false;
        }

        item.quantity -= quantity;

        if (item.quantity <= 0) {

            this.items = this.items.filter((entry) => !(entry.itemId === itemId && entry.quality === item.quality));

        }

        return true;

    }

    getItemQuantity(itemId, quality = null) {

        return this.items
            .filter((item) => item.itemId === itemId && (quality === null || quality === undefined || item.quality === quality))
            .reduce((total, item) => total + Number(item.quantity || 0), 0);

    }

    hasItem(itemId, quantity = 1, quality = null) {

        return this.getItemQuantity(itemId, quality) >= quantity;

    }

    getAllItems() {

        return this.items;

    }

}