import Unit from "./Unit";
import { createSkill } from "./Hero_Skills/SkillFactory";
export default class Hero extends Unit {
    constructor(scene, data) {
        super(scene, data);

        this.role = data.role;
        this.rarity = data.rarity;
        this.exp = data.exp || 0;
        this.team = "player";

        this.skills = data.skills
            .map((skillData) => createSkill(skillData))
            .filter((skill) => skill !== null);
    }

    Active_Skill_First(battle) {
        const skill = this.skills[0];

        if (!skill) {
            return;
        }

        skill.execute(this, battle);
    }
}
