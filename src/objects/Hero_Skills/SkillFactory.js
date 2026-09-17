import MaceSkill from "./MaceSkill";
import MageSkill from "./MageSkill";
import NatureSkill from "./NatureSkill";

const SKILL_CLASSES = {
    mace_skill_first: MaceSkill,
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