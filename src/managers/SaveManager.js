import items from "../assets/data/item.js";
import { HERO_SKILL_INFO, CLASS_LABELS, HERO_PASSIVE_INFO } from "../assets/data/heroSkills.js";

export default class SaveManager {

    static STORAGE_KEY = "idle_game_save";

    static VERSION = 1;

    /**
     * Tạo dữ liệu save mặc định cho người chơi mới
     */
    static createDefaultSave() {

        return {
            version: this.VERSION,

            player: {
                gold: 0,
                diamond: 0
            },

            progress: {
                stage: 1,
                wave: 1
            },

            heroes: {},

            inventory: [],

            settings: {
                music: true,
                sound: true
            },

            lastSaveTime: Date.now()
        };
    }

    /**
     * Lưu toàn bộ dữ liệu game
     */
    static save(data) {

        try {

            const saveData = {
                ...data,
                version: this.VERSION,
                lastSaveTime: Date.now()
            };

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(saveData)
            );

            return true;

        } catch (error) {

            console.error(
                "SaveManager: Cannot save game",
                error
            );

            return false;
        }
    }

    /**
     * Load dữ liệu game
     *
     * Nếu chưa có save:
     * → tạo dữ liệu mới
     */
    static load() {

        try {

            const rawData = localStorage.getItem(
                this.STORAGE_KEY
            );

            if (!rawData) {

                const newSave = this.createDefaultSave();

                this.save(newSave);

                return newSave;
            }

            const saveData = JSON.parse(rawData);

            return this.migrate(saveData);

        } catch (error) {

            console.error(
                "SaveManager: Cannot load save data",
                error
            );

            const newSave = this.createDefaultSave();

            this.save(newSave);

            return newSave;
        }
    }

    // SaveManager.js
    static loadHeroes(defaultHeroes = []) {
        const saveData = this.load();
        const savedHeroes = saveData.heroes || {};

        return defaultHeroes.map((hero) => {
            const savedHero = savedHeroes[String(hero.id)] || {};

            return {
                ...hero, // skills, stats, role... luôn lấy từ heroes.js
                level: savedHero.level ?? hero.level ?? 1,
                experience: savedHero.experience ?? hero.experience ?? 0,
                equipment: savedHero.equipment ?? {},
                passives: savedHero.passives ?? {},
            };
        });
    }

    /**
     * Kiểm tra người chơi đã có save hay chưa
     */
    static hasSave() {

        return localStorage.getItem(
            this.STORAGE_KEY
        ) !== null;
    }

    /**
     * Xóa toàn bộ dữ liệu save
     */
    static clear() {

        localStorage.removeItem(
            this.STORAGE_KEY
        );
    }

    /**
     * Cập nhật một phần dữ liệu save
     *
     * Ví dụ:
     * SaveManager.update({
     *     player: {
     *         gold: 1000
     *     }
     * });
     */
    static update(data) {

        const currentSave = this.load();

        const newSave = {
            ...currentSave,
            ...data,
            lastSaveTime: Date.now()
        };

        return this.save(newSave);
    }

    /**
     * Cập nhật một giá trị sâu bên trong save
     *
     * Ví dụ:
     *
     * SaveManager.set("player.gold", 1000);
     *
     * SaveManager.set(
     *     "heroes.mace.level",
     *     10
     * );
     */
    static set(path, value) {

        const saveData = this.load();

        const keys = path.split(".");

        let current = saveData;

        for (let i = 0; i < keys.length - 1; i++) {

            const key = keys[i];

            if (
                current[key] === undefined ||
                current[key] === null
            ) {
                current[key] = {};
            }

            current = current[key];
        }

        current[keys[keys.length - 1]] = value;

        return this.save(saveData);
    }

    /**
     * Lấy một giá trị trong save
     *
     * Ví dụ:
     *
     * SaveManager.get("player.gold");
     *
     * SaveManager.get("heroes.mace.level");
     */
    static get(path, defaultValue = null) {

        const saveData = this.load();

        const keys = path.split(".");

        let current = saveData;

        for (const key of keys) {

            if (
                current === undefined ||
                current === null ||
                current[key] === undefined
            ) {
                return defaultValue;
            }

            current = current[key];
        }

        return current;
    }

    /**
     * Migration dữ liệu save
     *
     * Dùng khi thay đổi cấu trúc save trong tương lai.
     */
    static migrate(saveData) {

        if (!saveData.version) {
            saveData.version = 1;
        }

        // Sau này:
        //
        // if (saveData.version === 1) {
        //     saveData = this.migrateV1ToV2(saveData);
        // }
        //
        // if (saveData.version === 2) {
        //     saveData = this.migrateV2ToV3(saveData);
        // }

        saveData.version = this.VERSION;

        return saveData;
    }

    static getHeroEquipment(heroId) {
        const savedHero = this.loadHero(heroId) || {};
        return savedHero.equipment || {};
    }

    static getEffectiveHero(hero) {
        if (!hero) {
            return hero;
        }

        const equipment = this.getHeroEquipment(hero.id);
        const savedHero = this.loadHero(hero.id) || {};
        const passives = savedHero.passives || {};
        const bonusStats = {
            attack_physical: 0,
            attack_magic: 0,
            armor: 0,
            defense: 0,
            magic_resistance: 0,
            hp: 0,
            mp: 0,
            speed: 0,
            threat: 0
        };

        Object.values(equipment).forEach((entry) => {
            const itemId = typeof entry === "string"
                ? entry
                : entry?.itemId;

            if (!itemId) {
                return;
            }

            const itemData = items.find((item) => item.id === itemId);

            if (!itemData || !itemData.stats) {
                return;
            }

            Object.entries(itemData.stats).forEach(([key, value]) => {
                if (bonusStats[key] !== undefined) {
                    bonusStats[key] += Number(value) || 0;
                }
            });
        });

        Object.entries(passives).forEach(([passiveId, levelValue]) => {
            const passiveLevel = Number(levelValue) || 0;
            if (passiveLevel <= 0) {
                return;
            }

            const passiveInfo = HERO_PASSIVE_INFO[passiveId] || {};
            const effect = passiveInfo.effect || {};
            const baseArmor = Number(hero.armor ?? hero.defense ?? 0);
            const baseDefense = Number(hero.defense ?? hero.armor ?? 0);
            const baseMagicResistance = Number(hero.magic_resistance ?? 0);
            const baseAttackMagic = Number(hero.attack_magic ?? 0);
            const baseHp = Number(hero.hp ?? 0);

            switch (passiveId) {
                case "mace_passive": {
                    // Defense Mastery tăng toàn bộ chỉ số phòng thủ hiện có, gồm cả
                    // chỉ số gốc và chỉ số cộng từ trang bị.
                    const armorBoost = (baseArmor + bonusStats.armor) * passiveLevel * (effect.increaseArmor ?? 0.01);
                    const defenseBoost = (baseDefense + bonusStats.defense) * passiveLevel * (effect.increaseArmor ?? 0.01);
                    const magicResBoost = (baseMagicResistance + bonusStats.magic_resistance) * passiveLevel * (effect.increaseMagicResistance ?? 0.01);
                    bonusStats.armor += armorBoost;
                    bonusStats.defense += defenseBoost;
                    bonusStats.magic_resistance += magicResBoost;
                    break;
                }
                case "mage_passive": {
                    const attackMagicBoost = baseAttackMagic * passiveLevel * (effect.increaseAttackMagic ?? 0.01);
                    bonusStats.attack_magic += attackMagicBoost;
                    break;
                }
                case "nature_passive": {
                    const hpBoost = baseHp * passiveLevel * (effect.increaseHp ?? 0.01);
                    bonusStats.hp += hpBoost;
                    break;
                }
                default:
                    break;
            }
        });

        const baseArmor = Number(hero.armor ?? hero.defense ?? 0);
        const baseDefense = Number(hero.defense ?? hero.armor ?? 0);

        return {
            ...hero,
            attack_physical: Number(hero.attack_physical || 0) + bonusStats.attack_physical,
            attack_magic: Number(hero.attack_magic || 0) + bonusStats.attack_magic,
            armor: baseArmor + bonusStats.armor,
            defense: baseDefense + bonusStats.defense,
            magic_resistance: Number(hero.magic_resistance || 0) + bonusStats.magic_resistance,
            hp: Number(hero.hp || 0) + bonusStats.hp,
            maxHp: Number(hero.maxHp ?? hero.hp ?? 0) + bonusStats.hp,
            mp: Number(hero.mp || 0) + bonusStats.mp,
            maxMp: Number(hero.maxMp ?? hero.mp ?? 0) + bonusStats.mp,
            speed: Number(hero.speed || 100) + bonusStats.speed,
            threat: Number(hero.threat || 1) + bonusStats.threat,
        };
    }

    static loadHero(heroId) {

        const saveData = this.load();

        return saveData.heroes[String(heroId)] || null;

    }
}
