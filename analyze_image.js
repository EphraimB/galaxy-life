const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('debug_glitch.png')
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    const width = 80;
    const height = Math.floor(this.height * (width / this.width) * 0.5); // 0.5 because terminal characters are taller than wide
    
    let ascii = '';
    const chars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.floor(x * (this.width / width));
        const srcY = Math.floor(y * (this.height / height));
        
        const idx = (this.width * srcY + srcX) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];
        
        if (a < 128) {
          ascii += ' ';
          continue;
        }
        
        const brightness = (r + g + b) / 3;
        const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
        
        // Let's also encode color in the ASCII if possible, but for now just brightness
        // Actually, let's map specific colors to letters for debugging!
        if (r < 50 && g < 50 && b > 150) {
           ascii += 'B'; // Bright Blue
        } else if (r > 150 && g < 50 && b < 50) {
           ascii += 'R'; // Red
        } else if (r < 50 && g > 150 && b < 50) {
           ascii += 'G'; // Green
        } else if (r < 30 && g < 30 && b < 50) {
           ascii += 'D'; // Dark Blue/Black
        } else {
           ascii += chars[charIdx];
        }
      }
      ascii += '\n';
    }
    
    console.log(ascii);
  });
