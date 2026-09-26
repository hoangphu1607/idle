import Skill from "../Hero_Skills/Skill.js";

export default class Thief_bow_first_skill extends Skill {
    constructor(config) {
        super({
            id: "Thief_bow_first_skill",
            name: "Thief Bow Shot",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });
    }

    execute(caster, battle) {

        if (!caster.isAggro) {
            return;
        }

        const currentTime = battle.time.now;

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

        // ==========================================
        // TÍNH DAMAGE
        // ==========================================

        const hpPercent = caster.hp / caster.maxHp;
        const damageMultiplier = 1;
        const baseDamage = caster.attack_physical;


        // ==========================================
        // PROJECTILE
        // ==========================================

        const projectile = battle.add.image(
            caster.ownerGrid.container.x + caster.view.container.x,
            caster.ownerGrid.container.y + caster.view.container.y,
            "Base_first_skill",
        )
            .setOrigin(0.5)
            .setDisplaySize(60, 60);

        projectile.setDepth(10);

        const targetX =
            target.ownerGrid.container.x + target.view.container.x;

        const targetY =
            target.ownerGrid.container.y + target.view.container.y;


        battle.tweens.add({
            targets: projectile,
            x: targetX,
            y: targetY,
            duration: 1000,

            onComplete: () => {

                projectile.destroy();

                if (target.dead) {
                    return;
                }

                const damageResult = target.takeDamage(
                    baseDamage,
                    caster,
                    "physical",
                    { multiplier: damageMultiplier },
                );

                //console.log("Damage result", damageResult);

                if (target.dead) {
                    battle.removeUnit(target);
                }
            },
        });


        // ==========================================
        // LOG
        // ==========================================

        // console.log(
        //     `${caster.name} uses ${this.name} on ${target.name}: ` +
        //     `time=${currentTime}, ` +
        //     `baseDamage=${baseDamage}, ` +
        //     `multiplier=${damageMultiplier}, ` +
        //     `HP=${Math.round(hpPercent * 100)}%`
        // );


        this.startCooldown(currentTime);
    }
}