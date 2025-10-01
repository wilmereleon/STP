const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'img', 'pT.png');
const outputPath = path.join(__dirname, 'build', 'icon.ico');

// Crear directorio build si no existe
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
}

pngToIco(inputPath)
  .then(buf => {
    fs.writeFileSync(outputPath, buf);
    console.log('✓ Icono .ico creado exitosamente en build/icon.ico');
  })
  .catch(err => {
    console.error('Error al crear el icono:', err);
    // Si falla, copiar el PNG directamente
    fs.copyFileSync(inputPath, path.join(__dirname, 'build', 'icon.png'));
    console.log('✓ PNG copiado a build/icon.png como respaldo');
  });
