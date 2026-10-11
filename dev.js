const fs = require('fs');
const path = require('path');
const bs = require('browser-sync').create();

function build() {
  delete require.cache[require.resolve('./build.js')];
  try {
    require('./build.js');
  } catch (e) {
    console.error('Build error:', e.message);
  }
}

build();

bs.init({
  server: '.',
  port: 3000,
  files: ['index.html', 'main.css', 'main.js'],
  open: false,
  notify: false,
});

const watchFiles = ['index.template.html', 'services.json'];
for (const file of watchFiles) {
  let timeout;
  fs.watch(path.join(__dirname, file), () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log(`[${new Date().toLocaleTimeString()}] ${file} changed, rebuilding...`);
      build();
    }, 100);
  });
}

console.log(`Watching: ${watchFiles.join(', ')}`);
