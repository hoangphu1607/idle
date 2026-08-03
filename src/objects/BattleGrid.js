import BattleCell from "./BattleCell";
import Phaser from "phaser";

export default class BattleGrid{

    constructor(scene, x, y, cellSize = 30) {

        this.scene = scene;

        this.rows = 9;
        this.cols = 9;

        this.cellSize = cellSize;

        this.cells = [];

        this.container = scene.add.container(x, y);

        this.create();
        this.grid = [];

        for (let row = 0; row < this.rows; row++) {

            this.grid[row] = [];

            for (let col = 0; col < this.cols; col++) {

                this.grid[row][col] = null;

            }

        }        

    }

    create() {

        for (let row = 0; row < this.rows; row++) {

            this.cells[row] = [];

            for (let col = 0; col < this.cols; col++) {

                const cell = new BattleCell(
                    this.scene,
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize
                );

                this.container.add(cell.rect);

                this.cells[row][col] = cell;

            }

        }

    }

    getRandomCell(rows) {

        const empty = [];

        rows.forEach(row => {

            for (let col = 0; col < this.cols; col++) {

                if (this.grid[row][col] == null) {

                    empty.push({
                        row,
                        col
                    });

                }

            }

        });

        if (empty.length == 0) {
            return null;
        }

        return Phaser.Utils.Array.GetRandom(empty);

    }

    spawnHeroes(heroes) {

        heroes.forEach(hero => {

            let rows;

            switch (hero.role) {

                case "tank":
                    rows = [0, 1];
                    break;

                case "dps":
                    rows = [7, 8];
                    break;

                default:
                    rows = [2, 3, 4, 5, 6];
                    break;

            }

            const pos = this.getRandomCell(rows);

            if (!pos) {
                return;
            }

            this.grid[pos.row][pos.col] = hero;

            this.createHero(hero, pos.row, pos.col);

        });

    }

    createHero(hero, row, col) {

        const x =
            col * this.cellSize +
            this.cellSize / 2;

        const y =
            row * this.cellSize +
            this.cellSize / 2;

        const img = this.scene.add.image(
            x,
            y,
            hero.avatar
        );

        img.setDisplaySize(48, 48);

        this.container.add(img);

    }

}