const express = require('express');
const productService = require('./productService');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/v1/products', (req, res) => {
    productService.getAvailableProducts((err, products) => {
        if (err) return res.status(500).json({ error_code: "INTERNAL_ERROR", message: err.message });
        res.json(products);
    });
});

// אנדפוינט לחיפוש מוצר לפי שם
app.get('/api/v1/products/search/:name', (req, res) => {
    productService.searchProductsByName(req.params.name, (err, products) => {
        if (err) return res.status(500).json({ error_code: "INTERNAL_ERROR", message: err.message });
        res.json(products);
    });
});

app.post('/api/v1/products/:id/purchase', (req, res) => {
    if (req.headers['authorization'] !== 'Bearer secret-token') {
        return res.status(401).json({ error_code: "UNAUTHORIZED", message: "Invalid token" });
    }
    productService.purchaseProduct(req.params.id, req.body.reseller_price, (err, result) => {
        if (err === "PRODUCT_NOT_FOUND") return res.status(404).json({ error_code: "PRODUCT_NOT_FOUND", message: "Product not found" });
        if (err === "PRODUCT_ALREADY_SOLD") return res.status(409).json({ error_code: "PRODUCT_ALREADY_SOLD", message: "Product already sold" });
        if (err === "RESELLER_PRICE_TOO_LOW") return res.status(400).json({ error_code: "RESELLER_PRICE_TOO_LOW", message: "Price too low" });
        if (err) return res.status(500).json({ error_code: "INTERNAL_ERROR", message: err.message });
        res.json({ product_id: req.params.id, ...result });
    });
});

app.post('/api/admin/products', (req, res) => {
    productService.createProduct(req.body, (err, result) => {
        if (err === "INVALID_PRICING_FIELDS") return res.status(400).json({ error_code: "INVALID_INPUT", message: "Prices cannot be negative" });
        if (err) return res.status(500).json({ error_code: "INTERNAL_ERROR", message: err.message });
        res.status(201).json(result);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));