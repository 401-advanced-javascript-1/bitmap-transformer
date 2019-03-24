'use strict';

const fs = require('fs');

// NO, you may not read synchronosly ... this is only for expedience in the demo
const buffer = fs.readFileSync(`${__dirname}/assets/baldy.bmp`);

// Create a naked object to model the bitmap properties
const parsedBitmap = {};

// Identify the offsets by reading the bitmap docs
const FILE_SIZE_OFFSET = 2;
const WIDTH_OFFSET = 18;
const HEIGHT_OFFSET = 22;
const BYTES_PER_PIXEL_OFFSET = 28;
const COLOR_TABLE_OFFSET = 54;

//------------------------------------------------------
// READING INFORMATION FROM THE BITMAP FILE
//------------------------------------------------------
parsedBitmap.type = buffer.toString('utf-8', 0, 2);
parsedBitmap.fileSize = buffer.readInt32LE(FILE_SIZE_OFFSET);
parsedBitmap.bytesPerPixel = buffer.readInt16LE(BYTES_PER_PIXEL_OFFSET);
parsedBitmap.height = buffer.readInt32LE(HEIGHT_OFFSET);
parsedBitmap.width = buffer.readInt32LE(WIDTH_OFFSET);
parsedBitmap.colorTable = buffer.readInt32LE(COLOR_TABLE_OFFSET);

// let colorPallet = buffer.slice(121,1145).toJSON('hex').match(/../g).join(' ');
// let pixels = buffer.slice(1147).toString('hex');
let colorPallet = buffer.slice(121,1145);
// let colorPallet = buffer.slice(121,1145);
// console.log(colorPallet);

let headers = buffer.slice(0,121);
let colors = buffer.slice(121,1146);
let pixels = buffer.slice(1146, buffer.length);
// let newBuffer = Buffer.concat([headers, colors, pixels]);

// for(let i = 6628; i<6700; i++){
//   pixels[i] = '0';
// }

// for(let i = 8644; i<8716; i++){
//   pixels[i] = '0';
// }

for(let i = 121; i<1146; i+=4){
  buffer[i] = Math.floor(Math.random()*(255-0)+0);
  buffer[i+1] = Math.floor(Math.random()*(255-0)+0);
  buffer[i+3] = Math.floor(Math.random()*(255-0)+0);
}

fs.writeFile('./assets/test2.bmp', buffer, (err) => {
  if (err) { throw err; }
});

fs.writeFile('./assets/colorpallet.txt', JSON.stringify(pixels), (err) => {
  if (err) { throw err; }
});

console.log(parsedBitmap);
