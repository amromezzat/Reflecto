var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player, arrow, cursors, upButton, downButton, leftButton, rightButton;
var speed = 200;
var myArc, relfectFlag = 0;
var items
//Pad Variables
var padAimX, padAimY, lastpadAimX = 0,
    lastpadAimY = 0,
    pressFlagR1 = 0,
    padFlag = 0;


function preload() {
    game.load.image('fire1', 'assets/sprites/fire1.png');
    game.load.image('fire2', 'assets/sprites/fire2.png');
    game.load.image('fire3', 'assets/sprites/fire3.png');
    game.load.image('smoke', 'assets/sprites/smoke-puff.png');
    game.load.image('cloud', 'assets/sprites/cloud.png');
    game.load.image('floor', 'assets/sprites/floor.png');
    game.load.image('player', 'assets/sprites/player.png');
    game.load.image('bullet1', 'assets/sprites/bullet1.png');
    game.load.image('bullet2', 'assets/sprites/bullet2.png');
    game.load.image('arrow', 'assets/sprites/arrow.png');
    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 313, 207)
}

function create() {
    //Set Background and Center Game
    game.add.tileSprite(0, 0, 800, 600, 'floor');
    game.stage.backgroundColor = '#FFFFFF';
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    //Create Groups
    bulletsGroup = game.add.group();
    enemiesGroup = game.add.group();

    //Create Player
    player = game.add.sprite(200, 400, 'player');

    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    game.world.bringToTop(player);

    //Create Arrow
    arrow = game.add.sprite(200, 400, 'arrow');
    arrow.anchor.setTo(0, 0.5);
    arrow.scale.setTo(0.05, 0.05);
    game.physics.arcade.enable(arrow);

    //Keyboard and Mouse
    cursors = game.input.keyboard.createCursorKeys();
    upButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);

    //Gamepad 
    if (padFlag) {
        game.input.gamepad.start();
        pad1 = game.input.gamepad.pad1;
    }


    //Create Enimes
    enemy2 = new Enemy(200, 200)
    enemy1 = new Enemy(600, 200)
    myEnemies.push(enemy2)
    myEnemies.push(enemy1)
}

function update() {
    if (player) {
        for (let i = 0; i < myEnemies.length; i++) {
            myEnemies[i].update(player);
            if (myArc && myEnemies[i]) {
                if (checkOverlap(myEnemies[i].getSprite(), myArc)) {
                    //console.log("Enemy Attacked");
                    myEnemies[i].die();
                    myEnemies.splice(i, 1);
                }
            }
        }
        for (let i = 0; i < myBullets.length; i++) {
            myBullets[i].update();
        }
        //Choose Between Keyboard or Gamepad
        if (padFlag)
            movePlayerPad();
        else
            movePlayer();

        //Control Arrow Movement
        arrow.position.x = player.position.x;
        arrow.position.y = player.position.y;
    }

    //Check Bullet Collison
    for (let i = 0; i < myBullets.length; i++) {
        checkBulletCollison(myBullets[i]);
    }
    if (relfectFlag) {
        myArc.destroy();
        myArc = null;
        relfectFlag = 0;
    }
    //enemies collide
    game.physics.arcade.collide(enemiesGroup, enemiesGroup);


}

function checkBulletCollison(myBullet) {
    var bulletSprite = myBullet.getSprite();
    if (bulletSprite) {
        //Check Border and Bullet Collision
        if (bulletSprite.body.blocked.left || bulletSprite.body.blocked.right ||
            bulletSprite.body.blocked.up || bulletSprite.body.blocked.down) {
            myBullet.wallHitCount--;
            if (myBullet.wallHitCount == 0) {
                bulletSearchDestroy(bulletSprite);
            }
        }
        //Check Player and Bullet Collision
        game.physics.arcade.collide(bulletSprite, player, bpCollision);

        //Check Bullet and Bullet Collision
        try {
            game.physics.arcade.collide(bulletSprite, bulletsGroup, bbCollision);
        } catch (err) {
            console.log(err.message);
        }

        //check bullet and enemy collision
        game.physics.arcade.collide(bulletSprite, enemiesGroup, beCollision);

        //Reflection Check without using physics
        if (myArc && bulletSprite) {
            if (checkOverlap(bulletSprite, myArc)) {
                reflect(myBullet);
                relfectFlag = 1;
            }
        }
    }
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function reflect(b) {
    if (player) {
        var xdir, ydir, norm;
        if (padFlag) {
            xdir = (padAimX + lastpadAimX) - player.position.x;
            ydir = (padAimY + lastpadAimY) - player.position.y;
        } else {
            xdir = game.input.mousePointer.x - player.position.x;
            ydir = game.input.mousePointer.y - player.position.y;
        }

        norm = Math.sqrt((xdir * xdir) + (ydir * ydir));
        xdir = xdir / norm;
        ydir = ydir / norm;
        b.getSprite().body.velocity.x = xdir * (Bullet.speed * 1.25);
        b.getSprite().body.velocity.y = ydir * (Bullet.speed * 1.25);

        b.reflect();
    }

}

function bpCollision(b) {
    player.destroy();
    player = null;
    arrow.destroy();
    arrow = null;
    bulletSearchDestroy(b);
}

function bbCollision(b1, b2) {
    bulletSearchDestroy(b1);
    bulletSearchDestroy(b2);
}

function beCollision(b, e) {
    for (let i = 0; i < myEnemies.length; i++) {
        if (myEnemies[i].getSprite() == e) {
            myEnemies[i].die();
            myEnemies.splice(i, 1);
        }
    }
    bulletSearchDestroy(b);
}

function bulletSearchDestroy(bullet) {
    for (let i = 0; i < myBullets.length; i++) {
        if (myBullets[i].getSprite() == bullet) {
            myBullets[i].destroy();
            bullet.body.enable = false;
            setTimeout(function() {
                bulletsGroup.remove(bullet);
                bullet.destroy();
            }, 100);

            myBullets.splice(i, 1);
        }
    }
}

function movePlayer() {
    slowTime();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (upButton.isDown) {
        player.body.velocity.y = -speed;
        resetTime();
    } else if (downButton.isDown) {
        player.body.velocity.y = speed;
        resetTime();
    }
    if (leftButton.isDown) {
        player.body.velocity.x = -speed;
        resetTime();
    } else if (rightButton.isDown) {
        player.body.velocity.x = speed;
        resetTime();
    }

    //Control Arrow Direction
    arrow.rotation = game.physics.arcade.angleToPointer(arrow);

    //Create Bullet on Click
    game.input.activePointer.leftButton.onDown.add(slash, this);

}

function slash() {
    if (player) {
        var graphics = game.add.graphics(player.position.x, player.position.y);
        graphics.alpha = 0.0;

        if (padFlag)
            var angle = game.physics.arcade.angleToXY(arrow, padAimX + lastpadAimX, padAimY + lastpadAimY); //Use with Gamepad
        else
            var angle = game.physics.arcade.angleToPointer(arrow); //Use with Keyboard

        graphics.lineStyle(72, 0xff0000);
        graphics.arc(0, 0, 90, angle - game.math.degToRad(36), angle + game.math.degToRad(36), false);

        myArc = game.add.sprite(player.position.x, player.position.y, graphics.generateTexture());
        myArc.anchor.setTo(0.5, 0.5);
        myArc.alpha = 0.3;

        graphics.lifespan = 1;
        setTimeout(function() {
            if (myArc) {
                myArc.destroy();
                myArc = null;
            }
        }, 100);
    }
}

function movePlayerPad() {
    slowTime();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    var aimXChange = 0,
        aimYChange = 0;

    padAimX = player.position.x;
    padAimY = player.position.y;

    if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
        player.body.velocity.x = -speed;
        resetTime();
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
        player.body.velocity.x = speed;
        resetTime();
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }
    if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
        player.body.velocity.y = -speed;
        resetTime();
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
        player.body.velocity.y = speed;
        resetTime();
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }

    if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -0.1) {
        padAimX = player.position.x - 100;
        lastpadAimX = -100;
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
        aimXChange = 1;
    } else if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) > 0.1) {
        padAimX = player.position.x + 100;
        lastpadAimX = 100;
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
        aimXChange = 1;
    }
    if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) < -0.1) {
        padAimY = player.position.y - 100;
        lastpadAimY = -100;
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
        aimYChange = 1;
    } else if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) > 0.1) {
        padAimY = player.position.y + 100;
        lastpadAimY = 100;
        //arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
        aimYChange = 1;
    }
    if (pad1.justPressed(Phaser.Gamepad.XBOX360_RIGHT_BUMPER)) {
        pressFlagR1 = 1;
    }
    if (pad1.justReleased(Phaser.Gamepad.XBOX360_RIGHT_BUMPER) && pressFlagR1) {
        slash();
        pressFlagR1 = 0;
    }
    if (aimXChange && !aimYChange) {
        lastpadAimY = 0;
    } else if (!aimXChange && aimYChange) {
        lastpadAimX = 0;
    }
    arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX + lastpadAimX, padAimY + lastpadAimY);
}

function slowTime() {
    for (let i = 0; i < myEnemies.length; i++) {
        myEnemies[i].animSpeed = 10;
    }
    game.time.slowMotion = 6;
    game.time.desiredFps = 360;
}

function resetTime() {
    for (let i = 0; i < myEnemies.length; i++) {
        myEnemies[i].animSpeed = 60;
    }
    game.time.slowMotion = 1;
    game.time.desiredFps = 60;
}