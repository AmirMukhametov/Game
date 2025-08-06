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
        this.sprite.setScale(0.05);
        
        // Сохраняем оригинальный масштаб
        this.originalScale = 0.05;
        
        // Добавляем физику
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(false);
        
        // Уменьшаем хитбокс под новый размер
        this.sprite.body.setSize(10, 10);
        
        // Направление движения
        this.lastDirection = { x: 0, y: 0 };
        
        // Обновляем UI при создании игрока
        this.updateUI();
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
        
        // Стрельба (убираем проверку reloadTime)
        if (Phaser.Input.Keyboard.JustDown(spaceKey) && this.ammo > 0) {
            this.vomit();
        }
        
        // Убираем функциональность R - больше не нужна
        // if (Phaser.Input.Keyboard.JustDown(rKey)) {
        //     this.startReload();
        // }
    }
    
    updateSpriteDirection(velocityX) {
        // АЛЬТЕРНАТИВНАЯ логика (если моделька изначально смотрит влево)
        if (velocityX < 0) {
            // Движемся влево - НЕ поворачиваем спрайт
            this.sprite.setFlipX(false);
        } else if (velocityX > 0) {
            // Движемся вправо - поворачиваем спрайт
            this.sprite.setFlipX(true);
        }
    }
    
    vomit() {
        if (this.ammo <= 0) return;
        
        this.ammo--;
        this.updateUI(); // Обновляем UI после использования блевотины
        
        // Вычисляем позицию вылета блевотины (впереди персонажа)
        const offset = 60;
        const startX = this.sprite.x + (this.lastDirection.x * offset);
        const startY = this.sprite.y + (this.lastDirection.y * offset);
        
        // Создаем блевотину
        const vomit = new Vomit(this.scene, startX, startY, this.lastDirection);
        this.vomits.push(vomit);
    }
    
    // Добавляем метод для анимации при подборе бутылки
    playBottlePickupAnimation() {
        // Анимация увеличения при подборе бутылки
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: this.originalScale * 1.30,
            scaleY: this.originalScale * 1.30,
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                // Возвращаем к оригинальному размеру
                this.sprite.setScale(this.originalScale, this.originalScale);
            }
        });
    }
    
    updateUI() {
        // Обновляем UI через сцену
        if (this.scene && this.scene.updateUI) {
            this.scene.updateUI();
        }
    }
}