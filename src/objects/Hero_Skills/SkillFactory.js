import MaceSkill from "./MaceSkill.js";
import MaceSecondSkill from "./MaceSecondSkill.js";
import MageSkill from "./MageSkill.js";
import NatureSkill from "./NatureSkill.js";

const SKILL_CLASSES = {
    mace_skill_first: MaceSkill,
    mace_skill_second: MaceSecondSkill,
    mage_skill_first: MageSkill,
    nature_skill_first: NatureSkill,
    fireball: MageSkill,
};

export function createSkill(skillData) {

    const SkillClass = SKILL_CLASSES[skillData.id];

    if (!SkillClass) {
        console.warn(`Skill not found: ${skillData.id}`);
        return null;
    }

    return new SkillClass(skillData);
}