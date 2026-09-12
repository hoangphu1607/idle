import BaseScene from "./base/BaseScene";

export default class InventoryScene extends BaseScene {

    constructor() {
        super("InventoryScene");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.createBackground();

        this.add.text(width / 2, 70, "Inventory", {
            fontSize: "42px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const columns = 9;
        const rows = 9;
        const gap = 6;
        const gridWidth = width - 48;
        const cellSize = (gridWidth - gap * (columns - 1)) / columns;
        const gridHeight = cellSize * rows + gap * (rows - 1);
        const startX = (width - gridWidth) / 2 + cellSize / 2;
        const startY = 140 + cellSize / 2;

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const x = startX + column * (cellSize + gap);
                const y = startY + row * (cellSize + gap);
                const slotNumber = row * columns + column + 1;

                this.add.rectangle(x, y, cellSize, cellSize, 0x24344a)
                    .setStrokeStyle(2, 0x8aa4bf, 0.9);

                this.add.text(x, y, String(slotNumber), {
                    fontSize: "18px",
                    color: "#8aa4bf"
                }).setOrigin(0.5);
            }
        }

        this.add.text(width / 2, startY + gridHeight + 35, "0 / 81 slots", {
            fontSize: "20px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.createBottomNavigation("Inventory");
    }
}