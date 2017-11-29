var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player, arrow, cursors, upButton, downButton, leftButton, rightButton;
var speed = 200;
var bulletSpeed = 500;
var myBullets = [];

var bulletsGroup, enimesGroup;

//Pad Variables
var padAimX, padAimY, pressFlagA = 0;

function preload() {
    game.load.image('player', 'assets/sprites/player.png');
    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('arrow', 'assets/sprites/arrow.png');
}

function create() {
    //Set Background and Center Game
    game.stage.backgroundColor = '#FFFFFF';
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    //Create Groups
    bulletsGroup = game.add.group();
    enimesGroup = game.add.group();

    //Create Player
    player = game.add.sprite(200, 200, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    //Create Arrow
    arrow = game.add.sprite(200, 200, 'arrow');
    arrow.anchor.setTo(0, 0.5);
    arrow.scale.setTo(0.05, 0.05);
    game.physics.arcade.enable(arrow);

    //Keyboard
    cursors = game.input.keyboard.createCursorKeys();
    upButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);

    //Gamepad 
    game.input.gamepad.start();
    pad1 = game.input.gamepad.pad1;

}

function update() {
    if (player) {
        //Choose Between Keyboard or Gamepad
        movePlayer();
        //movePlayerPad();

        //Control Arrow Movement
        arrow.position.x = player.position.x;
        arrow.position.y = player.position.y;
    }

    //Check Bullet Collison
    for (let i = 0; i < myBullets.length; i++) {
        checkBulletCollison(myBullets[i]);
    }
}

function checkBulletCollison(myBullet) {
    if (myBullet[0]) {
        //Check Border and Bullet Collision
        if (myBullet[0].body.blocked.left || myBullet[0].body.blocked.right || myBullet[0].body.blocked.up || myBullet[0].body.blocked.down) {
            myBullet[1]--;
            if (myBullet[1] == 0) {
                myBullet[0].destroy();
                myBullet[0] = null;
            }
        }
        //Check Player and Bullet Collision
        game.physics.arcade.collide(myBullet[0], player, bpCollision);

        //Check Bullet and Bullet Collision
        try {
            game.physics.arcade.collide(myBullet[0], bulletsGroup, bbCollision);
        } catch (err) {
            console.log(err.message);
        }

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

function bulletSearchDestroy(bullet) {
    for (let i = 0; i < myBullets.length; i++) {
        if (myBullets[i][0] == bullet) {
            myBullets[i][0].destroy();
            myBullets[i][0] = null;
        }
    }
}

function createBullet(posX, posY) {
    var bullet = game.add.sprite(posX, posY, 'bullet');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(bullet);
    bullet.body.collideWorldBounds = true;
    bullet.body.bounce.setTo(1.0, 1.0);

    //Use this to Move to Mouse Location
    //game.physics.arcade.moveToPointer(bullet, bulletSpeed);

    //Use this to Move to Player Location (Our Main Usage)
    game.physics.arcade.moveToObject(bullet, player, bulletSpeed);

    //Use this to Move to Position(X,Y)
    //game.physics.arcade.moveToXY(bullet,200,100,bulletSpeed);

    bulletsGroup.add(bullet);

    var bulletArr = [bullet, 3];
    return bulletArr;

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
    game.input.onDown.add(Shoot, this);
}

function Shoot() {
    if (player)
        myBullets.push(createBullet(50, 50));
}

function movePlayerPad() {
    slowTime();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    padAimX = player.position.x;
    padAimY = player.position.y;

    if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
        player.body.velocity.x = -speed;
        resetTime();
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
        player.body.velocity.x = speed;
        resetTime();
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }
    if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
        player.body.velocity.y = -speed;
        resetTime();
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
        player.body.velocity.y = speed;
        resetTime();
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }

    if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -0.1) {
        padAimX = player.position.x - 1;
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) > 0.1) {
        padAimX = player.position.x + 1;
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }
    if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) < -0.1) {
        padAimY = player.position.y - 1;
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    } else if (pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) > 0.1) {
        padAimY = player.position.y + 1;
        arrow.rotation = game.physics.arcade.angleToXY(arrow, padAimX, padAimY);
    }
    if (pad1.justPressed(Phaser.Gamepad.XBOX360_A)) {
        pressFlagA = 1;
    }
    if (pad1.justReleased(Phaser.Gamepad.XBOX360_A) && pressFlagA) {
        Shoot();
        pressFlagA = 0;
    }
}

function slowTime() {
    game.time.slowMotion = 6;
    game.time.desiredFps = 360;
}

function resetTime() {
    game.time.slowMotion = 1;
    game.time.desiredFps = 60;
}