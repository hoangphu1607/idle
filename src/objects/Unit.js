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

        this.maxHp = data.maxHp || 1200;
        this.hp = data.hp ?? this.maxHp;

        this.maxMp = data.maxMp || 200;
        this.mp = data.mp || this.maxMp;

        this.attack_physical = data.attack_physical || 0;
        this.attack_magic = data.attack_magic || 0;

        this.auto_attack = data.auto_attack || 1;

        this.defense = data.defense || 0;
        this.speed = data.speed || 100;

        // Vị trí
        this.row = null;
        this.col = null;

        // Sprite
        this.sprite = null;
        this.dead = false;
    }

    setPosition(row, col) {

        this.row = row;
        this.col = col;

    }

    takeDamage(value) {

        if (this.dead) {
            return;
        }


        this.hp -= value;

        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }


        if (this.view) {
            this.view.refresh();
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

}