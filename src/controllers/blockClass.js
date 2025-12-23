class Block {
  constructor(image, x, y, name, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.name = name;
    this.width = width;
    this.height = height;
    this.tileSize = width;
    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  drawBlock(ctx, actors = null) {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      return;
    }

    switch (this.name) {
      case "p":
        ctx.fillStyle = "pink";
        break;
      case "y":
        ctx.fillStyle = "yellow";
        break;
      case "b":
        ctx.fillStyle = "blue";
        break;
      case "x":
        ctx.fillStyle = "brown";
        break;
      case "1":
        ctx.fillStyle = "red";
        break;
      case ".": {
        if (this.isOccupied(actors)) return;

        const size = 5;
        const x = this.x + (this.width - size) / 2;
        const y = this.y + (this.height - size) / 2;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, size, size);
        return;
      }
      default:
        return;
    }
    ctx.fillRect(this.x, this.y, this.width, this.width);
  }

  updateDirection(direction, image = this.image) {
    this.direction = direction;
    if (image) this.image = image;
    this.updateVelocity();
  }

  updateVelocity() {
    if (this.direction === "U") {
      this.velocityX = 0;
      this.velocityY = -this.tileSize;
    } else if (this.direction === "D") {
      this.velocityX = 0;
      this.velocityY = this.tileSize;
    } else if (this.direction === "L") {
      this.velocityX = -this.tileSize;
      this.velocityY = 0;
    } else if (this.direction === "R") {
      this.velocityX = this.tileSize;
      this.velocityY = 0;
    }
  }

  toStop() {
    this.x -= this.velocityX;
    this.y -= this.velocityY;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  isColliding(b) {
    return (
      this.x < b.x + b.width &&
      this.x + this.width > b.x &&
      this.y + this.height > b.y &&
      this.y < b.y + b.height
    );
  }

  checkBoundary(boardDimensions) {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > boardDimensions.width)
      this.x = boardDimensions.width - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > boardDimensions.height)
      this.y = boardDimensions.height - this.height;
  }

  isOccupied(actors) {
    if (!actors) return false;
    for (let a of actors.values()) {
      if (!a) continue;
      if (
        Math.floor(a.x / this.tileSize) ===
          Math.floor(this.x / this.tileSize) &&
        Math.floor(a.y / this.tileSize) === Math.floor(this.y / this.tileSize)
      ) {
        return true;
      }
    }
    return false;
  }
}

export default Block;
