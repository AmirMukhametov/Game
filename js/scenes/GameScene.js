class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.health = 100;
        this.ammo = 10;
        this.rats = [];
        this.vomits = [];
        this.bottles = [];
        this.maxRats = 10;
        this.bottleSpawned = false;
        
        // Сбрасываем UI при создании новой сцены
        if (window.updateUI) {
            window.updateUI(0, 100, 10);
        }
    }
    
    preload() {
        // Загружаем GIF крысу
        this.load.image('rat-gif', 'assets/images/rat.gif');
        
        // Загружаем PNG бомжа
        this.load.image('bomzh', 'assets/images/bomzh.png');
        
        // Загружаем фон города
        this.load.image('city-background', 'assets/images/city.png');
        
        // Загружаем PNG бутылку (исправляем название файла)
        this.load.image('bottle', 'assets/images/bootle.png'); // ← Исправили на bootle.png
        
        console.log('GameScene: preload completed');
    }
    
    create() {
        console.log('GameScene: create started');
        this.createBackground();
        this.createPlayer();
        this.createRats();
        this.createBottles();
        this.setupCollisions();
        this.setupInput();
        this.createUI();
        
        // Запускаем спавн крыс с ограничением
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnRat,
            callbackScope: this,
            loop: true
        });
        
        // Обновляем UI с начальными значениями
        this.updateUI();
        console.log('GameScene: create completed');
    }
    
    createBackground() {
        this.background = this.add.image(600, 400, 'city-background');
        
        // Получаем размеры экрана
        const screenWidth = 1200;
        const screenHeight = 800;
        
        // Растягиваем с сохранением пропорций
        this.background.setDisplaySize(screenWidth, screenHeight);
        this.background.setOrigin(0.5, 0.5); // Центрируем
        
        // Создаем прямоугольную игровую область
        this.createRectangularBoundary();
    }

    createRectangularBoundary() {
        // Определяем границы прямоугольной области
        const leftBound = 0;      // Левая граница
        const rightBound = 930;    // Правая граница (как вы хотели)
        const topBound = 390;      // Верхняя граница (половина экрана)
        const bottomBound = 800;   // Нижняя граница
        
        // Создаем точки прямоугольника
        const points = [
            { x: leftBound, y: topBound },     // Верхний левый
            { x: rightBound, y: topBound },    // Верхний правый
            { x: rightBound, y: bottomBound }, // Нижний правый
            { x: leftBound, y: bottomBound }   // Нижний левый
        ];
        
        // Создаем графический объект для границ
        
        
        // Создаем физические границы
        this.createPhysicalBoundaries(points);
    }

    reatePentagonBoundary() {
        // Центр пятиугольника
        const centerX = 600;
        const centerY = 400;
        const radius = 300; // Радиус пятиугольника
        
        // Создаем точки пятиугольника
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2; // Начинаем сверху
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push({ x, y });
        }
        
        // Создаем графический объект для границ
        this.boundaryGraphics = this.add.graphics();
        this.boundaryGraphics.lineStyle(4, 0x00ff00, 1); // Зеленая линия толщиной 4
        this.boundaryGraphics.strokePoints(points, true, true); // Замыкаем линию
        
        // Создаем физические границы
        this.createPhysicalBoundaries(points);
    }

    createPhysicalBoundaries(points) {
        // Создаем группу для физических границ
        this.boundaryGroup = this.physics.add.staticGroup();
        
        // Создаем 4 отдельные стены вместо одной сложной
        const leftBound = 0;
        const rightBound = 930;
        const topBound = 390;
        const bottomBound = 800;
        
        // Верхняя стена
        const topWall = this.add.rectangle(
            (leftBound + rightBound) / 2, // Центр по X
            topBound, // Y позиция
            rightBound - leftBound, // Ширина
            10, // Толщина
            0x00ff00,
            0
        );
        this.physics.add.existing(topWall, true);
        this.boundaryGroup.add(topWall);
        
        // Нижняя стена
        const bottomWall = this.add.rectangle(
            (leftBound + rightBound) / 2, // Центр по X
            bottomBound, // Y позиция
            rightBound - leftBound, // Ширина
            10, // Толщина
            0x00ff00,
            0
        );
        this.physics.add.existing(bottomWall, true);
        this.boundaryGroup.add(bottomWall);
        
        // Левая стена
        const leftWall = this.add.rectangle(
            leftBound, // X позиция
            (topBound + bottomBound) / 2, // Центр по Y
            10, // Толщина
            bottomBound - topBound, // Высота
            0x00ff00,
            0
        );
        this.physics.add.existing(leftWall, true);
        this.boundaryGroup.add(leftWall);
        
        // Правая стена
        const rightWall = this.add.rectangle(
            rightBound, // X позиция
            (topBound + bottomBound) / 2, // Центр по Y
            10, // Толщина
            bottomBound - topBound, // Высота
            0x00ff00,
            0
        );
        this.physics.add.existing(rightWall, true);
        this.boundaryGroup.add(rightWall);
    }
    
    createPlayer() {
        // Размещаем игрока в центре прямоугольной области
        const playerX = 465; // (0 + 930) / 2 = 465
        const playerY = 595; // (390 + 800) / 2 = 595
        this.player = new Player(this, playerX, playerY);
        
        // Добавляем коллизию с границами
        this.physics.add.collider(this.player.sprite, this.boundaryGroup);
    }

    getRandomPositionInRect() {
        // Определяем границы области спавна (немного меньше физических границ)
        const leftBound = 20;      // Отступ от левой границы
        const rightBound = 910;    // Отступ от правой границы
        const topBound = 410;      // Отступ от верхней границы
        const bottomBound = 790;   // Отступ от нижней границы
        
        // Генерируем случайную позицию внутри прямоугольника
        const x = Phaser.Math.Between(leftBound, rightBound);
        const y = Phaser.Math.Between(topBound, bottomBound);
        
        return { x, y };
    }

    isPointInRect(x, y) {
        // Проверяем, находится ли точка внутри прямоугольной области
        const leftBound = 0;       // Левая граница
        const rightBound = 930;    // Правая граница
        const topBound = 390;      // Верхняя граница
        const bottomBound = 800;   // Нижняя граница
        
        return x >= leftBound && x <= rightBound && y >= topBound && y <= bottomBound;
    }
    
    
    createRats() {
        this.ratsGroup = this.physics.add.group();
    }
    
    spawnRat() {
        // Проверяем, не превышено ли максимальное количество крыс
        if (this.rats.length < this.maxRats) {
            // Генерируем позицию внутри прямоугольной области
            const position = this.getRandomPositionInRect();
            
            const rat = new Rat(this, position.x, position.y);
            this.rats.push(rat);
            this.ratsGroup.add(rat.sprite);
            
            // Добавляем коллизию с границами
            this.physics.add.collider(rat.sprite, this.boundaryGroup);
            
            console.log(`Крыса создана. Всего крыс: ${this.rats.length}/${this.maxRats}`);
        }
    }

    getRandomPositionInPentagon() {
        const centerX = 600;
        const centerY = 400;
        const radius = 250; // Немного меньше радиуса границ
        
        // Генерируем случайную позицию внутри пятиугольника
        let x, y;
        do {
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            x = centerX + distance * Math.cos(angle);
            y = centerY + distance * Math.sin(angle);
        } while (!this.isPointInPentagon(x, y));
        
        return { x, y };
    }
    
    isPointInPentagon(x, y) {
        // Простая проверка - точка должна быть внутри круга с радиусом границ
        const centerX = 600;
        const centerY = 400;
        const radius = 280; // Немного меньше радиуса границ
        
        const distance = Phaser.Math.Distance.Between(x, y, centerX, centerY);
        return distance <= radius;
    }
    
    setupCollisions() {
        // Коллизия между игроком и крысами
        this.physics.add.overlap(
            this.player.sprite,
            this.ratsGroup,
            this.playerHitByRat,
            null,
            this
        );
        
        // Коллизия между игроком и бутылками
        this.physics.add.overlap(
            this.player.sprite,
            this.bottlesGroup,
            this.playerPickupBottle,
            null,
            this
        );
    }

    createBottles() {
        this.bottlesGroup = this.physics.add.group();
    }
    
    spawnBottle() {
        // Проверяем, не спавнилась ли уже бутылка
        if (this.bottleSpawned) return;
        
        // Генерируем позицию внутри прямоугольной области
        const position = this.getRandomPositionInRect();
        
        const bottle = new Bottle(this, position.x, position.y);
        this.bottles.push(bottle);
        this.bottlesGroup.add(bottle.sprite);
        
        this.bottleSpawned = true;
        console.log('Бутылка создана!');
    }

    playerPickupBottle(player, bottle) {
        // Игрок подбирает бутылку
        
        // Удаляем из физической группы
        if (this.bottlesGroup && bottle.sprite) {
            this.bottlesGroup.remove(bottle.sprite);
        }
        
        // Принудительно уничтожаем бутылку
        bottle.destroy();
        
        // Удаляем из массивов
        this.bottles = this.bottles.filter(b => !b.isDestroyed);
        
        // Пополняем блевотину игрока ДО МАКСИМУМА
        this.player.ammo = this.player.maxAmmo;
        
        // Запускаем анимацию увеличения персонажа
        this.player.playBottlePickupAnimation();
        
        this.player.updateUI();
        
        // Сбрасываем флаг спавна бутылки
        this.bottleSpawned = false;
        
        console.log(`Бутылка подобрана! Блевотины: ${this.player.ammo}`);
    }
    
    hitRat(vomit, rat) {
        // Удаляем блевотину и крысу
        vomit.destroy();
        rat.destroy();
        
        // Увеличиваем счет
        this.score += 10;
        this.updateUI();
        
        // Удаляем из массивов
        this.rats = this.rats.filter(r => !r.isDestroyed);
        this.player.vomits = this.player.vomits.filter(v => v !== vomit);
        
        console.log(`Крыса уничтожена! Осталось крыс: ${this.rats.length}/${this.maxRats}`);
    }
    
    playerHitByRat(player, rat) {
        // Защита от множественных ударов - проверяем, не получал ли игрок урон недавно
        if (this.player.isInvulnerable) return;
        
        // Игрок получает урон
        this.health -= 25;
        this.updateUI();
        
        // Делаем игрока неуязвимым на короткое время (1 секунда)
        this.player.isInvulnerable = true;
        this.time.delayedCall(1000, () => {
            this.player.isInvulnerable = false;
        });
        
        console.log(`Игрок получил урон! Здоровье: ${this.health}`);
        
        // Проверяем конец игры
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // Убираем R - больше не нужна
        // this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    
    createUI() {
        // UI создается в HTML
    }
    
    updateUI() {
        if (window.updateUI && this.player) {
            window.updateUI(this.score, this.health, this.player.ammo); // Передаем ammo от игрока
        }
    }
    
    update() {
        if (this.player) {
            // Убираем rKey из параметров
            this.player.update(this.cursors, this.wasd, this.spaceKey);
        }
        
        // Проверяем, нужно ли спавнить бутылку
        if (this.player && this.player.ammo <= 1 && !this.bottleSpawned) {
            this.spawnBottle();
        }
        
        // Удаляем уничтоженные крысы из массива
        this.rats = this.rats.filter(rat => !rat.isDestroyed);
        
        // Удаляем уничтоженные бутылки из массива
        this.bottles = this.bottles.filter(bottle => !bottle.isDestroyed);
        
        // Обновляем только неуничтоженные крысы
        this.rats.forEach(rat => {
            if (!rat.isDestroyed && rat.sprite && rat.sprite.body) {
                rat.update();
            }
        });
        
        // Обновляем блевотину и проверяем попадания
        if (this.player) {
            // Удаляем уничтоженные блевотины
            this.player.vomits = this.player.vomits.filter(vomit => 
                vomit.particles && vomit.particles.length > 0 && 
                vomit.particles.some(p => p && p.active)
            );
            
            this.player.vomits.forEach(vomit => {
                vomit.update();
                
                // Проверяем попадания блевотины в крыс
                this.rats.forEach(rat => {
                    if (!rat.isDestroyed && vomit.isHittingRat(rat)) {
                        this.hitRatWithVomit(vomit, rat);
                    }
                });
            });
        }
    }
    
    hitRatWithVomit(vomit, rat) {
        // Удаляем блевотину и крысу
        vomit.destroy();
        rat.destroy();
        
        // Увеличиваем счет
        this.score += 10;
        this.updateUI();
        
        // Удаляем из массивов
        this.rats = this.rats.filter(r => !r.isDestroyed);
        this.player.vomits = this.player.vomits.filter(v => v !== vomit);
        
        console.log(`Крыса уничтожена! Осталось крыс: ${this.rats.length}/${this.maxRats}`);
    }
    
    gameOver() {
        this.scene.pause();
        if (window.gameInstance) {
            window.gameInstance.showGameOver(this.score);
        }
    }
}