const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const createProduct = (data, cb) => {
    if (data.cost_price < 0 || data.margin_percentage < 0) return cb("INVALID_PRICING_FIELDS");
    const id = uuidv4();
    const sql = `INSERT INTO products (id, name, description, cost_price, margin_percentage, image_url, value) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, data.name, data.description, data.cost_price, data.margin_percentage, data.image_url, data.value], function(err) {
        cb(err, { id });
    });
};

const getAvailableProducts = (cb) => {
    const sql = `SELECT id, name, description, image_url, (cost_price * (1 + margin_percentage / 100.0)) as price, is_sold FROM products WHERE is_sold = 0`;
    db.all(sql, [], (err, rows) => cb(err, rows));
};

// חיפוש מוצר לפי שם - שימוש ב-LIKE למציאת התאמה חלקית
const searchProductsByName = (name, cb) => {
    const sql = `SELECT id, name, description, image_url, (cost_price * (1 + margin_percentage / 100.0)) as price, is_sold 
                 FROM products WHERE name LIKE ?`;
    db.all(sql, [`%${name}%`], (err, rows) => cb(err, rows));
};

const purchaseProduct = (productId, resellerPrice, cb) => {
    db.serialize(() => {
        db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, p) => {
            if (err) return cb(err);
            if (!p) return cb("PRODUCT_NOT_FOUND");
            if (p.is_sold === 1) return cb("PRODUCT_ALREADY_SOLD");
            
            const minPrice = p.cost_price * (1 + p.margin_percentage / 100.0);
            if (resellerPrice < minPrice) return cb("RESELLER_PRICE_TOO_LOW");

            db.run(`UPDATE products SET is_sold = 1 WHERE id = ?`, [productId], (err) => {
                cb(err, { value: p.value, final_price: resellerPrice });
            });
        });
    });
};

module.exports = { createProduct, getAvailableProducts, searchProductsByName, purchaseProduct };