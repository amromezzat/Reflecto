
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});
var player, arrow, cursors, upButton, downButton, leftButton, rightButton;
var speed = 200;
var bulletSpeed = 500;
var myBullets = [];

function preload()
{
	game.load.image('player','assets/player.png');
	game.load.image('bullet','assets/bullet.png');
	game.load.image('arrow','assets/arrow.png');
}

function create()
{
	//Set Background and Center Game
	game.stage.backgroundColor = '#FFFFFF';
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.refresh();
	
	//Create Player
	player = game.add.sprite(200, 200, 'player');
	player.anchor.setTo(0.5, 0.5);
	player.scale.setTo(0.5, 0.5);
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds=true;
	
	//Create Arrow
	arrow = game.add.sprite(200,200,'arrow');
	arrow.anchor.setTo(0, 0.5);
	arrow.scale.setTo(0.05, 0.05);
	game.physics.arcade.enable(arrow);
	
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
	
	//Control Arrow Movement
	arrow.position.x = player.position.x;
	arrow.position.y = player.position.y;
	arrow.rotation = game.physics.arcade.angleToPointer(arrow);
	
	//Create Bullet on Click and Check Collison
	game.input.onDown.add(Shoot, this);
	for(let i = 0; i < myBullets.length; i++)
	{
		checkBulletCollison(myBullets[i]);
	}

}

function Shoot() 
{
	var bullet = createBullet(50, 50);
	myBullets.push(bullet);
}

function checkBulletCollison(myBullet)
{
	if(myBullet[0])
	{
		//Check Border and Bullet Collision
		if(myBullet[0].body.blocked.left || myBullet[0].body.blocked.right || myBullet[0].body.blocked.up || myBullet[0].body.blocked.down)
		{
			myBullet[1]--;
			if(myBullet[1] == 0)
			{
				myBullet[0].destroy();
				myBullet[0] = null;
			}
		}
		//Check Player and Bullet Collision
		game.physics.arcade.collide(myBullet[0],player,killplayer);
	}
}
function killplayer(b)
{
	player.destroy();
	arrow.destroy();
	b.destroy();
}
function createBullet(posX,posY)
{
	var bullet = game.add.sprite(posX,posY,'bullet');
	bullet.anchor.setTo(0.5, 0.5);
	bullet.scale.setTo(0.5, 0.5);
	game.physics.arcade.enable(bullet);
	bullet.body.collideWorldBounds = true;
	bullet.body.bounce.setTo(1.0,1.0);
	//Use this to Move to Mouse Location
	game.physics.arcade.moveToPointer(bullet, bulletSpeed);
	//Use this to Move to Player Location (Our Main Usage)
	//game.physics.arcade.moveToObject(bullet, player, bulletSpeed);
	
	var bulletArr = [bullet, 3];
	return bulletArr;

}

function movePlayer()
{
	slowTime();
	console.log(game.time.desiredFps);
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if(upButton.isDown)
	{
		player.body.velocity.y = -speed;
		resetTime();
	}
	else if(downButton.isDown)
	{
		player.body.velocity.y = speed;
		resetTime();
	}
	if(leftButton.isDown)
	{
		player.body.velocity.x = -speed;
		resetTime();
	}
	else if(rightButton.isDown)
	{
		player.body.velocity.x = speed;
		resetTime();
	}
}

function slowTime()
{
	game.time.slowMotion = 4;
	game.time.desiredFps = 240;
}
function resetTime()
{
	game.time.slowMotion = 1;
	game.time.desiredFps = 60;
}






