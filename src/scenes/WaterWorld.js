
// You can write more code here

/* START OF COMPILED CODE */

class WaterWorld extends Phaser.Scene {

	constructor() {
		super("WaterWorld");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here
 	// line;

	drawHexagon(x1, y1, color){
		// TOP
		// var line1 = this.add.line(x + 25, y, x + 25, y, x + 50, y, 0xff0000);
		// var line1 = this.add.line(x1, y1, 75, 0, 25, 0, 0xff0000);
		// BOTTOM
		//var line2 = this.add.line(x1, y1, 25, 100, 75, 100, 0xff0000);
		// LEFT
		//var line3 = this.add.line(x1, y1, -25, 100, 15, 35, 0xff0000);
		//var line4 = this.add.line(x, y, 0, 50, 25, 100, 0xff0000);
		// RIGHT
		//var line5 = this.add.line(x + 75, y, x + 75, y, x + 100, y + 50, 0xff0000);
		//var line6 = this.add.line(x + 100, y + 50, x + 100, y + 50, x + 75, y + 100, 0xff0000);
		var poly = this.add.polygon(x1, y1, [25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43], color)

	}
	
	create() {
		// grid - 100 x 100
		var colors = [0xff0000, 0x00ff00, 0x00ff00, 0xffffff];
		for (var x = 0; x < 30; x++) {
			for (var y = 0; y < 20; y++) {
				var xcoord = x * 75;
				var ycoord = y * 86;
				if (x % 2 == 1){
					ycoord += 43;
				}
				var hex = this.drawHexagon(xcoord, ycoord, Math.random() * 100 + 150);

			}
		}
		
		//var hex = this.drawHexagon(0, 0xff0000);
		//var hex1 = this.drawHexagon(100, 100);
		//var hex2 = this.drawHexagon(200, 200);

		// var line = this.add.line(0,0,100,100,200,200,0xff0000);
		// line.setLineWidth(1);
		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
