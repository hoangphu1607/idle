import Phaser from "phaser";
import MenuUI from "./MenuUI";
import HeroScreen from "../scenes/HeroScreen";
import MenuScene from "../scenes/MenuScene";
export default class BottomNavigation {

    constructor(scene) {
        this.scene = scene;
        this.buttons = [];
        this.create();
    }

    create() {

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        const menu = [
            { id: "headquarters", text: "Headquarters" },
            { id: "hero", text: "Hero" },
            { id: "gate", text: "Gate" },
            { id: "battle", text: "Battle" }
        ];

        const spacing = width / menu.length;

        menu.forEach((item, index) => {

            const x = spacing * index + spacing / 2;
            const y = height - 70;

            const icon = this.scene.add.image(x, y - 20, "home");
            icon.setScale(0.2);

            const text = this.scene.add.text(
                x,
                y + 15,
                item.text,
                {
                    fontSize: "18px",
                    color: "#ffffff"
                }
            ).setOrigin(0.5);
            text.setVisible(false);
            const container = this.scene.add.container(x, y);

            container.add([
                icon.setPosition(0, -20),
                text.setPosition(0, 25)
            ]);

            icon.setInteractive();

            icon.on("pointerup", () => {
                this.select(item.id);
                this.handleButtonClick(item);
            });

            this.buttons.push({ id: item.id, icon, text });

        });

        this.select("headquarters");
    }

    select(id) {

        this.buttons.forEach(btn => {

            if (btn.id === id) {
                btn.icon.setTint(0xffb347);
                btn.text.setColor("#ffb347");
                btn.text.setVisible(true);
            }
            else {
                btn.icon.clearTint();
                btn.text.setColor("#ffffff");
                btn.text.setVisible(false);
            }

        });

        console.log("Current:", id);

    }
    handleButtonClick(item) {
        this.select(item.id);

        switch (item.id) {
            case "headquarters":
                this.scene.scene.start("MenuScene");
                break;
            case "hero":
                console.log(this.scene);
                console.log(this.scene.heroScreen);

                // Thêm kiểm tra if để đảm bảo heroScreen tồn tại và có hàm show()
                if (this.scene.heroScreen && typeof this.scene.heroScreen.show === "function") {
                    this.scene.menuContainer?.setVisible(false);
                    this.scene.heroScreen.show();
                } else {
                    console.warn("heroScreen chưa được khởi tạo hoặc không có hàm show()!");
                }
                break;
            case "gate":
                console.log("Mở Gate");
                break;
            case "battle":
                console.log("Mở Battle");
                break;
        }
    }

}