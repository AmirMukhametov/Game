class Vomit {
    constructor(scene, x, y, direction) {
        this.scene = scene;
        this.speed = 400;
        this.lifetime = 2000; // Уменьшили время жизни до 2 секунд
        this.direction = direction;
        this.damageRadius = 50;
        
        // Создаем спрайт блевотины
        this.sprite = scene.add.circle(x, y, 12, 0x90EE90);
        scene.physics.add.existing(this.sprite);
        
        // Устанавливаем скорость в направлении движения
        const velocityX = this.direction.x * this.speed;
        const velocityY = this.direction.y * this.speed;
        this.sprite.body.setVelocity(velocityX, velocityY);
        
        // Запускаем таймер уничтожения
        this.scene.time.delayedCall(this.lifetime, () => {
            this.destroy();
        });
    }
    
    update() {
        // Проверяем границы экрана
        if (this.sprite.x < -50 || this.sprite.x > 1250 || 
            this.sprite.y < -50 || this.sprite.y > 850) {
            this.destroy();
        }
    }
    
    destroy() {
        // Просто удаляем спрайт без эффектов
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
    
    // Метод для проверки попадания в крысу
    isHittingRat(rat) {
        if (!this.sprite || !rat.sprite) return false;
        
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            rat.sprite.x, rat.sprite.y
        );
        
        return distance <= this.damageRadius;
    }
}