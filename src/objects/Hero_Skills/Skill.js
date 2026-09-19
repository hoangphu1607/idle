
export default class Skill {
    constructor(data = {}) {
        this.id = data.id || "";
        this.name = data.name || "";
        // Thời gian hồi chiêu sau mỗi lần sử dụng
        this.cooldown = data.cooldown ?? 1;

        // Thời gian hồi chiêu ban đầu khi vào trận
        this.initialCooldown = data.initialCooldown ?? 0;

        // Thời điểm skill có thể sử dụng
        this.nextAvailableTime = 0;
    }

    /**
     * Khởi tạo cooldown khi bắt đầu trận
     */
    startBattle(currentTime) {
        this.nextAvailableTime = currentTime + this.initialCooldown * 1000;
    }

    /**
     * Kiểm tra skill có thể sử dụng hay chưa
     */
    isReady(currentTime) {
        return currentTime >= this.nextAvailableTime;
    }

    /**
     * Đặt cooldown sau khi sử dụng skill
     */
    startCooldown(currentTime) {
        this.nextAvailableTime = currentTime + this.cooldown * 1000;
    }

    execute(caster, battle) {
        console.warn(`Skill ${this.name} has no execute()`);
    }
}
