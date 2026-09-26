import SlimeSkill from "./SlimeSkill.js";
import WolfSkill from "./WolfSkill.js";
import OrcSkill from "./OrcSkill.js";
import ThiefDaggerSkill from "./Thief_dagger_first_skill.js";
import ThiefBowSkill from "./Thief_bow_first_skill.js";

const SKILL_CLASSES = {
    Slime_first_skill: SlimeSkill,
    Wolf_first_skill: WolfSkill,
    Orc_first_skill: OrcSkill,
    Thief_dagger_first_skill: ThiefDaggerSkill,
    Thief_bow_first_skill: ThiefBowSkill,
};

export function createMonsterSkill(skillData) {
    const SkillClass = SKILL_CLASSES[skillData.id];

    if (!SkillClass) {
        console.warn(`Monster skill not found: ${skillData.id}`);
        return null;
    }

    return new SkillClass(skillData);
}
