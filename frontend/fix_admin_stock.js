const fs = require('fs');

let adminCode = fs.readFileSync('src/app/admin/page.js', 'utf8');

const stockInputRegex = /<label className="block text-sm text-gray-400 mb-1">Qoldiq \(Soni\)<\/label>[\s\S]*?<\/div>/;

if (adminCode.match(stockInputRegex)) {
  const newInputs = `<label className="block text-sm text-gray-400 mb-1">Qoldiq soni (Sotuvdagi)</label>
                <input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} 
                  className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Qolgan" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Umumiy tovarlar soni (Boshlang'ich)</label>
                <input type="number" value={originalStock} onChange={e => setOriginalStock(e.target.value)} 
                  className="w-full bg-gray-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Umumiy keltirilgan" />
              </div>`;
  adminCode = adminCode.replace(stockInputRegex, newInputs);
  fs.writeFileSync('src/app/admin/page.js', adminCode);
  console.log('Fixed admin stock inputs');
} else {
  console.log('Could not find stock inputs');
}
