import MaceSkill from "./MaceSkill";
import MageSkill from "./MageSkill";

const SKILL_CLASSES = {
    mace_skill_first: MaceSkill,
    mage_skill_first: MageSkill,
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