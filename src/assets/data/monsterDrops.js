import { getDifficultyLevelRange as getRangeByDifficulty } from "./item.js";

export const MONSTER_DROPS = {

    slime: [
        {
            itemId: "slime_essence",
            chance: 0.1,
            minQuantity: 1,
            maxQuantity: 3
        },
        {
            itemId: "mace",
            chance: 1,
            minQuantity: 1,
            maxQuantity: 1,
            level: 1
        },
        {
            itemId: "fire_staff",
            chance: 1,
            minQuantity: 1,
            maxQuantity: 1,
            level: 10
        },
        {
            itemId: "nature_staff",
            chance: 1,
            minQuantity: 1,
            maxQuantity: 1,
            level: 20
        },
        {
            itemId: "rare_gem",
            chance: 0.01,
            minQuantity: 1,
            maxQuantity: 1
        }
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
            level: 10
        },
        {
            itemId: "fire_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            level: 10
        },
        {
            itemId: "nature_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            level: 10
        }
    ],

    orc: [
        {
            itemId: "mace",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            level: 20
        },
        {
            itemId: "fire_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            level: 20
        },
        {
            itemId: "nature_staff",
            chance: 0.35,
            minQuantity: 1,
            maxQuantity: 1,
            level: 20
        }
    ]

};

export function getMonsterDropPool(monsterId, difficulty = "normal") {
    const pool = MONSTER_DROPS[monsterId] || [];
    const { minLevel, maxLevel } = getRangeByDifficulty(difficulty);

    return pool
        .filter((drop) => {
            if (!drop.itemId) {
                return false;
            }

            const dropLevel = Number(drop.level ?? minLevel ?? 1);
            return dropLevel >= minLevel && dropLevel <= maxLevel;
        })
        .map((drop) => ({
            ...drop,
            level: Number(drop.level ?? minLevel ?? 1)
        }));
}
