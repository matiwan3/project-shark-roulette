const sqlite3 = require('sqlite3').verbose();

function addRecord(name, highestBalance, callback) {
    const db = new sqlite3.Database('local.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            callback(err);
            return;
        }

        // Insert the new record
        db.run('INSERT INTO users (name, highestBalance) VALUES (?, ?)', [name, highestBalance], function (err) {
            if (err) {
                console.error('Error adding record:', err.message);
                callback(err);
                db.close(); // Ensure database is closed even on error
                return;
            }

            // Select all records after insertion
            db.all('SELECT * FROM users', (err, rows) => {
                if (err) {
                    console.error('Error checking records:', err.message);
                    callback(err);
                } else {
                    callback(null, rows);
                }

                // Close the database after all operations
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    }
                });
            });
        });
    });
}

function removeAllRecords(callback) {
    const db = new sqlite3.Database('local.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            callback(err);
            return;
        }

        // Delete all records from the users table
        db.run('DELETE FROM users', function(err) {
            if (err) {
                console.error('Error deleting records:', err.message);
                callback(err);
                db.close(); // Ensure database is closed even on error
                return;
            }

            // Check if table is empty after deletion
            db.all('SELECT * FROM users', (err, rows) => {
                if (err) {
                    console.error('Error checking records:', err.message);
                    callback(err);
                } else {
                    callback(null, rows);
                }

                // Close the database after all operations
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    }
                });
            });
        });
    });
}


export default function updateRanking(username, balance, callback) {
    const db = new sqlite3.Database('local.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            callback(err);
            return;
        }

        db.serialize(() => {
            // Step 1: Check if the username already exists in the database
            db.get('SELECT * FROM users WHERE name = ?', [username], (err, user) => {
                if (err) {
                    console.error('Error checking user:', err.message);
                    callback(err);
                    db.close();
                    return;
                }

                if (user) {
                    // Username exists, update the highest balance if the new balance is higher
                    if (balance > user.highestBalance) {
                        db.run('UPDATE users SET highestBalance = ? WHERE name = ?', [balance, username], function(err) {
                            if (err) {
                                console.error('Error updating balance:', err.message);
                                callback(err);
                                db.close();
                                return;
                            }
                            finalizeUpdate();
                        });
                    } else {
                        // If balance is not higher, just return current top 3
                        finalizeUpdate();
                    }
                } else {
                    // Username does not exist, insert new record if it qualifies for top 3
                    processNewRecord();
                }
            });

            function processNewRecord() {
                // Step 2: Retrieve the current top 3 records
                db.all('SELECT * FROM users ORDER BY highestBalance DESC LIMIT 3', (err, rows) => {
                    if (err) {
                        console.error('Error retrieving records:', err.message);
                        callback(err);
                        db.close();
                        return;
                    }

                    // Step 3: Check if the new balance should be in the top 3
                    if (rows.length < 3 || balance > rows[rows.length - 1].highestBalance) {
                        // Begin transaction
                        db.run('BEGIN TRANSACTION');

                        // If already 3 records, delete the record with the lowest balance
                        if (rows.length === 3) {
                            db.run('DELETE FROM users WHERE id = ?', rows[rows.length - 1].id, (err) => {
                                if (err) {
                                    console.error('Error deleting record:', err.message);
                                    db.run('ROLLBACK');
                                    callback(err);
                                    db.close();
                                    return;
                                }
                                insertNewRecord();
                            });
                        } else {
                            insertNewRecord();
                        }
                    } else {
                        // If the new balance is not in the top 3, return the current top 3 records
                        finalizeUpdate();
                    }
                });
            }

            function insertNewRecord() {
                // Insert the new record
                db.run('INSERT INTO users (name, highestBalance) VALUES (?, ?)', [username, balance], function(err) {
                    if (err) {
                        console.error('Error adding record:', err.message);
                        db.run('ROLLBACK');
                        callback(err);
                        db.close();
                        return;
                    }
                    commitTransaction();
                });
            }

            function commitTransaction() {
                // Commit transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Error committing transaction:', err.message);
                        db.run('ROLLBACK');
                        callback(err);
                        db.close();
                        return;
                    }
                    finalizeUpdate();
                });
            }

            function finalizeUpdate() {
                // Retrieve the updated top 3 records and return them
                db.all('SELECT * FROM users ORDER BY highestBalance DESC LIMIT 3', (err, updatedRows) => {
                    if (err) {
                        console.error('Error retrieving updated records:', err.message);
                        callback(err);
                    } else {
                        callback(null, updatedRows);
                    }

                    // Close the database after all operations
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        }
                    });
                });
            }
        });
    });
}

updateRanking('Igor', 4000, (err, rows) => {
    if (err) {
        console.error('Error updating ranking:', err.message);
    } else {
        console.log('Updated top 3 records:', rows);
    }
});

