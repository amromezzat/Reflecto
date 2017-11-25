
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var player, cursors, upButton, downButton, leftButton, rightButton;
var speed = 200;
var bullet;

function preload()
{
	game.load.image('player','assets/player.png');
	game.load.image('bullet','assets/bullet.png');
}

function create()
{
	//Set background
	game.stage.backgroundColor = '#FFFFFF';
	
	//Create Player
	player = game.add.sprite(200,200,'player');
	player.anchor.setTo(0.5,0.5);
	player.scale.setTo(0.5, 0.5);
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds=true;
	
	//Create Bullet
	bullet = game.add.sprite(400,300,'bullet');
	bullet.anchor.setTo(0.5,0.5);
	bullet.scale.setTo(0.5, 0.5);
	game.physics.arcade.enable(bullet);
	bullet.body.collideWorldBounds=true;
	bullet.body.bounce.setTo(0.9,0.9);
	bullet.body.velocity.x = 400;
	bullet.body.velocity.y = 200;
	
	
	//Keyboard Controls
	cursors = game.input.keyboard.createCursorKeys();
	upButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
	downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
	leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
	
}

function update()
{
	movePlayer();
}

function movePlayer()
{
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if(upButton.isDown)
	{
		player.body.velocity.y = -speed;
	}
	else if(downButton.isDown)
	{
		player.body.velocity.y = speed;
	}
	if(leftButton.isDown)
	{
		player.body.velocity.x = -speed;
	}
	else if(rightButton.isDown)
	{
		player.body.velocity.x = speed;
	}
}





















