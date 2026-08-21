import BattleCell from "./BattleCell";
import Phaser from "phaser";
import Hero from "./Hero";
import Monster from "./Monster";
import UnitView from "./UnitView";
import { MONSTERS } from "../assets/data/monsters";
export default class BattleGrid {
    constructor(scene, x, y, cellSize = 30, rows = 5, cols = 9, rowGap = 10) {
        this.scene = scene;

        this.rows = rows;
        this.cols = cols;

        this.cellSize = cellSize;
        this.rowGap = rowGap;

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
                    row * (this.cellSize + this.rowGap),
                    this.cellSize,
                );

                this.container.add(cell.rect);

                this.cells[row][col] = cell;
            }
        }
    }

    getRandomCell(rows) {
        const empty = [];

        rows.forEach((row) => {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] == null) {
                    empty.push({
                        row,
                        col,
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
        heroes.forEach((heroData) => {
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
        const x = col * this.cellSize + this.cellSize / 2;

        const y = row * (this.cellSize + this.rowGap) + this.cellSize / 2;

        const img = this.scene.add.image(x, y, hero.avatar);

        img.setDisplaySize(48, 48);

        this.container.add(img);
    }

    spawnMonsters(wave) {
        wave.monsters.forEach((spawnData) => {
            if (spawnData.formation) {
                this.spawnFormation(spawnData);
                return;
            }

            const formation = Array.from(
                { length: spawnData.count || 0 },
                () => [1],
            );

            this.spawnFormation({ ...spawnData, formation });
        });
    }

    spawnFormation(spawnData) {
        const formation = spawnData.formation;
        const position = this.getRandomFormationPosition(formation);

        if (!position) {
            console.warn("No empty space available for monster formation");
            return;
        }

        formation.forEach((formationRow, formationRowIndex) => {
            formationRow.forEach((cell, formationColIndex) => {
                if (cell === null || cell === undefined || cell === 0 || cell === false) {
                    return;
                }

                const monsterId = typeof cell === "string" ? cell : spawnData.id;
                const monsterData = MONSTERS.find(
                    (monster) => monster.id === monsterId,
                );

                if (!monsterData) {
                    console.warn(`Monster not found: ${monsterId}`);
                    return;
                }

                const row = position.row + formationRowIndex;
                const col = position.col + formationColIndex;
                const monster = new Monster(this.scene, monsterData);

                monster.setPosition(row, col);
                monster.ownerGrid = this;
                this.grid[row][col] = monster;
                this.createUnit(monster);
            });
        });
    }

    getRandomFormationPosition(formation) {
        const height = formation.length;
        const width = Math.max(...formation.map((row) => row.length));
        const positions = [];

        for (let row = 0; row <= this.rows - height; row++) {
            for (let col = 0; col <= this.cols - width; col++) {
                const isEmpty = formation.every((formationRow, rowIndex) =>
                    formationRow.every((cell, colIndex) => {
                        if (cell === null || cell === undefined || cell === 0 || cell === false) {
                            return true;
                        }

                        return this.grid[row + rowIndex][col + colIndex] === null;
                    }),
                );

                if (isEmpty) {
                    positions.push({ row, col });
                }
            }
        }

        return positions.length > 0
            ? Phaser.Utils.Array.GetRandom(positions)
            : null;
    }

    createMonster(monster, row, col) {
        const x = col * this.cellSize + this.cellSize / 2;

        const y = row * (this.cellSize + this.rowGap) + this.cellSize / 2;

        const img = this.scene.add.image(x, y, monster.avatar);

        img.setDisplaySize(this.cellSize - 8, this.cellSize - 8);

        this.container.add(img);
    }

    createUnit(unit) {
        const x = unit.col * this.cellSize + this.cellSize / 2;

        const y = unit.row * (this.cellSize + this.rowGap) + this.cellSize / 2;

        unit.view = new UnitView(this.scene, unit, x, y, this.cellSize);

        this.container.add(unit.view.container);
    }

    getHeight() {
        return this.rows * this.cellSize + Math.max(0, this.rows - 1) * this.rowGap;
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

        if (this.hp < 0) this.hp = 0;

        if (this.view) {
            this.view.refresh();
        }
    }
}
