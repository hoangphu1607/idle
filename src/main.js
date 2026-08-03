import Phaser from "phaser";

import BootScene from "./scenes/Boot.js";
import PreloaderScene from "./scenes/Preloader.js";
import GameScene from "./scenes/Game.js";
import MenuScene from "./scenes/MenuScene";
import MapScene from "./scenes/MapScene";
import ContentScene from "./scenes/ContentScene";
import BattleScene from "./scenes/BattleScene";
const config = {
    type: Phaser.AUTO,

    width: 720,
    height: 1280,

    parent: "game",

    //backgroundColor: "#3a2daf",
    //backgroundImage: "url(./assets/bg.png)",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
        BootScene,
        PreloaderScene,
        GameScene,
        MenuScene,
        MapScene,
        ContentScene,
         BattleScene,
    ]
};

new Phaser.Game(config);