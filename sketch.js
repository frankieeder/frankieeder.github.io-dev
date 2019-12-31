// JavaScript Document

var button;
var avenirLight;
console.log("Hi!");

function preload() {
  avenirLight = loadFont('fonts/Avenir-Light.ttf');
}

function setup() {
  	createCanvas(windowWidth, 500);
	button = new Button(20, 20, 200, 100, 'VISUAL');
	textFont(avenirLight);
}

function windowResized() {
  	resizeCanvas(windowWidth, 500);
}

function draw() {
  	background(220);
	button.draw();
}


function Button(x, y, w, h, buttonText) {
	console.log('making button');
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.buttonText = buttonText;
	
	
	this.bgColor = color(0);
	this.color = color(255);
	
	this.lerpAmt = 0;
	this.decay = 0.9;
	
	this.draw = function() {
		var xmid = this.x + (this.w / 2);
		var ymid = this.y + (this.h / 2);
		var fontsize = this.h / 3;
		var vertoffset = fontsize * 4 / 11;
		console.log(xmid, ymid, this.lerpAmt);
		
		fill(lerpColor(this.bgColor, this.color, this.lerpAmt));
		noStroke();
		rect(this.x, this.y, this.w, this.h);
		
		fill(lerpColor(this.color, this.bgColor, this.lerpAmt));
		textSize(fontsize);
		textAlign(CENTER, BASELINE);
		//line(this.x, ymid, this.x + this.w, ymid);
		//line(xmid, this.y, xmid, this.y + this.h);
		text(this.buttonText, xmid, ymid + vertoffset); //+ (fontsize/2));
		if (this.inBounds(mouseX, mouseY)) {
			this.lerpAmt = 1 - ((1-this.lerpAmt) * this.decay);
		} else {
			this.lerpAmt *= this.decay;
		}
	}
	
	this.inBounds = function(x, y) {
		var inb =
			x > this.x &&
			x < (this.x + this.w) &&
			y > this.y &&
			y < (this.y + this.h);
		//console.log("Checking bounds", inb);
		return inb;
	}
}