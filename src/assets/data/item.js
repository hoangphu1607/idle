export const ITEM_QUALITIES = [
    "Nomal",
    "good",
    "outstanding",
    "excellent",
    "masterpiece"
];

export const QUALITY_WEIGHTS = {
    Nomal: 45,
    good: 25,
    outstanding: 15,
    excellent: 10,
    masterpiece: 5
};

export const QUALITY_ITEMS = new Set([
    "mace",
    "fire_staff",
    "nature_staff"
]);

export const QUALITY_MULTIPLIERS = {
    Nomal: 1,
    good: 1.2,
    outstanding: 1.4,
    excellent: 1.6,
    masterpiece: 1.8
};

export const ITEM_LEVEL_RANGES = {
    easy: { minLevel: 1, maxLevel: 10 },
    normal: { minLevel: 10, maxLevel: 20 },
    hard: { minLevel: 20, maxLevel: 30 },
    hell: { minLevel: 30, maxLevel: 30 }
};

export function getQualityMultiplier(quality) {
    const normalizedQuality = String(quality ?? "Nomal").trim();
    return QUALITY_MULTIPLIERS[normalizedQuality] ?? QUALITY_MULTIPLIERS.Nomal;
}

export function getItemRequiredLevel(item = {}) {
    const value = Number(item?.requiredLevel ?? item?.level ?? 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getItemLevelMultiplier(level = 1) {
    const normalizedLevel = Number(level ?? 1);

    if (!Number.isFinite(normalizedLevel) || normalizedLevel <= 1) {
        return 1;
    }

    if (normalizedLevel >= 30) {
        return 4;
    }

    if (normalizedLevel >= 20) {
        return 3;
    }

    if (normalizedLevel >= 10) {
        return 2;
    }

    return 1;
}

export function getDifficultyLevelRange(difficulty = "normal") {
    const normalizedDifficulty = String(difficulty ?? "normal").trim().toLowerCase();
    return ITEM_LEVEL_RANGES[normalizedDifficulty] ?? ITEM_LEVEL_RANGES.normal;
}

export const QUALITY_LABELS = {
    Nomal: "Nomal",
    good: "Good",
    outstanding: "Outstanding",
    excellent: "Excellent",
    masterpiece: "Masterpiece"
};

export const QUALITY_BACKGROUND_KEYS = {
    Nomal: "bg_item_nomal",
    good: "bg_item_good",
    outstanding: "bg_item_outstanding",
    excellent: "bg_item_excellent",
    masterpiece: "bg_item_masterpiece"
};

export function getQualityLabel(quality) {
    return QUALITY_LABELS[quality] || QUALITY_LABELS.Nomal;
}

export function getItemBackgroundKey(quality) {
    return QUALITY_BACKGROUND_KEYS[quality] || "bg_item_nomal";
}

export function getRandomItemQuality(itemId = null) {
    if (!QUALITY_ITEMS.has(itemId)) {
        return "Nomal";
    }

    const totalWeight = Object.values(QUALITY_WEIGHTS).reduce((sum, value) => sum + value, 0);
    const randomValue = Math.random() * totalWeight;

    let cumulative = 0;

    for (const quality of ITEM_QUALITIES) {
        cumulative += QUALITY_WEIGHTS[quality];
        if (randomValue <= cumulative) {
            return quality;
        }
    }

    return "Nomal";
}

const items = [{
        id: "slime_essence",
        name: "Slime Essence",
        description: "Tinh chất Slime dùng để nâng cấp Hero.",
        icon: "item_slime_essence",

        type: "material",
        rarity: "common",
        sell_price: 10,
        maxStack: 999
    },    

    {
        id: "health_potion",
        name: "Health Potion",
        description: "Hồi phục HP.",
        icon: "item_health_potion",
        sell_price: 5,
        type: "potion",
        rarity: "common",

        maxStack: 99,

        effect: {
            hp: 200
        }
    },
    {
        id: "rare_gem",
        name: "Rare Gem",
        description: "Đá quý hiếm dùng để nâng cấp trang bị.",
        icon: "rare_gem",
        sell_price: 100,
        type: "material",
        rarity: "rare",

        maxStack: 99
    },
    {
        id: "mace",
        name: "Mace",
        description: "Một cây búa cơ bản.",
        icon: "item_mace",
        sell_price: 50,
        type: "weapon",
        rarity: "common",
        class: "Mace",
        maxStack: 1,
        level: 1,
        requiredLevel: 1,

        stats: {
            attack_physical: 5,
            attack_magic: 0,
            hp: 20,
            mp: 10,
        }
    },
    {
        id: "fire_staff",
        name: "Fire Staff",
        description: "Một cây trượng pháp sư cơ bản.",
        icon: "item_fire_staff",
        sell_price: 50,
        type: "weapon",
        rarity: "common",
        class: "Mage",
        maxStack: 1,
        level: 1,
        requiredLevel: 1,

        stats: {
            attack_physical: 0,
            attack_magic: 5,
            hp: 10,
            mp: 20,
        }
    },
    {
        id: "nature_staff",
        name: "Nature Staff",
        description: "Một cây trượng thiên nhiên cơ bản.",
        icon: "item_nature_staff",
        sell_price: 50,
        type: "weapon",
        rarity: "common",
        class: "Nature",
        maxStack: 1,
        level: 1,
        requiredLevel: 1,

        stats: {
            attack_physical: 0,
            attack_magic: 5,
            hp: 10,
            mp: 20,
        }
    }
];

export default items;