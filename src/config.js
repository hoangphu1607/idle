import Phaser from "phaser";
import BootScene from "./scenes/BootScene";

const config = {
    type: Phaser.AUTO,

    width: 720,
    height: 1280,

    backgroundColor: "#1e1e1e",

    parent: "game",

    scene: [
        BootScene
    ]
};

export default config;