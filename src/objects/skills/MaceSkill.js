import Skill from "./Skill";

export default class MaceSkill extends Skill {
    constructor(config) {
        super({
            id: "mace_skill_first",
            name: "Mace Smash",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });
    }

    execute(caster, battle) {
        const currentTime = battle.time.now;

        // Chưa hết cooldown
        if (!this.isReady(currentTime)) {
            return;
        }

        const targetGrid = caster.team === "enemy" ? battle.playerGrid : battle.enemyGrid;

        if (!caster.currentTarget || caster.currentTarget.dead) {
            caster.currentTarget = battle.findNearestTarget(targetGrid, caster);
        }

        const target = caster.currentTarget;

        if (!target) {
            return;
        }

        const damage = caster.attack_physical;

        target.takeDamage(damage);

        if (target.dead) {
            battle.removeUnit(target);
        }

        console.log(`${caster.name} uses ${this.name}`);

        console.log(
            `${caster.name} attacks ${target.name} for ${damage} damage`,
        );

        // Bắt đầu cooldown
        this.startCooldown(currentTime);
    }
}
