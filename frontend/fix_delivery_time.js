const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf('<div className="mt-2 flex items-center gap-1">');
if (sIdx !== -1) {
  const replacement = `<div className="mt-2 flex flex-col gap-1 items-start">
                      <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ★ {avgRating}
                      </span>
                      {p.delivery_time && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yetkazib berish sanasi: <br/><b className="text-black dark:text-white">{p.delivery_time}</b></span>
                      )}
                    </div>`;
  const eIdx = code.indexOf('</div>', sIdx + 50);
  code = code.substring(0, sIdx) + replacement + code.substring(eIdx + 6);
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed delivery time display on home page');
}
