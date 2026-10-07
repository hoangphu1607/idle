import { getItemTiersByDifficulty, ITEM_TIERS } from "./item.js";

export const MONSTER_DROPS = {

    slime: [
        {
            itemId: "slime_essence",
            chance: 0.1,
            minQuantity: 1,
            maxQuantity: 3
        },        
    ],

    wolf: [
        {
            itemId: "health_potion",
            chance: 0.05,
            minQuantity: 1,
            maxQuantity: 1
        },
        {
            itemId: "mace",
            chance: 0.4,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        },
        {
            itemId: "fire_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        },
        {
            itemId: "nature_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        }
    ],

    orc: [
        {
            itemId: "mace",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        },
        {
            itemId: "fire_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        },
        {
            itemId: "nature_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            tiered: true
        }
    ],

    wood_monster: [
        {
            itemId: "log",
            chance: 1,
            minQuantity: 1,
            maxQuantity: 3,
            tiered: true
        },        
    ],
    

};

export function getMonsterDropPool(monsterId, difficulty = "normal", monsterTier = null) {
    const pool = MONSTER_DROPS[monsterId] || [];
    const tiers = getItemTiersByDifficulty(difficulty);
    const fixedTier = Number.isInteger(Number(monsterTier)) && Number(monsterTier) > 0
        ? ITEM_TIERS[Number(monsterTier) - 1]
        : null;

    return pool
        .filter((drop) => {
            return Boolean(drop.itemId);
        })
        .map((drop) => {
            if (!drop.tiered) {
                return drop;
            }

            if (fixedTier) {
                const fixedDrop = { ...drop };
                delete fixedDrop.tiers;
                return { ...fixedDrop, tier: fixedTier };
            }

            return { ...drop, tiers: drop.tiers ?? tiers };
        });
}
