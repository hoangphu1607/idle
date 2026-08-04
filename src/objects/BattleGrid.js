import BattleCell from "./BattleCell";
import Phaser from "phaser";
import Hero from "./Hero";
import Monster from "./Monster";
import UnitView from "./UnitView";
export default class BattleGrid {

    constructor(scene, x, y, cellSize = 30) {

        this.scene = scene;

        this.rows = 5;
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

        heroes.forEach(heroData => {

            const rows = this.getRowsByRole(heroData.role);

            const pos = this.getRandomCell(rows);

            if (!pos) return;

            // Tạo Hero object
            const hero = new Hero(this.scene, heroData);

            hero.setPosition(pos.row, pos.col);
            hero.ownerGrid = this;

            this.grid[pos.row][pos.col] = hero;

            this.createUnit(hero);

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

    spawnMonsters(monsters) {

        const count = Phaser.Math.Between(3, 5);

        const selected =
            Phaser.Utils.Array.Shuffle([...monsters]).slice(0, count);

        const allRows = Array.from({ length: this.rows }, (_, index) => index);

        selected.forEach(monsterData => {

            const pos = this.getRandomCell(allRows);

            if (!pos) return;

            const monster = new Monster(this.scene, monsterData);

            monster.setPosition(pos.row, pos.col);
            monster.ownerGrid = this;

            this.grid[pos.row][pos.col] = monster;

            this.createUnit(monster);

        });

    }

    createMonster(monster, row, col) {

        const x =
            col * this.cellSize +
            this.cellSize / 2;

        const y =
            row * this.cellSize +
            this.cellSize / 2;

        const img = this.scene.add.image(
            x,
            y,
            monster.avatar
        );

        img.setDisplaySize(
            this.cellSize - 8,
            this.cellSize - 8
        );

        this.container.add(img);

    }

    createUnit(unit) {

        const x =
            unit.col * this.cellSize +
            this.cellSize / 2;

        const y =
            unit.row * this.cellSize +
            this.cellSize / 2;

        unit.view = new UnitView(
            this.scene,
            unit,
            x,
            y,
            this.cellSize
        );

        this.container.add(unit.view.container);

    }

    getRowsByRole(role) {

        const lastRow = Math.max(0, this.rows - 1);
        const secondLastRow = Math.max(0, this.rows - 2);

        switch (role) {

            case "tank":
                return [0, 1];

            case "dps":
                return [secondLastRow, lastRow];

            default:
                return Array.from({ length: this.rows }, (_, index) => index);

        }

    }

    updateHpBar() {

        if (!this.hpBar) return;

        const percent = this.hp / this.maxHp;

        this.hpBar.width = this.scene.playerGrid.cellSize * percent;

    }

    takeDamage(value) {

        this.hp -= value;

        if (this.hp < 0)
            this.hp = 0;

        if (this.view) {
            this.view.refresh();
        }

    }
}