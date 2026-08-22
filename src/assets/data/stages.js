export const STAGES = [
    {
        id: 1,
        name: "Stage 1",

        waves: [
            {
                monsters: [
                    {
                        id: "slime",
                        formation: [
                            [1, 0, 1],
                            [0, 1, 0],
                            [1, 1, 1],
                        ],
                    },
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
                    {
                        id: "slime",
                        formation: [
                            ["wolf", 0, "wolf"],
                            ["slime", "slime", "slime"],
                        ],
                    },
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
                    {
                        id: "orc",
                        formation: [[1]],
                    },
                    {
                        id: "slime",
                        formation: [
                            [1, 1, 1],
                            [1, 1, 1],
                        ],
                    },
                ],
            },
        ],
    },
];
