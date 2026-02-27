class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.socket = io();
    this.userId = null;
    this.world = null;
    this.players = new Map();
    this.playerSprite = null;
    this.blocks = new Map();
    this.selectedBlock = 'dirt';
    this.inventory = [];
  }

  create() {
    // Socket event listeners
    this.socket.on('init', (data) => {
      this.userId = data.userId;
      this.world = data.world;
      this.loadWorld();
      this.setupPlayers(data.players);
      this.setupUI();
      console.log(`[CLIENT] User ID: ${this.userId}`);
    });

    this.socket.on('world:blockPlaced', (data) => {
      this.updateBlock(data.x, data.y, data.type);
    });

    this.socket.on('world:blockBroken', (data) => {
      this.updateBlock(data.x, data.y, 'air');
    });

    this.socket.on('player:joined', (data) => {
      this.addPlayer(data.id, data.name, data.x, data.y);
    });

    this.socket.on('player:moved', (data) => {
      if (data.id !== this.userId) {
        this.movePlayer(data.id, data.x, data.y);
      }
    });

    this.socket.on('player:left', (data) => {
      this.removePlayer(data.id);
    });

    this.socket.on('error', (msg) => {
      console.error(`[ERROR] ${msg}`);
    });

    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === '1') this.selectedBlock = 'dirt';
      if (event.key === '2') this.selectedBlock = 'rock';
      if (event.key === '3') this.selectedBlock = 'grass';
      if (event.key === '4') this.selectedBlock = 'water';
      if (event.key === '5') this.selectedBlock = 'sand';
      if (event.key === ' ') {
        this.placeBlock();
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.button === 0) {
        // Left click - place block
        this.placeBlock();
      } else if (pointer.button === 2) {
        // Right click - break block
        this.breakBlock();
      }
    });

    this.input.mouse.disableContextMenu();

    // Update loop
    this.time.addEvent({
      delay: 100,
      callback: () => this.updatePlayerPosition(),
      loop: true,
    });
  }

  loadWorld() {
    const tileWidth = 16;
    const tileHeight = 16;

    for (let x = 0; x < this.world.width; x++) {
      for (let y = 0; y < this.world.height; y++) {
        const block = this.world.grid[x][y];
        if (block.type !== 'air') {
          this.createBlockSprite(x, y, block.type, tileWidth, tileHeight);
        }
      }
    }
  }

  createBlockSprite(x, y, type, width, height) {
    const key = `${x},${y}`;
    const colors = {
      dirt: 0x8B4513,
      rock: 0x404040,
      grass: 0x228B22,
      water: 0x4169E1,
      sand: 0xFFD700,
      tree: 0x2F4F2F,
      lava: 0xFF4500,
      cave_bg: 0x696969,
      rice: 0xDAA520,
      fire_seed: 0xFF6347,
      mud: 0x654321,
      cactus: 0x6B8E23,
      root: 0x8B4513,
      crystal: 0x00CED1,
      flower: 0xFFB6C1,
      pearl: 0xFFFFFF,
    };

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(colors[type] || 0x000000, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.strokeStyle(0x000000, 0.5);
    graphics.strokeRect(0, 0, width, height);

    const texture = graphics.generateTexture(`tile_${type}_${key}`, width, height);
    graphics.destroy();

    const sprite = this.add.sprite(x * width + width / 2, y * height + height / 2, texture.key);
    sprite.setDisplayOrigin(0, 0);
    sprite.x = x * width;
    sprite.y = y * height;

    this.blocks.set(key, { sprite, type });
  }

  setupPlayers(playersData) {
    playersData.forEach(p => {
      this.addPlayer(p.id, p.name, p.x, p.y);
    });
  }

  addPlayer(id, name, x, y) {
    if (id === this.userId) {
      // Create self
      this.playerSprite = this.add.rectangle(x * 16 + 8, y * 16 + 8, 12, 12, 0x00FF00);
      this.playerSprite.setInteractive();
    } else {
      // Create other player
      const sprite = this.add.rectangle(x * 16 + 8, y * 16 + 8, 12, 12, 0xFF00FF);
      this.players.set(id, {
        sprite,
        name,
        x,
        y,
      });
    }
  }

  removePlayer(id) {
    const player = this.players.get(id);
    if (player) {
      player.sprite.destroy();
      this.players.delete(id);
    }
  }

  movePlayer(id, x, y) {
    const player = this.players.get(id);
    if (player) {
      player.x = x;
      player.y = y;
      player.sprite.x = x * 16 + 8;
      player.sprite.y = y * 16 + 8;
    }
  }

  updatePlayerPosition() {
    if (!this.playerSprite || !this.playerSprite.active) return;

    let moved = false;
    let newX = Math.floor(this.playerSprite.x / 16);
    let newY = Math.floor(this.playerSprite.y / 16);

    if (this.cursors.left.isDown) newX--;
    if (this.cursors.right.isDown) newX++;
    if (this.cursors.up.isDown) newY--;
    if (this.cursors.down.isDown) newY++;

    newX = Phaser.Math.Clamp(newX, 0, this.world.width - 1);
    newY = Phaser.Math.Clamp(newY, 0, this.world.height - 1);

    this.playerSprite.x = newX * 16 + 8;
    this.playerSprite.y = newY * 16 + 8;

    this.socket.emit('player:move', { x: newX, y: newY });
    this.updateUICoords(newX, newY);
  }

  placeBlock() {
    const x = Math.floor(this.playerSprite.x / 16);
    const y = Math.floor(this.playerSprite.y / 16);

    // Check distance
    if (Math.abs(x - Math.floor(this.playerSprite.x / 16)) > 2 ||
        Math.abs(y - Math.floor(this.playerSprite.y / 16)) > 2) {
      return;
    }

    this.socket.emit('world:placeBlock', { x, y, type: this.selectedBlock });
  }

  breakBlock() {
    const x = Math.floor((this.input.mousePointer.x + this.cameras.main.scrollX) / 16);
    const y = Math.floor((this.input.mousePointer.y + this.cameras.main.scrollY) / 16);

    this.socket.emit('world:breakBlock', { x, y });
  }

  updateBlock(x, y, type) {
    const key = `${x},${y}`;
    const existing = this.blocks.get(key);

    if (existing) {
      if (type === 'air') {
        existing.sprite.destroy();
        this.blocks.delete(key);
      } else {
        existing.sprite.destroy();
        this.createBlockSprite(x, y, type, 16, 16);
      }
    } else if (type !== 'air') {
      this.createBlockSprite(x, y, type, 16, 16);
    }
  }

  setupUI() {
    document.getElementById('player-name').textContent = `Player: ${this.userId.slice(0, 8)}`;
    this.updateUICoords(0, 0);
  }

  updateUICoords(x, y) {
    document.getElementById('player-coords').textContent = `X: ${x}, Y: ${y}`;
  }

  update() {
    // Game loop updates
  }
}

export default GameScene;
