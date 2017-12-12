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

    function tweenTint(obj, startColor, endColor, time) { // create an object to tween with our step value at 0
        var colorBlend = { step: 0 }; // create the tween on this object and tween its step property to 100   
        var colorTween = game.add.tween(colorBlend).to({ step: 100 }, time); // run the interpolateColor function every time the tween updates, feeding it the    
        // updated value of our tween each time, and set the result as our tint    
        colorTween.onUpdateCallback(function() {
            obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
        }); // set the object to the start color straight away    
        obj.tint = startColor; // start the tween    
        colorTween.start();
    }

    this.reflect = function() {
        this.shootNow += 1000;
        tweenTint(enemy, 0X0000FF, 0XFFFFFF, this.animSpeed * 100);
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
        safeEnemyBullet.push(bullet);
        game.time.events.add(200, function() {
            safeEnemyBullet.splice(safeEnemyBullet.indexOf(bullet), 1);
            myBullets.push(bullet);
        }, this);
    }

    this.getSprite = function() {
        return enemy;
    }
    this.move();
    //movement tween is affected by frameRate speed
    if (this.movement)
        this.movement.frameBased = true;
}