import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Testing Farcaster Manifest Setup...\n');

// Test 1: Check if source manifest exists
const sourcePath = path.join(__dirname, '..', 'public', '.well-known', 'farcaster.json');
console.log('1. Checking source manifest in public/.well-known/');
if (fs.existsSync(sourcePath)) {
  console.log('   ✅ Source manifest exists');
  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  console.log(`   📋 App name: ${sourceContent.frame.name}`);
  console.log(`   🌐 Home URL: ${sourceContent.frame.homeUrl}`);
} else {
  console.log('   ❌ Source manifest not found');
}

// Test 2: Check if build manifest exists
const buildPath = path.join(__dirname, '..', 'build', '.well-known', 'farcaster.json');
console.log('\n2. Checking build manifest in build/.well-known/');
if (fs.existsSync(buildPath)) {
  console.log('   ✅ Build manifest exists');
  const buildContent = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
  console.log(`   📋 App name: ${buildContent.frame.name}`);
  
  // Test 3: Compare source and build
  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  if (JSON.stringify(sourceContent) === JSON.stringify(buildContent)) {
    console.log('   ✅ Source and build manifests match');
  } else {
    console.log('   ⚠️  Source and build manifests differ');
  }
} else {
  console.log('   ❌ Build manifest not found');
  console.log('   💡 Run "npm run build" to generate it');
}

// Test 4: Validate manifest structure
console.log('\n3. Validating manifest structure...');
try {
  const manifest = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
  
  const requiredFields = [
    'frame.name',
    'frame.homeUrl', 
    'frame.iconUrl',
    'frame.version'
  ];
  
  let allValid = true;
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], manifest);
    if (value) {
      console.log(`   ✅ ${field}: ${value}`);
    } else {
      console.log(`   ❌ Missing ${field}`);
      allValid = false;
    }
  });
  
  if (allValid) {
    console.log('\n🎉 Manifest validation successful!');
    console.log('\n📝 Next steps:');
    console.log('   1. Deploy your application');
    console.log('   2. Test manifest at: https://yourdomain.com/.well-known/farcaster.json');
    console.log('   3. Verify Content-Type: application/json header is set');
  }
  
} catch (error) {
  console.log(`   ❌ Manifest validation failed: ${error}`);
}