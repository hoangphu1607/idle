import BaseScene from "./base/BaseScene";
import Phaser from "phaser";
import BattleGrid from "../objects/BattleGrid";
import { MONSTERS } from "../assets/data/monsters";
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

        const gridSize = 60;
        const rows = 5;
        const cols = 9;

        const gridHeight = rows * gridSize;
        const gridWidth = cols * gridSize;

        const startX = (this.scale.width - gridWidth) / 2;

        const enemyY = 20;
        const dividerHeight = 70;

        // Vị trí thanh giữa
        const dividerY = enemyY + gridHeight + dividerHeight / 2;

        // Grid player bắt đầu ngay dưới thanh
        const playerY = enemyY + gridHeight + dividerHeight + 10;

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

        this.enemyGrid.spawnMonsters(MONSTERS);
        this.playerGrid.spawnHeroes(this.heroes);
        this.startBattle();

    }

    startBattle() {

        this.enemyGrid.grid.forEach(row => {

            row.forEach(monster => {

                if (monster) {

                    this.startAutoAttack(monster);

                }

            });

        });

        this.playerGrid.grid.forEach(row => {

            row.forEach(hero => {

                if (hero) {

                    this.startAutoAttack(hero);

                }

            });

        });

    }

    startAutoAttack(unit) {

        const delay = unit.auto_attack * 1000;

        unit.attackTimer = this.time.addEvent({

            delay,

            loop: true,

            callback: () => {

                this.attack(unit);

            }

        });

    }

    attack(attacker) {
        if (attacker.dead) {
            return;
        }
        const targetGrid =
            attacker.team === "enemy"
                ? this.playerGrid
                : this.enemyGrid;

        const target = this.findRandomTarget(targetGrid);

        if (!target) return;

        target.takeDamage(attacker.attack_physical);
        if (target.dead) {
            this.removeUnit(target);
        }
        console.log(
            `${attacker.name} attacks ${target.name} for ${attacker.attack_physical} damage. Target HP: ${target.hp}/${target.maxHp}`
        );

    }

    removeUnit(unit) {
        if (!unit.dead) {
        return;
    }
        // Xóa khỏi BattleGrid
        unit.ownerGrid.grid[unit.row][unit.col] = null;

        // Xóa giao diện
        unit.view.destroy();

        console.log(`${unit.name} chết`);

    }

    findRandomTarget(grid) {

        const units = [];

        grid.grid.forEach(row => {
            row.forEach(unit => {
                if (unit && !unit.dead) {
                    units.push(unit);
                }
            });
        });

        if (units.length === 0) {
            return null;
        }

        return Phaser.Utils.Array.GetRandom(units);
    }


}