class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        // Создаем фон с анимацией
        this.createAnimatedBackground();
        
        // Добавляем текст заголовка
       
        
        // Подзаголовок
       
        
        // Анимированные элементы
        this.createMenuElements();
    }
    
    createAnimatedBackground() {
        // Создаем градиентный фон
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        graphics.fillRect(0, 0, 1200, 800);
        
        // Добавляем анимированные частицы
        for (let i = 0; i < 50; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, 1200),
                Phaser.Math.Between(0, 800),
                2,
                0xffffff,
                0.3
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y - 100,
                alpha: 0,
                duration: 3000,
                ease: 'Power2',
                repeat: -1,
                delay: i * 100
            });
        }
    }
    
    createMenuElements() {
        // Анимированные иконки
        const playerIcon = this.add.circle(400, 500, 30, 0xff6b35);
        const ratIcon = this.add.circle(800, 500, 20, 0x8b4513);
        
        // Анимация иконок
        this.tweens.add({
            targets: playerIcon,
            y: playerIcon.y - 20,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        this.tweens.add({
            targets: ratIcon,
            x: ratIcon.x + 30,
            duration: 800,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
}