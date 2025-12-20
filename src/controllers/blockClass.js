class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tileSize = width;
    this.stsrtX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  draw(ctx) {
    if (!this.image) return;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  updateDirection(direction, image) {
    this.direction = direction;
    if (image) this.image = image;
    this.updateVelocity();
  }

  updateVelocity(tileSize = this.tileSize) {
    if (this.direction === "U") {
      this.velocityX = 0;
      this.velocityY = -tileSize / 4;
    } else if (this.direction === "D") {
      this.velocityX = 0;
      this.velocityY = tileSize / 4;
    } else if (this.direction === "L") {
      this.velocityX = -tileSize / 4;
      this.velocityY = 0;
    } else if (this.direction === "R") {
      this.velocityX = tileSize / 4;
      this.velocityY = 0;
    }
  }
}

export default Block;
