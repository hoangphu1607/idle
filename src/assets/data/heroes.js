export const HEROES = [

    {
        id: 1,
        name: "Mace",
        level: 1,

        attack_physical: 20,
        attack_magic: 1,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_knight",
        avatar: "mace",

        role: "tank",

        skills: [
            {
                id: "mace_skill_first",
                cooldown: 3,
                initialCooldown: 5
            }
        ]
    },

    {
        id: 2,
        name: "Mage",
        level: 1,

        attack_physical: 1,
        attack_magic: 5,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_mage",
        avatar: "wizard",

        role: "dps",

        skills: [
            {
                id: "mage_skill_first",
                cooldown: 2,
                initialCooldown: 5
            }
        ]
    },

    {
        id: 3,
        name: "Archer",
        level: 1,

        attack_physical: 5,
        attack_magic: 1,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_archer",
        avatar: "hunter",

        role: "dps",

        skills: [
            "arrow_shot"
        ]
    },

    {
        id: 4,
        name: "Axe",
        level: 1,

        attack_physical: 5,
        attack_magic: 1,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_archer",
        avatar: "hunter",

        role: "warrior",

        skills: [
            "axe_slash"
        ]
    },

    {
        id: 5,
        name: "Hammer",
        level: 1,

        attack_physical: 5,
        attack_magic: 1,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_archer",
        avatar: "hunter",

        role: "warrior",

        skills: [
            "hammer_smash"
        ]
    },

    {
        id: 6,
        name: "Spear",
        level: 1,

        attack_physical: 5,
        attack_magic: 1,

        auto_attack: 3,

        hp: 1200,
        mp: 200,

        image: "hero_archer",
        avatar: "hunter",

        role: "warrior",

        skills: [
            "spear_thrust"
        ]
    }

];