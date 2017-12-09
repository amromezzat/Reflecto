var myBullets = [];
var bulletsGroup;

function Bullet(x, y, rotation, attendedSprite, bulletSpeed) {
    var bullet = game.add.sprite(0, 0, '');
    bullet.height = 5;
    bullet.width = 20;
    bullet.anchor.setTo(0.5, 0.5);
    bullet.checkWorldBounds = true;
    game.physics.arcade.enable(bullet);
    bullet.body.collideWorldBounds = true;
    bullet.body.bounce.setTo(1, 1);
    this.trail = game.add.graphics(0, 0);
    this.positions = [];
    bullet.reset(x, y);
    this.reflected = false;

    this.color = 0XFF0000;
    bullet.lifespan = 4000;
    game.physics.arcade.moveToObject(bullet, attendedSprite, bulletSpeed);
    bulletsGroup.add(bullet);
    this.getSprite = function() {
        return bullet;
    }

    this.reflect = function(x, y, bulletSpeed) {
        bullet.body.velocity.x = x * bulletSpeed;
        bullet.body.velocity.y = y * bulletSpeed;
        this.reflected = true;
        this.color = 0X2e86c1;
    }
    this.destroy = function() {
        this.trail.clear();
        bulletsGroup.remove(bullet);
    }

    this.update = function() {
        if (bullet.alive) {
            this.positions.unshift([bullet.x, bullet.y]);
            if (this.positions.length > 60)
                this.positions.pop();
        } else {
            if (this.positions.length > 50) {
                for (var i = 0; i < this.positions.length; i++) {
                    if (i > 50) {
                        this.positions.splice(i, 1)
                    }
                }
            }
            if (this.positions.length > 1) {
                this.positions.unshift([bullet.x, bullet.y]);
                this.positions.pop();
            } else {
                this.positions = [];
            }
        }
        this.trail.clear();
        for (var i of Array(this.positions.length).keys()) {
            if (i == 0) continue
            this.trail.lineStyle(4, this.color, 1 / (i / 10));
            this.trail.moveTo(this.positions[i - 1][0], this.positions[i - 1][1]);
            this.trail.lineTo(this.positions[i][0], this.positions[i][1]);
        }
        for (let j = 0; j < 50; j++) {
            if (j == 0) continue
            if (this.positions[j] && this.positions[j - 1]) {
                this.trail.lineStyle(2, 0xFFFFFF, .8 / (j / 150))
                this.trail.moveTo(this.positions[j - 1][0], this.positions[j - 1][1]);
                this.trail.lineTo(this.positions[j][0], this.positions[j][1]);
            }
        }
    }
}