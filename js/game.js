// Конфигурация и настройки игры
class GameConfig {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1200,
            height: 800,
            parent: 'game-container',
            backgroundColor: '#1e3c72',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [MainMenuScene, GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            audio: {
                disableWebAudio: false
            },
            render: {
                pixelArt: false,
                antialias: true
            }
        };
        
        // Игровые константы
        this.gameSettings = {
            player: {
                speed: 200,
                health: 100,
                maxAmmo: 10,
                reloadTime: 2000
            },
            rat: {
                minSpeed: 50,
                maxSpeed: 150,
                spawnInterval: 2000,
                maxRats: 10
            },
            vomit: {
                speed: 300,
                lifetime: 3000,
                damage: 1
            },
            scoring: {
                ratKill: 10,
                healthLoss: 10
            }
        };
        
        // Цвета игры
        this.colors = {
            player: 0x8B4513,
            playerHead: 0xFFE4B5,
            playerArms: 0x8B4513,
            playerLegs: 0x2F4F4F,
            playerBeard: 0x654321,
            rat: 0x8B4513,
            ratHead: 0x654321,
            ratEyes: 0xFF0000,
            vomit: 0x90EE90,
            background: 0x1e3c72,
            road: 0x666666,
            buildings: 0x444444,
            windows: 0xffff00,
            blood: 0xFF0000
        };
        
        // Размеры объектов
        this.sizes = {
            player: 25,
            playerHead: 15,
            rat: 12,
            ratHead: 8,
            vomit: 8,
            buildingWidth: 200,
            buildingHeight: 400,
            windowWidth: 20,
            windowHeight: 30
        };
    }
    
    // Получить конфигурацию Phaser
    getPhaserConfig() {
        return this.config;
    }
    
    // Получить настройки игры
    getGameSettings() {
        return this.gameSettings;
    }
    
    // Получить цвета
    getColors() {
        return this.colors;
    }
    
    // Получить размеры
    getSizes() {
        return this.sizes;
    }
    
    // Получить конкретную настройку
    getSetting(category, setting) {
        return this.gameSettings[category][setting];
    }
    
    // Получить конкретный цвет
    getColor(colorName) {
        return this.colors[colorName];
    }
    
    // Получить конкретный размер
    getSize(sizeName) {
        return this.sizes[sizeName];
    }
}

// Глобальные утилиты для игры
class GameUtils {
    // Создание случайного числа в диапазоне
    static random(min, max) {
        return Phaser.Math.Between(min, max);
    }
    
    // Создание случайной позиции на экране
    static randomPosition(scene) {
        return {
            x: this.random(100, scene.game.config.width - 100),
            y: this.random(100, scene.game.config.height - 100)
        };
    }
    
    // Создание случайной позиции на дороге
    static randomRoadPosition(scene) {
        return {
            x: this.random(100, scene.game.config.width - 100),
            y: this.random(700, 750)
        };
    }
    
    // Проверка, находится ли объект в пределах экрана
    static isOnScreen(x, y, scene) {
        return x >= 0 && x <= scene.game.config.width && 
               y >= 0 && y <= scene.game.config.height;
    }
    
    // Создание эффекта частиц
    static createParticleEffect(scene, x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            const particle = scene.add.circle(
                x + this.random(-10, 10),
                y + this.random(-10, 10),
                this.random(2, 4),
                color
            );
            
            scene.tweens.add({
                targets: particle,
                x: particle.x + this.random(-30, 30),
                y: particle.y + this.random(-30, 30),
                alpha: 0,
                duration: this.random(500, 1000),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    // Создание текста с тенью
    static createTextWithShadow(scene, x, y, text, fontSize = '32px', color = '#ffffff') {
        const textObject = scene.add.text(x, y, text, {
            fontSize: fontSize,
            fill: color,
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 2
        });
        textObject.setOrigin(0.5);
        return textObject;
    }
}

// Глобальные переменные для доступа к конфигурации
window.GameConfig = GameConfig;
window.GameUtils = GameUtils;