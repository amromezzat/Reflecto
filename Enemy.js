var myBullets = [],
    myEnemies = [];
var bulletsGroup, enemiesGroup;

function Enemy(x, y) {
    this.animSpeed = 60;
    var enemy = game.add.sprite(x, y, 'enemy');
    //enemy animations
    enemy.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 19));
    enemy.animations.add('move', Phaser.ArrayUtils.numberArray(20, 39));
    enemy.animations.add('reload', Phaser.ArrayUtils.numberArray(40, 59));
    enemy.animations.add('shoot', Phaser.ArrayUtils.numberArray(60, 62));
    enemy.animations.add('die', Phaser.ArrayUtils.numberArray(63, 81));
    enemy.animations.play('idle', 60, true);

    game.physics.arcade.enable(enemy);
    //set collision range in a circle wide enough to take enemy rotating around gun nozzle
    //enemy.body.setCircle(300, 0, -enemy.height)
    enemy.body.collideWorldBounds = true;
    //set anchor at gun nozzle
    enemy.anchor.setTo(0.93, 0.73);
    enemy.scale.setTo(0.5, 0.5);
    enemy.events.onAnimationComplete.add(function() { console.log("complete") }, this);
    enemiesGroup.add(enemy);
    //enemy setters and getters
    this.playAnimations = function(name, frameRate = 60, looping = true) {
        enemy.animations.play(name, frameRate, looping);
    }
    this.createBullet = function() {
        var bullet = game.add.sprite(enemy.x + 1, enemy.y + 1, 'bullet');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.scale.setTo(0.25, 0.25);
        game.physics.arcade.enable(bullet);
        bullet.body.collideWorldBounds = true;
        bullet.body.bounce.setTo(1.0, 1.0);
        //Move bullet to Player Location (Our Main Usage)
        game.physics.arcade.moveToObject(bullet, player, bulletSpeed);
        bulletsGroup.add(bullet);
        var bulletArr = [bullet, 3];
        myBullets.push(bulletArr);
    }
    this.update = function(player) {
        enemy.animations.currentAnim.speed = this.animSpeed;
        enemy.rotation = game.physics.arcade.angleBetween(enemy, player);
    }
    this.die = function() {
        enemy.animations.play('die', this.animSpeed, true);
        setTimeout(function() {
                enemy.destroy();
                enemiesGroup.remove(enemy);
            },
            15000 / this.animSpeed);
        this.update = function() {};
    }
    this.shoot = function() {
        enemy.animations.play('shoot', this.animSpeed, true);
        this.createBullet();
    }
    this.getSprite = function() {
        return enemy;
    }
}