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

db.get("PRAGMA foreign_keys = ON");

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

const menu = [
    {
        type: 'list',
        name: 'opzione',
        message: 'Cosa vuoi fare?',
        choices: ['Registrare un nuovo utente', 'Inserire un prodotto nella lista della spesa', 'Contrassegnare come comprato un prodotto esistente', 'Visualizzare la lista della spesa di un utente', 'Uscire dal programma']
    }
];

const registra = [
    {
        type: 'input',
        name: 'username',
        message: 'Inserisci il tuo username',
        validate: function(value) {
            if (value.length) {
                return true;
            } else {
                return 'Inserisci il tuo username';
            }
        }
    },
    {
        type: 'password',
        name: 'passwd',
        message: 'Inserisci la tua password',
        validate: function(value) {
            if (value.length && isValidPassword(value)) {
                return true;
            } else {
                return 'Inserisci una password valida';
            }
        }
    },
    {
        type: 'input',
        name: 'email',
        message: 'Inserisci la tua email',
        validate: function(value) {
            if (value.length && isValidEmail(value)) {
                return true;
            } else {
                return 'Inserisci un indirizzo email valido';
            }
        }
    }
];

const chiediUsername = [
    {
        type: 'input',
        name: 'username',
        message: 'Inserisci lo username',
        validate: function(value) {
            if (value.length) {
                return true;
            } else {
                return 'Inserisci uno username valido!';
            }
        }
    }
];

function main() {
    
    inquirer.prompt(menu).then((answers) => {        
        switch(answers.opzione) {
                case 'Registrare un nuovo utente':
                    registrazione();
                    break;
                case 'Inserire un prodotto nella lista della spesa':
                    inserisciProdotto();
                    break;
                case 'Contrassegnare come comprato un prodotto esistente':
                    contrassegnaComprato();
                    break;
                case 'Visualizzare la lista della spesa di un utente':
                    visualizzaLista();
                    break;
                case 'Uscire dal programma':
                    db.close((err) => {
                        if (err) {
                            console.error("Errore nella chiusura del DB!");
                        } else {
                            console.log("DB chiuso con successo!");
                        }
                    });
                    return;
            }
    });

}

function visualizzaLista() {
    inquirer.prompt(chiediUsername).then((answers) => {
        let stmt = db.prepare("SELECT * FROM Prodotto WHERE Utente = ? ;");
        stmt.all(answers.username, (err, rows) => {
            if (err) {
                console.error("Errore nella ricerca della lista della spesa!");
                main();
            } else if (rows.length === 0) {
                console.log("Lista della spesa vuota");
                main();
            } else {
                console.log("Lista della spesa:");
                rows.forEach((row) => {
                    console.log(row);
                });
                main();
            }
        });
    });
}


function registrazione() {
    inquirer.prompt(registra).then((answers) => {
        let stmt = db.prepare("SELECT username FROM Utente WHERE username = ? ;");
        stmt.get(answers.username, (err, row) => {
            if (err) {
                console.error("Errore nella ricerca dell'utente!");
                main();
            } else if (row) {
                console.log("Username già esistente");
                main();
            } else {
                let stmt = db.prepare("SELECT email FROM Utente WHERE email = ? ;");
                stmt.get(answers.email, (err, row) => {
                    if (err) {
                        console.error("Errore nella ricerca dell'email!");
                        main();
                    } else if (row) {
                        console.log("Indirizzo email già esistente");
                        main();
                    } else {
                        let stmt = db.prepare("INSERT INTO Utente (username, passwd, email) VALUES (?, ?, ?);");
                        stmt.run(answers.username, answers.passwd, answers.email, (err) => {
                            if (err) {
                                console.error("Impossibile inserire i dati utente!");
                                main();
                            } else {
                                console.log("Utente registrato con successo");
                                main();
                            }
                        });
                    }   
                });
            }
        });
    });
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$&_\#@\-%\*]).+$/;
    return passwordRegex.test(password);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

main();