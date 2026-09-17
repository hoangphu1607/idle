import Skill from "./Skill";

export default class NatureSkill extends Skill {
	constructor(config) {
		super({
			id: "nature_skill_first",
			name: "Nature Heal",
			cooldown: config.cooldown,
			initialCooldown: config.initialCooldown,
		});

		this.activeLeaves = new Map();
	}

	execute(caster, battle) {
		const currentTime = battle.time.now;

		if (!this.isReady(currentTime)) {
			return;
		}

		const allies = battle.getAllUnits(battle.playerGrid).filter(
			(unit) => unit && !unit.dead && unit.hp < unit.maxHp,
		);

		const target = allies.reduce((mostInjured, unit) => {
			if (!mostInjured) {
				return unit;
			}

			return unit.maxHp - unit.hp > mostInjured.maxHp - mostInjured.hp
				? unit
				: mostInjured;
		}, null);

		if (!target || !target.view) {
			return;
		}

		const missingHp = target.maxHp - target.hp;
		const requestedLeaves = Math.min(3, Math.ceil(missingHp / 10));
		const currentEffect = this.activeLeaves.get(target);
		const existingLeafCount = currentEffect?.leaves.length || 0;
		const leafCount = Math.min(
			requestedLeaves,
			3 - existingLeafCount,
		);

		if (leafCount <= 0) {
			return;
		}

		const targetX = target.ownerGrid.container.x + target.view.container.x;
		const targetY = target.ownerGrid.container.y + target.view.container.y;
		const effect = currentEffect || {
			leaves: [],
			timer: null,
		};
		const offsetsByCount = {
			1: [0],
			2: [-20, 20],
			3: [-20, 20, 0],
		};

		for (let index = 0; index < leafCount; index += 1) {
			const totalLeafCount = effect.leaves.length + 1;
			const offsets = offsetsByCount[totalLeafCount];
			const leaf = battle.add.image(
				targetX + offsets[totalLeafCount - 1],
				targetY + 22,
				"Nature_first_skill",
			);

			leaf.setDisplaySize(24, 24);
			leaf.setDepth(9);
			leaf.setAlpha(0);
			effect.leaves.push(leaf);

			effect.leaves.forEach((activeLeaf, leafIndex) => {
				activeLeaf.x = targetX + offsetsByCount[effect.leaves.length][leafIndex];
				activeLeaf.y = targetY + 12;
			});

			target.heal(10);
			target.view.refresh();

			battle.tweens.add({
				targets: leaf,
				alpha: 1,
				duration: 180,
				duration: 180,
			});
		}

		if (effect.timer) {
			effect.timer.remove(false);
		}

		effect.timer = battle.time.delayedCall(3000, () => {
			effect.leaves.forEach((leaf) => leaf.destroy());
			this.activeLeaves.delete(target);
		});

		this.activeLeaves.set(target, effect);

		console.log(
			`${caster.name} uses ${this.name} on ${target.name} (${leafCount} leaves)`,
		);

		this.startCooldown(currentTime);
	}
}
