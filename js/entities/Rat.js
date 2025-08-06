class Rat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = Phaser.Math.Between(50, 150);
        
        // Случайное направление движения (по X и Y)
        this.velocityX = Phaser.Math.Between(-1, 1) * this.speed;
        this.velocityY = Phaser.Math.Between(-1, 1) * this.speed;
        
        // Создаем спрайт крысы из GIF
        this.sprite = scene.add.sprite(x, y, 'rat-gif');
        
        // Устанавливаем размер
        this.sprite.setScale(0.5);
        
        // Добавляем физику
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Уменьшаем хитбокс крысы
        this.sprite.body.setSize(20, 20); // Вместо полного размера спрайта
        
        // Устанавливаем начальную скорость
        this.sprite.body.setVelocity(this.velocityX, this.velocityY);
        
        // Флипаем спрайт в зависимости от направления
        this.updateDirection();
        
        // Таймер для изменения направления
        this.directionChangeTimer = 0;
        this.directionChangeInterval = Phaser.Math.Between(2000, 5000); // 2-5 секунд
        
        // Флаг для отслеживания уничтожения
        this.isDestroyed = false;
    }
    
    updateDirection() {
        // Проверяем, существует ли спрайт и его тело
        if (!this.sprite || !this.sprite.body || this.isDestroyed) return;
        
        // Флипаем спрайт в зависимости от направления по X
        if (this.velocityX < 0) {
            this.sprite.setFlipX(true);
        } else if (this.velocityX > 0) {
            this.sprite.setFlipX(false);
        }
    }
    
    update() {
        // Проверяем, не уничтожена ли крыса и существует ли спрайт
        if (!this.sprite || !this.sprite.body || this.isDestroyed) return;
        
        // Обновляем таймер
        this.directionChangeTimer += this.scene.game.loop.delta;
        
        // Периодически меняем направление
        if (this.directionChangeTimer >= this.directionChangeInterval) {
            this.changeDirection();
            this.directionChangeTimer = 0;
            this.directionChangeInterval = Phaser.Math.Between(2000, 5000);
        }
        
        // Проверяем границы и отскакиваем
        this.checkBounds();
        
        // Случайное изменение направления (2% шанс)
        if (Phaser.Math.Between(0, 100) < 2) {
            this.changeDirection();
        }
    }
    
    changeDirection() {
        // Проверяем, существует ли спрайт и его тело
        if (!this.sprite || !this.sprite.body || this.isDestroyed) return;
        
        // Случайно меняем направление движения
        this.velocityX = Phaser.Math.Between(-1, 1) * this.speed;
        this.velocityY = Phaser.Math.Between(-1, 1) * this.speed;
        
        // Убеждаемся, что крыса движется (не стоит на месте)
        if (this.velocityX === 0 && this.velocityY === 0) {
            this.velocityX = (Phaser.Math.Between(0, 1) ? 1 : -1) * this.speed;
        }
        
        // Устанавливаем новую скорость
        this.sprite.body.setVelocity(this.velocityX, this.velocityY);
        
        // Обновляем направление спрайта
        this.updateDirection();
    }
    
    checkBounds() {
        // Проверяем, существует ли спрайт и его тело
        if (!this.sprite || !this.sprite.body || this.isDestroyed) return;
        
        const margin = 50;
        const worldBounds = this.scene.physics.world.bounds;
        
        // Проверяем границы по X
        if (this.sprite.x <= worldBounds.x + margin || this.sprite.x >= worldBounds.width - margin) {
            this.velocityX *= -1;
            this.sprite.body.setVelocityX(this.velocityX);
            this.updateDirection();
        }
        
        // Проверяем границы по Y
        if (this.sprite.y <= worldBounds.y + margin || this.sprite.y >= worldBounds.height - margin) {
            this.velocityY *= -1;
            this.sprite.body.setVelocityY(this.velocityY);
        }
    }
    
    destroy() {
        // Отмечаем крысу как уничтоженную
        this.isDestroyed = true;
        
        // Создаем эффект смерти крысы
        this.createDeathEffect();
        
        // Удаляем спрайт
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
    
    createDeathEffect() {
        // Проверяем, существует ли спрайт
        if (!this.sprite) return;
        
        // Создаем частицы крови
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                this.sprite.x + Phaser.Math.Between(-10, 10),
                this.sprite.y + Phaser.Math.Between(-10, 10),
                2,
                0xFF0000
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-30, 30),
                y: particle.y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
}