const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// 1. יצירת מוצר חדש (Admin API)
const createProduct = (data, cb) => {
    const id = uuidv4();
    const sql = `INSERT INTO products (id, name, description, cost_price, margin_percentage, image_url, value) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, data.name, data.description, data.cost_price, data.margin_percentage, data.image_url, data.value], function(err) {
        cb(err, { id });
    });
};

// 2. קבלת מוצרים זמינים (Reseller/Customer API)
// כאן אנחנו מחשבים את ה-minimum_sell_price בתוך ה-SQL כדי שהחישוב יקרה בשרת
const getAvailableProducts = (cb) => {
    const sql = `SELECT id, name, description, image_url, 
                 (cost_price * (1 + margin_percentage / 100.0)) as price 
                 FROM products WHERE is_sold = 0`;
    db.all(sql, [], (err, rows) => {
        cb(err, rows);
    });
};

// 3. רכישת מוצר (Atomic Purchase)
const purchaseProduct = (productId, resellerPrice, cb) => {
    db.serialize(() => {
        // בדיקה שהמוצר קיים ולא נמכר
        db.get(`SELECT * FROM products WHERE id = ? AND is_sold = 0`, [productId], (err, p) => {
            if (err) return cb(err);
            if (!p) return cb("PRODUCT_NOT_FOUND");
            
            // חישוב המחיר המינימלי לפי הנוסחה
            const minPrice = p.cost_price * (1 + p.margin_percentage / 100.0);
            if (resellerPrice < minPrice) return cb("RESELLER_PRICE_TOO_LOW");

            // עדכון המכירה (אטומי)
            db.run(`UPDATE products SET is_sold = 1 WHERE id = ?`, [productId], (err) => {
                cb(err, { value: p.value, final_price: resellerPrice });
            });
        });
    });
};

module.exports = { createProduct, getAvailableProducts, purchaseProduct };