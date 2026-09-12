import Unit from "./Unit";
import SlimeSkill from "./Monsters_Skills/SlimeSkill";

export default class Monster extends Unit {

    constructor(scene, data) {

        super(scene, data);

        this.dropItems = data.dropItems || [];
        this.experienceReward = data.experience ?? 0;
        this.goldReward = data.gold ?? 0;
        this.team = "enemy";
        this.skills = (data.skills || [])
            .map((skillData) => {
                if (skillData.id === "Slime_first_skill") {
                    return new SlimeSkill(skillData);
                }

                console.warn(`Skill not found: ${skillData.id}`);
                return null;
            })
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