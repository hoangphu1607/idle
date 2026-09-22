export const CLASS_LABELS = {
    tank: "Tank",
    dps: "DPS",
    healer: "Healer",
};

export const HERO_SKILL_INFO = {
    mace_skill_first: {
        name: "Mace Smash",
        icon: "Mace_first_skill",
        description: "Đánh mục tiêu gần nhất, gây sát thương vật lý bằng chỉ số Physic Dame.",
    },
    mace_skill_second: {
        name: "Mace Shockwave",
        icon: "Mace_second_skill",
        description: "Sóng xung kích gây 180% sát thương vật lý lên mục tiêu và các ô xung quanh (3x3), làm kẻ địch choáng 5 giây.",
    },
    mage_skill_first: {
        name: "Mage Fireball",
        icon: "Mage_first_skill",
        description: "Bắn cầu lửa vào mục tiêu, gây sát thương phép bằng chỉ số Mage Dame.",
    },
    nature_skill_first: {
        name: "Nature Heal",
        icon: "Nature_first_skill",
        description: "Hồi máu đồng minh đang thiếu HP nhất trong 4 giây. Mỗi giây hồi 10 HP x số stack (tối đa 3 stack).",
    },
};

export const HERO_PASSIVE_INFO = {
    mace_passive: {
        name: "Defense Mastery",
        icon: "Defense_mastery",
        description: "Tăng 1% giáp và kháng phép mỗi level, tối đa 10%.",
        effect: {
            increaseArmor: 0.01, // Tăng 1% giáp mỗi level
            increaseMagicResistance: 0.01, // Tăng 1% kháng phép mỗi level
        }
    },
    mage_passive: {
        name: "Magic Mastery",
        icon: "Magic_mastery",
        description: "Tăng 1% sát thương phép mỗi level, tối đa 10%.",
        effect: {
            increaseAttackMagic: 0.01, // Tăng 1% sát thương phép mỗi level
        }
    },
    nature_passive: {
        name: "Healing Mastery",
        icon: "Healing_mastery",
        description: "Tăng 1% hồi máu mỗi level, tối đa 10%.",
        effect: {
            increaseHp: 0.01, // Tăng 1% hồi máu mỗi level
        }
    },
};