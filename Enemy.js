var myEnemies = [];
var enemiesGroup;
/*///////////////////
/x:enemy x position
/y: enemy y position
/fireRate: enemy fire rate
/clipSize: number of bullets shoot before reload
/bulletSpeed: the speed of fired bullet
/movementSpeed: the speed of the enemy movement
/restDuration: the time the enemy stops before starting to move again
///////////////////*/
function Enemy(x, y, fireRate = 2880, clipSize = 2, bulletSpeed = 500, movementSpeed = 7500, restDuration = 1500) {
    this.shootNow = fireRate;
    this.ammo = clipSize;
    this.animSpeed = 10;
    this.reloading = false;
    var reloadingTimeout = 30 / this.animSpeed;
    this.moveCase;
    var enemy = game.add.sprite(x, y, 'enemy');
    //enemy animations
    enemy.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 19));
    enemy.animations.add('move', Phaser.ArrayUtils.numberArray(20, 39));
    enemy.animations.add('reload', Phaser.ArrayUtils.numberArray(40, 59));
    enemy.animations.add('shoot', Phaser.ArrayUtils.numberArray(60, 62));
    enemy.animations.add('die', Phaser.ArrayUtils.numberArray(63, 80));
    this.lastAnim = enemy.animations.play('idle', 60, true);

    game.physics.arcade.enable(enemy);

    enemy.body.collideWorldBounds = true;
    //slow enemy bodies when collide until stop
    // enemy.body.bounce.set(0.5);
    //set anchor at gun nozzle
    //enemy.anchor.setTo(0.93, 0.73);
    enemy.anchor.setTo(0.304, 0.58);
    enemy.scale.setTo(0.4, 0.4);
	enemy.body.bounce.setTo(0.2, 0.2);
    enemiesGroup.add(enemy);

    this.update = function(player) 
	{
        //this.animSpeed = this.animSpeed || 60;
        this.shootNow -= this.animSpeed * game.rnd.realInRange(-1, 4);
        enemy.animations.currentAnim.speed = this.animSpeed;
        var angleDiff = game.physics.arcade.angleBetween(enemy, player);
        //set collision range in a movable circle with rotation
        enemy.body.setCircle(80);
        //game.debug.body(enemy);
        enemy.rotation = angleDiff;
        if (!this.shootNow || this.shootNow <= 0) {
            this.shootNow = fireRate;
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
        this.update = function() { game.world.sendToBack(enemy); };
        this.shoot = function() {};
        this.moveCase.stop();
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

    this.move = function() {
        var animSpeed = this.animSpeed;
        //console.log(this.animSpeed)
        enemy.animations.play('move', animSpeed, true);
        this.moveCase = game.add.tween(enemy).to({
            x: game.rnd.integerInRange(150, 600),
            y: game.rnd.integerInRange(150, 400)
        }, movementSpeed, Phaser.Easing.Linear.None, true, restDuration);
        this.moveCase.onComplete.add(function() {
            enemy.animations.play('idle', animSpeed, true);
            this.move();
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
            var bullet = new Bullet(enemy.x + 2, enemy.y + 2, enemy.rotation, player);
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
    this.move();
    if (this.moveCase)
        this.moveCase.frameBased = true;
}