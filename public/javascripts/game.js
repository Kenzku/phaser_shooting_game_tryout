/**
 * Created by ken on 10/02/15.
 */
/*global Phaser*/
var game;
var player;
var starfield;
var cursors;
var bank;

var ACCELERATION = 600;
var DRAG = 400;
var MAX_SPEED = 400;

function preload() {
    "use strict";
    game.load.image('starfield', '/assets/starfield.png');
    game.load.image('ship', '/assets/player.png');
}

function create() {
    "use strict";
    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // acceleration
    player.body.maxVelocity.setTo(MAX_SPEED, MAX_SPEED);
    player.body.drag.setTo(DRAG, DRAG);

    // And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    "use strict";
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

    // Squish and rotate ship for illusion of "banking"
    bank = player.body.velocity.x / MAX_SPEED;
    player.scale.x = 1 - Math.abs(bank) / 2;
    player.angle = bank * 10;
}

function render() {
    "use strict";
}
game = new Phaser.Game(800,
    600,
    Phaser.AUTO,
    'phaser-demo',
    {preload: preload, create: create, update: update, render: render}
    );
