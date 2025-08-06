class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.health = 100;
        this.ammo = 10;
        this.rats = [];
        this.vomits = [];
        this.maxRats = 10; // Максимальное количество крыс
    }
    
    preload() {
        // Загружаем GIF крысу
        this.load.image('rat-gif', 'assets/images/rat.gif');
        
        // Загружаем PNG бомжа
        this.load.image('bomzh', 'assets/images/bomzh.png');
        
        console.log('GameScene: preload completed');
    }
    
    create() {
        console.log('GameScene: create started');
        this.createBackground();
        this.createPlayer();
        this.createRats();
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
        
        // Обновляем UI
        this.updateUI();
        console.log('GameScene: create completed');
    }
    
    createBackground() {
        // Создаем фон улицы
        const graphics = this.add.graphics();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 1200, 800);
        
        // Добавляем дорогу
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 600, 1200, 200);
        
        // Добавляем здания (простые прямоугольники)
        graphics.fillStyle(0x444444);
        graphics.fillRect(0, 0, 200, 400);
        graphics.fillRect(250, 0, 200, 350);
        graphics.fillRect(500, 0, 200, 450);
        graphics.fillRect(750, 0, 200, 380);
        graphics.fillRect(1000, 0, 200, 420);
        
        // Добавляем окна
        graphics.fillStyle(0xffff00);
        for (let x = 20; x < 180; x += 40) {
            for (let y = 50; y < 350; y += 60) {
                graphics.fillRect(x, y, 20, 30);
            }
        }
        
        // Аналогично для других зданий
        for (let building = 0; building < 4; building++) {
            const startX = 270 + building * 250;
            for (let x = startX; x < startX + 160; x += 40) {
                for (let y = 50; y < 300; y += 60) {
                    graphics.fillRect(x, y, 20, 30);
                }
            }
        }
    }
    
    createPlayer() {
        this.player = new Player(this, 600, 700);
    }
    
    createRats() {
        this.ratsGroup = this.physics.add.group();
    }
    
    spawnRat() {
        // Проверяем, не превышено ли максимальное количество крыс
        if (this.rats.length < this.maxRats) {
            // Случайная позиция по всей карте
            const x = Phaser.Math.Between(100, 1100);
            const y = Phaser.Math.Between(100, 700); // От 100 до 700 вместо только 750
            
            const rat = new Rat(this, x, y);
            this.rats.push(rat);
            this.ratsGroup.add(rat.sprite);
            
            console.log(`Крыса создана. Всего крыс: ${this.rats.length}/${this.maxRats}`);
        }
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
        // Игрок получает урон
        this.health -= 10;
        this.updateUI();
        
        // НЕ удаляем крысу - она остается живой
        // rat.destroy(); // Убираем эту строку!
        
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
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    
    createUI() {
        // UI создается в HTML
    }
    
    updateUI() {
        if (window.updateUI) {
            window.updateUI(this.score, this.health, this.ammo);
        }
    }
    
    update() {
        if (this.player) {
            this.player.update(this.cursors, this.wasd, this.spaceKey, this.rKey);
        }
        
        // Удаляем уничтоженные крысы из массива
        this.rats = this.rats.filter(rat => !rat.isDestroyed);
        
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