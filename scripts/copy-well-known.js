const fs = require('fs');
const path = require('path');

// Ensure the build/.well-known directory exists
const buildWellKnownDir = path.join(__dirname, '..', 'build', '.well-known');
if (!fs.existsSync(buildWellKnownDir)) {
  fs.mkdirSync(buildWellKnownDir, { recursive: true });
}

// Copy farcaster.json from public/.well-known to build/.well-known
const sourcePath = path.join(__dirname, '..', 'public', '.well-known', 'farcaster.json');
const destPath = path.join(buildWellKnownDir, 'farcaster.json');

try {
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Successfully copied farcaster.json to build/.well-known/');
  
  // Validate the copied file
  const content = fs.readFileSync(destPath, 'utf8');
  const manifest = JSON.parse(content);
  console.log(`✅ Manifest validated: ${manifest.frame.name}`);
} catch (error) {
  console.error('❌ Error copying farcaster.json:', error);
  process.exit(1);
}