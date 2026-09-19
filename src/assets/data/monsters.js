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
    }
];