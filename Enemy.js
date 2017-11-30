var myBullets = [],
    myEnemies = [];
var bulletsGroup, enemiesGroup;

function Enemy(x, y, attackSpeed = 2880, ammo = 2) {
    this.shootNow = attackSpeed;
    this.ammo = ammo;
    this.animSpeed = 10;
    this.reloading = false;
    var moveCase;
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
    //not to bounce on collision
    enemy.body.drag.setTo(100);
    //set anchor at gun nozzle
    enemy.anchor.setTo(0.93, 0.73);
    enemy.scale.setTo(0.5, 0.5);
    enemy.events.onAnimationComplete.add(function() { console.log("complete") }, this);
    enemiesGroup.add(enemy);
    move();

    function createBullet() {
        var bullet = game.add.sprite(enemy.x + 2, enemy.y + 2, 'bullet');
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
        this.shootNow -= this.animSpeed * game.rnd.realInRange(-1, 3);
        enemy.animations.currentAnim.speed = this.animSpeed;
        var angleDiff = game.physics.arcade.angleBetween(enemy, player);
        var ecu1 = Math.abs(enemy.x * Math.cos(angleDiff) - enemy.x)
        var ecu2 = Math.abs(enemy.y * Math.sin(angleDiff) - enemy.y)
        //set collision range in a movable circle with rotation
        ecu1 = ecu1 / 2 < enemy.x + 200 ? ecu1 * 2 : ecu1;
        ecu1 = ecu1 / 2 > 600 ? ecu1 / 2 : ecu1;
        enemy.body.setCircle(60, ecu1 / 2, ecu2 / 2);
        //game.debug.body(enemy);
        enemy.rotation = angleDiff;
        if (this.shootNow <= 0) {
            this.shootNow = attackSpeed;
            shoot();
        }
    }
    this.die = function() {
        var dieAnim = enemy.animations.play('die', this.animSpeed, false);
        this.update = function() {};
        this.shoot = function() {};
        moveCase.stop();
        dieAnim.onComplete.add(function() {
            //set dead enemy animation
            enemy.frame = 80;
            enemy.body.velocity.setTo(0, 0);
            enemy.body.enable = false;
            //destory enemy spirit and remove it from group collision after anime finishes
            //enemiesGroup.remove(enemy);
            //enemy.destroy();
        }, this);
    }

    function move() {
        enemy.animations.play('move', 60, true);
        moveCase = game.add.tween(enemy).to({
            x: game.rnd.integerInRange(150, 600),
            y: game.rnd.integerInRange(150, 400)
        }, 7500, Phaser.Easing.Linear.None, true, 1500);
        moveCase.onComplete.add(function() {
            enemy.animations.play('idle', 60, true);
            move();
        }, this);
    }

    function shoot() {
        if (!this.reloading) {
            this.ammo--;
            var shootAnim = enemy.animations.play('shoot', this.animSpeed, false);
            createBullet();
            shootAnim.onComplete.add(function() {
                //if there is still ammo continue last animation idle or move
                //or shoot lock and play reloading animation
                if (this.ammo >= 0) {
                    if (this.lastAnim) {
                        this.lastAnim.play();
                    }
                } else {
                    this.reloading = true;
                    var reload = enemy.animations.play('reload', this.animSpeed, false);
                    //on reload finish reset ammo value and remove the lock
                    reload.onComplete.add(function() {
                        this.ammo = ammo;
                        this.reloading = false;
                    }, this);
                }
            }, this);
        }
    }
    this.getSprite = function() {
        return enemy;
    }
}