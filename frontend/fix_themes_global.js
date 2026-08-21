const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// Global replaces for light/dark theme exact colors
// Backgrounds
code = code.replace(/bg-gray-50/g, 'bg-slate-50 dark:bg-slate-900');
// We need to be careful with bg-white so it doesn't break string literals that already have dark:bg-black
// If there's a standalone bg-white, replace it with bg-white dark:bg-black
code = code.replace(/\bbg-white(?!\s+dark:)/g, 'bg-white dark:bg-black');

// Text colors
code = code.replace(/text-gray-500/g, 'text-slate-900 dark:text-white opacity-80');
code = code.replace(/text-gray-600/g, 'text-slate-900 dark:text-white opacity-90');
code = code.replace(/text-gray-700/g, 'text-slate-900 dark:text-white');
code = code.replace(/text-gray-800/g, 'text-slate-900 dark:text-white font-semibold');
code = code.replace(/text-gray-900/g, 'text-slate-900 dark:text-white font-bold');
code = code.replace(/text-gray-400/g, 'text-slate-500 dark:text-slate-400');
// Remove conflicting text-black
code = code.replace(/\btext-black(?!\s+dark:)/g, 'text-slate-900 dark:text-white');

// Borders
code = code.replace(/border-gray-100/g, 'border-slate-200 dark:border-slate-800');
code = code.replace(/border-gray-200/g, 'border-slate-200 dark:border-slate-800');
code = code.replace(/border-gray-300/g, 'border-slate-300 dark:border-slate-700');

// Fix explicit ternary wrappers that might be broken now
code = code.replace(/theme === 'dark' \? 'dark bg-black' : 'bg-white dark:bg-black'/g, "theme === 'dark' ? 'dark bg-black' : 'bg-white'");
code = code.replace(/theme === 'dark' \? 'dark bg-black text-white' : 'bg-white dark:bg-black text-slate-900 dark:text-white font-bold'/g, "theme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-slate-900'");

fs.writeFileSync('src/app/page.js', code);
console.log('Themes applied');
