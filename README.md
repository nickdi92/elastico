# Elastico

Web app (PWA) per allenarsi in camper o a casa con elastici, piattaforma per push-up, pesi di ogni
tipo e corpo libero. Chiede profilo, obiettivo (anche i muscoli da far crescere), tempo disponibile
e attrezzatura, genera un piano di 6 settimane e guida ogni
allenamento con timer, voce e suoni. Legge il battito da un cardiofrequenzimetro Bluetooth quando
il browser lo permette, altrimenti stima le calorie.

Il piano è indicativo: non sostituisce un personal trainer né il parere del medico.

Online: https://nickdi92.github.io/elastico/

## Comandi

```bash
npm install
npm run dev       # sviluppo su http://localhost:5173
npm test          # test della logica (piano, progressione, calorie, timer, voce)
npm run build     # build di produzione in dist/
npm run preview   # serve dist/ su http://localhost:4173
```

## Installarla sul telefono

Apri https://nickdi92.github.io/elastico/ dal telefono e scegli "Aggiungi a schermata Home".
Dopo la prima apertura funziona anche senza rete.

Ogni push su `main` esegue i test, fa la build e la pubblica su GitHub Pages
(`.github/workflows/pages.yml`). Service worker, Bluetooth e schermo sempre acceso funzionano solo
in HTTPS (o su `localhost`); la build usa percorsi relativi, quindi funziona in una sottocartella.

## Come funziona

- **Piano** (`src/domain/planner.ts`): regole fisse. Le sessioni a settimana decidono la struttura
  (2–3 corpo intero, 4 due allenamenti alternati, 5–6 gambe/spinta/tirata); obiettivo e livello
  decidono serie, ripetizioni e recuperi; la durata decide quanti esercizi entrano. Gli esercizi
  sono scelti dalla libreria (`src/domain/exercises.ts`) escludendo quelli incompatibili con le
  limitazioni, l'attrezzatura e lo spazio (dentro il camper niente salti né affondi in camminata).
- **Muscoli da far crescere** (`src/domain/muscles.ts`): oltre all'obiettivo generale si possono
  scegliere fino a 4 muscoli. Ogni sessione parte con un esercizio per ognuno (al massimo il 60%
  degli esercizi, a rotazione), con 8–12 ripetizioni; il resto del corpo fa una serie in meno ma
  non sparisce. Il piano mostra le serie a settimana per muscolo rispetto alla soglia di 10.
- **Elastici e pesi** (`src/domain/loads.ts`): ogni esercizio ha un carico (leggero, medio,
  pesante) che viene abbinato agli elastici o ai pesi dell'utente ordinati per chili. Un peso può
  essere qualsiasi cosa (manubri, kettlebell, palla medica, uno zaino): conta come si impugna
  (in una mano, per la maniglia, a due mani al petto), che decide quali esercizi ci si fanno.
- **Corpo libero**: con l'interruttore acceso una parte degli esercizi (qualcuno, un terzo, metà)
  viene scelta a corpo libero e alternata a quelli con gli attrezzi.
- **Progressione** (`src/domain/progression.ts`): a fine allenamento "troppo facile" aggiunge
  ripetizioni e poi passa all'elastico più forte o al peso più pesante (tenuto allo stesso modo),
  "giusta" aggiunge una ripetizione, "troppo dura"
  alleggerisce. Si sale solo se è stato fatto almeno il 70% delle serie.
- **Calorie** (`src/domain/calories.ts`): con il battito si usa Keytel et al. 2005; senza, MET
  (Compendium of Physical Activities) × peso × durata.
- **Allenamento guidato** (`src/domain/timeline.ts`, `player.ts`, `announce.ts`): la sessione
  diventa una sequenza di passi (riscaldamento, serie, riposi, defaticamento) con timer basato
  sull'orologio reale, quindi resta preciso anche se il telefono rallenta l'app. Durante ogni
  esercizio "Come si fa" apre la scheda con foto e passi (e mette in pausa finché è aperta).
- **Pausa e ripresa** (`src/domain/activeWorkout.ts`): l'allenamento in corso viene salvato ogni
  pochi secondi in `localStorage` (`elastico:active`). Con "Pausa, riprendo dopo" si esce e si
  gira per l'app; una barra sopra le sezioni lo riprende dal punto esatto. Se l'app viene chiusa
  a timer acceso, alla riapertura riparte in pausa dall'ultimo salvataggio.
- **Storico** (`src/domain/history.ts`): ogni allenamento si apre, si modifica o si elimina; si
  possono aggiungere allenamenti fatti senza l'app. Le modifiche non toccano il piano.

## Come si fa ogni esercizio

Nel piano ogni esercizio si tocca e apre una scheda con foto (posizione iniziale e finale),
passi semplici, un consiglio e la dose prevista. Le spiegazioni sono in `src/domain/guides.ts`.
Le foto vengono da [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (pubblico
dominio, Unlicense) e stanno in `public/exercises/`; quando la foto usa un attrezzo diverso
(manubri o cavi al posto dell'elastico) la scheda lo dice. Gli 11 esercizi senza una foto adatta
sono disegnati in `src/ui/illustrations.ts`.

## Smartwatch

Il battito arriva via Web Bluetooth dal servizio standard "Heart Rate": fasce cardio e orologi che
lo trasmettono (Garmin, Polar, Coros, Wahoo, …; su Garmin va attivato "Trasmetti frequenza
cardiaca"). Funziona con Chrome su Android e computer. Safari su iPhone non supporta Web Bluetooth
e Apple Watch non trasmette il battito in questo modo: lì servirebbe un'app nativa con HealthKit.

## Limiti noti

- Testata con Chrome in emulazione mobile; non ancora provata su un telefono vero.
- Voce e suoni non sono stati verificati automaticamente; la qualità della voce dipende dal telefono.
- Con lo schermo spento o l'app in background il browser può silenziare voce e suoni; il timer
  resta corretto. Durante l'allenamento l'app chiede di tenere lo schermo acceso.
- Le ripetizioni sono scandite a tempo: l'app non conta i movimenti reali.
