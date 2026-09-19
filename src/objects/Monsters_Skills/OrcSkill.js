import Skill from "../Hero_Skills/Skill.js";
import Phaser from "phaser";
export default class OrcSkill extends Skill {
    constructor(config) {
        super({
            id: "Orc_first_skill",
            name: "Orc Attack",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });
    }

    execute(caster, battle) {

        // Monster chưa bị tác động thì không dùng skill
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

        // =====================================================
        // Lấy tất cả mục tiêu còn sống
        // =====================================================
        const targets = battle.getAllUnits(targetGrid).filter(
            unit => unit && !unit.dead
        );

        if (targets.length === 0) {
            return;
        }

        // =====================================================
        // Chọn mục tiêu
        // =====================================================
        let attackTargets;

        if (targets.length === 1) {

            // Chỉ còn 1 mục tiêu
            // → đánh mục tiêu đó 2 lần
            attackTargets = [
                targets[0],
                targets[0]
            ];

        } else {

            // Có từ 2 mục tiêu trở lên
            // → chọn 2 mục tiêu khác nhau
            const shuffledTargets = Phaser.Utils.Array.Shuffle([
                ...targets
            ]);

            attackTargets = [
                shuffledTargets[0],
                shuffledTargets[1]
            ];
        }

        // =====================================================
        // Vị trí Orc
        // =====================================================
        const startX =
            caster.ownerGrid.container.x +
            caster.view.container.x;

        const startY =
            caster.ownerGrid.container.y +
            caster.view.container.y;

        // =====================================================
        // Tạo 2 projectile
        // =====================================================
        attackTargets.forEach((target, index) => {

            if (!target?.view) {
                return;
            }

            const projectile = battle.add.image(
                startX,
                startY,
                "Base_first_skill"
            )
                .setOrigin(0.5, 0.5)
                .setDisplaySize(60, 60);

            projectile.setDepth(10);

            const targetX =
                target.ownerGrid.container.x +
                target.view.container.x;

            const targetY =
                target.ownerGrid.container.y +
                target.view.container.y;

            battle.tweens.add({
                targets: projectile,

                x: targetX,
                y: targetY,

                duration: 1000,

                onComplete: () => {

                    projectile.destroy();

                    // Target đã chết trước khi projectile tới
                    if (target.dead) {
                        return;
                    }

                    // =================================================
                    // Damage
                    // =================================================
                    const damage = caster.attack_physical;

                    let objDame = target.takeDamage(
                        damage,
                        caster,
                        "physical"
                    );
                    console.log(`${caster.name} attacks ${target.name} for ${objDame.finalDamage} final damage (base damage: ${damage})`);

                    // =================================================
                    // Target chết
                    // =================================================
                    if (target.dead) {
                        battle.removeUnit(target);
                    }
                },
            });
        });

        // =====================================================
        // Cooldown
        // =====================================================
        this.startCooldown(currentTime);
    }
}