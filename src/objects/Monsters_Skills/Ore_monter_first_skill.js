import Skill from "../Hero_Skills/Skill.js";

export default class OreMonsterSkill extends Skill {
    constructor(config) {
        super({
            id: "Ore_monster_first_skill",
            name: "Ore Monster Attack",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });
    }

    execute(caster, battle) {


        const currentTime = battle.time.now;

        // Log kiểm tra xem hàm có được gọi mỗi tick không
        if (!caster.isAggro) {
            // console.log("Không dùng skill do mất Aggro");
            return;
        }

        if (!this.isReady(currentTime)) {
            return;
        }

        // Cooldown đã sẵn sàng, nhưng xem có bị chặn bởi Target không
        const targetGrid = caster.team === "enemy" ? battle.playerGrid : battle.enemyGrid;

        if (!caster.currentTarget || caster.currentTarget.dead) {
            caster.currentTarget = battle.findNearestTarget(targetGrid, caster);
        }

        const target = caster.currentTarget;

        if (!target || !caster.view || !target.view) {
            console.log(`[${currentTime}] Skill sẵn sàng nhưng không tìm thấy target hoặc target chưa có view!`);
            return;
        }

        const targetBounds = target.view.sprite?.getBounds();
        const targetX = targetBounds?.centerX ??
            target.ownerGrid.container.x + target.view.container.x;
        const footY = targetBounds?.bottom ??
            target.ownerGrid.container.y +
                target.view.container.y +
                (target.view.sprite?.displayHeight ?? 64) * 0.5;

        // ==========================================
        // Tạo cây dưới chân Hero
        // ==========================================
        const finalY = footY;         // Vị trí mọc lên hoàn chỉnh (ngay mặt sàn tiếp đất)
        const startY = footY + 25;    // Vị trí lún dưới lòng đất trước khi đâm lên

        const projectile = battle.add.image(
            targetX,
            startY,
            "Ore_monster_first_skill"
        );

        // Neo ở giữa đáy (bottom-center)
        projectile
            .setOrigin(0.5, 1)
            .setDepth(target.view.container.depth + 1); // Hiển thị phía trước nhân vật hoặc tùy chỉnh
        projectile.setScale(0.2);
        // ==========================================
        // Hiệu ứng rễ cây trồi lên
        // ==========================================
        battle.tweens.add({
            targets: projectile,
            y: finalY,
            duration: 150,
            ease: "Cubic.easeOut",
            onComplete: () => {
                // Gây sát thương ngay khi trồi lên hoàn tất
                if (!target.dead) {
                    const damage = caster.attack_physical;

                    target.takeDamage(
                        damage,
                        caster,
                        "physical"
                    );

                    console.log(
                        `${caster.name} uses ${this.name} on ${target.name}: ` +
                        `time=${currentTime}, damage=${damage}`
                    );

                    if (target.dead) {
                        battle.removeUnit(target);
                    }
                }

                // ============================================
                // Asset tồn tại 1 giây (1000ms) trước khi biến mất
                // ============================================
                battle.time.delayedCall(1000, () => {
                    if (!projectile || !projectile.scene) return;

                    // Hiệu ứng lặn dần xuống đất
                    battle.tweens.add({
                        targets: projectile,
                        alpha: 0,
                        y: finalY + 20,
                        duration: 300,
                        onComplete: () => {
                            projectile.destroy();
                        }
                    });
                });
            }
        });

        // =========================
        // Bắt đầu cooldown
        // =========================
        this.startCooldown(currentTime);
    }

    
}