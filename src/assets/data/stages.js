export const JUNGLE_STAGES = [
    {
        id: 1,
        name: "Stage 1",

        waves: [
            {
                monsters: [
                    {
                        id: "slime",
                        formation: [   
                            ["","", ""],
                            ["thief_bow", "thief_mage", "thief_bow"],                         
                            ["thief_sword", "thief_dagger", "thief_miner"],
                        ],
                    },
                ],
            },
        ],
    },

    // {
    //     id: 2,
    //     name: "Stage 2",

    //     waves: [
    //         {
    //             monsters: [
    //                 {
    //                     id: "slime",
    //                     formation: [
    //                         ["wolf", 0, "wolf"],
    //                         ["slime", "slime", "slime"],
    //                     ],
    //                 },
    //             ],
    //         },
    //     ],
    // },

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
