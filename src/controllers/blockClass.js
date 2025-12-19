class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.stsrtX = x;
    this.startY = y;
  }

  draw(ctx) {
    if (!this.image) return;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

export default Block;
