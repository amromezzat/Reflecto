var myBullets = [];
var bulletsGroup;

function Bullet(x, y, attendedSprite) {
    var bullet = game.add.sprite(x, y, 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(0.25, 0.25);
    game.physics.arcade.enable(bullet);
    bullet.body.collideWorldBounds = true;
    bullet.body.bounce.setTo(1.0, 1.0);
    //Move bullet to Player Location (Our Main Usage)
    game.physics.arcade.moveToObject(bullet, attendedSprite, Bullet.speed);
    bulletsGroup.add(bullet);
    var bulletArr = [bullet, 3];
    myBullets.push(bulletArr);
}
Bullet.speed = 500;