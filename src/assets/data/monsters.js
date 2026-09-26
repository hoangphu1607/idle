export const MONSTERS = [
    {
        id: "slime",
        name: "Slime",
        avatar: "monster_slime",

        hp: 100,
        mp: 200,

        attack_physical: 12,
        attack_magic: 5,

        armor: 5,
        magic_resistance: 5,

        role: "melee",

        skills: [
            {
                id: "Slime_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },

    {
        id: "wolf",
        name: "Wolf",
        avatar: "monster_wolf",

        hp: 150,
        mp: 200,

        attack_physical: 15,
        attack_magic: 1,

        armor: 8,
        magic_resistance: 8,

        role: "melee",

        skills: [
            {
                id: "Wolf_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 20,
        gold: 3
    },

    {
        id: "orc",
        name: "Orc",
        avatar: "monster_orc",

        hp: 300,
        mp: 200,

        attack_physical: 30,
        attack_magic: 1,

        armor: 10,
        magic_resistance: 10,

        role: "tank",

        skills: [
            {
                id: "Orc_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 50,
        gold: 7
    },

    {
        id: "thief_dagger",
        name: "Thief (Dagger)",
        avatar: "monster_thief_dagger",

        hp: 800,
        

        attack_physical: 30,
        attack_magic: 5,

        armor: 5,
        magic_resistance: 5,

        role: "melee",

        skills: [
            {
                id: "Thief_dagger_first_skill",
                cooldown: 1.2,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "thief_bow",
        name: "Thief (Bow)",
        avatar: "monster_thief_bow",

        hp: 800,
        

        attack_physical: 20,
        attack_magic: 5,

        armor: 5,
        magic_resistance: 5,

        role: "ranged",

        skills: [
            {
                id: "Thief_bow_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "thief_sword",
        name: "Thief (Sword)",
        avatar: "monster_thief_sword",

        hp: 1200,
        

        attack_physical: 15,
        attack_magic: 5,

        armor: 10,
        magic_resistance: 10,

        role: "melee",

        skills: [
            {
                id: "Thief_sword_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "thief_miner",
        name: "Thief (Miner)",
        avatar: "monster_thief_miner",

        hp: 1100,
        

        attack_physical: 10,
        attack_magic: 5,

        armor: 7,
        magic_resistance: 7,

        role: "melee",

        skills: [
            {
                id: "Thief_miner_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "thief_mage",
        name: "Thief (Mage)",
        avatar: "monster_thief_mage",

        hp: 700,
        

        attack_physical: 5,
        attack_magic: 30,

        armor: 5,
        magic_resistance: 5,

        role: "magic",

        skills: [
            {
                id: "Thief_mage_first_skill",
                cooldown: 1.5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
];