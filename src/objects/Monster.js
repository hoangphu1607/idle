import Unit from "./Unit.js";
import { createMonsterSkill } from "./Monsters_Skills/SkillFactory.js";
import monsterTiers from "../assets/data/monsterTiers.js";
import { MONSTER_DROPS } from "../assets/data/monsterDrops.js";

export default class Monster extends Unit {

    constructor(scene, data) {

        // ==========================================
        // TIER
        // ==========================================

        const requestedTier = Number(data.tier) || 1;

        const tier = monsterTiers[requestedTier]
            ? requestedTier
            : 1;

        const tierMultiplier = monsterTiers[tier];


        // ==========================================
        // BASE STATS
        // ==========================================

        const statKeys = [
            "hp",
            "mp",
            "armor",
            "magic_resistance",
            "attack_physical",
            "attack_magic",
        ];

        const baseStats = Object.fromEntries(
            statKeys.map((stat) => [
                stat,
                data[stat] ?? 0
            ])
        );


        // ==========================================
        // FINAL STATS
        // ==========================================

        const finalStats = Object.fromEntries(
            statKeys.map((stat) => [
                stat,
                baseStats[stat] * (tierMultiplier[stat] ?? 1)
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

        this.tierMultiplier = tierMultiplier;

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

        this.dropItems =
            MONSTER_DROPS[this.id] || [];


        // ==========================================
        // REWARDS
        // ==========================================

        this.experienceReward =
            data.experience ?? 0;

        this.goldReward =
            data.gold ?? 0;


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