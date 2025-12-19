export function loadImage(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `/statics/${name}.png`;

    img.onload = () => resolve(img);
    img.onerror = () => reject(`Failed to load ${name}`);
  });
}

export async function loadAllImages() {
  const images = {
    pacManUp: await loadImage("pacManUp"),
    pacManDown: await loadImage("pacManDown"),
    pacManLeft: await loadImage("pacManLeft"),
    pacManRight: await loadImage("pacManRight"),
    pacManwall: await loadImage("pacManWall"),
    ghostBlue: await loadImage("ghostBlue"),
    ghostPink: await loadImage("ghostPink"),
    ghostYellow: await loadImage("ghostYellow"),
  };

  return images;
}
