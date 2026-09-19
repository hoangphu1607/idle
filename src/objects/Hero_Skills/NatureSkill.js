import Skill from "./Skill.js";
import Phaser from "phaser";

export default class NatureSkill extends Skill {
    constructor(config) {
        super({
            id: "nature_skill_first",
            name: "Nature Heal",
            cooldown: config.cooldown,
            initialCooldown: config.initialCooldown,
        });

        this.activeStacks = new Map();
    }

    /**
     * Hiển thị số hồi máu (+HP) màu xanh lá nổi lên bên trái nhân vật
     */
    showFloatingHealText(battle, target, amount) {
        if (!target?.view?.container) return;

        // Điểm bắt đầu: phía dưới bên trái của nhân vật
        const startX = -40;
        const startY = 15;
        // Điểm kết thúc: trôi lên phía trên bên trái
        const endY = -35;

        // Tạo text số máu màu xanh lá cây
        const healText = battle.add.text(startX, startY, `+${amount}`, {
            fontSize: "16px",
            fontStyle: "bold",
            color: "#00ff66", // Màu xanh lá cây nổi bật
            stroke: "#003300", // Viền xanh đậm/đen giúp dễ đọc
            strokeThickness: 3,
        });

        healText.setOrigin(0.5);
        healText.setDepth(20); // Đảm bảo nổi lên trên nhân vật

        // Gắn trực tiếp vào container của nhân vật để đi theo vị trí nhân vật
        target.view.container.add(healText);

        // Hiệu ứng bay lên và mờ dần trong 0.5 giây (500ms)
        battle.tweens.add({
            targets: healText,
            y: endY,
            alpha: 0,
            duration: 1000, // 1 giây
            ease: "Cubic.easeOut",
            onComplete: () => {
                healText.destroy(); // Tự hủy sau khi hiệu ứng kết thúc
            },
        });
    }

    execute(caster, battle) {
        const currentTime = battle.time.now;

        if (!this.isReady(currentTime)) {
            return;
        }

        // Lấy tất cả đồng minh còn sống
        const allies = battle.getAllUnits(battle.playerGrid).filter(
            (unit) => unit && !unit.dead
        );

        if (allies.length === 0) {
            return;
        }

        // =========================================================
        // 1. Ưu tiên đồng minh đang thiếu HP nhiều nhất
        // =========================================================
        const injuredAllies = allies.filter(
            (unit) => unit.hp < unit.maxHp
        );

        let target;

        if (injuredAllies.length > 0) {

            // Có người bị thương -> chọn người thiếu HP nhiều nhất
            target = injuredAllies.reduce((mostInjured, unit) => {
                if (!mostInjured) {
                    return unit;
                }

                const missingHp = unit.maxHp - unit.hp;
                const mostMissingHp =
                    mostInjured.maxHp - mostInjured.hp;

                return missingHp > mostMissingHp
                    ? unit
                    : mostInjured;
            }, null);

        } else {

            // =====================================================
            // 2. Tất cả đều đầy HP -> chọn ngẫu nhiên
            // =====================================================
            target = Phaser.Utils.Array.GetRandom(allies);
        }

        if (!target || !target.view || !target.view.container) {
            return;
        }

        // =========================================================
        // 3. Lấy Nature Effect hiện tại của target
        // =========================================================
        const currentEffect = this.activeStacks.get(target);
        const currentCount = currentEffect?.count || 0;

        // Tăng stack, tối đa 3
        const newTotalStacks = Math.min(3, currentCount + 1);

        let effect = currentEffect;

        // =========================================================
        // 4. Nếu target chưa có Nature Effect
        // =========================================================
        if (!effect) {
            const stackPosX = -32;
            const stackPosY = 0;

            const icon = battle.add.image(
                stackPosX,
                stackPosY,
                "Nature_first_skill"
            );

            icon.setDisplaySize(24, 24);
            icon.setDepth(9);

            const text = battle.add.text(
                stackPosX + 8,
                stackPosY + 6,
                `${newTotalStacks}`,
                {
                    fontSize: "14px",
                    fontStyle: "bold",
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 3,
                }
            );

            text.setOrigin(0.5);
            text.setDepth(10);

            target.view.container.add([icon, text]);

            effect = {
                icon,
                text,
                count: newTotalStacks,
                healEvent: null,
            };

        } else {

            // =====================================================
            // 5. Target đã có effect -> tăng stack
            // =====================================================
            effect.count = newTotalStacks;
            effect.text.setText(`${newTotalStacks}`);
        }

        // =========================================================
        // 6. Reset timer hồi máu
        // =========================================================
        if (effect.healEvent) {
            effect.healEvent.remove(false);
        }

        let remainingTicks = 4; // 4 ticks, mỗi tick 1 giây

        effect.healEvent = battle.time.addEvent({
            delay: 1000,
            repeat: 3,

            callback: () => {

                // Target chết
                if (target.dead) {

                    if (effect.icon) {
                        effect.icon.destroy();
                    }

                    if (effect.text) {
                        effect.text.destroy();
                    }

                    this.activeStacks.delete(target);

                    if (effect.healEvent) {
                        effect.healEvent.remove(false);
                    }

                    return;
                }

                // =================================================
                // Lượng HP hồi
                // =================================================
                const healAmount = effect.count * 10;

                // Chỉ heal nếu đang thiếu HP
                if (target.hp < target.maxHp) {

                    const oldHp = target.hp;

                    target.heal(healAmount);

                    const actualHeal = target.hp - oldHp;

                    if (actualHeal > 0) {
                        target.view.refresh();

                        this.showFloatingHealText(
                            battle,
                            target,
                            actualHeal
                        );
                    }
                }

                remainingTicks -= 1;

                // =================================================
                // Hết 12 giây
                // =================================================
                if (remainingTicks <= 0) {

                    if (effect.icon) {
                        effect.icon.destroy();
                    }

                    if (effect.text) {
                        effect.text.destroy();
                    }

                    this.activeStacks.delete(target);
                }
            },
        });

        this.activeStacks.set(target, effect);

        // =========================================================
        // 7. Bắt đầu cooldown skill
        // =========================================================
        this.startCooldown(currentTime);
    }
}