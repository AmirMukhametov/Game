class Rat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = Phaser.Math.Between(50, 150);
        
        // Случайное направление движения (по X и Y)
        this.velocityX = Phaser.Math.Between(-1, 1) * this.speed;
        this.velocityY = Phaser.Math.Between(-1, 1) * this.speed;
        
        // Создаем спрайт крысы из GIF
        this.sprite = scene.add.sprite(x, y, 'rat-gif');
        this.sprite.setScale(0.5);
        
        // Добавляем физику
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(false); // Отключаем мировые границы
        
        // Уменьшаем хитбокс
        this.sprite.body.setSize(15, 15);
        
        this.isDestroyed = false;
        this.directionChangeTime = 0;
        this.directionChangeInterval = Phaser.Math.Between(2000, 5000);
    }
    
    update() {
        if (this.isDestroyed || !this.sprite || !this.sprite.body) return;
        
        // Проверяем, не вышла ли крыса за границы прямоугольника
        if (!this.scene.isPointInRect(this.sprite.x, this.sprite.y)) {
            this.changeDirection();
        }
        
        // Остальная логика обновления...
        this.directionChangeTime += 16;
        
        if (this.directionChangeTime >= this.directionChangeInterval) {
            this.changeDirection();
            this.directionChangeTime = 0;
            this.directionChangeInterval = Phaser.Math.Between(2000, 5000);
        }
    }
    
    changeDirection() {
        if (this.isDestroyed || !this.sprite || !this.sprite.body) return;
        
        // Генерируем новое направление
        this.velocityX = Phaser.Math.Between(-1, 1) * this.speed;
        this.velocityY = Phaser.Math.Between(-1, 1) * this.speed;
        
        this.sprite.body.setVelocity(this.velocityX, this.velocityY);
    }
    
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.isDestroyed = true;
    }
}