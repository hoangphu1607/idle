import SlimeSkill from "./SlimeSkill.js";
import WolfSkill from "./WolfSkill.js";
import OrcSkill from "./OrcSkill.js";

const SKILL_CLASSES = {
    Slime_first_skill: SlimeSkill,
    Wolf_first_skill: WolfSkill,
    Orc_first_skill: OrcSkill,
};

export function createMonsterSkill(skillData) {
    const SkillClass = SKILL_CLASSES[skillData.id];

    if (!SkillClass) {
        console.warn(`Monster skill not found: ${skillData.id}`);
        return null;
    }

    return new SkillClass(skillData);
}
