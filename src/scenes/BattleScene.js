import BaseScene from "./base/BaseScene";
import Phaser from "phaser";
import BattleGrid from "../objects/BattleGrid";
import { STAGES } from "../assets/data/stages";
import SaveManager from "../managers/SaveManager";
import Inventory from "../managers/Inventory";
export default class BattleScene extends BaseScene {
    constructor() {
        super("BattleScene");
    }
    init(data) {
        this.heroes = data.heroes || [];
        this.content = data.content;
        this.stageIndex = data.stageIndex || 0;
        this.waveIndex = 0;
        this.isTransitioning = false;
        this.damageTotals = new Map();
        this.victoryShown = false;
    }
    create() {
        this.createBackground();

        this.createBottomNavigation("battle");

        const gridSize = 60;
        const enemyRows = 9;
        const enemyCols = 9;
        const heroRows = 5;
        const rowGap = 10;

        const gridWidth = enemyCols * gridSize;

        const startX = (this.scale.width - gridWidth) / 2;

        const enemyY = 20;
        const dividerHeight = 70;

        // Vị trí thanh giữa
        const enemyGridHeight = enemyRows * gridSize + (enemyRows - 1) * rowGap;
        const dividerY = enemyY + enemyGridHeight + dividerHeight / 2;

        // Grid player bắt đầu ngay dưới thanh
        const playerY = enemyY + enemyGridHeight + dividerHeight + 10;

        // Enemy
        this.enemyGrid = new BattleGrid(
            this,
            startX,
            enemyY,
            gridSize,
            enemyRows,
            enemyCols,
            rowGap,
        );

        // Divider
        this.add.rectangle(
            this.scale.width / 2,
            dividerY,
            this.scale.width - 80,
            dividerHeight,
            0x666666,
        );

        // Player
        this.playerGrid = new BattleGrid(
            this,
            startX,
            playerY,
            gridSize,
            heroRows,
            enemyCols,
            rowGap,
        );

        this.playerGrid.spawnHeroes(this.heroes);
        this.spawnCurrentWave();
        this.createDpsButton();
        this.startCountdown(() => {
            this.initializeSkillCooldown();
            this.startBattle();
        });
    }

    createDpsButton() {
        const buttonX = this.scale.width - 42;
        const buttonY = 42;

        this.dpsButton = this.add.image(buttonX, buttonY, "btn_check_dps")
            .setDisplaySize(52, 52)
            .setDepth(20)
            .setInteractive({ useHandCursor: true });

        this.dpsPanel = this.add.container(0, 0)
            .setDepth(19)
            .setVisible(false);

        this.dpsButton.on("pointerdown", () => {
            this.dpsPanel.setVisible(!this.dpsPanel.visible);
            this.refreshDpsPanel();
        });
    }

    recordDamage(hero, damage) {
        const currentDamage = this.damageTotals.get(hero) || 0;

        this.damageTotals.set(hero, currentDamage + damage);

        if (this.dpsPanel?.visible) {
            this.refreshDpsPanel();
        }
    }

    refreshDpsPanel() {
        const panelWidth = 230;
        const panelX = Math.max(8, this.scale.width - panelWidth - 64);
        const panelY = 70;
        const rowHeight = 26;
        const entries = [...this.damageTotals.entries()]
            .sort(([, firstDamage], [, secondDamage]) => secondDamage - firstDamage);
        const panelHeight = 48 + Math.max(entries.length, 1) * rowHeight;

        this.dpsPanel.removeAll(true);
        this.dpsPanel.setPosition(panelX, panelY);

        const background = this.add.rectangle(
            0,
            0,
            panelWidth,
            panelHeight,
            0x18212b,
            0.96,
        ).setOrigin(0);
        const title = this.add.text(14, 10, "DPS", {
            fontSize: "20px",
            color: "#f5d98b",
            fontStyle: "bold",
        });

        this.dpsPanel.add([background, title]);

        if (entries.length === 0) {
            this.dpsPanel.add(this.add.text(14, 38, "Chưa có sát thương", {
                fontSize: "15px",
                color: "#c8d0d8",
            }));
            return;
        }

        entries.forEach(([hero, damage], index) => {
            const rowY = 40 + index * rowHeight;
            const name = this.add.text(14, rowY, hero.name, {
                fontSize: "16px",
                color: "#ffffff",
            });
            const total = this.add.text(panelWidth - 14, rowY, String(damage), {
                fontSize: "16px",
                color: "#ffffff",
            }).setOrigin(1, 0);

            this.dpsPanel.add([name, total]);
        });
    }

    spawnCurrentWave() {
        const stage = STAGES[this.stageIndex];

        if (!stage) {
            this.handleVictory();
            return;
        }

        const wave = stage.waves[this.waveIndex];

        if (!wave) {
            this.advanceStage();
            return;
        }

        this.enemyGrid.spawnMonsters(wave);
    }

    initializeSkillCooldown() {
        const units = [
            ...this.getAllUnits(this.playerGrid),
            ...this.getAllUnits(this.enemyGrid),
        ];

        const currentTime = this.time.now;

        units.forEach((unit) => {
            unit.skills.forEach((skill) => {
                skill.startBattle(currentTime);
            });
        });
    }

    getAllUnits(grid) {
        const units = [];

        grid.grid.forEach((row) => {
            row.forEach((unit) => {
                if (unit && !unit.dead) {
                    units.push(unit);
                }
            });
        });

        return units;
    }

    alertNearbyMonsters(target, attacker, damage) {
        if (!target.ownerGrid || !attacker) {
            return;
        }

        this.getAllUnits(target.ownerGrid).forEach((monster) => {
            if (
                monster === target ||
                monster.team !== "enemy" ||
                monster.dead ||
                Math.abs(monster.row - target.row) + Math.abs(monster.col - target.col) !== 1
            ) {
                return;
            }

            monster.isAggro = true;
            monster.addThreat(attacker, damage * attacker.threat);
        });
    }

    startBattle() {
        this.startGridAutoAttack(this.enemyGrid);
        this.startGridAutoAttack(this.playerGrid);
    }

    startGridAutoAttack(grid) {
        grid.grid.forEach((row) => {
            row.forEach((monster) => {
                if (monster) {
                    this.startAutoAttack(monster);
                }
            });
        });
    }

    startAutoAttack(unit) {
        const skill = unit.skills?.[0];
        const cooldown = (skill?.cooldown ?? unit.auto_attack) * 1000;
        const initialCooldown = (skill?.initialCooldown ?? 0) * 1000;

        const startCooldownTimer = () => {
            unit.attackTimer = this.time.addEvent({
                delay: cooldown,
                loop: true,
                callback: () => {
                    this.attack(unit);
                },
            });
        };

        if (initialCooldown > 0) {
            unit.initialAttackTimer = this.time.delayedCall(
                initialCooldown,
                () => {
                    this.attack(unit);
                    startCooldownTimer();
                },
            );
            return;
        }

        this.attack(unit);
        startCooldownTimer();
    }

    attack(attacker) {
        if (attacker.dead) {
            return;
        }

        attacker.Active_Skill_First(this);
    }

    getExperienceToNextLevel(level) {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    onUnitDefeated(defeatedUnit, attacker) {
        if (
            defeatedUnit.team !== "enemy" ||
            !attacker ||
            attacker.team !== "player" ||
            (!defeatedUnit.experienceReward &&
                !defeatedUnit.goldReward &&
                defeatedUnit.dropItems.length === 0)
        ) {
            return;
        }

        const experienceReward = defeatedUnit.experienceReward;
        const goldReward = defeatedUnit.goldReward;
        const saveData = SaveManager.load();
        saveData.heroes = saveData.heroes || {};
        saveData.player = saveData.player || {};
        const inventory = new Inventory(saveData.inventory || []);

        saveData.player.gold = Number(saveData.player.gold || 0) + goldReward;
        inventory.addDrops(defeatedUnit.dropItems);
        saveData.inventory = inventory.getAllItems();

        this.heroes.forEach((hero) => {
            const heroId = String(hero.id);
            const savedHero = saveData.heroes[heroId] || {};
            const currentExperience = Number(savedHero.experience ?? hero.experience ?? 0);
            let remainingExperience = currentExperience + experienceReward;
            let level = Number(savedHero.level ?? hero.level ?? 1);

            while (remainingExperience >= this.getExperienceToNextLevel(level)) {
                const requiredExperience = this.getExperienceToNextLevel(level);

                remainingExperience -= requiredExperience;
                level += 1;
            }

            hero.experience = remainingExperience;
            hero.level = level;

            saveData.heroes[heroId] = {
                ...savedHero,
                level,
                experience: remainingExperience
            };
        });

        SaveManager.save(saveData);

        this.getAllUnits(this.playerGrid).forEach((hero) => {
            hero.view?.refresh();
        });

        //console.log(`Đội hình nhận ${experienceReward} EXP mỗi hero và ${goldReward} gold`);
    }

    removeUnit(unit) {
        if (!unit.dead) {
            return;
        }
        // Xóa khỏi BattleGrid
        unit.ownerGrid.grid[unit.row][unit.col] = null;

        // Xóa giao diện
        unit.view.destroy();

        if (unit.attackTimer) {
            unit.attackTimer.remove(false);
        }

        if (unit.initialAttackTimer) {
            unit.initialAttackTimer.remove(false);
        }

        //console.log(`${unit.name} chết`);

        if (unit.team === "enemy" && this.getAllUnits(this.enemyGrid).length === 0) {
            this.advanceWave();
        }
    }

    advanceWave() {
        if (this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;
        this.time.delayedCall(300, () => {
            this.isTransitioning = false;

            const stage = STAGES[this.stageIndex];

            if (this.waveIndex + 1 < stage.waves.length) {
                this.waveIndex += 1;
                this.spawnCurrentWave();
                this.startGridAutoAttack(this.enemyGrid);
                return;
            }

            this.advanceStage();
        });
    }

    advanceStage() {
        this.stageIndex += 1;
        this.waveIndex = 0;

        if (!STAGES[this.stageIndex]) {
            this.handleVictory();
            return;
        }

        this.spawnCurrentWave();
        this.startGridAutoAttack(this.enemyGrid);
    }

    handleVictory() {
        if (this.victoryShown) {
            return;
        }

        this.victoryShown = true;

        this.competeButton = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "btn_compete",
        )
            .setDisplaySize(180, 70)
            .setDepth(100)
            .setInteractive({ useHandCursor: true });
    }

    findRandomTarget(grid) {
        const units = [];

        grid.grid.forEach((row) => {
            row.forEach((unit) => {
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

    findNearestTarget(grid, attacker) {
        const units = this.getAllUnits(grid);

        if (units.length === 0) {
            return null;
        }

        if (attacker.team === "enemy" && attacker.threatTable.size > 0) {
            const highestThreat = units.reduce((highest, unit) => {
                const threat = attacker.threatTable.get(unit) || 0;

                return threat > highest.threat
                    ? { unit, threat }
                    : highest;
            }, { unit: null, threat: 0 });

            if (highestThreat.unit) {
                return highestThreat.unit;
            }
        }

        // Chọn tuyến đầu trước: hàng cuối của enemyGrid gần hero nhất,
        // hàng đầu của playerGrid gần quái nhất.
        const frontlineRow = grid === this.enemyGrid
            ? Math.max(...units.map((unit) => unit.row))
            : Math.min(...units.map((unit) => unit.row));

        const frontlineUnits = units.filter(
            (unit) => unit.row === frontlineRow
        );

        return frontlineUnits.reduce((nearest, unit) => {
            const distance = Math.abs(unit.row - attacker.row) + Math.abs(unit.col - attacker.col);
            const nearestDistance = Math.abs(nearest.row - attacker.row) + Math.abs(nearest.col - attacker.col);

            return distance < nearestDistance ? unit : nearest;
        });
    }

    startCountdown(onComplete) {
        const countKeys = ["text-3", "text-2", "text-1"];
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        let index = 0;

        const showNextNumber = () => {
            if (index >= countKeys.length) {
                if (onComplete) onComplete();
                return;
            }

            const key = countKeys[index];
            index++;

            // Tạo hình ảnh số đếm ở giữa màn hình
            const numberImg = this.add.image(centerX, centerY, key);
            numberImg.setDepth(100);
            numberImg.setScale(0.5);
            numberImg.setAlpha(0);

            // Tween phóng to và mờ dần trong 900ms
            this.tweens.add({
                targets: numberImg,
                scale: 1.2,
                alpha: 1,
                duration: 250,
                ease: "Back.easeOut",
                onComplete: () => {
                    this.tweens.add({
                        targets: numberImg,
                        scale: 1.5,
                        alpha: 0,
                        duration: 550,
                        delay: 150,
                        ease: "Power2",
                        onComplete: () => {
                            numberImg.destroy();
                            showNextNumber();
                        },
                    });
                },
            });
        };

        showNextNumber();
    }

    
}
