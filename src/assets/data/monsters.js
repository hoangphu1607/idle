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
    //!--------------------Thief
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
    

    //!--------------------Skeleton
    {
        id: "skeleton_sword",
        name: "Skeleton (Sword)",
        avatar: "monster_skeleton_sword",

        hp: 1000,
        

        attack_physical: 30,
        attack_magic: 5,

        armor: 7,
        magic_resistance: 7,

        role: "melee",

        skills: [
            {
                id: "Skeleton_sword_first_skill",
                cooldown: 1.2,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "skeleton_bow",
        name: "Skeleton (Bow)",
        avatar: "monster_skeleton_bow",

        hp: 800,
        

        attack_physical: 20,
        attack_magic: 5,

        armor: 5,
        magic_resistance: 5,

        role: "ranged",

        skills: [
            {
                id: "Skeleton_bow_first_skill",
                cooldown: 1,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "skeleton_mage",
        name: "Skeleton (Mage)",
        avatar: "monster_skeleton_mage",

        hp: 800,
        

        attack_physical: 5,
        attack_magic: 20,

        armor: 5,
        magic_resistance: 5,

        role: "magic",

        skills: [
            {
                id: "Skeleton_mage_first_skill",
                cooldown: 1.5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "skeleton_warlock",
        name: "Skeleton (Warlock)",
        avatar: "monster_skeleton_warlock",

        hp: 900,
        

        attack_physical: 5,
        attack_magic: 30,

        armor: 5,
        magic_resistance: 5,

        role: "melee",

        skills: [
            {
                id: "Skeleton_warlock_first_skill",
                cooldown: 1.5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "skeleton_knight",
        name: "Skeleton (Knight)",
        avatar: "monster_skeleton_knight",

        hp: 1500
,
        

        attack_physical: 35,
        attack_magic: 5,

        armor: 15,
        magic_resistance: 15,

        role: "melee",

        skills: [
            {
                id: "Skeleton_knight_first_skill",
                cooldown: 1.5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },  
    //!--------------------Mob Gather
    {
        id: "wood_monster",
        name: "Wood Monster",
        avatar: "monster_wood_tier",
        type:"mob_gather",

        hp: 100,        

        attack_physical: 20,
        attack_magic: 5,

        armor: 15,
        magic_resistance: 15,

        role: "melee",

        skills: [
            {
                id: "Wood_monster_first_skill",
                cooldown: 5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },

    {
        id: "fibber_monster",
        name: "Fibber Monster",
        avatar: "monster_fibber_tier",
        type:"mob_gather",

        hp: 100,        

        attack_physical: 10,
        attack_magic: 15,

        armor: 10,
        magic_resistance: 10,

        role: "melee",

        skills: [
            {
                id: "Fibber_monster_first_skill",
                cooldown: 5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
    {
        id: "ore_monster",
        name: "Ore Monster",
        avatar: "monster_ore_tier",
        type:"mob_gather",

        hp: 100,        

        attack_physical: 10,
        attack_magic: 15,

        armor: 10,
        magic_resistance: 10,

        role: "melee",

        skills: [
            {
                id: "Ore_monster_first_skill",
                cooldown: 5,
                initialCooldown: 0.2
            }
        ],

        experience: 10,
        gold: 2
    },
];