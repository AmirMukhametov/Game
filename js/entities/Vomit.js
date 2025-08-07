class Vomit {
    constructor(scene, x, y, direction) {
        this.scene = scene;
        this.speed = 300;
        this.lifetime = 1000;
        this.direction = direction;
        this.damageRadius = 40;
        
        // Создаем группу частиц вместо одного спрайта
        this.particles = [];
        this.createParticles(x, y);
        
        // Запускаем таймер уничтожения
        this.scene.time.delayedCall(this.lifetime, () => {
            this.destroy();
        });
    }
    
    createParticles(x, y) {
        // Создаем несколько зеленых частиц
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.circle(
                x + Phaser.Math.Between(-5, 5),
                y + Phaser.Math.Between(-5, 5),
                3, // Размер частицы
                0x90EE90, // Зеленый цвет
                0.8 // Прозрачность
            );
            
            // Добавляем физику к частице
            this.scene.physics.add.existing(particle);
            
            // Устанавливаем скорость в направлении движения с небольшим разбросом
            const spreadX = this.direction.x + Phaser.Math.Between(-0.2, 0.2);
            const spreadY = this.direction.y + Phaser.Math.Between(-0.2, 0.2);
            const velocityX = spreadX * this.speed;
            const velocityY = spreadY * this.speed;
            
            particle.body.setVelocity(velocityX, velocityY);
            
            // Добавляем частицу в массив
            this.particles.push(particle);
            
            // Добавляем эффект исчезновения
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: this.lifetime,
                ease: 'Power2'
            });
        }
    }
    
    update() {
        // Проверяем границы экрана для всех частиц
        this.particles.forEach(particle => {
            if (particle.x < -50 || particle.x > 1250 || 
                particle.y < -50 || particle.y > 850) {
                this.destroy();
            }
        });
    }
    
    destroy() {
        // Удаляем все частицы
        this.particles.forEach(particle => {
            if (particle) {
                particle.destroy();
            }
        });
        this.particles = [];
    }
    
    // Метод для проверки попадания в крысу
    isHittingRat(rat) {
        if (!rat.sprite) return false;
        
        // Проверяем расстояние от любой частицы до крысы
        for (let particle of this.particles) {
            if (particle && particle.active) {
                const distance = Phaser.Math.Distance.Between(
                    particle.x, particle.y,
                    rat.sprite.x, rat.sprite.y
                );
                
                if (distance <= this.damageRadius) {
                    return true;
                }
            }
        }
        
        return false;
    }
}