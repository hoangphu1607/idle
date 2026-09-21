export const HEROES = [

    {
        id: 1,
        name: "Mace",
        level: 1,

        attack_physical: 20,
        attack_magic: 5,
        armor: 10,
        magic_resistance: 10,

        hp: 1200,
        mp: 200,

        image: "hero_knight",
        avatar: "mace",

        role: "tank",

        skills: [
            {
                id: "mace_skill_first",
                cooldown: 3,
                initialCooldown: 0.2
            },
            {
                id: "mace_skill_second",
                cooldown: 10,
                initialCooldown: 10
            }
        ],
        experience: 0,
        threat: 4,
    },

    {
        id: 2,
        name: "Mage",
        level: 1,

        attack_physical: 2,
        attack_magic: 20,
        armor: 7,
        magic_resistance: 7,

        hp: 1200,
        mp: 200,

        image: "hero_mage",
        avatar: "wizard",

        role: "dps",

        skills: [
            {
                id: "mage_skill_first",
                cooldown: 2,
                initialCooldown: 0.2
            },
            {
                id: "mage_skill_second",
                cooldown: 10,
                initialCooldown: 5
            }
        ],
        experience: 0,
        threat: 1,
    },

    {
        id: 3,
        name: "Nature",
        level: 1,

        attack_physical: 4,
        attack_magic: 16,
        armor: 8,
        magic_resistance: 8,

        hp: 1200,
        mp: 200,

        image: "hero_nature",
        avatar: "nature",

        role: "healer",

        skills: [
            {
                id: "nature_skill_first",
                cooldown: 1,
                initialCooldown: 1
            },
            {
                id: "nature_skill_second",
                cooldown: 15,
                initialCooldown: 5
            }
        ],
        experience: 0,
        threat: 1,
    },

    // {
    //     id: 4,
    //     name: "Axe",
    //     level: 1,

    //     attack_physical: 5,
    //     attack_magic: 1,

    //     auto_attack: 3,

    //     hp: 1200,
    //     mp: 200,

    //     image: "hero_archer",
    //     avatar: "hunter",

    //     role: "warrior",

    //     skills: [
    //         "axe_slash"
    //     ]
    // },

    // {
    //     id: 5,
    //     name: "Hammer",
    //     level: 1,

    //     attack_physical: 5,
    //     attack_magic: 1,

    //     auto_attack: 3,

    //     hp: 1200,
    //     mp: 200,

    //     image: "hero_archer",
    //     avatar: "hunter",

    //     role: "warrior",

    //     skills: [
    //         "hammer_smash"
    //     ]
    // },

    // {
    //     id: 6,
    //     name: "Spear",
    //     level: 1,

    //     attack_physical: 5,
    //     attack_magic: 1,

    //     auto_attack: 3,

    //     hp: 1200,
    //     mp: 200,

    //     image: "hero_archer",
    //     avatar: "hunter",

    //     role: "warrior",

    //     skills: [
    //         "spear_thrust"
    //     ]
    // }

];