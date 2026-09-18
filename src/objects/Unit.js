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
    }

    setPosition(row, col) {

        this.row = row;
        this.col = col;

    }

    takeDamage(value, attacker = null) {

        if (this.dead) {
            return;
        }

        this.hp -= value;

        /*
         * Monster chỉ bị kích hoạt khi bị Hero/Player tấn công
         */
        if (
            this.team === "enemy" &&
            attacker &&
            attacker.team === "player"
        ) {
            this.isAggro = true;
            this.addThreat(attacker, value * attacker.threat);
            this.scene.alertNearbyMonsters?.(this, attacker, value);
            this.scene.recordDamage?.(attacker, value);

            //console.log(`${this.name} is now AGGRO!`);
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
}