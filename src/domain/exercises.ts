import type { Exercise } from './types';

/*
 * Libreria esercizi. I valori MET vengono dal Compendium of Physical Activities
 * (calistenia/elastici moderati ~3.5–5, cardio vigoroso ~7–8, stretching ~2.3).
 */
export const EXERCISES: Exercise[] = [
  // ---------- Riscaldamento ----------
  { id: 'mob-marcia', name: 'Marcia sul posto', pattern: 'mobility', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Ginocchia alte, braccia che accompagnano', setup: 'In piedi, sciogli il corpo.', met: 3.5 },
  { id: 'mob-braccia', name: 'Cerchi con le braccia', pattern: 'mobility', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Cerchi ampi, a metà cambia verso', setup: 'In piedi, braccia tese ai lati.', met: 2.8 },
  { id: 'mob-anche', name: 'Cerchi con le anche', pattern: 'mobility', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Cerchi ampi con il ginocchio, a metà cambia gamba', setup: 'In piedi, una mano appoggiata al camper.', met: 2.5 },
  { id: 'mob-busto', name: 'Rotazioni del busto', pattern: 'mobility', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Ruota piano a destra e a sinistra', setup: 'In piedi, braccia tese davanti e mani unite.', met: 2.5 },
  { id: 'mob-gatto', name: 'Gatto e mucca', pattern: 'mobility', requires: [], space: 'small', avoid: ['polsi'], difficulty: 1, timed: true, repSec: 1, cadence: 'Inarca e arrotonda la schiena seguendo il respiro', setup: 'A quattro zampe, mani sotto le spalle, ginocchia sotto le anche.', met: 2.5 },
  { id: 'mob-squat', name: 'Squat lento di attivazione', pattern: 'mobility', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 1, timed: true, repSec: 1, cadence: 'Scendi solo fin dove stai comodo', setup: 'Piedi alla larghezza delle spalle.', met: 3.5 },
  { id: 'mob-caviglie', name: 'Cerchi con le caviglie', pattern: 'mobility', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Cerchi lenti con la punta del piede, a metà cambia piede', setup: 'In piedi, una mano appoggiata al camper.', met: 2.5 },

  // ---------- Defaticamento ----------
  { id: 'st-pettorali', name: 'Apertura del petto', pattern: 'stretch', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Apri e tieni, respira lento', setup: 'In piedi, braccia tese davanti all’altezza delle spalle.', met: 2.3 },
  { id: 'st-spalle', name: 'Allungamento spalle', pattern: 'stretch', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, unilateral: true, repSec: 1, cadence: 'Respira lento, spalle basse', setup: 'Porta un braccio teso davanti al petto e tienilo con l’altro.', met: 2.3 },
  { id: 'st-femorali', name: 'Allungamento posteriori coscia', pattern: 'stretch', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, unilateral: true, repSec: 1, cadence: 'Piegati dall’anca, schiena lunga', setup: 'Seduto, una gamba tesa e l’altra piegata.', met: 2.3 },
  { id: 'st-quadricipiti', name: 'Allungamento quadricipiti', pattern: 'stretch', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 1, timed: true, unilateral: true, repSec: 1, cadence: 'Ginocchia vicine, bacino in avanti', setup: 'Sdraiato su un fianco: afferra la caviglia della gamba sopra e porta il tallone al gluteo.', met: 2.3 },
  { id: 'st-flessori', name: 'Allungamento flessori dell’anca', pattern: 'stretch', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 1, timed: true, unilateral: true, repSec: 1, cadence: 'Spingi piano il bacino avanti', setup: 'Affondo con il ginocchio dietro appoggiato a terra.', met: 2.3 },
  { id: 'st-ginocchia-petto', name: 'Ginocchia al petto', pattern: 'stretch', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Dondola piano, rilassa la schiena', setup: 'Sdraiato sulla schiena, abbraccia le ginocchia.', met: 2.3 },
  { id: 'st-bambino', name: 'Posizione del bambino', pattern: 'stretch', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 1, timed: true, repSec: 1, cadence: 'Respira nella schiena', setup: 'In ginocchio, siediti sui talloni e allunga le braccia avanti.', met: 2.3 },
  { id: 'st-respiro', name: 'Respirazione profonda', pattern: 'stretch', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Inspira in 4 secondi, espira in 6', setup: 'Seduto o sdraiato, una mano sulla pancia.', met: 1.3 },

  // ---------- Squat ----------
  { id: 'squat-elastico', name: 'Squat con elastico', pattern: 'squat', requires: ['band'], bandLoad: 'heavy', space: 'small', avoid: ['ginocchia'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, sali in 1', setup: 'Piedi sull’elastico alla larghezza delle spalle, maniglie all’altezza delle spalle.', met: 5.0 },
  { id: 'squat-corpo', name: 'Squat a corpo libero', pattern: 'squat', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 1, repSec: 3, cadence: 'Scendi in 2 secondi, sali in 1', setup: 'Piedi alla larghezza delle spalle, punte appena aperte.', met: 5.0 },
  { id: 'squat-gradino', name: 'Squat al gradino', pattern: 'squat', requires: ['gradino'], space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Siediti in 2 secondi, alzati in 1', setup: 'Di spalle al gradino del camper (o a una sedia): siediti appena e rialzati.', met: 4.5 },
  { id: 'squat-goblet', name: 'Goblet squat con manubrio', pattern: 'squat', requires: ['manubri'], space: 'small', avoid: ['ginocchia'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, sali in 1', setup: 'Tieni il manubrio al petto con due mani.', met: 5.0 },

  // ---------- Stacchi e glutei ----------
  { id: 'stacco-elastico', name: 'Stacco rumeno con elastico', pattern: 'hinge', requires: ['band'], bandLoad: 'heavy', space: 'small', avoid: ['schiena'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, risali in 1', setup: 'Piedi sull’elastico, maniglie in mano. Spingi il bacino indietro a schiena dritta.', met: 5.0 },
  { id: 'stacco-manubri', name: 'Stacco rumeno con manubri', pattern: 'hinge', requires: ['manubri'], space: 'small', avoid: ['schiena'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, risali in 1', setup: 'Manubri davanti alle cosce, ginocchia morbide.', met: 5.0 },
  { id: 'stacco-una-gamba', name: 'Stacco su una gamba', pattern: 'hinge', requires: [], space: 'small', avoid: [], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Scendi in 2 secondi, risali in 1', setup: 'In equilibrio su una gamba, busto in avanti e gamba libera indietro.', met: 3.8 },
  { id: 'ponte-elastico', name: 'Ponte glutei con elastico', pattern: 'glutes', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: [], difficulty: 2, repSec: 3, cadence: 'Sali in 1 secondo, tieni 1, scendi in 1', setup: 'Sdraiato, ginocchia piegate, elastico teso sopra il bacino e tenuto a terra con le mani.', met: 4.0 },
  { id: 'ponte-glutei', name: 'Ponte glutei', pattern: 'glutes', requires: [], space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Sali in 1 secondo, tieni 1, scendi in 1', setup: 'Sdraiato sulla schiena, ginocchia piegate, piedi a terra.', met: 3.5 },
  { id: 'ponte-una-gamba', name: 'Ponte su una gamba', pattern: 'glutes', requires: [], space: 'small', avoid: [], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Sali in 1 secondo, tieni 1, scendi in 1', setup: 'Sdraiato, un piede a terra e l’altra gamba tesa in alto.', met: 4.0 },
  { id: 'passi-laterali', name: 'Passi laterali con elastico', pattern: 'glutes', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 2, cadence: 'Passo lento, elastico sempre teso', setup: 'Elastico pestato sotto i piedi o sopra le ginocchia, mezzo squat.', met: 4.0 },

  // ---------- Affondi ----------
  { id: 'split-squat-elastico', name: 'Split squat con elastico', pattern: 'lunge', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: ['ginocchia'], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Scendi in 2 secondi, sali in 1', setup: 'Piede davanti sull’elastico, maniglie alle spalle, gambe divaricate avanti e dietro.', met: 4.5 },
  { id: 'affondo-indietro', name: 'Affondo indietro', pattern: 'lunge', requires: [], space: 'small', avoid: ['ginocchia'], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Scendi in 2 secondi, risali in 1', setup: 'Piedi uniti, fai un passo indietro e scendi con il ginocchio verso terra.', met: 4.5 },
  { id: 'step-up', name: 'Salita sul gradino', pattern: 'lunge', requires: ['gradino'], space: 'small', avoid: ['ginocchia'], difficulty: 1, unilateral: true, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Davanti al gradino del camper: sali spingendo con la gamba davanti.', met: 5.0 },
  { id: 'affondi-camminata', name: 'Affondi in camminata', pattern: 'lunge', requires: [], space: 'large', avoid: ['ginocchia'], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Passo lungo, scendi in 2 secondi', setup: 'Serve qualche metro libero davanti a te.', met: 5.0 },

  // ---------- Spinta orizzontale ----------
  { id: 'pushup-piatt-petto', name: 'Push-up su piattaforma, petto', pattern: 'pushH', requires: ['platform'], platformZone: 'petto', space: 'small', avoid: [], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Maniglie nella zona petto. Se è troppo duro, ginocchia a terra.', met: 3.8 },
  { id: 'pushup-piatt-dorso', name: 'Push-up su piattaforma, presa larga', pattern: 'pushH', requires: ['platform'], platformZone: 'dorso', space: 'small', avoid: [], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Maniglie nella zona dorso, la più larga. Se è troppo duro, ginocchia a terra.', met: 3.8 },
  { id: 'chest-press-elastico', name: 'Spinta in avanti con elastico', pattern: 'pushH', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Spingi in 1 secondo, torna in 2', setup: 'Elastico dietro la schiena all’altezza delle scapole, maniglie in mano.', met: 4.0 },
  { id: 'pushup-gradino', name: 'Push-up inclinati al gradino', pattern: 'pushH', requires: ['gradino'], space: 'small', avoid: ['polsi'], difficulty: 1, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Mani sul gradino del camper, piedi indietro, corpo dritto.', met: 3.8 },
  { id: 'pushup-ginocchia', name: 'Push-up sulle ginocchia', pattern: 'pushH', requires: [], space: 'small', avoid: ['polsi'], difficulty: 1, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Mani poco più larghe delle spalle, ginocchia a terra, corpo dritto.', met: 3.8 },
  { id: 'pushup', name: 'Push-up', pattern: 'pushH', requires: [], space: 'small', avoid: ['polsi'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Mani poco più larghe delle spalle, corpo dritto come una tavola.', met: 3.8 },

  // ---------- Spinta verticale e spalle ----------
  { id: 'pushup-piatt-spalle', name: 'Push-up su piattaforma, spalle', pattern: 'pushV', requires: ['platform'], platformZone: 'spalle', space: 'small', avoid: ['spalle'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Maniglie nella zona spalle, bacino un po’ più alto.', met: 3.8 },
  { id: 'press-elastico', name: 'Spinte sopra la testa con elastico', pattern: 'pushV', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: ['spalle'], difficulty: 2, repSec: 3, cadence: 'Spingi in 1 secondo, scendi in 2', setup: 'Piedi sull’elastico, maniglie alle spalle, spingi verso l’alto.', met: 4.0 },
  { id: 'press-manubri', name: 'Spinte sopra la testa con manubri', pattern: 'pushV', requires: ['manubri'], space: 'small', avoid: ['spalle'], difficulty: 2, repSec: 3, cadence: 'Spingi in 1 secondo, scendi in 2', setup: 'Manubri alle spalle, addominali attivi.', met: 4.0 },
  { id: 'pike-pushup', name: 'Pike push-up', pattern: 'pushV', requires: [], space: 'small', avoid: ['spalle', 'polsi'], difficulty: 3, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Bacino alto a V rovesciata, scendi con la testa verso terra.', met: 4.0 },
  { id: 'alzate-laterali', name: 'Alzate laterali con elastico', pattern: 'raise', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Piedi al centro dell’elastico, maniglie in mano, gomiti appena piegati.', met: 3.5 },
  { id: 'alzate-manubri', name: 'Alzate laterali con manubri', pattern: 'raise', requires: ['manubri'], space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Manubri lungo i fianchi, gomiti appena piegati.', met: 3.5 },

  // ---------- Tirata orizzontale ----------
  { id: 'rematore-piedi', name: 'Rematore in piedi con elastico', pattern: 'pullH', requires: ['band', 'ancoraggio'], bandLoad: 'medium', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Tira in 1 secondo, torna in 2', setup: 'Elastico fissato alla porta all’altezza del petto. Fai un passo indietro e tira verso la pancia.', met: 4.0 },
  { id: 'rematore-seduto', name: 'Rematore seduto con elastico', pattern: 'pullH', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Tira in 1 secondo, torna in 2', setup: 'Seduto a gambe tese, elastico attorno ai piedi. Tira i gomiti indietro.', met: 4.0 },
  { id: 'rematore-chinato', name: 'Rematore a busto inclinato con elastico', pattern: 'pullH', requires: ['band'], bandLoad: 'medium', space: 'small', avoid: ['schiena'], difficulty: 2, repSec: 3, cadence: 'Tira in 1 secondo, torna in 2', setup: 'Piedi sull’elastico, busto inclinato a schiena dritta, tira verso i fianchi.', met: 4.0 },
  { id: 'rematore-trx', name: 'Rematore al TRX', pattern: 'pullH', requires: ['trx'], space: 'small', avoid: [], difficulty: 2, repSec: 3, cadence: 'Tira in 1 secondo, scendi in 2', setup: 'Cinghie tese, corpo dritto inclinato all’indietro.', met: 4.5 },
  { id: 'rematore-manubrio', name: 'Rematore con manubrio', pattern: 'pullH', requires: ['manubri'], space: 'small', avoid: [], difficulty: 1, unilateral: true, repSec: 3, cadence: 'Tira in 1 secondo, scendi in 2', setup: 'Una mano appoggiata al gradino o al tavolo, schiena dritta.', met: 4.0 },

  // ---------- Tirata verticale ----------
  { id: 'trazioni', name: 'Trazioni alla sbarra', pattern: 'pullV', requires: ['sbarra'], space: 'small', avoid: ['spalle'], difficulty: 3, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Presa poco più larga delle spalle, porta il petto verso la sbarra.', met: 5.0 },
  { id: 'trazioni-assistite', name: 'Trazioni assistite con elastico', pattern: 'pullV', requires: ['sbarra', 'band'], bandLoad: 'heavy', space: 'small', avoid: ['spalle'], difficulty: 2, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Aggancia l’elastico alla sbarra e appoggia un piede nell’anello.', met: 5.0 },
  { id: 'lat-elastico', name: 'Lat machine con elastico', pattern: 'pullV', requires: ['band', 'ancoraggio'], bandLoad: 'medium', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Tira in 1 secondo, risali in 2', setup: 'Elastico fissato in alto sulla porta. In ginocchio, tira i gomiti verso i fianchi.', met: 4.0 },
  { id: 'pulldown-elastico', name: 'Tirate verso il basso con elastico', pattern: 'pullV', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Tira giù in 1 secondo, risali in 2', setup: 'Braccia tese sopra la testa, elastico tra le mani: allarga e porta le mani alle spalle.', met: 3.5 },

  // ---------- Spalle posteriori ----------
  { id: 'face-pull', name: 'Face pull con elastico', pattern: 'rearDelt', requires: ['band', 'ancoraggio'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Tira in 1 secondo, torna in 2', setup: 'Elastico fissato alla porta all’altezza del viso. Tira verso la fronte aprendo i gomiti.', met: 3.5 },
  { id: 'pull-apart', name: 'Aperture con elastico', pattern: 'rearDelt', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Apri in 1 secondo, torna in 2', setup: 'Braccia tese davanti al petto, elastico tra le mani: apri fino a toccare il petto.', met: 3.5 },

  // ---------- Braccia ----------
  { id: 'curl-elastico', name: 'Curl con elastico', pattern: 'biceps', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Piedi sull’elastico, gomiti fermi ai fianchi.', met: 3.5 },
  { id: 'curl-manubri', name: 'Curl con manubri', pattern: 'biceps', requires: ['manubri'], space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Sali in 1 secondo, scendi in 2', setup: 'Manubri lungo i fianchi, gomiti fermi.', met: 3.5 },
  { id: 'pushup-piatt-tricipiti', name: 'Push-up su piattaforma, tricipiti', pattern: 'triceps', requires: ['platform'], platformZone: 'tricipiti', space: 'small', avoid: [], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Maniglie nella zona tricipiti, gomiti stretti lungo il corpo. Ginocchia a terra se serve.', met: 3.8 },
  { id: 'tricipiti-elastico', name: 'Estensioni tricipiti con elastico', pattern: 'triceps', requires: ['band'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Distendi in 1 secondo, torna in 2', setup: 'Elastico pestato dietro di te, maniglie dietro la testa: distendi le braccia verso l’alto.', met: 3.5 },
  { id: 'dip-gradino', name: 'Dip al gradino', pattern: 'triceps', requires: ['gradino'], space: 'small', avoid: ['spalle', 'polsi'], difficulty: 2, repSec: 3, cadence: 'Scendi in 2 secondi, spingi in 1', setup: 'Mani sul bordo del gradino dietro di te, scendi piegando i gomiti.', met: 3.8 },

  // ---------- Core ----------
  { id: 'dead-bug', name: 'Dead bug', pattern: 'core', requires: [], space: 'small', avoid: [], difficulty: 1, repSec: 3, cadence: 'Allunga in 2 secondi, torna in 1', setup: 'Sdraiato sulla schiena, braccia in alto e ginocchia a 90°. Allunga braccio e gamba opposti.', met: 3.0 },
  { id: 'plank', name: 'Plank', pattern: 'core', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Respira con calma, pancia in dentro', setup: 'Avambracci a terra, gomiti sotto le spalle, corpo dritto.', met: 3.0 },
  { id: 'bird-dog', name: 'Bird dog', pattern: 'core', requires: [], space: 'small', avoid: ['polsi'], difficulty: 1, repSec: 3, cadence: 'Allunga in 2 secondi, torna in 1', setup: 'A quattro zampe: allunga un braccio e la gamba opposta, poi cambia.', met: 3.0 },
  { id: 'pallof', name: 'Pallof press con elastico', pattern: 'core', requires: ['band', 'ancoraggio'], bandLoad: 'light', space: 'small', avoid: [], difficulty: 2, unilateral: true, repSec: 3, cadence: 'Spingi in 1 secondo, tieni 1, torna in 1', setup: 'Elastico fissato di lato all’altezza del petto. Spingi le mani avanti senza ruotare.', met: 3.5 },
  { id: 'plank-laterale', name: 'Plank laterale', pattern: 'core', requires: [], space: 'small', avoid: ['spalle'], difficulty: 2, timed: true, unilateral: true, repSec: 1, cadence: 'Bacino alto, respira', setup: 'Su un avambraccio, piedi uno sopra l’altro.', met: 3.0 },
  { id: 'crunch', name: 'Crunch', pattern: 'core', requires: [], space: 'small', avoid: ['schiena'], difficulty: 1, repSec: 2, cadence: 'Sali in 1 secondo, scendi in 1', setup: 'Sdraiato, ginocchia piegate, mani alle tempie.', met: 3.0 },
  { id: 'hollow', name: 'Hollow hold', pattern: 'core', requires: [], space: 'small', avoid: ['schiena'], difficulty: 3, timed: true, repSec: 1, cadence: 'Schiena bassa incollata a terra', setup: 'Sdraiato, gambe e braccia sollevate da terra.', met: 3.5 },

  // ---------- Polpacci ----------
  { id: 'polpacci-gradino', name: 'Polpacci al gradino', pattern: 'calves', requires: ['gradino'], space: 'small', avoid: [], difficulty: 1, repSec: 2, cadence: 'Sali in 1 secondo, scendi in 1', setup: 'Avampiedi sul bordo del gradino, talloni fuori.', met: 3.0 },
  { id: 'polpacci', name: 'Sollevamenti sui polpacci', pattern: 'calves', requires: [], space: 'small', avoid: [], difficulty: 1, repSec: 2, cadence: 'Sali in 1 secondo, scendi in 1', setup: 'In piedi, una mano appoggiata per l’equilibrio.', met: 3.0 },

  // ---------- Cardio ----------
  { id: 'marcia-veloce', name: 'Marcia veloce sul posto', pattern: 'cardio', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Ritmo sostenuto, ginocchia alte', setup: 'In piedi, braccia che spingono.', met: 4.5 },
  { id: 'shadow-boxing', name: 'Pugni veloci', pattern: 'cardio', requires: [], space: 'small', avoid: [], difficulty: 1, timed: true, repSec: 1, cadence: 'Colpi rapidi, piedi leggeri', setup: 'Gambe piegate, pugni davanti al viso.', met: 5.5 },
  { id: 'mountain-climber', name: 'Mountain climber', pattern: 'cardio', requires: [], space: 'small', avoid: ['polsi'], difficulty: 2, timed: true, repSec: 1, cadence: 'Ginocchia al petto alternate, ritmo costante', setup: 'Posizione di push-up, mani sotto le spalle.', met: 8.0 },
  { id: 'jumping-jack', name: 'Jumping jack', pattern: 'cardio', requires: [], space: 'large', avoid: ['ginocchia'], difficulty: 1, timed: true, repSec: 1, cadence: 'Salta aprendo braccia e gambe', setup: 'Meglio fuori: i salti fanno ballare il camper.', met: 7.7 },
  { id: 'squat-jump', name: 'Squat jump', pattern: 'cardio', requires: [], space: 'large', avoid: ['ginocchia', 'schiena'], difficulty: 3, timed: true, repSec: 1, cadence: 'Atterra morbido sulle punte', setup: 'Fuori dal camper, su terreno piano.', met: 8.0 },
  { id: 'burpee', name: 'Burpee', pattern: 'cardio', requires: [], space: 'large', avoid: ['ginocchia', 'polsi', 'schiena'], difficulty: 3, timed: true, repSec: 1, cadence: 'A terra, push-up, salto', setup: 'Fuori dal camper, su terreno piano.', met: 8.0 },
];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise {
  const ex = BY_ID.get(id);
  if (!ex) throw new Error(`Esercizio sconosciuto: ${id}`);
  return ex;
}
