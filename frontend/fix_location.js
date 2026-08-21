const fs = require('fs');

// --- Fix frontend/src/app/page.js ---
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

// 1. Fix Onboarding Input styling
const oldOnboardDiv = '<div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl border border-gray-100">';
const newOnboardDiv = '<div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">';
pageContent = pageContent.replace(oldOnboardDiv, newOnboardDiv);

const oldOnboardInput = `className="w-full border border-gray-200 rounded-xl p-4 text-center font-bold text-lg mb-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"`;
const newOnboardInput = `className="w-full border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl p-4 text-center font-bold text-lg mb-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900 dark:text-white"`;
pageContent = pageContent.replace(oldOnboardInput, newOnboardInput);


// 2. Add Location State & UI
// Add state
const stateInsertPos = pageContent.indexOf('const [checkoutPhone2, setCheckoutPhone2] = useState(\'\');');
if (stateInsertPos !== -1 && !pageContent.includes('const [location, setLocation] = useState(null);')) {
  pageContent = pageContent.slice(0, stateInsertPos) + 
    "const [location, setLocation] = useState(null);\n    const [locationLoading, setLocationLoading] = useState(false);\n    " + 
    pageContent.slice(stateInsertPos);
}

// Add location button UI in checkout form
const oldCheckoutFormButton = `<button onClick={() => {
                if(!checkoutName || !checkoutPhone1) return alert(tr("Ism va asosiy telefon raqamini kiriting!"));
                if(cart.length === 0) return alert(tr("Savatingiz bo'sh!"));`;

const newLocationUI = `<div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tr("Yetkazib berish manzili")}</label>
                  <button 
                    onClick={() => {
                      setLocationLoading(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          setLocationLoading(false);
                        },
                        (err) => {
                          alert("Lokatsiyani aniqlab bo'lmadi. Iltimos, ruxsat bering.");
                          setLocationLoading(false);
                        },
                        { enableHighAccuracy: true }
                      );
                    }}
                    className={\`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border \${location ? 'bg-green-500/10 text-green-600 border-green-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent'}\`}
                  >
                    📍 {locationLoading ? "Aniqlanmoqda..." : location ? "Lokatsiya belgilandi ✓" : "Lokatsiyamni aniqlash"}
                  </button>
                </div>
                
                <button onClick={() => {
                if(!checkoutName || !checkoutPhone1) return alert(tr("Ism va asosiy telefon raqamini kiriting!"));
                if(!location) return alert(tr("Iltimos, yetkazib berish manzili (lokatsiya)ni belgilang!"));
                if(cart.length === 0) return alert(tr("Savatingiz bo'sh!"));`;

pageContent = pageContent.replace(oldCheckoutFormButton, newLocationUI);

// Add Lokatsiya string to translations if we need to. But let's just use it directly or add to tr.
// It's fine to just use tr() if it falls back to the key string.

// Update submitCheckout DB insert
const oldCheckoutInsert = `receipt_image_url: receiptUrl
        }));`;

const newCheckoutInsert = `receipt_image_url: receiptUrl,
          latitude: location?.lat || null,
          longitude: location?.lng || null
        }));`;

pageContent = pageContent.replace(oldCheckoutInsert, newCheckoutInsert);

fs.writeFileSync('src/app/page.js', pageContent);

// --- Fix frontend/src/app/admin/page.js ---
let adminContent = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Display location in Admin panel
const oldAdminRender = `{order.receipt_image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Chek rasmi:</p>`;

const newAdminRender = `{(order.latitude && order.longitude) && (
                  <div className="mt-4 bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <a href={\`https://yandex.com/maps/?pt=\${order.longitude},\${order.latitude}&z=18&l=map\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold">
                      📍 Xaritada ko'rish (Lokatsiya)
                    </a>
                  </div>
                )}
                {order.receipt_image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Chek rasmi:</p>`;

adminContent = adminContent.replace(oldAdminRender, newAdminRender);

fs.writeFileSync('src/app/admin/page.js', adminContent);
console.log('Location and UI bugs fixed!');
