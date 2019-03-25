'use strict';

const fs = require('fs');

/**
 * Bitmap -- receives a file name, used in the transformer to note the new buffer
 * @param filePath
 * @constructor
 */
function Bitmap(filePath) {
  this.file = filePath;
}

/**
 * Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
 * @param buffer
 */
Bitmap.prototype.parse = function(buffer) {
  this.FILE_SIZE_OFFSET = 2;
  this.WIDTH_OFFSET = 18;
  this.HEIGHT_OFFSET = 22;
  this.BYTES_PER_PIXEL_OFFSET = 28;
  this.COLOR_PALLET_OFFSET = 121;
  this.PIXEL_MAP_OFFSET = 1145;

  this.buffer = buffer;
  this.type = buffer.toString('utf-8', 0, 2);
  this.colorPallet = buffer.slice(this.COLOR_PALLET_OFFSET, this.PIXEL_MAP_OFFSET + 1);
  this.pixelMap = buffer.slice(this.PIXEL_MAP_OFFSET, buffer.length);
};

/**
 * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
 * @param operation
 */
Bitmap.prototype.transform = function(operation) {
  // This is really assumptive and unsafe
  transforms[operation](this);
  this.newFile = this.file.replace(/\.bmp/, `.${operation}.bmp`);
};

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 * @param bmp
 */
const transformGreyscale = (bmp) => {

  console.log('Transforming bitmap into greyscale', bmp);
  //TODO: Figure out a way to validate that the bmp instance is actually valid before trying to transform it

  if(Buffer.isBuffer(this.buffer) === false){ return null; }
  for(let i = bmp.PIXEL_MAP_OFFSET - 1; i>bmp.COLOR_PALLET_OFFSET; i-=4){
    let greyScale = (bmp.colorPallet[i-1]+bmp.colorPallet[i-2]+bmp.colorPallet[i-3])/3;
    bmp.colorPallet[i-1] = greyScale;
    bmp.colorPallet[i-2] = greyScale;
    bmp.colorPallet[i-3] = greyScale;
  }
};

/**
 * Bitmap Transformer (inversion)
 * Would be called by Bitmap.transform('invert')
 * @param bmp
 */
const doTheInversion = (bmp) => {
  for(let i = bmp.PIXEL_MAP_OFFSET - 1; i>bmp.COLOR_PALLET_OFFSET; i-=4){
    bmp.colorPallet[i-3] = 255 - bmp.colorPallet[i-3];
    bmp.colorPallet[i-2] = 255 - bmp.colorPallet[i-2];
    bmp.colorPallet[i-1] = 255 - bmp.colorPallet[i-1];
  }
};

/**
 * Bitmap Transformer (robberMask)
 * Would be called by Bitmap.transform('mask')
 * @param bmp
 */
const robberMask = (bmp) => {
  for(let i = 6628; i<8716; i++){
    if(bmp.pixelMap[i] === 244){
      bmp.pixelMap[i] = '10';
    }
  }
};

/**
 * Bitmap Transformer (technicolor)
 * Would be called by Bitmap.transform('technicolor')
 * @param bmp
 */
const technicolor = (bmp) => {
  for(let i = bmp.COLOR_PALLET_OFFSET; i<bmp.PIXEL_MAP_OFFSET; i+=4){
    bmp.buffer[i] = Math.floor(Math.random()*(255-0)+0);
    bmp.buffer[i+1] = Math.floor(Math.random()*(255-0)+0);
    bmp.buffer[i+3] = Math.floor(Math.random()*(255-0)+0);
  }
};

/**
 * A dictionary of transformations
 * Each property represents a transformation that someone could enter on the command line and then a function that would be called on the bitmap to do this job
 */
const transforms = {
  greyscale: transformGreyscale,
  invert: doTheInversion,
  mask: robberMask,
  technicolor: technicolor,
};

// ------------------ GET TO WORK ------------------- //

/**
 * Bitmap Transformer with Callbacks
 * Uses CLI input to execute parse and transform methods on bitmap buffer
 */
function transformWithCallbacks() {

  fs.readFile(file, (err, buffer) => {

    if (err) {
      throw err;
    }

    bitmap.parse(buffer);
    bitmap.transform(operation);

    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    fs.writeFile(bitmap.newFile, bitmap.buffer, (err, out) => {
      if (err) {
        throw err;
      }
      console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    });

  });
}

// TODO: Explain how this works (in your README)
const [file, operation] = process.argv.slice(2);

let bitmap = new Bitmap(file);

transformWithCallbacks();

