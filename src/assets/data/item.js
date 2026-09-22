const items = [
    {
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
        id: "iron_sword",
        name: "Iron Sword",
        description: "Một thanh kiếm sắt cơ bản.",
        icon: "item_iron_sword",

        type: "weapon",
        class: "Mace",
        rarity: "common",
        sell_price: 20,
        maxStack: 1,

        stats: {
            attack_physical: 10,
            hp: 50,
            mp: 20,
            armor: 5,
            magic_resistance: 5

        }
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

        stats: {
            attack_physical: 15,
            hp: 50,
            mp: 20,
            armor: 5,
            magic_resistance: 5
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

        stats: {
            attack_magic: 15
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

        stats: {
            attack_magic: 10
        }
    }
];


export default items;