const fs = require('fs');
const path = require('path');

const makeDirs = [
  () => fs.mkdirSync(path.resolve(__dirname, '..', 'public')),
  () => fs.mkdirSync(path.resolve(__dirname, '..', 'public', 'bootstrap')),
  () => fs.mkdirSync(path.resolve(__dirname, '..', 'public', 'jquery')),
  () => fs.mkdirSync(path.resolve(__dirname, '..', 'public', 'bootstrap', 'css')),
  () => fs.mkdirSync(path.resolve(__dirname, '..', 'public', 'bootstrap', 'js')),
];

makeDirs.forEach((fn) => {
  try {
    fn();
  } catch (error) {}
});

fs.copyFileSync(
  path.resolve(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'),
  path.resolve(__dirname, '..', 'public', 'bootstrap', 'css', 'bootstrap.min.css')
);

fs.copyFileSync(
  path.resolve(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js'),
  path.resolve(__dirname, '..', 'public', 'bootstrap', 'js', 'bootstrap.min.js')
);

fs.copyFileSync(
  path.resolve(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js'),
  path.resolve(__dirname, '..', 'public', 'jquery', 'jquery.min.js')
);
