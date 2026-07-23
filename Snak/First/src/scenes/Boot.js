export class Boot extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    create() {
        console.log("Boot Scene");

        this.add.text(100, 100, "Boot Scene", {
            fontSize: "32px",
            color: "#ffffff"
        });

        // Tạm thời đừng chuyển scene
        // this.scene.start("Preloader");
    }
}