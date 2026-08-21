import Unit from "./Unit";

export default class Monster extends Unit {

    constructor(scene, data) {

        super(scene, data);

        this.dropItems = data.dropItems || [];
        this.expReward = data.expReward || 0;
        this.team = "enemy";
        this.skills = [];

    }
    Active_Skill_First(battle) {

        const skill = this.skills[0];

        if (!skill) {
            return;
        }

        skill.execute(this, battle);

    }
}