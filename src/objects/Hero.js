import Unit from "./Unit.js";
import { createSkill } from "./Hero_Skills/SkillFactory.js";
export default class Hero extends Unit {
    constructor(scene, data) {
        super(scene, data);

        this.role = data.role;
        this.rarity = data.rarity;
        this.experience = data.experience || 0;
        this.team = "player";

        this.skills = data.skills
            .map((skillData) => createSkill(skillData))
            .filter((skill) => skill !== null);
    }

    Active_Skill_First(battle) {
        const firstSkill = this.skills[0];

        if (firstSkill) {
            firstSkill.execute(this, battle);
        }
    }
}
