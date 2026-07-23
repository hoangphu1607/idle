import Phaser from "phaser";

import { GAME, COLORS } from "./Constants";

import BootScene from "../scenes/BootScene";
import PreloadScene from "../scenes/PreloadScene";

const config = {

    type: Phaser.AUTO,

    parent: "game",

    width: GAME.WIDTH,
    height: GAME.HEIGHT,

    backgroundColor: COLORS.BACKGROUND,

    scene: [
        BootScene,
        PreloadScene
    ],

    scale: {

        mode: Phaser.Scale.FIT,

        autoCenter: Phaser.Scale.CENTER_BOTH

    },

    physics: {

        default: "arcade",

        arcade: {

            debug: false

        }

    }

};

export default config;