var myBullets = [];
var bulletsGroup;

function Bullet(x, y, attendedSprite) {

    var bullet = game.add.sprite(x, y, 'bullet1');
    this.wallHitCount = 3;
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(0.25, 0.25);
    game.physics.arcade.enable(bullet);
    bullet.body.collideWorldBounds = true;
    bullet.body.bounce.setTo(1.0, 1.0);
    //Move bullet to Player Location (Our Main Usage)
    game.physics.arcade.moveToObject(bullet, attendedSprite, Bullet.speed);
    game.world.bringToTop(bullet);
    bulletsGroup.add(bullet);
    var trailEmitter = makeEmitter(['cloud'], 0.2);

    this.update = function() {
        updateEmitter();
    }

    this.getSprite = function() {
        return bullet;
    }
    this.destroy = function() {
        this.update = function() {};
        trailEmitter.destroy();
    }
    this.reflect = function() {
        trailEmitter.destroy();
        bulletsGroup.remove(bullet);
        bullet.loadTexture('bullet2');
        bulletsGroup.add(bullet);
        trailEmitter = makeEmitter(['fire1', 'fire2', 'fire3', 'smoke'], 0.4);
    }

    function makeEmitter(frames, alpha = 0.6) {
        var emitter = game.add.emitter(game.world.centerX, game.world.centerY, 400);
        emitter.makeParticles(frames, 0, 250, true, true);
        emitter.gravity = 200;
        emitter.setAlpha(alpha, 0, 3000);
        emitter.setScale(0.1, 0, 0.1, 0, 3000);
        emitter.maxParticleSpeed = 0;
        emitter.particleSendToBack = true;
        emitter.start(false, 250, 0);
        return emitter;
    }

    function updateEmitter() {
        //show trailEmittering path after bullet
        var px = bullet.body.velocity.x;
        var py = bullet.body.velocity.y;

        px *= -1;
        py *= -1;

        trailEmitter.minParticleSpeed = new Phaser.Point(px, py);
        trailEmitter.maxParticleSpeed = new Phaser.Point(px, py);
        trailEmitter.x = bullet.x;
        trailEmitter.y = bullet.y;
    }
}
Bullet.speed = 500;