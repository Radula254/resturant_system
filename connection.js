const mysql = require('mysql2');

//database connection
const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'resturant'
};

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database.', err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = connection;
