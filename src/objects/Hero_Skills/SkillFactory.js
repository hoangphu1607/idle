import MaceSkill from "./MaceSkill.js";
import MaceSecondSkill from "./MaceSecondSkill.js";
import MageSkill from "./MageSkill.js";
import MageSecondSkill from "./MageSecondSkill.js";
import NatureSkill from "./NatureSkill.js";
import NatureSecondSkill from "./NatureSecondSkill.js";

const SKILL_CLASSES = {
    mace_skill_first: MaceSkill,
    mace_skill_second: MaceSecondSkill,
    mage_skill_first: MageSkill,
    mage_skill_second: MageSecondSkill,
    nature_skill_first: NatureSkill,
    nature_skill_second: NatureSecondSkill,
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