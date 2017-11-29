var myBullets = [],
    myEnemies = [];
var bulletsGroup, enemiesGroup;

function Enemy(x, y, attackSpeed = 2880) {
    this.shootNow = attackSpeed;
    this.ammo = 2;
    this.animSpeed = 10;
    this.reloading = false;
    var enemy = game.add.sprite(x, y, 'enemy');
    //enemy animations
    enemy.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 19));
    enemy.animations.add('move', Phaser.ArrayUtils.numberArray(20, 39));
    enemy.animations.add('reload', Phaser.ArrayUtils.numberArray(40, 59));
    enemy.animations.add('shoot', Phaser.ArrayUtils.numberArray(60, 62));
    enemy.animations.add('die', Phaser.ArrayUtils.numberArray(63, 81));
    this.lastAnim = enemy.animations.play('idle', 60, true);

    game.physics.arcade.enable(enemy);

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
        this.shootNow -= this.animSpeed;
        enemy.animations.currentAnim.speed = this.animSpeed;
        var angleDiff = game.physics.arcade.angleBetween(enemy, player);
        //set collision range in a circle wide enough to take enemy rotating around gun nozzle
        enemy.body.setCircle(120, enemy.width - x * Math.cos(angleDiff), enemy.height - y * Math.sin(angleDiff))
        //game.debug.body(enemy);
        enemy.rotation = angleDiff;
        if (this.shootNow <= 0) {
            this.shootNow = attackSpeed;
            this.shoot();
        }
    }
    this.die = function() {
        var dieAnim = enemy.animations.play('die', this.animSpeed, false);
        this.update = function() {};
        this.shoot = function() {};

        dieAnim.onComplete.add(function() {
            //set dead enemy animation
            enemy.frame = 80;
            enemy.body.velocity.setTo(0, 0)
            //destory enemy spirit and remove it from group collision after anime finishes
            //enemiesGroup.remove(enemy);
            //enemy.destroy();
        }, this);
    }
    this.shoot = function() {
        if (!this.reloading) {
            this.ammo--;
            var shootAnim = enemy.animations.play('shoot', this.animSpeed, false);
            this.createBullet();
            shootAnim.onComplete.add(function() {
                //if there is still ammo continue last animation idle or move
                //or shoot lock and play reloading animation
                if (this.ammo > 0) {
                    this.lastAnim.play();
                } else {
                    this.reloading = true;
                    var reload = enemy.animations.play('reload', this.animSpeed, false);
                    //on reload finish reset ammo value and remove the lock
                    reload.onComplete.add(function() {
                        this.ammo = 30;
                        this.reloading = false;
                    }, this)
                }
            }, this);
        }
    }
    this.getSprite = function() {
        return enemy;
    }
}