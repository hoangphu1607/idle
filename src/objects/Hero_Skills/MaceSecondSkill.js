import Skill from "./Skill.js";

export default class MaceSecondSkill extends Skill {
    constructor(config) {
        super({
            id: "mace_skill_second",
            name: "Mace Shockwave",
            cooldown: config.cooldown ?? 10,
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

        const targetGrid =
            caster.team === "enemy"
                ? battle.playerGrid
                : battle.enemyGrid;

        if (!caster.currentTarget || caster.currentTarget.dead) {
            caster.currentTarget = battle.findNearestTarget(
                targetGrid,
                caster
            );
        }

        const target = caster.currentTarget;

        if (!target || !caster.view || !target.view) {
            return;
        }

        const affectedUnits = battle.getAllUnits(targetGrid).filter((unit) => {
            if (!unit || unit.dead) {
                return false;
            }

            const dRow = Math.abs(unit.row - target.row);
            const dCol = Math.abs(unit.col - target.col);

            return dRow <= 1 && dCol <= 1;
        });

        if (affectedUnits.length === 0) {
            return;
        }

        const originX = target.ownerGrid.container.x + target.view.container.x;
        const originY = target.ownerGrid.container.y + target.view.container.y;

        const wave = battle.add.image(originX, originY, "Mace_second_skill")
            .setOrigin(0.5)            
            .setDisplaySize(90, 90);

        battle.tweens.add({
            targets: wave,
            alpha: 0,
            scale: 1.4,
            duration: 450,
            ease: "Linear",
            onComplete: () => wave.destroy(),
        });

        const baseDamage = Math.max(20, caster.attack_physical * 1.8);

        affectedUnits.forEach((unit) => {
            if (unit.dead) {
                return;
            }

            const damage = unit.takeDamage(baseDamage, caster, "physical");
            debugger;
            if (damage && unit.team !== caster.team) {
                unit.applyStun?.(5000);
                console.log('Stunned', unit.name, 'for 5 seconds');
            }

            if (unit.dead) {
                battle.removeUnit(unit);
            }
        });

        this.startCooldown(currentTime);
    }
}
