const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/images/sequence';
const outputDir = './public/images/sequence-optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.webp'));

let processed = 0;

console.log(`${files.length} ta rasm optimizatsiya qilinmoqda...\n`);

files.forEach((file) => {
  sharp(path.join(inputDir, file))
    .resize(1280, 720, { fit: 'inside' })
    .webp({ quality: 60, effort: 4 })
    .toFile(path.join(outputDir, file))
    .then(() => {
      processed++;
      console.log(`✅ ${processed}/${files.length} - ${file}`);

      if (processed === files.length) {
        console.log('\n🎉 Tayyor!');
      }
    })
    .catch(err => {
      console.error(`❌ ${file}: ${err.message}`);
    });
});
