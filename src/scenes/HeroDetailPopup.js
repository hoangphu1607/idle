export default class HeroDetailPopup {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);

        // =========================
        // Overlay
        // =========================

        const overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.65
        ).setOrigin(0);

        overlay.setInteractive();

        overlay.on("pointerup", () => {
            this.hide();
        });

        // =========================
        // Panel
        // =========================

        const panelWidth = 650;
        const panelHeight = 700;

        const panel = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height / 2,
            panelWidth,
            panelHeight,
            0xffffff
        );

        // =========================
        // Avatar
        // =========================

        this.avatar = scene.add.image(
            scene.scale.width / 2,
            220,
            "wizard"
        );

        this.avatar.setScale(0.8);

        // =========================
        // Hero name
        // =========================

        this.name = scene.add.text(
            scene.scale.width / 2,
            335,
            "",
            {
                fontSize: "36px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // =========================
        // Stats container
        // =========================

        this.statsContainer = scene.add.container(
            scene.scale.width / 2,
            390
        );

        // =========================
        // Stat rows
        // =========================

        this.statTexts = {};

        this.createStat("level", "Level", 0, 0);
        this.createStat("role", "Role", 300, 0);

        this.createStat("hp", "HP", 0, 55);
        this.createStat("mp", "MP", 300, 55);

        this.createStat(
            "attack_physical",
            "Physical ATK",
            0,
            110
        );

        this.createStat(
            "attack_magic",
            "Magic ATK",
            300,
            110
        );

        this.createStat(
            "auto_attack",
            "Auto Attack",
            0,
            165
        );

        // Skills
        this.createStat(
            "skills",
            "Skills",
            300,
            165
        );

        // =========================
        // Close button
        // =========================

        const closeButton = scene.add.text(
            scene.scale.width / 2 + panelWidth / 2 - 25,
            scene.scale.height / 2 - panelHeight / 2 + 20,
            "×",
            {
                fontSize: "36px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        closeButton.setInteractive({
            useHandCursor: true
        });

        closeButton.on("pointerup", () => {
            this.hide();
        });

        closeButton.on("pointerover", () => {
            closeButton.setColor("#ff0000");
        });

        closeButton.on("pointerout", () => {
            closeButton.setColor("#000000");
        });

        // =========================
        // Add to container
        // =========================

        this.container.add([
            overlay,
            panel,
            this.avatar,
            this.name,
            this.statsContainer,
            closeButton
        ]);
    }

    // =====================================================
    // Create stat
    // =====================================================

    createStat(key, label, x, y) {

        const row = this.scene.add.container(x - 325, y);

        const background = this.scene.add.rectangle(
            0,
            0,
            280,
            45,
            0xf2f2f2
        ).setOrigin(0);

        const labelText = this.scene.add.text(
            15,
            22,
            label,
            {
                fontSize: "18px",
                color: "#555555"
            }
        ).setOrigin(0, 0.5);

        const valueText = this.scene.add.text(
            265,
            22,
            "-",
            {
                fontSize: "18px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(1, 0.5);

        row.add([
            background,
            labelText,
            valueText
        ]);

        this.statsContainer.add(row);

        this.statTexts[key] = valueText;
    }

    // =====================================================
    // Show
    // =====================================================

    show(hero) {

        this.avatar.setTexture(hero.avatar);

        this.name.setText(hero.name);

        this.statTexts.level.setText(hero.level);
        this.statTexts.role.setText(hero.role);

        this.statTexts.hp.setText(hero.hp);
        this.statTexts.mp.setText(hero.mp);

        this.statTexts.attack_physical.setText(
            hero.attack_physical
        );

        this.statTexts.attack_magic.setText(
            hero.attack_magic
        );

        this.statTexts.auto_attack.setText(
            hero.auto_attack
        );

        // Skills có thể là string hoặc object
        let skillsText = "-";

        if (Array.isArray(hero.skills)) {

            skillsText = hero.skills
                .map(skill => {

                    if (typeof skill === "string") {
                        return skill;
                    }

                    if (skill && skill.id) {
                        return skill.id;
                    }

                    return "-";

                })
                .join(", ");
        }

        this.statTexts.skills.setText(skillsText);

        this.container.setVisible(true);

        // Đưa popup lên trên cùng
        this.container.setDepth(9999);
    }

    // =====================================================
    // Hide
    // =====================================================

    hide() {

        this.container.setVisible(false);

    }
}