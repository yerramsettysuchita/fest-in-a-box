const { execSync } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

try {
  console.log('Installing frontend dependencies...');
  // Try using npm through the node executable directly
  const npmPath = path.join(process.execPath, '..', 'npm.cmd');
  
  // Try alternative approach - use node_modules/.bin/npm if it exists
  execSync('node node_modules/.bin/npm install', { 
    cwd: frontendDir, 
    stdio: 'inherit',
    shell: true,
    windowsHide: false
  });
  console.log('Frontend dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install frontend dependencies:', error.message);
  
  // Fallback: try to directly invoke npm-cli.js with node
  try {
    console.log('Trying alternative npm installation method...');
    const npmCliPath = path.join(process.execPath, '..', '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js');
    execSync(`node "${npmCliPath}" install`, { 
      cwd: frontendDir, 
      stdio: 'inherit',
      shell: false
    });
    console.log('Frontend dependencies installed successfully!');
  } catch (fallbackError) {
    console.error('Fallback installation also failed:', fallbackError.message);
    process.exit(1);
  }
}
