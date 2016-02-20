"use strict";

var DATA = {
	ant: { 
		initialNumber: 50, 
		color: "black",
		colorFooder: "red",
		speed: 3, 
		size: { width: 5, height: 5 },
		anchor: { x: 0.5, y: 0.5 }
	},
	anthill: { 
		position: [{ x: 25, y: 25 }], 
		color: "green", 
		size: [{ width: 20, height: 20 }],
		anchor: { x: 0.5, y: 0.5 }
	},
	food: { 
		position: [{ x: 50, y: 30 }, { x: 90, y: 90 }], 
		color: "blue", 
		size: [{ width: 15, height: 15 }, { width: 15, height: 15 }],
		anchor: { x: 0.5, y: 0.5 }
	},
	pheromone: { 
		color: "#DD33AA", 
		size: { width: 2, height: 2 }, 
		anchor: { x: 0.5, y: 0.5 },
		value: {
			initial: 1,
			gain: 0.2, 
			loss: 0.01
		}
	},
	game: { 
		backgroundColor: "#FFFEFD",
		origin: { 
			min: { x: 0, y: 0 },
			max: { x: 0, y: 0 }
		}
	}
};

function getNegOrPos() {
	var rand = Math.random();
	if (rand < 0.5) return -1;
	else return 1;
}

function Simulation(canvas, ctx, anthills, foods) {
	this.canvas = canvas;
	this.ctx = ctx;
	this.anthills = anthills;
	this.foods = foods;
	this.ants = this.createAnts(100);
	this.stop = false;
	this.frameCount = 0;
	this.fps = 25;
	this.fpsInterval;
	this.startTime;
	this.now;
	this.then;
	this.elapsed;
    this.fpsInterval = 1000 / this.fps;
    this.then = Date.now();
    this.startTime = this.then;
	this.tick();
}
Simulation.prototype.createAnts = function(n) {
	var self = this;
	var array = [];
	for (var i = 0; i < this.anthills.length; i++) {
		for (var j = 0; j< n; j++) {
			array.push(new Ant(this.anthills[i], self.ctx));
		}
	}
	return array;
};
Simulation.prototype.tick = function() {
	var self = this;
    requestAnimationFrame(function() {
		self.tick();
	});
	this.now = Date.now();
    this.elapsed = this.now - this.then;
    if (this.elapsed > this.fpsInterval) {
        this.then = this.now - (this.elapsed % this.fpsInterval);
		this.update();
		this.draw();
    }
};
Simulation.prototype.update = function() {
	this.moveAnts();
	this.checkAntFoodCollision();
	this.checkAntBackToAnthill();
};
Simulation.prototype.draw = function() {
	this.drawBackground();
	this.drawAnthills();
	this.drawFood();
	this.drawAnts();
};
Simulation.prototype.drawBackground = function() {
	this.ctx.fillStyle = DATA.game.backgroundColor;
	this.ctx.fillRect(DATA.game.origin.min.x, DATA.game.origin.min.y, DATA.game.origin.max.x, DATA.game.origin.max.y);	
};
Simulation.prototype.drawAnthills = function() {
	for (var i = 0; i < this.anthills.length; i++) {
		this.anthills[i].draw();
	}
};
Simulation.prototype.drawFood = function() {
	for (var i = 0; i < this.foods.length; i++) {
		this.foods[i].draw();
	}
};
Simulation.prototype.drawAnts = function() {
	for (var i = 0; i < this.ants.length; i++) {
		this.ants[i].draw();
	}
};
Simulation.prototype.moveAnts = function() {
	for (var i = 0; i < this.ants.length; i++) {
		this.ants[i].move();
	}
};
Simulation.prototype.checkAntFoodCollision = function() {
	for (var i = 0; i < this.ants.length; i++) {
		for (var j = 0; j < this.foods.length; j++) {
			this.ants[i].setCarringFood(this.ants[i].collideFood(this.foods[j]));
		}
	}	
};
Simulation.prototype.checkAntBackToAnthill = function() {
	var back;
	for (var i = 0; i < this.ants.length; i++) {
		for (var j = 0; j < this.foods.length; j++) {
			back = this.ants[i].isBackToAnthill();
			if (back) {
				this.ants[i].setCarringFood(false);
			}
		}
	}	
};


function Ant(anthill, ctx) {
	this.anthill = anthill;
	this.position = { x: this.anthill.getPosition().x, y: this.anthill.getPosition().y };
	this.carringFood = false;
	this.color = DATA.ant.color;
	this.colorFooder = DATA.ant.colorFooder;
	this.speed = DATA.ant.speed;
	this.size = DATA.ant.size;
	this.ctx = ctx;
}
Ant.prototype.getPosition = function() { return this.position; };
Ant.prototype.getColor = function() { return this.color; };
Ant.prototype.isCarringFood = function() { return this.carringFood; };
Ant.prototype.getSpeed = function() { return this.speed; };
Ant.prototype.setCarringFood = function(carringFood) { this.carringFood = carringFood; };
Ant.prototype.draw = function() {
	this.isCarringFood() ? this.ctx.fillStyle = this.colorFooder : this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
};
Ant.prototype.move = function() { 
	var dx, dy;
	// If the ant does not carry food, it wanders looking for some
	if (!this.carringFood) {
		dx = Math.floor(this.speed * Math.random() * 2) * getNegOrPos();
		dy = Math.floor(this.speed * Math.random() * 2) * getNegOrPos();
		this.position.x += dx;
		this.position.y += dy;
		if (this.position.x < DATA.game.origin.min.x) {
			this.position.x = DATA.game.origin.min.x;
		}
		else if (this.position.x > DATA.game.origin.max.x) {
			this.position.x = DATA.game.origin.max.x - this.size.width;
		}
		if (this.position.y < DATA.game.origin.min.y) {
			this.position.y = DATA.game.origin.min.y;
		}
		else if (this.position.y > DATA.game.origin.max.y) {
			this.position.y = DATA.game.origin.max.y - this.size.height;
		}
	}
	else {
		// The ants carries food, so it comes back to the anthill
		// dx = Math.abs(Math.floor(DATA.ant.speed * Math.random() * 2));
		// dy = Math.abs(Math.floor(DATA.ant.speed * Math.random() * 2));
		// if (DATA.anthill.position[ant[0]][1] < ant[1]) dx *= -1;
		// if (DATA.anthill.position[ant[0]][2] < ant[2]) dy *= -1;
		if (this.anthill.getPosition().x < this.position.x) {
			dx = -this.speed;
		}
		else {
			dx = this.speed;
		}
		if (this.anthill.getPosition().y < this.position.y) {
			dy = -this.speed;
		}
		else {
			dy = this.speed;
		}
		this.position.x += dx;
		this.position.y += dy;
		if (this.position.x < DATA.game.origin.min.x) {
			this.position.x = DATA.game.origin.min.x;
		}
		else if (this.position.x > DATA.game.origin.max.x) {
			this.position.x = DATA.game.origin.max.x - this.size.width;
		}
		if (this.position.y < DATA.game.origin.min.y) {
			this.position.y = DATA.game.origin.min.y;
		}
		else if (this.position.y > DATA.game.origin.max.y) {
			this.position.y = DATA.game.origin.max.y - this.size.height;
		}
	}
};
Ant.prototype.collideFood = function(entity) {
	var collision = this.carringFood;
	if (this.getPosition().x >= entity.getPosition().x && this.getPosition().x < entity.getPosition().x + entity.getSize().width) {
		if (this.getPosition().y >= entity.getPosition().y && this.getPosition().y < entity.getPosition().y + entity.getSize().height) {
			collision = true;
		}
	}
	return collision;
};
Ant.prototype.isBackToAnthill = function() {
	if (this.getPosition().x >= this.anthill.getPosition().x && this.getPosition().x < this.anthill.getPosition().x + this.anthill.getSize().width) {
		if (this.getPosition().y >= this.anthill.getPosition().y && this.getPosition().y < this.anthill.getPosition().y + this.anthill.getSize().height) {
			return true;
		}
	}
	return false;
};

function Anthill(x, y, w, h, n, ctx) {
	this.position = { x: x, y: y };
	this.antNumber = n;
	this.color = DATA.anthill.color;
	this.size = { width: w, height: h };
	this.ctx = ctx;
}
Anthill.prototype.getPosition = function() { return this.position; };
Anthill.prototype.getAntNumber = function() { return this.antNumber; };
Anthill.prototype.getColor = function() { return this.color; };
Anthill.prototype.getSize = function() { return this.size; };
Anthill.prototype.draw = function() {
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
}

function Food(x, y, w, h, ctx) {
	this.position = { x: x, y: y };
	this.size = { width: w, height: h };
	this.color = DATA.food.color;
	this.ctx = ctx;
}
Food.prototype.getPosition = function() { return this.position; };
Food.prototype.getColor = function() { return this.color; };
Food.prototype.getSize = function() { return this.size; };
Food.prototype.draw = function() {
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
};

(function(scope) {
	scope.ant = scope.ant || {};
	scope.ant.canvas = scope.ant.canvas || document.getElementById('canvas');
	scope.ant.ctx = scope.ant.ctx || scope.ant.canvas.getContext('2d');
	DATA.game.origin.max.x = scope.canvas.width;
	DATA.game.origin.max.y = scope.canvas.height;
	var anthills = [ new Anthill(20, 20, 40, 40, 20, scope.ant.ctx) ];
	var foods = [ new Food(200, 200, 30, 30, scope.ant.ctx) ];
	scope.ant.simu = new Simulation(scope.ant.canvas, scope.ant.ctx, anthills, foods);
	scope.ant.simu.tick();
})(window);
















