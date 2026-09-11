export const MONSTERS = [
    {
        id: "slime",
        name: "Slime",
        avatar: "monster_slime",

        hp: 100,
        mp: 200,

        attack_physical: 10,
        attack_magic: 1,

        auto_attack: 3,

        role: "melee",
        skills: [
            {
                id: "Slime_first_skill",
                cooldown: 5,
                initialCooldown: 1
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

        role: "melee"
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

        role: "tank"
    }
];