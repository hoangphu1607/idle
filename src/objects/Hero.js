import Unit from "./Unit";

export default class Hero extends Unit {

    constructor(scene, data) {

        super(scene, data);

        this.role = data.role;
        this.rarity = data.rarity;
        this.exp = data.exp || 0;
        this.team = "player";

    }

}