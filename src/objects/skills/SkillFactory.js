import MaceSkill from "./MaceSkill";
// import HunterSkill from "./HunterSkill";
// import MageSkill from "./MageSkill";

const SKILL_CLASSES = {
    mace_skill_first: MaceSkill,
    // hunter_skill_first: HunterSkill,
    // mage_skill_first: MageSkill,
};

export function createSkill(skillData) {

    const SkillClass = SKILL_CLASSES[skillData.id];

    if (!SkillClass) {
        console.warn(`Skill not found: ${skillData.id}`);
        return null;
    }

    return new SkillClass(skillData);
}