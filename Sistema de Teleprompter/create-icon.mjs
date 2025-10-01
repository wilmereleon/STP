import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'img', 'pT.png');
const outputPath = path.join(__dirname, 'build', 'icon.png');

// Crear directorio build si no existe
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
}

Jimp.read(inputPath)
  .then(image => {
    return image
      .resize(256, 256)
      .write(outputPath);
  })
  .then(() => {
    console.log('✓ Icono redimensionado a 256x256 y guardado en build/icon.png');
  })
  .catch(err => {
    console.error('Error:', err);
    // Si falla, simplemente copiar el archivo
    fs.copyFileSync(inputPath, outputPath);
    console.log('✓ PNG copiado a build/icon.png');
  });
