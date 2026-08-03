import BaseScene from "./base/BaseScene";

import BattleGrid from "../objects/BattleGrid";

export default class BattleScene extends BaseScene {

    constructor() {

        super("BattleScene");

    }
    init(data) {

        this.heroes = data.heroes || [];
        this.content = data.content;

    }
    create() {

        this.createBackground();

        this.createBottomNavigation("battle");

        console.log(this.heroes);
        console.log(this.content);
        const gridSize = 60;
        const rows = 9;

        const gridHeight = rows * gridSize;
        const gridWidth = rows * gridSize;

        const startX = (this.scale.width - gridWidth) / 2;

        const enemyY = 5;
        const dividerHeight = 60;

        // Vị trí thanh giữa
        const dividerY = enemyY + gridHeight + dividerHeight / 2;

        // Grid player bắt đầu ngay dưới thanh
        const playerY = enemyY + gridHeight + dividerHeight;

        // Enemy
        this.enemyGrid = new BattleGrid(
            this,
            startX,
            enemyY,
            gridSize
        );

        // Divider
        this.add.rectangle(
            this.scale.width / 2,
            dividerY,
            this.scale.width - 80,
            dividerHeight,
            0x666666
        );

        // Player
        this.playerGrid = new BattleGrid(
            this,
            startX,
            playerY,
            gridSize
        );

        this.playerGrid.spawnHeroes(this.heroes);

    }

}