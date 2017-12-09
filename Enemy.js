var myEnemies = [];
var enemiesGroup;

/*///////////////////
/x:enemy x position
/y:enemy y position
/fireDelay: enemy fire rate
/bulletSpeed: the speed of fired bullet
/movementSpeed: the speed of the enemy movement
/restDuration: the time the enemy stops before starting to move again
///////////////////*/
function Enemy(x, y, fireDelay = 6000, bulletSpeed = 500, movementSpeed = 7500, restDuration = 1500) {
    this.shootNow = fireDelay;
    this.animSpeed = 10;
    var angleDiff;
    this.movement;
    var enemy = game.add.sprite(x, y, 'enemy');
    
    //enemy animations
    generateSprite(enemy, false);

    game.physics.arcade.enable(enemy);

    enemy.body.collideWorldBounds = true;
    enemy.anchor.setTo(0.5, 0.5);
    //enemy.scale.setTo(0.5, 0.5);
    enemiesGroup.add(enemy);
    this.update = function(player) {
        this.shootNow -= this.animSpeed * game.rnd.realInRange(-1, 4);
        enemy.animations.currentAnim.speed = this.animSpeed;
        angleDiff = game.physics.arcade.angleBetween(enemy, player);
        enemy.body.setCircle(35, 15, 3);
        enemy.animations.play(spriteDirecFromAngle(Phaser.Math.radToDeg(angleDiff)), this.animSpeed / 60, true);
        //game.debug.body(enemy);
        if (!this.shootNow || this.shootNow <= 0) {
            this.shootNow = fireDelay;
            shoot(player);
        }
    }

    this.die = function() {
        playAudio(explosion, 0.1);
        var dieAnim = enemy.animations.play(spriteDirecFromAngle(Phaser.Math.radToDeg(angleDiff)) + "-die", 1, false);
        this.update = function() { game.world.sendToBack(enemy); };
        this.shoot = function() {};
        this.movement.stop();
        dieAnim.onComplete.add(function() {
            //set dead enemy animation
            enemy.body.velocity.setTo(0, 0);
            enemy.body.enable = false;
        }, this);
    }

    this.move = function() {
        enemy.animations.play(spriteDirecFromAngle(Phaser.Math.radToDeg(angleDiff)), this.animSpeed * 1000000, true);
        this.movement = game.add.tween(enemy).to({
            x: game.rnd.integerInRange(150, 600),
            y: game.rnd.integerInRange(150, 400)
        }, movementSpeed, Phaser.Easing.Linear.None, true, restDuration);
        this.movement.onComplete.add(function() {
            this.move();
        }, this);
    }

    function shoot(player) {
        playAudio(blaster, 0.1);
        var shoot = enemy.animations.play(spriteDirecFromAngle(Phaser.Math.radToDeg(angleDiff)) + "-shoot", 1, true);
        //create bullet sprite directed at enemy
        var bullet = new Bullet(enemy.x, enemy.y, angleDiff, player, bulletSpeed);
        myBullets.push(bullet);
    }

    this.getSprite = function() {
        return enemy;
    }
    this.move();
    //movement tween is affected by frameRate speed
    if (this.movement)
        this.movement.frameBased = true;
}