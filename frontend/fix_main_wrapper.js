const fs = require('fs');
const FILE_PATH = './src/app/page.js';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const targetRegex = /<div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50 text-gray-900 font-sans overflow-hidden relative">/;

const replacementStr = `<div data-theme={theme} className={\`omni-app flex flex-col h-screen text-gray-900 font-sans overflow-hidden relative \${activeTab === 'home' ? 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50' : activeTab === 'cart' ? 'bg-[url("https://www.transparenttextures.com/patterns/diagonal-stripes.png")] bg-gradient-to-tr from-blue-50 to-purple-50' : 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] bg-gradient-to-bl from-orange-50 to-red-50'} bg-fixed\`}>`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacementStr);
  
  // also fix background: !important to background-color: !important
  content = content.replace(/background: #0f172a !important;/g, "background-color: #0f172a !important;");

  fs.writeFileSync(FILE_PATH, content);
  console.log("Main wrapper fixed successfully!");
} else {
  console.log("Could not find the target string.");
}
