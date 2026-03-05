-- יצירת טבלת מוצרים עם מזהה ייחודי מסוג UUID ומחיר בסיס
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cost_price REAL NOT NULL,
    margin_percentage REAL NOT NULL,
    image_url TEXT,
    value TEXT NOT NULL,
    is_sold INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);