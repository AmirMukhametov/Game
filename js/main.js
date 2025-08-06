// Основной файл для инициализации игры
class Game {
    constructor() {
        // Создаем конфигурацию игры
        this.gameConfig = new GameConfig();
        
        // Инициализируем Phaser с конфигурацией
        this.game = new Phaser.Game(this.gameConfig.getPhaserConfig());
        
        // Инициализируем UI
        this.initUI();
        
        console.log('Game initialized');
    }
    
    initUI() {
        // Обработчики для кнопок
        document.getElementById('start-btn').addEventListener('click', () => {
            console.log('Start button clicked');
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            console.log('Restart button clicked');
            this.restartGame();
        });
    }
    
    startGame() {
        console.log('Starting game...');
        document.getElementById('start-screen').classList.add('hidden');
        this.game.scene.start('GameScene');
    }
    
    restartGame() {
        console.log('Restarting game...');
        document.getElementById('game-over-screen').classList.add('hidden');
        this.game.scene.start('GameScene');
    }
    
    showGameOver(score) {
        document.getElementById('final-score').textContent = score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    // Геттеры для доступа к настройкам
    getGameSettings() {
        return this.gameConfig.getGameSettings();
    }
    
    getColors() {
        return this.gameConfig.getColors();
    }
    
    getSizes() {
        return this.gameConfig.getSizes();
    }
}

// Глобальные переменные для UI
window.updateUI = function(score, health, ammo) {
    const scoreElement = document.getElementById('score-value');
    const healthElement = document.getElementById('health-value');
    const ammoElement = document.getElementById('ammo-value');
    
    if (scoreElement) scoreElement.textContent = score;
    if (healthElement) healthElement.textContent = health;
    if (ammoElement) ammoElement.textContent = ammo; // Убедитесь, что эта строка есть
};

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    console.log('Page loaded, initializing game...');
    window.gameInstance = new Game();
});