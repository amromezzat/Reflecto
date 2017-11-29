function Enemy(x, y) {
    var enemy = game.add.sprite(x, y, 'enemy');
    //enemy animations
    enemy.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 19));
    enemy.animations.add('move', Phaser.ArrayUtils.numberArray(20, 39));
    enemy.animations.add('reload', Phaser.ArrayUtils.numberArray(40, 59));
    enemy.animations.add('shoot', Phaser.ArrayUtils.numberArray(60, 62));
    enemy.animations.play('idle', 60, true);
    //set collision range in a circle wide enough to take enemy rotating around gun nozzle
    game.physics.arcade.enable(enemy);
    enemy.body.setCircle(300, 0, -enemy.height)
    enemy.body.collideWorldBounds = true;
    //set anchor at gun nozzle
    enemy.anchor.setTo(0.93, 0.73);
    enemy.scale.setTo(0.5, 0.5);
    //enemy setters and getters
    this.playAnimations = function(name, frameRate = 60, looping = true) {
        enemy.animations.play(name, frameRate, looping);
    }
}