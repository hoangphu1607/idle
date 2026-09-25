import { QUALITY_ITEMS, getRandomItemQuality, getItemRequiredLevel } from "../assets/data/item.js";

export default class Inventory {

    constructor(items = []) {

        this.items = (items || []).map((item) => this.normalizeItem(item));

    }

    matchesItem(entry, itemId, quality = null, level = null) {
        if (!entry || entry.itemId !== itemId) {
            return false;
        }

        if (quality !== null && quality !== undefined && entry.quality !== quality) {
            return false;
        }

        if (level !== null && level !== undefined && Number(entry.level ?? 1) !== Number(level)) {
            return false;
        }

        return true;
    }

    normalizeItem(item) {
        if (!item || typeof item !== "object") {
            return item;
        }

        const normalized = {
            ...item,
            quantity: Number(item.quantity ?? 1),
            level: Number(item.level ?? item.requiredLevel ?? getItemRequiredLevel(item))
        };

        if (normalized.quality === undefined) {
            normalized.quality = QUALITY_ITEMS.has(normalized.itemId) ? "Nomal" : undefined;
        }

        return normalized;
    }

    addItem(itemId, quantity = 1, quality = null, level = null) {

        if (quantity <= 0) return;

        const resolvedQuality = quality ?? (QUALITY_ITEMS.has(itemId) ? "Nomal" : undefined);
        const resolvedLevel = Number(level ?? 1);

        const existingItem = this.items.find(
            item => this.matchesItem(item, itemId, resolvedQuality, resolvedLevel)
        );

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            this.items.push({
                itemId,
                quantity,
                level: resolvedLevel,
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

            this.addItem(drop.itemId, quantity, quality, Number(drop.level ?? 1));
        });

        return this.items;
    }

    removeItem(itemId, quantity = 1, quality = null, level = null) {

        const item = this.items.find((entry) => {
            if (entry.itemId !== itemId) {
                return false;
            }

            const matchesQuality = quality === null || quality === undefined || entry.quality === quality;
            const matchesLevel = level === null || level === undefined || Number(entry.level ?? 1) === Number(level);

            return matchesQuality && matchesLevel;
        });

        if (!item) return false;

        if (item.quantity < quantity) {
            return false;
        }

        item.quantity -= quantity;

        if (item.quantity <= 0) {

            this.items = this.items.filter((entry) => !(entry.itemId === itemId && entry.quality === item.quality && Number(entry.level ?? 1) === Number(item.level ?? 1)));

        }

        return true;

    }

    getItemQuantity(itemId, quality = null, level = null) {

        return this.items
            .filter((item) => item.itemId === itemId &&
                (quality === null || quality === undefined || item.quality === quality) &&
                (level === null || level === undefined || Number(item.level ?? 1) === Number(level)))
            .reduce((total, item) => total + Number(item.quantity || 0), 0);

    }

    hasItem(itemId, quantity = 1, quality = null, level = null) {

        return this.getItemQuantity(itemId, quality, level) >= quantity;

    }

    getAllItems() {

        return this.items;

    }

}