import Phaser from "phaser";
import BootScene from "./scenes/BootScene";

const config = {
    type: Phaser.AUTO,

    width: 720,
    height: 1280,

    backgroundColor: "#1e1e1e",
    scale: {
            mode: Phaser.Scale.FIT, // Co giãn vừa màn hình nhưng giữ nguyên tỷ lệ 720x1280
            autoCenter: Phaser.Scale.CENTER_BOTH, // Tự động căn giữa màn hình
        },
    parent: "game",

    scene: [
        BootScene
    ]
};

export default config;