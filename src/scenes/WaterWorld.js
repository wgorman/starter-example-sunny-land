
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

	
	createBase(){
		var crds = this.getHexCoords(25, 25);
		this.base = {type: 'base', x: 25, y: 25};
		this.gameGrid[25][25] = this.base;
		return this.add.polygon(crds.x, crds.y, [25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43], 0xff0000);
	}
		
	drawWall(wall){
		console.log('drawing wall at ' + wall.x + ', ' + wall.y);
		var crds = this.getHexCoords(wall.x, wall.y);
		var poly = this.add.polygon(crds.x, crds.y, [25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43], 0x964b00);
		wall.poly = poly;
		return poly;
	}
	
	drawWalls(){
		for(var i = 0; i < this.walls.length; i++) {
			this.drawWall(this.walls[i]);
		}
	}
	
	drawSelect(xy){
		var crds = this.getHexCoords(xy.x, xy.y);
		var poly = this.add.polygon(crds.x, crds.y, [25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43], 0, 0);
		poly.setStrokeStyle(4, 0x00ff00);
		return poly;
	}
	drawEnemies(){
		for(var i = 0; i < this.enemies.length; i++) {
			this.drawEnemy(this.enemies[i]);
		}
	}
	drawEnemy(enemy){
		var circle = this.add.circle(enemy.x, enemy.y, 40, 0xff00ff);
		enemy.circle = circle;
		return circle;
	}
	
	hexWidth = 75;
	hexHeight = 86;
	gameGrid = [];
	enemies = [];
	selection = null;
	base = null;
	
	getHexCoords(x, y){
		var xcoord = x * this.hexWidth;
		var ycoord = y * this.hexHeight;
		if (x % 2 == 1){
			ycoord += 43;
		}
		return {x: xcoord, y: ycoord};
	}
	createWall(x, y) {
		var wall = {type: 'wall', x: x, y: y};
		this.gameGrid[x][y] = wall;
		return wall;
	}
	createWater(x, y) {
		var water = {type: 'water', x: x, y: y, color: Math.random() * 100 + 150};
		this.gameGrid[x][y] = water;
		return water;
	}
	drawWater(water) {
		var crds = this.getHexCoords(water.x,water.y);
		return this.add.polygon(crds.x, crds.y, [25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43], water.color);
	}
	gameGridWidth = 51;
	gameGridHeight = 51;
	selCoords = {x: 20, y:20};
	
	getGridItem(x, y) {
		if (x >= 0 && x < this.gameGridWidth && y >= 0 && y < this.gameGridHeight) {
			return this.gameGrid[x][y];
		}
		return null;
	}
	
	linkGrid(){
		// TODO: We think there is a problem with linking the grid!
		for (var x = 0; x < this.gameGridWidth; x++) {
			for (var y = 0; y < this.gameGridHeight; y++) {
				// for each hex location, we want to link to the other hex locations
				this.gameGrid[x][y].neighbors = [];
				this.gameGrid[x][y].neighbors[0] = this.getGridItem(x + 0, y - 1);
				this.gameGrid[x][y].neighbors[1] = this.getGridItem(x + 0, y + 1);
				this.gameGrid[x][y].neighbors[2] = this.getGridItem(x + 1, y + 0);
				this.gameGrid[x][y].neighbors[3] = this.getGridItem(x - 1, y + 0);
				var diff = (x % 2 == 1) ? 1 : -1;
				this.gameGrid[x][y].neighbors[4] = this.getGridItem(x + 1, y + diff);
				this.gameGrid[x][y].neighbors[5] = this.getGridItem(x - 1, y + diff);
			}
		}
	}
	
	updateNode(node) {
		if (node.distance != -1) return;
		var minDist = -1;
		var toUpdateNodes = [];
		for(var i = 0; i < node.neighbors.length; i++) {
			if (node.neighbors[i] != null && node.neighbors[i].type != 'wall' && node.neighbors[i].distance != -1) {
				if (node.neighbors[i].distance < minDist || minDist == -1) {
					minDist = node.neighbors[i].distance;
				}
			} else if (node.neighbors[i] != null && node.neighbors[i].type != 'wall') {
				toUpdateNodes.push(node.neighbors[i]);
			}
		}
		node.distance = minDist + 1;
		for(var i = 0; i < toUpdateNodes.length; i++) {
			this.updateNode(toUpdateNodes[i]);
		}
	}
	
	updateHeatMap(){
		// reseting grid
		for (var x = 0; x < this.gameGridWidth; x++) {
			for (var y = 0; y < this.gameGridHeight; y++) {
				this.gameGrid[x][y].distance = -1;
			}
		}
		this.updateNode(this.base);	
	}
    hlt = 0;
	prev = {x: 0, y: 0};
	getHexLoc(x, y) {
		// rectangles if x is in the middle of the hexagon
		// triangles if x is on the sides of the hexagon
		var	r = {x: Math.round(x / this.hexWidth), y: Math.round(y / this.hexHeight)};
		if (r.x % 2 == 1) {
		  r.y = Math.round((y - this.hexHeight / 2) / this.hexHeight);
		}
		
		var xRect = r.x * this.hexWidth;
		var yRect = r.y * this.hexHeight;
		if (xRect > x && yRect < y) {
			if (
					((xRect - x) > 30) 
					&& ((xRect - x) < 48) 
					&& ((y - yRect) > 28)
				) {
		  		r.y = 50;
		  		r.x = 50;
			}
		}
		return r;
		/* else {
			if ((x - xRect) > 30 && (x - xRect)  < 48) {
		  		r.y = -10;
		  		r.x = -10;
			}		
		}*
		
		
		// if x is 7 pixels from the left
		
		
		// if x 7 pixels or less from the right or left
		// if y is first half, A = Subtract one from X
		// if y is second half, B
		
		if (this.hlt % 100 == 0 && (this.prev.x != r.x || this.prev.y != r.y)) {
			console.log('r: ' + r.x +', ' + r.y);
			this.prev.x = r.x;
			this.prev.y = r.y;
		}
		return r;
		
		/*
		var color = this.textures.getPixel(x, y, 'lookupGrid');
		if (color == null) {
			return {x: -1, y: -1};
		}
		this.hlt++;
		if (this.hlt % 100 == 0) {
			console.log('color: ' + color.red +', ' + color.green + ', ' + color.blue + ', ' + color.alpha);
		}
		return {x: Math.ceil(color.green / 5), y: Math.ceil(color.blue / 5)};
		*/
	}

	createLookupGrid(){
		var graphics = this.add.graphics();
		for (var x = 0; x < this.gameGridWidth; x++) {
			for (var y = 0; y < this.gameGridHeight; y++) {
				var crds = this.getHexCoords(x, y);
				var polygon = new Phaser.Geom.Polygon([25, 0, 75, 0, 100, 43, 75, 86, 25, 86, 0, 43]);
				Phaser.Geom.Polygon.Translate(polygon, crds.x - 50, crds.y - 43);
				var color = Phaser.Display.Color.GetColor(0, x * 5, y * 5);

				graphics.fillStyle(color);
				graphics.lineStyle(1, color);
				if (x % 2 == 0 && y % 2 == 0) {
					graphics.fillPoints(polygon.points);
					graphics.strokePoints(polygon.points);

				}
			}
		}
		graphics.generateTexture('lookupGrid', 100 * this.gameGridWidth, 86 * this.gameGridHeight);
	}
	
	create() {
		this.createLookupGrid();
		
		// grid - 100 x 100
		var colors = [0xff0000, 0x00ff00, 0x00ff00, 0xffffff];
		for (var x = 0; x < this.gameGridWidth; x++) {
			this.gameGrid[x] = [];
			for (var y = 0; y < this.gameGridHeight; y++) {
				var water = this.createWater(x, y);
				// this.drawWater(water);
			}
		}
		this.walls = [this.createWall(25,23), 
					  this.createWall(24,24), 
					  this.createWall(23,24),
					  this.createWall(22,25)];
		this.enemies = [{type: 'basic', x: 100, y: 100, health: 100}];
		var hexPos = {
			x: 500,
			y: 500
		};
		this.pointerState = 0; // 0 - UP, 1 - DOWN
		this.pointerStart = {x: 0, y: 0, scrollX: 0, scrollY: 0};
		this.createBase();
		
		// run this after creating all entities
		this.linkGrid();
		
		this.updateHeatMap();
		
		this.drawWalls();
		this.drawEnemies();
		var sel = this.drawSelect(this.selCoords);
		this.camSize = {
			x: 400,
			y: 300,
			zoom: 1
		};
		this.input.on("wheel",  (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
			if (deltaY > 0) {
				var newZoom = this.cameras.main.zoom - 0.1;
				if (newZoom > 0.1) {
					this.cameras.main.zoom = newZoom;     
				}
			}

			if (deltaY < 0) {
				var newZoom = this.cameras.main.zoom + 0.1;
				if (newZoom < 50.0) {
					this.cameras.main.zoom = newZoom;     
				}
			}

			
			
        this.input.on('pointermove', (pointer) => {
			// translate x & y to coords
			//
			// if zoom is 0.5, then offset is going to be 100 ~viewport width / 4
			// if zoom is 2, the offset is probably going to be -100
			var wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
			var coords = this.getHexLoc(wp.x, wp.y);
			this.selCoords.x = coords.x;
			this.selCoords.y = coords.y;
			
			// this.selCoords.x = Math.round(wp.x / this.hexWidth);
			// this.selCoords.y = Math.round(wp.y / this.hexHeight);
			
			
			// selCoords.x = Math.round((pointer.x / this.cameras.main.zoom) / this.hexWidth - xoffset);
			// selCoords.y = Math.round((pointer.y / this.cameras.main.zoom) / this.hexHeight - yoffset);
			// turn pointer x and y into hex coordinates
			// console.log('sel: ' + selCoords.x + ', ' + selCoords.y + ', ' + wp.x +', ' + wp.y + ', ' + this.cameras.main.zoom);
			
			
			var crds = this.getHexCoords(this.selCoords.x, this.selCoords.y);
			sel.setX(crds.x);
			sel.setY(crds.y);
			
			if (this.selection != null) {
				// move wall!
				if (this.selection.type == 'wall') {
					var wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
					// NOTE: This isn't perfect for selecting hexagons
					// this.selCoords.x = Math.round(wp.x / this.hexWidth);
					// this.selCoords.y = Math.round(wp.y / this.hexHeight);
					var crds = this.getHexCoords(this.selCoords.x, this.selCoords.y);
	
					// this will move the graphic
					
					// this will adjust the coords
					// clear out where it used to be
					if (this.gameGrid[this.selCoords.x][this.selCoords.y].type == 'water') {
						// draw the selection in the new location
						this.selection.poly.setX(crds.x);
						this.selection.poly.setY(crds.y);
						
						// replace the old location with water
						this.gameGrid[this.selection.x][this.selection.y] = this.gameGrid[this.selCoords.x][this.selCoords.y];
						this.gameGrid[this.selection.x][this.selection.y].x = this.selection.x;
						this.gameGrid[this.selection.x][this.selection.y].y = this.selection.y;
						
						// update the new location
						this.selection.x = this.selCoords.x;
						this.selection.y = this.selCoords.y;
						this.gameGrid[this.selection.x][this.selection.y] = this.selection;
					}
				}
			}
			if ((this.selection == null || this.selection.type == 'water') && this.pointerState == 1) {
				this.cameras.main.scrollX = this.pointerStart.scrollX - (pointer.x - this.pointerStart.x) * (1.0 / this.cameras.main.zoom);
				this.cameras.main.scrollY = this.pointerStart.scrollY - (pointer.y - this.pointerStart.y) * (1.0 / this.cameras.main.zoom);
			}
		});
        this.input.on('pointerup', (pointer) => {
			this.pointerState = 0;
				//console.log('pointerup...' + pointer.x + ', ' + pointer.y);
			if (this.selection != null){
				this.selection = null;
			}
			});
        this.input.on('pointerout', (pointer) => {
			this.pointerState = 0;
				//console.log('pointerout...' + pointer.x + ', ' + pointer.y);
			});
        this.input.on('pointerdown', (pointer) => {
			var wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
			var coords = this.getHexLoc(wp.x, wp.y);
			this.selCoords.x = coords.x;
			this.selCoords.y = coords.y;	
			
			// this.selCoords.x = Math.round(wp.x / this.hexWidth);
			// this.selCoords.y = Math.round(wp.y / this.hexHeight);

			
			// console.log('before: ' + this.selCoords.x + ', ' + this.selCoords.y + ', after: ' + coords.x + ', ' + coords.y);
			
			if (this.selCoords.x >= 0 && this.selCoords.x < this.gameGridWidth){
				if (this.selCoords.y >= 0 && this.selCoords.y < this.gameGridHeight){
					if (this.gameGrid[this.selCoords.x][this.selCoords.y] != null) {
						console.log('type = ' + this.gameGrid[this.selCoords.x][this.selCoords.y].type + ' at location ' + this.selCoords.x + ',' + this.selCoords.y + ', wp = ' + wp.x + ', ' + wp.y + ' distance = ' + this.gameGrid[this.selCoords.x][this.selCoords.y].distance);
						this.selection = this.gameGrid[this.selCoords.x][this.selCoords.y];
					}
				}
			}
			
			this.pointerState = 1;
			this.pointerStart.x = pointer.x;
			this.pointerStart.y = pointer.y;
			this.pointerStart.scrollX = this.cameras.main.scrollX ?? 0;
			this.pointerStart.scrollY = this.cameras.main.scrollY ?? 0;
			//console.log('pointerdown...' + pointer.x + ', ' + pointer.y);
		});			
			
        // this.camera.centerOn(pointer.worldX, pointer.worldY);
        // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
      
      });
		// this.cameras.main.setSize(400, 300);
		this.bindKeys();
		this.editorCreate();
	}
	
	bindKeys() {
		this.wasd = {
			zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, true),
			zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, true),
			addWall: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, true)
		};
	}
	
	getGridXY(x, y){
	 return {x: Math.round(x / this.hexWidth), y: Math.round(y / this.hexHeight)};	
	}
	
	update() {
		
		// move the bad guys
		for (var i = 0; i < this.enemies.length; i++) {
			var enemy = this.enemies[i];
			var gridLoc = this.getGridXY(enemy.x, enemy.y);
			var minDist = 10000;
			var minDistItem = null;
			if (gridLoc.x >= 0 && gridLoc.y >= 0 && gridLoc.x < this.gameGridWidth && gridLoc.y < this.gameGridHeight) {
				var gridItem = this.gameGrid[gridLoc.x][gridLoc.y];
				for (var j = 0; j < gridItem.neighbors.length; j++) {
					if (gridItem.neighbors[j] != null && gridItem.neighbors[j].type != 'wall' && gridItem.neighbors[j].distance < minDist) {
						minDist = gridItem.neighbors[j].distance;
						minDistItem = gridItem.neighbors[j];
					}
				}
				// console.log('gl: ' + gridLoc.x + ', ' + gridLoc.y + ', ' + gridItem.distance + ', go to ' + minDistItem.x + ', ' + minDistItem.y + ', ' + minDistItem.distance);

				var hexCoords = this.getHexCoords(minDistItem.x, minDistItem.y);
				// move bad guy to hex coords

				if (hexCoords.x > enemy.x) {
					enemy.x += 1;
					if (hexCoords.x < enemy.x) {
						enemy.x = hexCoords.x;
					}
				} else if (hexCoords.x < enemy.x) {
					enemy.x -= 1;
					if (hexCoords.x > enemy.x) {
						enemy.x = hexCoords.x;
					}
				}
				if (hexCoords.y > enemy.y) {
					enemy.y += 1;
					if (hexCoords.y < enemy.y) {
						enemy.y = hexCoords.y;
					}
				} else if (hexCoords.y < enemy.y) {
					enemy.y -= 1;
					if (hexCoords.y > enemy.y) {
						enemy.y = hexCoords.y;
					}
				}
				// rerender 
				enemy.circle.setX(enemy.x);
				enemy.circle.setY(enemy.y);
				
			}
		}
		
		
		if (this.wasd.zoomOut.isDown) {
			this.camSize.x = this.camSize.x * 1.1;
			this.camSize.y = this.camSize.y * 1.1;
			this.camSize.zoom *= 1.01;
			this.cameras.main.setZoom(this.camSize.zoom, this.camSize.zoom);
		}
		if (this.wasd.zoomIn.isDown) {
			this.camSize.x = this.camSize.x * 0.9;
			this.camSize.y = this.camSize.y * 0.9;
			this.camSize.zoom *= 0.99;
			this.cameras.main.setZoom(this.camSize.zoom, this.camSize.zoom);
		}
		if (this.wasd.addWall.isDown) {
			if (this.selCoords.x > 0 && this.selCoords.x < this.gameGridWidth){
				if (this.selCoords.y > 0 && this.selCoords.y < this.gameGridHeight){
					if (this.gameGrid[this.selCoords.x][this.selCoords.y].type == 'water') {
						// ADD WALL HERE
						var wall = this.createWall(this.selCoords.x, this.selCoords.y);
						// DRAW WALL HERE
						this.drawWall(wall);
					}
				}
			}
		}
	}
	
	getCanvasPoint(camera, x, y, output) {

    if (output === undefined) {
        output = {x: 0, y: 0};
    }

    const cameraMatrix = camera.matrix.matrix;

    const mva = cameraMatrix[0];
    const mvb = cameraMatrix[1];
    const mvc = cameraMatrix[2];
    const mvd = cameraMatrix[3];
    const mve = cameraMatrix[4];
    const mvf = cameraMatrix[5];

    const determinant = (mva * mvd) - (mvb * mvc);

    if (!determinant) {
        output.x = x;
        output.y = y;

        return output;
    }

    const res = camera.resolution;

    // const sx = (mva * x + mvc * y + mve) / res;
    // const sy = (mvb * x + mvd * y + mvf) / res;

	const sx = x; // / res;
    const sy = y; //  / res;

		
    const c = Math.cos(camera.rotation);
    const s = Math.sin(camera.rotation);

    const zoom = camera.zoom;

    const scrollX = camera.scrollX;
    const scrollY = camera.scrollY;
	
	// console.log('camera info: ' + scrollX + ', ' + scrollY + ', ' + zoom + ', ' + res);

    // output.x = sx - (scrollX * c - scrollY * s) * zoom;
    // output.y = sy - (scrollX * s + scrollY * c) * zoom;
    output.x = sx - (scrollX - scrollY) * zoom;
    output.y = sy - (scrollX + scrollY) * zoom;

    return output;
}
	
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
