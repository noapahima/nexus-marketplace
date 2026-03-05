const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// יצירת הקובץ אם הוא לא קיים
const db = new sqlite3.Database('./database.sqlite');

// הרצת ה-schema שכתבנו למעלה
const schema = fs.readFileSync('./schema.sql', 'utf8');
db.exec(schema, (err) => {
    if (err) {
        console.error("Error setting up the database", err);
    } else {
        console.log("Database configured successfully");
    }
});

module.exports = db;