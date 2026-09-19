import Phaser from "phaser";

export default class Unit {

    constructor(scene, data) {

        this.scene = scene;

        // Thông tin cơ bản
        this.id = data.id;
        this.name = data.name;
        this.avatar = data.avatar;

        // Chỉ số
        this.level = data.level || 1;

        this.hp = data.hp ?? 1200;
        this.maxHp = data.maxHp || data.hp;

        this.mp = data.mp || 200;
        this.maxMp = data.maxMp || data.mp;

        this.attack_physical = data.attack_physical || 0;
        this.attack_magic = data.attack_magic || 0;
        this.armor = data.armor ?? data.defense ?? 0;
        this.magic_resistance = data.magic_resistance ?? 0;
        this.threat = data.threat ?? 1;

        this.auto_attack = data.auto_attack || 1;

        this.defense = data.defense || 0;
        this.speed = data.speed || 100;

        // Vị trí
        this.row = null;
        this.col = null;
        this.currentTarget = null;

        // Sprite
        this.sprite = null;
        this.dead = false;

        // Trạng thái bị kích động
        this.isAggro = false;
        this.threatTable = new Map();

        // Trạng thái làm choáng
        this.isStunned = false;
        this.stunUntil = 0;
        this.stunTimer = null;
    }

    setPosition(row, col) {

        this.row = row;
        this.col = col;

    }

    takeDamage(value, attacker = null, damageType = "physical", options = {}) {
        if (this.dead) {
            return null;
        }

        const rawDamage = Math.max(0, Number(value) || 0);
        const multiplier = Number(options.multiplier) || 1;
        const modifiedDamage = rawDamage * multiplier;
        const mitigation = damageType === "magic"
            ? this.magic_resistance
            : this.armor;
        const finalDamage = Math.max(1, modifiedDamage - mitigation);
        const damageResult = {
            rawDamage,
            multiplier,
            modifiedDamage,
            mitigation,
            finalDamage,
            damageType,
        };

        this.hp -= finalDamage;
        this.showDamageNumber(finalDamage, damageType);
        /*
         * Monster chỉ bị kích hoạt khi bị Hero/Player tấn công
         */
        if (
            this.team === "enemy" &&
            attacker &&
            attacker.team === "player"
        ) {
            const wasPassive = !this.isAggro;
            this.isAggro = true;
            this.addThreat(attacker, finalDamage * attacker.threat);

            // Nếu đây là lần đầu tiên bị đánh, phản đòn ngay lập tức
            if (wasPassive && typeof this.scene.attack === "function") {
                this.scene.attack(this);
            }

            this.scene.alertNearbyMonsters?.(this, attacker, finalDamage);
            this.scene.recordDamage?.(attacker, finalDamage);
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;

            if (typeof this.scene.onUnitDefeated === "function") {
                this.scene.onUnitDefeated(this, attacker);
            }
        }

        if (this.view) {
            this.view.refresh();
        }

        return damageResult;
    }

    addThreat(attacker, value) {
        const currentThreat = this.threatTable.get(attacker) || 0;
        this.threatTable.set(attacker, currentThreat + value);

        const currentTargetThreat = this.currentTarget
            ? this.threatTable.get(this.currentTarget) || 0
            : 0;

        if (!this.currentTarget || value + currentThreat > currentTargetThreat) {
            this.currentTarget = attacker;
        }
    }

    applyStun(durationMs = 5000) {
        if (this.dead) {
            return;
        }

        const now = this.scene?.time?.now ?? Date.now();
        this.isStunned = true;
        this.stunUntil = now + durationMs;

        if (this.stunTimer) {
            this.stunTimer.remove(false);
        }

        this.stunTimer = this.scene?.time?.delayedCall(durationMs, () => {
            this.isStunned = false;
            this.stunUntil = 0;
            this.stunTimer = null;
        });
    }

    heal(value) {

        this.hp += value;

        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }

    }

    isDead() {

        return this.hp <= 0;

    }

    isAlive() {

        return !this.dead;

    }

    Active_Skill_First(battle) {

        console.warn(
            `${this.name} has no Active_Skill_First()`
        );

    }
    showDamageNumber(damage, damageType = "physical") {
        if (!this.view || !this.view.container) {
            return;
        }

        const color =
            damageType === "magic"
                ? "#4da6ff"   // Xanh dương
                : "#ff4444";  // Đỏ

        // Container của Unit nằm trong BattleGrid nên cần đổi sang tọa độ world.
        const gridContainer = this.ownerGrid?.container;
        const x = (gridContainer?.x || 0) + this.view.container.x;
        const y = (gridContainer?.y || 0) + this.view.container.y;

        const damageText = this.scene.add.text(
            x,
            y,
            `-${Math.round(damage)}`,
            {
                fontSize: "22px",
                fontStyle: "bold",
                color: color,
                stroke: "#000000",
                strokeThickness: 4,
            }
        );

        // Đặt tâm text đúng vào vị trí nhân vật
        damageText.setOrigin(0.5);

        damageText.setDepth(100);

        this.scene.tweens.add({
            targets: damageText,

            // Bay nhẹ lên trên sau khi xuất hiện
            y: y - 35,

            alpha: 0,

            duration: 700,

            ease: "Cubic.easeOut",

            onComplete: () => {
                damageText.destroy();
            }
        });
    }
}