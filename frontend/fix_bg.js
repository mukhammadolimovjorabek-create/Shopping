const fs = require('fs');
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

// The line we want to replace looks like this:
// <div data-theme={theme} className={`omni-app flex flex-col h-screen text-gray-900 font-sans overflow-hidden relative ${activeTab === 'home' ? 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50' : activeTab === 'cart' ? 'bg-[url("https://www.transparenttextures.com/patterns/diagonal-stripes.png")] bg-gradient-to-tr from-blue-50 to-purple-50' : 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] bg-gradient-to-bl from-orange-50 to-red-50'} bg-fixed`}>

const startStr = "<div data-theme={theme} className={`omni-app flex flex-col h-screen text-gray-900 font-sans overflow-hidden relative ${";
const endStr = "} bg-fixed`}>";

const startIdx = pageContent.indexOf(startStr);
if (startIdx !== -1) {
  const endIdx = pageContent.indexOf(endStr, startIdx);
  if (endIdx !== -1) {
    const newDiv = '<div data-theme={theme} className="omni-app flex flex-col h-screen text-gray-900 dark:text-gray-100 font-sans overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0a] transition-colors">';
    pageContent = pageContent.substring(0, startIdx) + newDiv + pageContent.substring(endIdx + endStr.length);
  }
}

fs.writeFileSync('src/app/page.js', pageContent);
console.log("Background fixed!");
