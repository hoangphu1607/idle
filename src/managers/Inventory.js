export default class Inventory {

    constructor(items = []) {

        this.items = items;

    }

    addItem(itemId, quantity = 1) {

        if (quantity <= 0) return;

        const existingItem = this.items.find(
            item => item.itemId === itemId
        );

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            this.items.push({
                itemId,
                quantity
            });

        }

        console.log(
            `Added ${itemId} x${quantity}`
        );

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

            this.addItem(drop.itemId, quantity);
        });

        return this.items;
    }

    removeItem(itemId, quantity = 1) {

        const item = this.items.find(
            item => item.itemId === itemId
        );

        if (!item) return false;

        if (item.quantity < quantity) {
            return false;
        }

        item.quantity -= quantity;

        if (item.quantity <= 0) {

            this.items = this.items.filter(
                item => item.itemId !== itemId
            );

        }

        return true;

    }

    getItemQuantity(itemId) {

        const item = this.items.find(
            item => item.itemId === itemId
        );

        return item ? item.quantity : 0;

    }

    hasItem(itemId, quantity = 1) {

        return this.getItemQuantity(itemId) >= quantity;

    }

    getAllItems() {

        return this.items;

    }

}