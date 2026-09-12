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

    static loadHeroes(defaultHeroes = []) {

        const saveData = this.load();
        const savedHeroes = saveData.heroes || {};

        const heroes = defaultHeroes.map((hero) => {
            const savedHero = savedHeroes[String(hero.id)] || {};
            const experience = savedHero.experience ?? hero.experience ?? 0;

            return {
                ...hero,
                ...savedHero,
                experience
            };
        });

        if (Object.keys(savedHeroes).length === 0 && heroes.length > 0) {
            saveData.heroes = Object.fromEntries(
                heroes.map((hero) => [String(hero.id), hero])
            );
            this.save(saveData);
        }

        return heroes;
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
}