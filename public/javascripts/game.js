/**
 * Created by ken on 10/02/15.
 * SOURCE: http://codeperfectionist.com/articles/phaser-js-tutorial-building-a-polished-space-shooter-game-part-1/
 */
/*global Phaser*/
var game;
var player;
var greenEnemies;
var starfield;
var cursors;
var bank;
var shipTrail;
var explosions;
var bullets;
var fireButton;
var tapRestart;
var spaceRestart;
var bulletTimer = 0;
var shields;
var score = 0;
var scoreText;
var greenEnemyLauchTimer;
var gameOver;

var ACCELERATION = 600;
var DRAG = 400;
var MAX_SPEED = 400;

function hitEnemy(enemy, bullet) {
    "use strict";
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    enemy.kill();
    bullet.kill();
}

function shipCollide(player, enemy) {
    "use strict";
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    enemy.kill();

    player.damage(enemy.damageAmount);
    shields.render();
}

function launchGreenEnemy() {
    "use strict";
    var MIN_ENEMY_SPACING = 300,
        MAX_ENEMY_SPACING = 3000,
        ENEMY_SPEED = 300,
        enemy = greenEnemies.getFirstExists(false);

    if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), -20);
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = ENEMY_SPEED;
        enemy.body.drag.x = 100;

        enemy.trail.start(false, 800, 1);

        // update function for each enemy ship to update rotation etc
        enemy.update = function () {
            enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
            enemy.trail.x = enemy.x;
            enemy.trail.y = enemy.y - 10;

            // Kill enemies once they go off screen
            if (enemy.y > game.height + 200) {
                enemy.kill();
            }
        };
    }

    // send another enemy soon
    game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), launchGreenEnemy);
}

function addEnemyEmitterTrail(enemy) {
    "use strict";
    var enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100);
    enemyTrail.width = 10;
    enemyTrail.makeParticles('explosion', [1, 2, 3, 4, 5]);
    enemyTrail.setXSpeed(20, -20);
    enemyTrail.setRotation(50, -50);
    enemyTrail.setAlpha(0.4, 0, 800);
    enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out);
    enemy.trail = enemyTrail;
}

function fireBullet() {
    "use strict";
    var BULLET_SPEED = 400,
        BULLET_SPACING = 250,
        bullet,
        bulletOffset;

    // to avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTimer) {
    // Grab the first bullet we can fom the pool
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            // And fire it
            // bullet.reset(player.x, player.y + 8); // fire vertically
            // bullet.body.velocity.y = -400;

            // Make bullet come out of tip of ship with right angle
            bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle));
            bullet.reset(player.x + bulletOffset, player.y);
            bullet.angle = player.angle;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
            bullet.body.velocity.x += player.body.velocity.x;

            bulletTimer = game.time.now + BULLET_SPACING;
        }
    }
}

function preload() {
    "use strict";
    game.load.image('starfield', '/assets/starfield.png');
    game.load.image('ship', '/assets/player.png');
    game.load.image('bullet', '/assets/bullet.png');
    game.load.image('enemy-green', 'assets/enemy-green.png');
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
}

function create() {
    "use strict";
    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    // Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.health = 100;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // acceleration
    player.body.maxVelocity.setTo(MAX_SPEED, MAX_SPEED);
    player.body.drag.setTo(DRAG, DRAG);

    player.events.onKilled.add(function () {
        shipTrail.kill();
    });

    player.events.onRevived.add(function () {
        shipTrail.start(false, 5000, 10);
    });

    // The baddies
    greenEnemies = game.add.group();
    greenEnemies.enableBody = true;
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    greenEnemies.createMultiple(5, 'enemy-green');
    greenEnemies.setAll('anchor.x', 0.5);
    greenEnemies.setAll('anchor.y', 0.5);
    greenEnemies.setAll('scale.x', 0.5);
    greenEnemies.setAll('scale.y', 0.5);
    greenEnemies.setAll('angle', 180);
    // greenEnemies.setAll('outOfBoundsKill', true);
    // greenEnemies.setAll('checkWorldBounds', true);
    greenEnemies.forEach(function (enemy) {
        addEnemyEmitterTrail(enemy);
        enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
        enemy.damageAmount = 20;
        enemy.events.onKilled.add(function () {
            enemy.trail.kill();
        });
    });

    //launchGreenEnemy();
    game.time.events.add(1000, launchGreenEnemy);
    // And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Add an emitter for the ship's trail
    shipTrail = game.add.emitter(player.x, player.y + 10, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('bullet');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);

    // An explosion pool
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(function (explosion) {
        explosion.animations.add('explosion');
    });

    // Shields stat
    shields = game.add.text(game.world.width - 150,
        10,
        'Shields: ' + player.health + '%',
        {font: '20px Arial', fill: '#fff'});
    shields.render = function () {
        shields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
    };

    // Score
    scoreText = game.add.text(10, 10, '', {font: '20px Arial', fill: '#fff'});
    scoreText.render = function () {
        scoreText.text = 'Score: ' + score;
    };
    scoreText.render();

    // Game over text
    gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER!', {font: '84px Arial', fill: '#fff'});
    gameOver.anchor.setTo(0.5, 0.5);
    gameOver.visible = false;
}

function update() {
    "use strict";
    var minDist,
        dist,
        fadeInGameOver;
    function restart() {
        // Reset the enemies
        greenEnemies.callAll('kill');
        game.time.events.remove(greenEnemyLauchTimer);
        game.time.events.add(1000, launchGreenEnemy);

        // Revive the player
        player.revive();
        player.health = 100;
        shields.render();
        score = 0;
        scoreText.render();

        // Hide the text
        gameOver.visible = false;
    }

    function setResetHandlers() {
        function restartHandler() {
            tapRestart.detach();
            spaceRestart.detach();
            restart();
        }

        // The "click to restart" handler
        tapRestart = game.input.onTap.addOnce(restartHandler, this);
        spaceRestart = fireButton.onDown.addOnce(restartHandler, this);
    }

    // Scroll the background
    starfield.tilePosition.y += 2;

    // Reset the player, then check for movement keys
    // player.body.velocity.setTo(0, 0); // no acceleration
    player.body.acceleration.x = 0;

    if (cursors.left.isDown) {
        //player.body.velocity.x = -200; // no acceleration
        player.body.acceleration.x = -ACCELERATION;
    } else if (cursors.right.isDown) {
        //player.body.velocity.x = 200; // no acceleration
        player.body.acceleration.x = ACCELERATION;
    }

    // Stop at screen edges
    if (player.x > game.width - 50) {
        player.x = game.width - 50;
        player.body.acceleration.x = 0;
    }
    if (player.x < 50) {
        player.x = 50;
        player.body.acceleration.x = 0;
    }

    // Fire bullet
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
        fireBullet();
    }

    // Move ship towards mouse pointer
    if (game.input.x < game.width - 20 &&
            game.input.x > 20 &&
            game.input.y > 20 &&
            game.input.y < game.height - 20) {
        minDist = 200;
        dist = game.input.x - player.x;
        player.body.velocity.x = MAX_SPEED * game.math.clamp(dist / minDist, -1, 1);
    }

    // Squish and rotate ship for illusion of "banking"
    bank = player.body.velocity.x / MAX_SPEED;
    player.scale.x = 1 - Math.abs(bank) / 2;
    player.angle = bank * 30;

    // Keep the shipTrail lined up with the ship
    shipTrail.x = player.x;

    // Check collisions
    game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this);

    // Game Over?
    if (!player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        gameOver.alpha = 0;
        fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();
    }
}

function render() {
    "use strict";
    return null;
}
game = new Phaser.Game(800,
    600,
    Phaser.AUTO,
    'phaser-demo',
    {preload: preload, create: create, update: update, render: render}
    );
