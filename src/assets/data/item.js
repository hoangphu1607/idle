const items = [
    {
        id: "slime_essence",
        name: "Slime Essence",
        description: "Tinh chất Slime dùng để nâng cấp Hero.",
        icon: "item_slime_essence",

        type: "material",
        rarity: "common",

        maxStack: 999
    },

    {
        id: "iron_sword",
        name: "Iron Sword",
        description: "Một thanh kiếm sắt cơ bản.",
        icon: "item_iron_sword",

        type: "weapon",
        rarity: "common",

        maxStack: 1,

        stats: {
            attack_physical: 10
        }
    },

    {
        id: "health_potion",
        name: "Health Potion",
        description: "Hồi phục HP.",
        icon: "item_health_potion",

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

        type: "material",
        rarity: "rare",

        maxStack: 99
    }
];


export default items;