var myEnemies = [];
var enemiesGroup;

function Enemy(x, y, attackSpeed = 2880, clipSize = 2, bulletSpeed = 500) {
    this.shootNow = attackSpeed;
    this.ammo = clipSize;
    this.animSpeed = 10;
    this.reloading = false;
    var reloadingTimeout = 30 / this.animSpeed;
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
    //slow enemy bodies when collide until stop
    enemy.body.bounce.set(0.1);
    //set anchor at gun nozzle
    enemy.anchor.setTo(0.93, 0.73);
    enemy.scale.setTo(0.5, 0.5);
    game.world.bringToTop(enemy);
    enemiesGroup.add(enemy);
    move();

    this.update = function(player) {
        this.animSpeed = this.animSpeed || 60;
        this.shootNow -= this.animSpeed * game.rnd.realInRange(-1, 4);
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
        if (!this.shootNow || this.shootNow <= 0) {
            this.shootNow = attackSpeed;
            var lineOfFire = new Phaser.Rectangle(enemy.x, enemy.y, player.x, player.y);

            var friendlyFire = false;
            for (var i = 0; i < myEnemies.length; i++) {
                var cEnemy = myEnemies[i].getSprite();
                if (cEnemy != enemy) {
                    if (Phaser.Rectangle.intersects(lineOfFire, cEnemy.getBounds())) {
                        friendlyFire = true;
                    }
                }
            }
            if (!friendlyFire) {
                shoot(player);
            }
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
            game.world.sendToBack(enemy);
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

    function shoot(player) {
        if (this.reloading) {
            // console.log("timeout:" + reloadingTimeout)
            // console.log("relo:" + this.reloading)
            // console.log("clipSize:" + this.ammo)
            reloadingTimeout--;
            if (!reloadingTimeout || reloadingTimeout <= 0) {
                reloadingTimeout = 30 / this.animSpeed;
                this.reloading = false;
                this.ammo = clipSize;
            }
        } else {
            reloadingTimeout = this.animSpeed / this.animSpeed;
            this.ammo--;
            var shootAnim = enemy.animations.play('shoot', this.animSpeed, false);
            //create bullet sprite directed at enemy
            var bullet = new Bullet(enemy.x + 2, enemy.y + 2, player);
            myBullets.push(bullet);
            shootAnim.onComplete.add(function() {
                //if there is still ammo continue last animation idle or move
                //or shoot lock and play reloading animation
                if (this.ammo >= 0) {
                    if (this.lastAnim) {
                        this.lastAnim.play();
                    } else {
                        enemy.animations.play('idle', this.animSpeed, true);
                    }
                } else {
                    this.reloading = true;
                    var reload = enemy.animations.play('reload', this.animSpeed, false);
                    //on reload finish reset clipSize value and remove the lock
                    reload.onComplete.add(function() {
                        this.ammo = clipSize;
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