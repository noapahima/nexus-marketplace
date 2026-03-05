# Nexus Marketplace

## Overview
מערכת Backend לניהול ושיווק קופונים, התומכת בלקוחות ישירים ובמשווקים חיצוניים (API).

## Tech Stack
- Node.js & Express
- SQLite3
- Docker

## Endpoints
- `GET /api/v1/products` - קבלת רשימת מוצרים זמינים.
- `POST /api/v1/products/:id/purchase` - רכישת מוצר (דורש Bearer Token).
- `POST /api/admin/products` - יצירת מוצר חדש (Admin).

## Docker
לבנייה: `docker build -t nexus-marketplace .`
להרצה: `docker run -p 3000:3000 nexus-marketplace`