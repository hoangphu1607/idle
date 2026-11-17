import Unit from "./Unit.js";
import { createMonsterSkill } from "./Monsters_Skills/SkillFactory.js";
import monsterTierBaseStats from "../assets/data/monsterTiers.js";
import { MONSTER_ROLES } from "../assets/data/monsterRoles.js";
import { getMonsterDropPool } from "../assets/data/monsterDrops.js";

export default class Monster extends Unit {

    constructor(scene, data) {

        // ==========================================
        // TIER
        // ==========================================

        const requestedTier = Number(data.tier) || 1;

        const tier = monsterTierBaseStats[requestedTier]
            ? requestedTier
            : 1;

        const tierBaseStats = monsterTierBaseStats[tier];
        const roleMultiplier = MONSTER_ROLES[data.role];

        if (!roleMultiplier) {
            throw new Error(`Unknown monster role "${data.role}" for "${data.id}"`);
        }

        const statKeys = [
            "hp",
            "mp",
            "armor",
            "magic_resistance",
            "attack_physical",
            "attack_magic",
        ];

        const overrides = data.overrides || {};
        const baseStats = { ...tierBaseStats };

        const finalStats = Object.fromEntries(
            statKeys.map((stat) => [
                stat,
                overrides[stat] ?? baseStats[stat] * roleMultiplier[stat]
            ])
        );


        // ==========================================
        // UNIT
        // ==========================================

        super(scene, {
            ...data,
            ...finalStats
        });


        // ==========================================
        // TIER DATA
        // ==========================================

        this.tier = tier;

        this.baseStats = baseStats;

        this.roleMultiplier = roleMultiplier;

        this.finalStats = finalStats;


        // ==========================================
        // DEFENSE
        // ==========================================

        this.armor = finalStats.armor;

        this.magic_resistance =
            finalStats.magic_resistance;


        // ==========================================
        // DROP ITEMS
        // ==========================================

        this.dropItems = getMonsterDropPool(
            this.id,
            scene.difficulty,
            this.type === "mob_gather" ? this.tier : null
        );


        // ==========================================
        // REWARDS
        // ==========================================

        this.experienceReward =
            overrides.experience ?? tierBaseStats.experience ?? 0;

        this.goldReward =
            overrides.gold ?? tierBaseStats.gold ?? 0;


        // ==========================================
        // TEAM
        // ==========================================

        this.team = "enemy";


        // ==========================================
        // SKILLS
        // ==========================================

        this.skills = (data.skills || [])
            .map((skillData) =>
                createMonsterSkill(skillData)
            )
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