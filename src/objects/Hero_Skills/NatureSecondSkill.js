import Skill from "./Skill.js";

export default class NatureSecondSkill extends Skill {
    constructor(config) {
        super({
            id: "nature_skill_second",
            name: "Nature Bloom",
            cooldown: config.cooldown ?? 15,
            initialCooldown: config.initialCooldown ?? 0,
        });
    }

    showFloatingHealText(battle, target, amount) {
        if (!target?.view?.container) {
            return;
        }

        const healText = battle.add.text(0, -28, `+${Math.round(amount)}`, {
            fontSize: "16px",
            fontStyle: "bold",
            color: "#00ff66",
            stroke: "#003300",
            strokeThickness: 3,
        });

        healText.setOrigin(0.5);
        healText.setDepth(30);
        target.view.container.add(healText);

        battle.tweens.add({
            targets: healText,
            y: -50,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => healText.destroy(),
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

        const allies = battle.getAllUnits(battle.playerGrid).filter(
            (unit) => unit && !unit.dead && unit.team === "player"
        );

        if (allies.length === 0) {
            return;
        }

        const target = allies.reduce((lowest, unit) => {
            if (!lowest) {
                return unit;
            }

            const lowestMissing = lowest.maxHp - lowest.hp;
            const unitMissing = unit.maxHp - unit.hp;

            return unitMissing > lowestMissing ? unit : lowest;
        }, null);

        if (!target || !target.view || !target.view.container) {
            return;
        }

        const regionMinRow = Math.max(0, target.row - 1);
        const regionMaxRow = Math.min(battle.playerGrid.grid.length - 1, target.row + 1);
        const regionMinCol = Math.max(0, target.col - 1);
        const regionMaxCol = Math.min(battle.playerGrid.grid[0].length - 1, target.col + 1);

        const candidateWindows = [];

        for (let rowStart = regionMinRow; rowStart <= regionMaxRow; rowStart++) {
            for (let colStart = regionMinCol; colStart <= regionMaxCol; colStart++) {
                const windowUnits = allies.filter((unit) => {
                    if (!unit || unit.dead) {
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

        const bestWindow = candidateWindows.reduce((best, current) => {
            if (!best || current.count > best.count) {
                return current;
            }

            if (current.count === best.count) {
                const currentDistance = Math.abs(current.rowStart - target.row) + Math.abs(current.colStart - target.col);
                const bestDistance = Math.abs(best.rowStart - target.row) + Math.abs(best.colStart - target.col);
                return currentDistance < bestDistance ? current : best;
            }

            return best;
        }, candidateWindows[0] || {
            rowStart: target.row,
            colStart: target.col,
            units: [target],
            count: 1,
        });

        const areaUnits = bestWindow.units.length > 0 ? bestWindow.units : [target];

        const targetCenterRow = Math.min(...areaUnits.map((unit) => unit.row));
        const targetCenterCol = Math.min(...areaUnits.map((unit) => unit.col));

        const fullAreaUnits = allies.filter((unit) => {
            if (!unit || unit.dead) {
                return false;
            }

            return unit.row >= targetCenterRow && unit.row <= targetCenterRow + 1 &&
                unit.col >= targetCenterCol && unit.col <= targetCenterCol + 1;
        });

        const centerX = fullAreaUnits.reduce((sum, unit) => {
            return sum + (unit.ownerGrid.container.x + unit.view.container.x);
        }, 0) / fullAreaUnits.length;

        const centerY = fullAreaUnits.reduce((sum, unit) => {
            return sum + (unit.ownerGrid.container.y + unit.view.container.y);
        }, 0) / fullAreaUnits.length;      

        const gridContainer = target.ownerGrid?.container;
        const zone = battle.add.image(centerX, centerY, "Nature_second_skill")
            .setDisplaySize(90, 90)
            .setOrigin(0.5)
            .setAlpha(0.95)
            .setDepth(2);

        if (gridContainer) {
            const localX = centerX - gridContainer.x;
            const localY = centerY - gridContainer.y;
            zone.setPosition(localX, localY);
            gridContainer.add(zone);
            gridContainer.sendToBack(zone);
        }

        const healPerSecond = Number(caster.attack_magic ?? 0) || 10;
        const affected = fullAreaUnits.filter((unit) => unit && !unit.dead && unit.team === "player");
        const previousArmor = new Map();
        const previousMagicResist = new Map();

        affected.forEach((unit) => {
            previousArmor.set(unit, unit.armor ?? 0);
            previousMagicResist.set(unit, unit.magic_resistance ?? 0);

            unit.armor = (unit.armor ?? 0) + 5;
            unit.magic_resistance = (unit.magic_resistance ?? 0) + 5;
        });

        const healTick = () => {
            affected.forEach((unit) => {
                if (!unit || unit.dead) {
                    return;
                }

                const before = unit.hp;
                unit.heal(healPerSecond);
                const actualHeal = unit.hp - before;

                if (actualHeal > 0) {
                    this.showFloatingHealText(battle, unit, actualHeal);
                    unit.view?.refresh();
                }
            });
        };

        healTick();

        const healTimer = battle.time.addEvent({
            delay: 1000,
            repeat: 4,
            callback: healTick,
        });

        battle.time.delayedCall(5000, () => {
            healTimer.remove(false);

            affected.forEach((unit) => {
                if (!unit) {
                    return;
                }

                unit.armor = previousArmor.get(unit) ?? unit.armor;
                unit.magic_resistance = previousMagicResist.get(unit) ?? unit.magic_resistance;

                if (unit.view?.refresh) {
                    unit.view.refresh();
                }
            });

            if (zone && zone.active) {
                zone.destroy();
            }
        });

        this.startCooldown(currentTime);
    }
}
