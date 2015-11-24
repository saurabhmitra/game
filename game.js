var Game = function() {
	// set up scene width and height
	this._width = window.innerWidth;
	this._height = window.innerHeight;

	// set up rendering surface
	this.renderer = new PIXI.CanvasRenderer(this._width, this._height);
	document.body.appendChild(this.renderer.view);

	// create the main stage to draw on
	this.stage = new PIXI.Stage();

	// physics shit
	this.world = new p2.World({
		gravity: [0,0]
	});

	// speed
	this.speed = 1000;
	this.turnSpeed = 5;

	window.addEventListener('keydown', function(event) {
		this.handleKeys(event.keyCode, true);
	}.bind(this), false);	
	window.addEventListener('keyup', function(event) {
		this.handleKeys(event.keyCode, false);
	}.bind(this), false);

	this.enemyBodies = [];
	this.enemyGraphics = [];

	// Start running the game.
	this.build();
};

Game.prototype = {
	// Build scene and start animating 
	build: function() {
		// Draw the star-field in the background
		this.drawStars();
		// set up the boundaries
		this.setupBoundaries();
		//draw ship
		this.createShip();
		// create enemies
		this.createEnemies();
		// start first frame
		requestAnimationFrame(this.tick.bind(this));
	},

	// Draw the field of stars behind everything
	drawStars: function() {
		// Draw randomly positioned stars
		for (var i = 0; i < 300; i++) {
			// Generate random parameters for the stars.
			var x = Math.round(Math.random() * this._width);
			var y = Math.round(Math.random() * this._height);
			var rad = Math.ceil(Math.random() * 2);
			var alpha = Math.min(Math.random() + .25, 1);

			var star = new PIXI.Graphics();
			star.beginFill(0xFFFFFF, alpha);
			star.drawCircle(x,y,rad);
			star.endFill();

			// attach the star to the stage
			this.stage.addChild(star);
		}
	},

	// Draw the boundaries of the space arena
	setupBoundaries: function() {
		var walls= new PIXI.Graphics();
		walls.beginFill(0xFFFFFFF, 0.5);
		walls.drawRect(0,0, this._width, 10);
		walls.drawRect(this._width - 10, 10, 10, this._height - 20);
		walls.drawRect(0, this._height - 10, this._width, 10);
		walls.drawRect(0,10,10,this._height - 20);

		// attach the star to the stage
		this.stage.addChild(walls);

	},

	createShip: function() {
		// create ship object
		this.ship = new p2.Body({
			mass: 1,
			angularVelocity: 0,
			damping: 0,
			angularDamping: 0,
			position:[Math.round(this._width/2),Math.round(this._height/2)]
		});
		this.shipShape = new p2.Box({width:52, height:69});
		this.ship.addShape(this.shipShape);
		this.world.addBody(this.ship);

		this.shipGraphics = new PIXI.Graphics();

		// draw the ship's body
		this.shipGraphics.beginFill(0x20D3FE);
		this.shipGraphics.moveTo(0,-30);
		this.shipGraphics.lineTo(-26,30);
		this.shipGraphics.lineTo(26,30);
		this.shipGraphics.endFill();

		// engine
		this.shipGraphics.beginFill(0x1495D1);
		this.shipGraphics.drawRect(-15, 30, 30, 8);
		this.shipGraphics.endFill();

		this.stage.addChild(this.shipGraphics);

	},

	createEnemies: function() {
		this.enemyTimer = setInterval(function() {
			var x = Math.round(Math.random() * this._width);
			var y = Math.round(Math.random() * this._height);
			var vx = 0;// (Math.random() - 0.5) * this.speed/20;
			var vy = 0;//(Math.random() - 0.5) * this.speed/20;
			var va = 0;//(Math.random() - 0.5) * this.speed/100;
			// create the enemy physics body
			var enemy = new p2.Body({
				position: [x,y],
				mass: 1,
				damping: 0,
				angularDamping: 0,
				velocity: [vx, vy],
				angularVelocity: va
			});
			var enemyShape = new p2.Circle({radius: 20});
			enemy.addShape(enemyShape);
			this.world.addBody(enemy);

			// Create the graphics
			var enemyGraphics = new PIXI.Graphics();
			enemyGraphics.beginFill(0x20c41a);
			this.shipGraphics.moveTo(x,y);
			enemyGraphics.drawCircle(0,0,20);
			enemyGraphics.endFill();
			enemyGraphics.beginFill(0x2aff00);
			enemyGraphics.lineStyle(1, 0x239d0b, 1);
			enemyGraphics.drawCircle(0,0,14);
			enemyGraphics.endFill();

			this.stage.addChild(enemyGraphics);

			this.enemyBodies.push(enemy);
			this.enemyGraphics.push(enemyGraphics);
			
		}.bind(this), 1000);
	},

	handleKeys: function (key, state) {
		switch(key) {
			case 65:
			this.keyLeft = state;
			break;
			case 68:
			this.keyRight = state;
			break;
			case 87:
			this.keyUp = state;
			break;
		}
	},

	updatePhysics: function () {
		// adjust rotation
		if (this.keyLeft) {
			this.ship.angularVelocity = -1*this.turnSpeed;//-1*this.turnSpeed - (-1*this.turnSpeed - this.ship.angularVelocity)*.8;
		} else if (this.keyRight) {
			this.ship.angularVelocity = this.turnSpeed;//this.turnSpeed - (this.turnSpeed - this.ship.angularVelocity)*.8;
		} else {
			this.ship.angularVelocity *= .1;
		}
		if (this.keyUp) {
			var angle = this.ship.angle + Math.PI/2;
			this.ship.force[0] -= this.speed * Math.cos(angle);
			this.ship.force[1] -= this.speed * Math.sin(angle);
		}

		this.shipGraphics.x = this.ship.position[0];
		this.shipGraphics.y = this.ship.position[1];

		// wrap to other side of screen
		if (this.ship.position[0] > this._width) {
			this.ship.position[0] = 0;
			// this.drawStars();
		}
		if (this.ship.position[1] > this._height) {
			this.ship.position[1] = 0;
			// this.drawStars();
		}
		if (this.ship.position[0] < 0) {
			this.ship.position[0] = this._width;
			// this.drawStars();
		}
		if (this.ship.position[1] < 0) {
			this.ship.position[1] = this._height;
			// this.drawStars();
		}

		this.shipGraphics.rotation = this.ship.angle;
		// update enemy positions
		for (var i = 0; i < this.enemyBodies.length; i++) {
			this.enemyGraphics[i].x = this.enemyBodies[i].position[0];
			this.enemyGraphics[i].y = this.enemyBodies[i].position[1];
			// this.enemyGraphics[i].moveTo(i*10, i*10);
			// console.log(this.enemyGraphics[i].x);
			// console.log(this.enemyGraphics[i].y);
		}

		// this.enemyGraphics[0].x = this.enemyBodies[0].position[0];
		// this.enemyGraphics[0].y = this.enemyBodies[0].position[1];

		this.world.step(1/60);
	},

	//fires at the end of the gameloop to reset and redraw the canvas
	tick: function() {
		this.renderer.render(this.stage);
		requestAnimationFrame(this.tick.bind(this));
		this.updatePhysics();
	}
};