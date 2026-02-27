class Lock {
  constructor(x, y, size, owner) {
    this.x = x;
    this.y = y;
    this.size = size; // 10: small, 30: big, 60: huge, 100: world
    this.owner = owner;
    this.friends = [];
    this.banned = [];
  }

  contains(px, py) {
    return (
      px >= this.x &&
      py >= this.y &&
      px < this.x + this.size &&
      py < this.y + this.size
    );
  }

  canAccess(userId) {
    if (this.owner === userId) return true;
    if (this.friends.includes(userId)) return true;
    if (this.banned.includes(userId)) return false;
    return false;
  }

  addFriend(userId) {
    if (!this.friends.includes(userId)) {
      this.friends.push(userId);
    }
  }

  removeFriend(userId) {
    this.friends = this.friends.filter(id => id !== userId);
  }

  ban(userId) {
    if (!this.banned.includes(userId)) {
      this.banned.push(userId);
    }
  }
}

class Locks {
  constructor() {
    this.locks = [];
  }

  placeLock(x, y, size, owner) {
    const lock = new Lock(x, y, size, owner);
    this.locks.push(lock);
    return lock;
  }

  removeLock(x, y) {
    this.locks = this.locks.filter(lock => !(lock.x === x && lock.y === y));
  }

  getLockAt(x, y) {
    return this.locks.find(lock => lock.contains(x, y));
  }

  isProtected(x, y, userId) {
    const lock = this.getLockAt(x, y);
    if (!lock) return false;
    return !lock.canAccess(userId);
  }

  getAllLocks() {
    return this.locks;
  }
}

export default Locks;
