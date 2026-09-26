import Skill from "./Skill.js";

export default class MageSecondSkill extends Skill {
    constructor(config) {
        super({
            id: "mage_skill_second",
            name: "Mage Arcane Rain",
            cooldown: config.cooldown ?? 12,
            initialCooldown: config.initialCooldown ?? 0,
        });
    }

    execute(caster, battle) {
        const currentTime = battle.time.now;

        if (!caster || caster.dead || caster.isStunned) {
            return;
        }

        if (!this.isReady(currentTime)) {
            return;
        }

        const targetGrid = caster.team === "enemy"
            ? battle.playerGrid
            : battle.enemyGrid;

        if (!caster.currentTarget || caster.currentTarget.dead) {
            caster.currentTarget = battle.findNearestTarget(targetGrid, caster);
        }

        const target = caster.currentTarget;

        if (!target || !target.ownerGrid) {
            return;
        }

        const regionMinRow = Math.max(0, target.row - 1);
        const regionMaxRow = Math.min(targetGrid.grid.length - 1, target.row + 2);
        const regionMinCol = Math.max(0, target.col - 1);
        const regionMaxCol = Math.min(targetGrid.grid[0].length - 1, target.col + 2);

        const regionUnits = battle.getAllUnits(targetGrid).filter((unit) => {
            if (!unit || unit.dead || unit.team === caster.team) {
                return false;
            }

            return unit.row >= regionMinRow && unit.row <= regionMaxRow &&
                unit.col >= regionMinCol && unit.col <= regionMaxCol;
        });

        const candidateWindows = [];

        for (let rowStart = regionMinRow; rowStart <= regionMaxRow - 1; rowStart++) {
            for (let colStart = regionMinCol; colStart <= regionMaxCol - 1; colStart++) {
                const windowUnits = battle.getAllUnits(targetGrid).filter((unit) => {
                    if (!unit || unit.dead || unit.team === caster.team) {
                        return false;
                    }

                    return unit.row >= rowStart && unit.row <= rowStart + 1 &&
                        unit.col >= colStart && unit.col <= colStart + 1;
                });

                candidateWindows.push({
                    rowStart,
                    colStart,
                    units: windowUnits,
                    count: windowUnits.length,
                });
            }
        }

        const bestWindow = candidateWindows.reduce((best, candidate) => {
            if (!best || candidate.count > best.count) {
                return candidate;
            }

            if (candidate.count === best.count) {
                const bestCenter = (best.rowStart + best.colStart) / 2;
                const candidateCenter = (candidate.rowStart + candidate.colStart) / 2;

                return candidateCenter > bestCenter ? candidate : best;
            }

            return best;
        }, candidateWindows[0] || {
            rowStart: target.row,
            colStart: target.col,
            units: [target],
            count: 1,
        });

        const areaUnits = bestWindow.units.length > 0
            ? bestWindow.units
            : regionUnits.length > 0
                ? regionUnits
                : [target];

        const fallX = areaUnits.reduce((sum, unit) => {
            return sum + (unit.ownerGrid.container.x + unit.view.container.x);
        }, 0) / areaUnits.length;

        const fallY = areaUnits.reduce((sum, unit) => {
            return sum + (unit.ownerGrid.container.y + unit.view.container.y);
        }, 0) / areaUnits.length;

        const falling = battle.add.image(fallX, fallY - 220, "Mage_second_skill_falling")
            .setDisplaySize(90, 90)
            .setDepth(20);

        battle.tweens.add({
            targets: falling,
            x: fallX,
            y: fallY,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => {
                falling.destroy();

                const gridContainer = target.ownerGrid?.container;
                const area = battle.add.image(
                    fallX,
                    fallY,
                    "Mage_second_skill_area",
                )
                    .setDisplaySize(110, 110)
                    .setAlpha(0.9)
                    .setDepth(0);

                if (gridContainer) {
                    area.setPosition(
                        fallX - gridContainer.x,
                        fallY - gridContainer.y,
                    );
                    gridContainer.add(area);
                    gridContainer.sendToBack(area);
                }
                const bonusDamage = 80;
                const tickDamage = Math.max(1, (caster.attack_magic ?? caster.auto_attack ?? 0) * 0.5) + bonusDamage;
                const damageMultiplier = 1; //100% sát thương
                const damageInArea = () => {
                    if (!area || !area.active) {
                        return;
                    }

                    const affectedUnits = battle.getAllUnits(targetGrid).filter((unit) => {
                        if (!unit || unit.dead || unit.team === caster.team) {
                            return false;
                        }

                        return unit.row >= bestWindow.rowStart && unit.row <= bestWindow.rowStart + 1 &&
                            unit.col >= bestWindow.colStart && unit.col <= bestWindow.colStart + 1;
                    });

                    affectedUnits.forEach((unit) => {
                        if (!unit || unit.dead) {
                            return;
                        }

                        unit.takeDamage(tickDamage, caster, "magic", { multiplier: damageMultiplier });

                        if (unit.dead) {
                            battle.removeUnit(unit);
                        }
                    });
                };

                damageInArea();

                const damageTimer = battle.time.addEvent({
                    delay: 1000,
                    repeat: 3,
                    callback: damageInArea,
                });

                battle.time.delayedCall(2000, () => {
                    damageTimer.remove(false);
                    area.destroy();
                });
            },
        });

        this.startCooldown(currentTime);
    }
}
