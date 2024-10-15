// Creare un DB SQLite3 "spesa.db" che contenga le seguenti tabelle:
// Utente(username, password, email)
// Prodotto(Id, Nome, Comprato, Utente)
// Il DB deve essere creato solo se non esiste già

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database("spesa.db", (err) => {
    if (err) {
        console.error("Errore nell'apertura del DB", err.message);
    } else {
        console.log("DB aperto con successo");
    }
});

db.serialize(() => {
    
    db.run("CREATE TABLE IF NOT EXISTS Utente (username TEXT NOT NULL, passwd TEXT NOT NULL, email TEXT NOT NULL UNIQUE, PRIMARY KEY(username))");
    
    db.run("CREATE TABLE IF NOT EXISTS Prodotto (Nome TEXT NOT NULL, Comprato INTEGER NOT NULL DEFAULT 0, Id INTEGER NOT NULL, Utente TEXT NOT NULL, FOREIGN KEY('Utente') REFERENCES Utente(username), PRIMARY KEY(Id AUTOINCREMENT))");

}
);

// Creare un programma in Node.js che permetta di:
// 1. Registrare un nuovo utente
// 2. Inserire un prodotto nella lista della spesa
// 3. Contrassegnare come comprato un prodotto esistente
// 4. Visualizzare la lista della spesa di un utente
// 5. Uscire dal programma

import inquirer from 'inquirer';
