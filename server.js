const express = require('express');
const productService = require('./productService');
const path = require('path');
const app = express();

// הגדרות בסיסיות
app.use(express.json());

// התיקון הקריטי: השרת יחפש קבצים בתיקייה public
app.use(express.static(path.join(__dirname, 'public')));

// 1. קבלת מוצרים זמינים
app.get('/api/v1/products', (req, res) => {
    productService.getAvailableProducts((err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(products);
    });
});

// 2. רכישת מוצר (API מאובטח)
app.post('/api/v1/products/:id/purchase', (req, res) => {
    // בדיקת הטוקן
    if (req.headers['authorization'] !== 'Bearer secret-token') {
        return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    productService.purchaseProduct(req.params.id, req.body.reseller_price, (err, result) => {
        if (err === "PRODUCT_NOT_FOUND") return res.status(404).json({ message: "Product not found" });
        if (err === "RESELLER_PRICE_TOO_LOW") return res.status(400).json({ message: "Price too low" });
        if (err) return res.status(500).json({ message: err });
        
        res.json({ product_id: req.params.id, ...result });
    });
});

// 3. Admin API - יצירת מוצר חדש
app.post('/api/admin/products', (req, res) => {
    productService.createProduct(req.body, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json(result);
    });
});

// נתיב גישה ל-HTML הראשי (למקרה שהסטטיק לא מספיק)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));