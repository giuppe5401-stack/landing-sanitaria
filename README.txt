PA Gestionale – Frontend Demo

Contenuto:
- gestionale.html : pagina demo con l'area gestionale
- gestionale.css  : stili di base (rispetta variabili --brand, --ink, --card se già presenti)
- gestionale.js   : logica demo con persistenza via localStorage e export CSV

Come provarlo:
1) Apri 'gestionale.html' in un browser.
2) Aggiungi/modifica elementi (richieste, turni, mezzi, volontari).
3) Usa 'Esporta CSV' per scaricare i dati in 4 file.

Come integrarlo nella tua landing:
- Copia il markup dentro <section id="gestionale"> nel tuo index.html (sotto l'Area riservata).
- Linka i file 'gestionale.css' e 'gestionale.js' nel tuo progetto oppure incolla gli stili/script nei tuoi file esistenti.
- Aggiungi nel menu un link a '#gestionale'.

Note:
- È una demo statica: collega le API/back-end per l'uso in produzione.
- I ruoli/permessi si possono gestire disattivando pulsanti in base all'utente.
