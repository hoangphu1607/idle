export default class DataManager {

    constructor(scene) {

        this.scene = scene;

        this.monsters = [];
        this.heroes = [];
        this.items = [];
        this.stages = [];

    }

    init() {

        this.monsters = this.scene.cache.json.get("monsters") || [];
        this.heroes = this.scene.cache.json.get("heroes") || [];
        this.items = this.scene.cache.json.get("items") || [];
        this.stages = this.scene.cache.json.get("stages") || [];

    }
    getMonster(id) {

        return this.monsters.find(x => x.id === id);

    }

    getHero(id) {

        return this.heroes.find(x => x.id === id);

    }

    getItem(id) {

        return this.items.find(x => x.id === id);

    }

    getStage(id) {

        return this.stages.find(x => x.id === id);

    }

}