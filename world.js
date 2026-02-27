class Block {
  constructor(type = 'air', owner = null, background = '', plantedAt = null) {
    this.type = type;
    this.owner = owner;
    this.background = background;
    this.plantedAt = plantedAt;
  }
}

class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => new Block())
    );
    this._initializeWorld();
  }

  _initializeWorld() {
    // Generate some basic terrain
    for (let x = 0; x < this.width; x++) {
      for (let y = 30; y < this.height; y++) {
        if (y < 35) {
          this.grid[x][y].type = 'dirt';
        } else {
          this.grid[x][y].type = 'rock';
        }
      }
    }
  }

  getBlock(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    }
    return this.grid[x][y];
  }

  setBlock(x, y, type, owner = null, background = '') {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return false;
    }
    const block = this.grid[x][y];
    block.type = type;
    block.owner = owner || block.owner;
    block.background = background || block.background;
    block.plantedAt = Date.now();
    return true;
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      grid: this.grid.map(col =>
        col.map(b => ({
          type: b.type,
          owner: b.owner,
          background: b.background
        }))
      )
    };
  }
}

export default World;
