class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = 200;
        this.vomits = [];
        this.vomitsGroup = scene.physics.add.group();
        this.ammo = 10;
        this.maxAmmo = 10;
        this.reloadTime = 0;
        this.reloadDuration = 2000;
        
        // Создаем спрайт игрока из PNG
        this.sprite = scene.add.sprite(x, y, 'bomzh');
        
        // Устанавливаем очень маленький размер
        this.sprite.setScale(0.05);
        
        // Добавляем физику
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Уменьшаем хитбокс под новый размер
        this.sprite.body.setSize(1, 1);
        
        // Направление движения для блевотины
        this.lastDirection = { x: 0, y: -1 };
    }
    
    update(cursors, wasd, spaceKey, rKey) {
        // Движение
        let velocityX = 0;
        let velocityY = 0;
        
        if (cursors.left.isDown || wasd.A.isDown) {
            velocityX = -this.speed;
        } else if (cursors.right.isDown || wasd.D.isDown) {
            velocityX = this.speed;
        }
        
        if (cursors.up.isDown || wasd.W.isDown) {
            velocityY = -this.speed;
        } else if (cursors.down.isDown || wasd.S.isDown) {
            velocityY = this.speed;
        }
        
        // Нормализуем диагональное движение
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }
        
        // Обновляем направление для блевотины
        if (velocityX !== 0 || velocityY !== 0) {
            this.lastDirection.x = velocityX / this.speed;
            this.lastDirection.y = velocityY / this.speed;
        }
        
        this.sprite.body.setVelocity(velocityX, velocityY);
        
        // Флипаем спрайт в зависимости от направления движения
        this.updateSpriteDirection(velocityX);
        
        // Стрельба
        if (Phaser.Input.Keyboard.JustDown(spaceKey) && this.ammo > 0 && this.reloadTime <= 0) {
            this.vomit();
        }
        
        // Перезарядка
        if (Phaser.Input.Keyboard.JustDown(rKey)) {
            this.startReload();
        }
        
        // Обновляем время перезарядки
        if (this.reloadTime > 0) {
            this.reloadTime -= this.scene.game.loop.delta;
            if (this.reloadTime <= 0) {
                this.finishReload();
            }
        }
    }
    
    updateSpriteDirection(velocityX) {
        if (velocityX < 0) {
            this.sprite.setFlipX(true);
        } else if (velocityX > 0) {
            this.sprite.setFlipX(false);
        }
    }
    
    vomit() {
        if (this.ammo <= 0) return;
        
        this.ammo--;
        
        // Вычисляем позицию вылета блевотины (впереди персонажа)
        const offset = 60;
        const startX = this.sprite.x + (this.lastDirection.x * offset);
        const startY = this.sprite.y + (this.lastDirection.y * offset);
        
        // Создаем несколько блевотин для широкого поражения
        this.createMultipleVomits(startX, startY);
        
        // Обновляем UI
        this.scene.updateUI();
    }
    
    createMultipleVomits(startX, startY) {
        // Создаем основную блевотину
        const mainVomit = new Vomit(this.scene, startX, startY, this.lastDirection);
        this.vomits.push(mainVomit);
        
        // Создаем дополнительные блевотины для широкого поражения
        const spreadAngle = 0.07; // Угол разброса в радианах
        
        // Левая блевотина
        const leftDirection = {
            x: this.lastDirection.x * Math.cos(spreadAngle) - this.lastDirection.y * Math.sin(spreadAngle),
            y: this.lastDirection.x * Math.sin(spreadAngle) + this.lastDirection.y * Math.cos(spreadAngle)
        };
        const leftVomit = new Vomit(this.scene, startX, startY, leftDirection);
        this.vomits.push(leftVomit);
        
        // Правая блевотина
        const rightDirection = {
            x: this.lastDirection.x * Math.cos(-spreadAngle) - this.lastDirection.y * Math.sin(-spreadAngle),
            y: this.lastDirection.x * Math.sin(-spreadAngle) + this.lastDirection.y * Math.cos(-spreadAngle)
        };
        const rightVomit = new Vomit(this.scene, startX, startY, rightDirection);
        this.vomits.push(rightVomit);
    }
    
    startReload() {
        if (this.ammo < this.maxAmmo && this.reloadTime <= 0) {
            this.reloadTime = this.reloadDuration;
            
            // Анимация перезарядки
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }
    
    finishReload() {
        this.ammo = this.maxAmmo;
        this.scene.updateUI();
    }
}