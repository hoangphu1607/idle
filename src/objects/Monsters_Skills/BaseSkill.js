import Skill from "../Hero_Skills/Skill.js";
import Phaser from "phaser";
export default class BaseSkill extends Skill {
    /**
     * @param {Object} config Cấu hình skill
     * @param {string} config.id ID của skill
     * @param {string} config.name Tên skill
     * @param {number} config.cooldown Thời gian hồi chiêu (ms)
     * @param {number} [config.initialCooldown] Thời gian hồi lúc mới vào trận
     * @param {string} [config.damageType="physical"] "physical" hoặc "magic"
     * @param {number} [config.damageMultiplier=1] Hệ số sát thương
     * @param {string} [config.projectileKey="Base_first_skill"] Asset đạn bay
     * @param {number} [config.projectileSize=60] Kích thước hiển thị của đạn
     * @param {number} [config.projectileDuration=1000] Thời gian bay tới mục tiêu (ms)
     */
    constructor(config) {
        super({
            id: config.id || "Projectile_Damage_Skill",
            name: config.name || "Projectile Strike",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });

        this.damageType = config.damageType || "physical";
        this.damageMultiplier = config.damageMultiplier !== undefined ? config.damageMultiplier : 1;
        this.projectileKey = config.projectileKey || "Base_first_skill";
        this.projectileSize = config.projectileSize || 60;
        this.projectileDuration = config.projectileDuration || 1000;
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
        // TỰ ĐỘNG CHỌN BASE DAMAGE THEO DAMAGE TYPE
        // ==========================================
        const baseDamage =
            this.damageType === "magic"
                ? (caster.attack_magic || 0)
                : (caster.attack_physical || 0);

        // ==========================================
        // TỌA ĐỘ BẮT ĐẦU VÀ ĐÍCH ĐẾN
        // ==========================================
        const startX = caster.ownerGrid.container.x + caster.view.container.x;
        const startY = caster.ownerGrid.container.y + caster.view.container.y;

        const targetX = target.ownerGrid.container.x + target.view.container.x;
        const targetY = target.ownerGrid.container.y + target.view.container.y;

        // Tính góc xoay hướng thẳng đến mục tiêu
        const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);

        // ==========================================
        // PROJECTILE
        // ==========================================
        const projectile = battle.add.image(startX, startY, this.projectileKey)
            .setOrigin(0.5)
            .setDisplaySize(this.projectileSize, this.projectileSize)
            .setDepth(10);

        // Xoay hình ảnh theo hướng bay (bù trừ -90 độ do hình gốc quay xuống dưới)
        projectile.rotation = angle - Math.PI / 2;

        battle.tweens.add({
            targets: projectile,
            x: targetX,
            y: targetY,
            duration: this.projectileDuration,

            onComplete: () => {
                projectile.destroy();

                if (target.dead) {
                    return;
                }

                target.takeDamage(
                    baseDamage,
                    caster,
                    this.damageType,
                    { multiplier: this.damageMultiplier }
                );

                if (target.dead) {
                    battle.removeUnit(target);
                }
            },
        });

        this.startCooldown(currentTime);
    }
}