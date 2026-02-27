class InventorySlot {
  constructor(itemType = null, quantity = 0) {
    this.itemType = itemType;
    this.quantity = quantity;
  }
}

class Inventory {
  constructor(size = 40) {
    this.slots = Array.from({ length: size }, () => new InventorySlot());
    this.selected = 0;
  }

  addItem(itemType, quantity = 1) {
    // Try to stack in existing slot
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].itemType === itemType) {
        this.slots[i].quantity += quantity;
        return true;
      }
    }

    // Find empty slot
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].itemType === null) {
        this.slots[i].itemType = itemType;
        this.slots[i].quantity = quantity;
        return true;
      }
    }

    return false; // Inventory full
  }

  removeItem(itemType, quantity = 1) {
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i].itemType === itemType) {
        if (this.slots[i].quantity >= quantity) {
          this.slots[i].quantity -= quantity;
          if (this.slots[i].quantity === 0) {
            this.slots[i].itemType = null;
          }
          return true;
        }
      }
    }
    return false;
  }

  getItem(index) {
    if (index >= 0 && index < this.slots.length) {
      return this.slots[index];
    }
    return null;
  }

  getSelectedItem() {
    return this.slots[this.selected];
  }

  selectSlot(index) {
    if (index >= 0 && index < this.slots.length) {
      this.selected = index;
    }
  }

  serialize() {
    return this.slots.map(slot => ({
      itemType: slot.itemType,
      quantity: slot.quantity
    }));
  }
}

export default Inventory;
