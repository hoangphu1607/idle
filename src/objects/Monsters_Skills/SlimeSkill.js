import Skill from "../Hero_Skills/Skill";

export default class SlimeSkill extends Skill {
	constructor(config) {
		super({
			id: "Slime_first_skill",
			name: "Slime Attack",
			cooldown: config.cooldown,
			initialCooldown: config.initialCooldown,
		});
	}

	execute(caster, battle) {
		const currentTime = battle.time.now;

		if (!this.isReady(currentTime)) {
			return;
		}

		const targetGrid = caster.team === "enemy" ? battle.playerGrid : battle.enemyGrid;

		if (!caster.currentTarget || caster.currentTarget.dead) {
			caster.currentTarget = battle.findNearestTarget(targetGrid, caster);
		}

		const target = caster.currentTarget;

		if (!target || !caster.view || !target.view) {
			return;
		}

		const projectile = battle.add.image(
			caster.ownerGrid.container.x + caster.view.container.x,
			caster.ownerGrid.container.y + caster.view.container.y,
			"Slime_first_skill",
		);

		projectile.setDepth(10);

		const targetX = target.ownerGrid.container.x + target.view.container.x;
		const targetY = target.ownerGrid.container.y + target.view.container.y;

		battle.tweens.add({
			targets: projectile,
			x: targetX,
			y: targetY,
			duration: 1000,
			onComplete: () => {
				projectile.destroy();

				if (target.dead) {
					return;
				}

				const damage = caster.attack_physical;
				target.takeDamage(damage);

				if (target.dead) {
					battle.removeUnit(target);
				}
			},
		});

		console.log(`${caster.name} uses ${this.name} on ${target.name}`);
		this.startCooldown(currentTime);
	}
}
