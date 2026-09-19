import Phaser from "phaser";

export default class MapCard {

    constructor(scene, {
        x = 0,
        y = 0,
        width = 600,
        height = 110,
        icon,
        title,
        subtitle,
        bg,
        difficulty = "normal",
        onDifficultyChange = null,
        onClick = null
    }) {

        this.scene = scene;
        this.onClick = onClick;
        this.onDifficultyChange = onDifficultyChange;

        this.bg = bg;
        this.width = width;
        this.height = height;

        this.difficulties = {
            easy: "Dễ",
            normal: "Thường",
            hard: "Khó",
            hell: "Địa ngục"
        };

        this.currentDifficulty = difficulty;

        this.container = scene.add.container(x, y);

        this.create(width, height, icon, title, subtitle, bg);
    }

    create(width, height, iconKey, title, subtitle, bgKey) {

        // =========================
        // Background
        // =========================
        const texture = this.scene.textures.get(bgKey);
        const source = texture.getSourceImage();

        const scale = Math.max(
            width / source.width,
            height / source.height
        );

        this.background = this.scene.add.tileSprite(
            0,
            0,
            width,
            height,
            bgKey
        )
            .setOrigin(0)
            .setTileScale(scale, scale);


        // =========================
        // Title
        // =========================
        this.title = this.scene.add.text(
            width - 20,
            15,
            title,
            {
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(1, 0);


        // =========================
        // Subtitle
        // =========================
        this.subtitle = this.scene.add.text(
            90,
            50,
            subtitle,
            {
                fontSize: "18px",
                color: "#555555"
            }
        );


        // =========================
        // Difficulty label
        // =========================
        this.difficultyLabel = this.scene.add.text(
            width - 20,
            52,
            "Độ khó:",
            {
                fontSize: "16px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(1, 0);


        // =========================
        // Difficulty Select
        // =========================
        this.createDifficultySelect(width);


        // =========================
        // Add to container
        // =========================
        this.container.add([
            this.background,
            this.title,
            this.subtitle,
            this.difficultyLabel,
            this.difficultySelect
        ]);


        // =========================
        // Click background
        // =========================
        this.background
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {

                this.background.setTint(0xeeeeee);

            })
            .on("pointerout", () => {

                this.background.clearTint();

            })
            .on("pointerup", () => {

                this.onClick?.();

            });
    }


    // ==================================================
    // Tạo dropdown độ khó
    // ==================================================
    createDifficultySelect(width) {

        const selectWidth = 130;
        const selectHeight = 30;

        const x = width - selectWidth - 20;
        const y = 75;


        // Container của select
        this.difficultySelect = this.scene.add.container(
            x,
            y
        );


        // Background
        const background = this.scene.add.rectangle(
            0,
            0,
            selectWidth,
            selectHeight,
            0xffffff
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x999999);


        // Text hiện tại
        this.difficultyText = this.scene.add.text(
            10,
            6,
            this.difficulties[this.currentDifficulty],
            {
                fontSize: "16px",
                color: "#222222"
            }
        );


        // Mũi tên
        this.arrow = this.scene.add.text(
            selectWidth - 20,
            5,
            "▼",
            {
                fontSize: "14px",
                color: "#333333"
            }
        );


        this.difficultySelect.add([
            background,
            this.difficultyText,
            this.arrow
        ]);


        // Click select
        background
            .setInteractive({ useHandCursor: true })
            .on("pointerup", (pointer) => {

                pointer.event.stopPropagation();

                this.toggleDifficultyDropdown();

            });


        // Lưu reference
        this.difficultyBackground = background;
    }


    // ==================================================
    // Dropdown options
    // ==================================================
    toggleDifficultyDropdown() {

        if (this.difficultyDropdown) {
            this.closeDifficultyDropdown();
            return;
        }

        const options = [
            { id: "easy", name: "Dễ" },
            { id: "normal", name: "Thường" },
            { id: "hard", name: "Khó" },
            { id: "hell", name: "Địa ngục" }
        ];

        // Lấy vị trí world của select
        const worldX = this.container.x + this.difficultySelect.x;
        const worldY = this.container.y
            + this.difficultySelect.y
            + 32;

        // Dropdown đặt trực tiếp vào Scene
        this.difficultyDropdown = this.scene.add.container(
            worldX,
            worldY
        );

        // CỰC KỲ QUAN TRỌNG
        this.difficultyDropdown.setDepth(99999);

        const optionHeight = 30;
        const optionWidth = 130;

        options.forEach((option, index) => {

            const y = index * optionHeight;

            const bg = this.scene.add.rectangle(
                0,
                y,
                optionWidth,
                optionHeight,
                0xffffff
            )
                .setOrigin(0)
                .setStrokeStyle(1, 0x999999);

            const text = this.scene.add.text(
                10,
                y + 6,
                option.name,
                {
                    fontSize: "16px",
                    color: "#222222"
                }
            );

            bg.setInteractive({
                useHandCursor: true
            });

            bg.on("pointerover", () => {
                bg.setFillStyle(0xeeeeee);
            });

            bg.on("pointerout", () => {
                bg.setFillStyle(0xffffff);
            });

            bg.on("pointerup", (pointer) => {

                pointer.event.stopPropagation();

                this.setDifficulty(option.id);

                this.closeDifficultyDropdown();
            });

            this.difficultyDropdown.add([
                bg,
                text
            ]);
        });
    }


    // ==================================================
    // Chọn độ khó
    // ==================================================
    setDifficulty(difficulty) {

        if (!this.difficulties[difficulty]) {
            return;
        }


        this.currentDifficulty = difficulty;


        this.difficultyText.setText(
            this.difficulties[difficulty]
        );


        // Callback
        this.onDifficultyChange?.(
            difficulty
        );
    }


    // ==================================================
    // Đóng dropdown
    // ==================================================
    closeDifficultyDropdown() {

        if (!this.difficultyDropdown) {
            return;
        }

        this.difficultyDropdown.destroy(true);

        this.difficultyDropdown = null;
    }


    // ==================================================
    // Locked
    // ==================================================
    setLocked(lock) {

        this.container.setAlpha(
            lock ? 0.5 : 1
        );

    }


    // ==================================================
    // Visible
    // ==================================================
    setVisible(value) {

        this.container.setVisible(value);

    }


    // ==================================================
    // Destroy
    // ==================================================
    destroy() {

        this.container.destroy(true);

    }

}