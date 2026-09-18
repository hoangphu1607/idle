export const MONSTERS = [
    {
        id: "slime",
        name: "Slime",
        avatar: "monster_slime",

        hp: 100,
        mp: 200,

        attack_physical: 20,
        attack_magic: 1,

        auto_attack: 3,

        role: "melee",
        skills: [
            {
                id: "Slime_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],
        experience: 10,
        gold: 2,
        dropItems: [
            {
                itemId: "slime_essence",
                chance: 0.1,
                minQuantity: 1,
                maxQuantity: 3
            },
            {
                itemId: "iron_sword",
                chance: 0.1,
                minQuantity: 1,
                maxQuantity: 1
            },
            {
                itemId: "rare_gem",
                chance: 0.05,
                minQuantity: 1,
                maxQuantity: 1
            }
        ]
    },

    {
        id: "wolf",
        name: "Wolf",
        avatar: "monster_wolf",

        hp: 150,
        mp: 200,

        attack_physical: 20,
        attack_magic: 0,

        auto_attack: 3,

        role: "melee",
        experience: 20,
        gold: 3,
    },

    {
        id: "orc",
        name: "Orc",
        avatar: "monster_orc",

        hp: 300,
        mp: 200,

        attack_physical: 30,
        attack_magic: 0,

        auto_attack: 3,

        role: "tank",
        experience: 50,
        gold: 7,
    }
];