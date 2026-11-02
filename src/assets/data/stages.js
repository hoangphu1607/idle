export const JUNGLE_STAGES = [
    {
        id: 1,
        name: "Stage 1",
        waves: [
            {
                monsters: [
                    {formation: [["ore_monster","", "ore_monster"],],},
                ],
            },
        ],
    },

    {
        id: 2,
        name: "Stage 2",
        waves: [
            {
                monsters: [
                    {formation: [["thief_miner", "thief_dagger", "thief_miner"],],},
                    {formation: [["", "thief_sword", ""],],},
                ],
            },
        ],
    },
    {
        id: 3,
        name: "Stage 3",
        waves: [
            {
                monsters: [
                    {formation: [["thief_bow", "thief_mage", "thief_bow"],],},
                    {formation: [["thief_sword", "", "thief_sword"],],},
                ],
            },
        ],
    },
    // {
    //     id: 3,
    //     name: "Stage 3",

    //     waves: [
    //         {
    //             monsters: [
    //                 {
    //                     id: "orc",
    //                     formation: [[1]],
    //                 },
    //                 {
    //                     id: "slime",
    //                     formation: [
    //                         [1, 1, 1],
    //                         [1, 1, 1],
    //                     ],
    //                 },
    //             ],
    //         },
    //     ],
    // },
];

export const STAGES_BY_MAP = {
    jungle: JUNGLE_STAGES,
};

export const STAGES = JUNGLE_STAGES;
