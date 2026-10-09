import SlimeSkill from "./SlimeSkill.js";
import WolfSkill from "./WolfSkill.js";
import OrcSkill from "./OrcSkill.js";
import BaseSkill from "./BaseSkill.js";
import WoodMonsterSkill from "./Wood_monster_first_skill.js";
import FibberMonsterSkill from "./Fibber_monster_first_skill.js";
import OreMonsterSkill from "./Ore_monter_first_skill.js"; // Import skill cho Ore Monster


// 1. Cấu hình mặc định cho các skill dùng chung BaseSkill
const GENERIC_PROJECTILE_CONFIGS = {
    //!------------Thief------------
    Thief_sword_first_skill: {
        name: "Thief Sword Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Thief_bow_first_skill: {
        name: "Thief Bow Shot",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Thief_dagger_first_skill: {
        name: "Thief Dagger Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Thief_mage_first_skill: {
        name: "Thief Mage Strike",
        damageType: "magic",
        damageMultiplier: 1.5,
        projectileKey: "Base_first_skill",
    },
    Thief_miner_first_skill: {
        name: "Thief Miner Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },

    //*!------------Skeleton------------
    Skeleton_sword_first_skill: {
        name: "Skeleton Sword Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Skeleton_bow_first_skill: {
        name: "Skeleton Bow Shot",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Skeleton_dagger_first_skill: {
        name: "Skeleton Dagger Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },
    Skeleton_mage_first_skill: {
        name: "Skeleton Mage Strike",
        damageType: "magic",
        damageMultiplier: 1,
        projectileKey: "Base_first_skill",
    },
    Skeleton_warlock_first_skill: {
        name: "Skeleton Warlock Strike",
        damageType: "magic",
        damageMultiplier: 1.2,
        projectileKey: "Base_first_skill",
    },
    Skeleton_knight_first_skill: {
        name: "Skeleton Knight Strike",
        damageType: "physical",
        damageMultiplier: 1.0,
        projectileKey: "Base_first_skill",
    },

};

// 2. Các skill có class xử lý logic đặc thù riêng biệt
const SPECIAL_SKILL_CLASSES = {
    Slime_first_skill: SlimeSkill,
    Wolf_first_skill: WolfSkill,
    Orc_first_skill: OrcSkill,
    Wood_monster_first_skill: WoodMonsterSkill,
    Fibber_monster_first_skill: FibberMonsterSkill, 
    Ore_monster_first_skill: OreMonsterSkill, // Thêm skill cho Ore Monster
};

export function createMonsterSkill(skillData) {
    if (!skillData || !skillData.id) {
        return null;
    }

    // Trường hợp 1: Skill nằm trong danh mục Projectile chung
    if (GENERIC_PROJECTILE_CONFIGS[skillData.id]) {
        const mergedConfig = {
            ...GENERIC_PROJECTILE_CONFIGS[skillData.id],
            ...skillData, // Cho phép dữ liệu truyền vào ghi đè cooldown, damageMultiplier nếu cần
        };
        return new BaseSkill(mergedConfig);
    }

    // Trường hợp 2: Skill có class riêng biệt
    const SpecialClass = SPECIAL_SKILL_CLASSES[skillData.id];
    if (SpecialClass) {
        return new SpecialClass(skillData);
    }

    console.warn(`Monster skill not found: ${skillData.id}`);
    return null;
}