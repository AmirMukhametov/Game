class Bottle {
    constructor(scene, x, y) {
        this.scene = scene;
        this.isDestroyed = false;
        
        // Создаем спрайт бутылки из PNG
        this.sprite = scene.add.sprite(x, y, 'bottle');
        
        // Устанавливаем размер (подстройте под вашу картинку)
        this.sprite.setScale(1); // Уменьшаем размер в 2 раза
        
        // Добавляем физику
        scene.physics.add.existing(this.sprite);
        
        // Устанавливаем хитбокс для бутылки
        this.sprite.body.setSize(10, 40); // Хитбокс на всю высоту бутылки
    }
    
    destroy() {
        // Принудительно уничтожаем спрайт
        if (this.sprite) {
            this.sprite.setVisible(false);
            this.sprite.setActive(false);
            this.sprite.destroy();
            this.sprite = null;
        }
        
        this.isDestroyed = true;
    }
}