/*
 * Spiegazioni passo passo per ogni esercizio.
 * Le foto vengono da free-exercise-db (github.com/yuhonas/free-exercise-db, pubblico dominio):
 * `photo` è il nome del file in public/exercises senza "-0.jpg" / "-1.jpg".
 * Gli esercizi senza foto adatta hanno un disegno (src/ui/illustrations.ts).
 */
export interface Guide {
  muscles: string;
  steps: string[];
  tip: string;
  photo?: string;
  /** Quando la foto usa un attrezzo diverso dal nostro. */
  photoNote?: string;
}

const SAME_WITH_BAND = 'In foto con i manubri: con l’elastico il movimento è lo stesso.';
const SAME_WITH_CABLE = 'In foto al cavo della palestra: con l’elastico il movimento è lo stesso.';
const SAME_ON_PLATFORM = 'In foto senza piattaforma: con le maniglie il movimento è lo stesso.';

export const GUIDES: Record<string, Guide> = {
  // ---------- Riscaldamento ----------
  'mob-marcia': {
    muscles: 'Riscaldamento generale',
    steps: [
      'In piedi, schiena dritta e sguardo avanti.',
      'Solleva un ginocchio all’altezza del bacino, poi l’altro, a ritmo tranquillo.',
      'Muovi le braccia in modo opposto alle gambe, come quando cammini.',
      'Respira con calma: devi scaldarti, non stancarti.',
    ],
    tip: 'Appoggia il piede senza battere il tallone: il camper ringrazia.',
  },
  'mob-braccia': {
    muscles: 'Spalle',
    steps: [
      'In piedi, piedi alla larghezza delle spalle.',
      'Apri le braccia tese ai lati, all’altezza delle spalle.',
      'Disegna cerchi piccoli in avanti, poi sempre più ampi.',
      'A metà tempo cambia verso e gira all’indietro.',
    ],
    tip: 'Spalle basse, lontane dalle orecchie.',
    photo: 'mob-braccia',
  },
  'mob-anche': {
    muscles: 'Anche',
    steps: [
      'In piedi, una mano appoggiata al camper.',
      'Solleva un ginocchio davanti a te.',
      'Porta il ginocchio di lato e poi giù, disegnando un cerchio ampio.',
      'A metà tempo cambia gamba.',
    ],
    tip: 'Il busto resta fermo: si muove solo la gamba.',
    photo: 'mob-anche',
  },
  'mob-busto': {
    muscles: 'Busto e schiena',
    steps: [
      'In piedi, piedi alla larghezza delle spalle, ginocchia morbide.',
      'Braccia tese davanti a te, mani unite.',
      'Ruota piano busto e braccia verso destra, poi verso sinistra.',
      'Il bacino resta fermo: gira solo la parte alta.',
    ],
    tip: 'Movimento lento e controllato, senza strattoni.',
    photo: 'mob-busto',
    photoNote: 'In foto con una palla: va bene anche a mani unite.',
  },
  'mob-gatto': {
    muscles: 'Schiena',
    steps: [
      'A quattro zampe: mani sotto le spalle, ginocchia sotto le anche.',
      'Espirando, arrotonda la schiena verso l’alto e porta il mento al petto.',
      'Inspirando, lascia scendere la pancia e guarda leggermente in avanti.',
      'Alterna lentamente seguendo il respiro.',
    ],
    tip: 'Muovi la schiena un po’ alla volta, senza forzare.',
    photo: 'mob-gatto',
  },
  'mob-squat': {
    muscles: 'Gambe e anche',
    steps: [
      'Piedi alla larghezza delle spalle, punte appena aperte.',
      'Mani dietro la testa o braccia tese davanti.',
      'Scendi piano come per sederti, solo fin dove stai comodo.',
      'Risali spingendo con i talloni.',
    ],
    tip: 'È riscaldamento: profondità e ritmo crescono un po’ alla volta.',
    photo: 'squat-corpo',
  },
  'mob-caviglie': {
    muscles: 'Caviglie',
    steps: [
      'In piedi, una mano appoggiata al camper.',
      'Solleva leggermente un piede da terra.',
      'Disegna cerchi lenti con la punta del piede, prima in un verso e poi nell’altro.',
      'A metà tempo cambia piede.',
    ],
    tip: 'Muovi solo la caviglia, la gamba resta ferma.',
    photo: 'mob-caviglie',
  },

  // ---------- Defaticamento ----------
  'st-pettorali': {
    muscles: 'Petto e spalle',
    steps: [
      'In piedi, braccia tese davanti all’altezza delle spalle.',
      'Apri le braccia di lato e portale un po’ indietro.',
      'Fermati quando senti tirare il petto, stringendo le scapole.',
      'Tieni la posizione respirando lentamente.',
    ],
    tip: 'Deve tirare, non fare male: braccia all’altezza delle spalle, non più su.',
    photo: 'st-pettorali',
  },
  'st-spalle': {
    muscles: 'Spalle',
    steps: [
      'In piedi o seduto, schiena dritta.',
      'Porta un braccio teso davanti al petto.',
      'Con l’altra mano tienilo all’altezza del gomito e avvicinalo al petto.',
      'Tieni la posizione, poi cambia braccio.',
    ],
    tip: 'Spalla bassa: non deve salire verso l’orecchio.',
    photo: 'st-spalle',
  },
  'st-femorali': {
    muscles: 'Retro coscia',
    steps: [
      'Seduto a terra, una gamba tesa e l’altra piegata con il piede verso l’interno.',
      'Schiena lunga, piegati in avanti partendo dall’anca.',
      'Allunga le mani verso il piede della gamba tesa.',
      'Tieni senza molleggiare, poi cambia gamba.',
    ],
    tip: 'Meglio schiena dritta e meno profondità che schiena curva.',
    photo: 'st-femorali',
  },
  'st-quadricipiti': {
    muscles: 'Coscia davanti',
    steps: [
      'Sdraiato su un fianco, testa appoggiata al braccio.',
      'Piega la gamba che sta sopra e afferra la caviglia con la mano.',
      'Porta il tallone verso il gluteo, ginocchia vicine.',
      'Spingi appena il bacino in avanti, tieni, poi girati e cambia gamba.',
    ],
    tip: 'Se non arrivi alla caviglia, passa un elastico attorno al piede.',
    photo: 'st-quadricipiti',
  },
  'st-flessori': {
    muscles: 'Anca e coscia davanti',
    steps: [
      'Fai un affondo con il ginocchio dietro appoggiato a terra (meglio sul tappetino).',
      'Il ginocchio davanti sta sopra la caviglia.',
      'Spingi piano il bacino in avanti finché senti tirare davanti all’anca.',
      'Tieni, poi cambia gamba.',
    ],
    tip: 'Non inarcare la schiena: stringi un po’ i glutei.',
    photo: 'st-flessori',
  },
  'st-ginocchia-petto': {
    muscles: 'Schiena bassa',
    steps: ['Sdraiato sulla schiena.', 'Porta le ginocchia verso il petto.', 'Abbracciale con le mani.', 'Respira e dondola piano a destra e a sinistra.'],
    tip: 'Testa e spalle restano rilassate a terra.',
    photo: 'st-ginocchia-petto',
  },
  'st-bambino': {
    muscles: 'Schiena e spalle',
    steps: [
      'In ginocchio, alluci vicini e ginocchia un po’ aperte.',
      'Siediti sui talloni.',
      'Piegati in avanti e allunga le braccia davanti a te, fronte verso terra.',
      'Respira lentamente nella schiena.',
    ],
    tip: 'Se le ginocchia danno fastidio, metti un cuscino tra talloni e glutei.',
    photo: 'st-bambino',
  },
  'st-respiro': {
    muscles: 'Rilassamento',
    steps: [
      'Siediti comodo o sdraiati.',
      'Metti una mano sulla pancia.',
      'Inspira dal naso in 4 secondi e senti la pancia che si gonfia.',
      'Espira dalla bocca in 6 secondi, lasciando andare le spalle.',
    ],
    tip: 'Il petto si muove poco: lavora la pancia.',
  },

  // ---------- Squat ----------
  'squat-elastico': {
    muscles: 'Cosce e glutei',
    steps: [
      'Piedi sull’elastico alla larghezza delle spalle.',
      'Porta le maniglie all’altezza delle spalle.',
      'Scendi come per sederti, petto alto, finché la schiena resta dritta.',
      'Risali spingendo con i talloni fino in piedi.',
    ],
    tip: 'Le ginocchia seguono le punte dei piedi, non cadono verso l’interno.',
    photo: 'squat-elastico',
  },
  'squat-corpo': {
    muscles: 'Cosce e glutei',
    steps: [
      'Piedi alla larghezza delle spalle, punte appena aperte.',
      'Mani dietro la testa o braccia tese davanti.',
      'Scendi come per sederti su una sedia, petto alto.',
      'Risali spingendo con i talloni.',
    ],
    tip: 'Le ginocchia seguono le punte dei piedi, non cadono verso l’interno.',
    photo: 'squat-corpo',
  },
  'squat-gradino': {
    muscles: 'Cosce e glutei',
    steps: [
      'Mettiti di spalle al gradino del camper o a una sedia stabile.',
      'Piedi alla larghezza delle spalle, braccia avanti.',
      'Scendi piano finché sfiori il gradino con i glutei.',
      'Senza sederti del tutto, risali spingendo con i talloni.',
    ],
    tip: 'Controlla che il gradino sia fermo prima di iniziare.',
    photo: 'squat-gradino',
    photoNote: 'In foto senza gradino: scendi finché lo sfiori.',
  },
  'squat-goblet': {
    muscles: 'Cosce e glutei',
    steps: [
      'Tieni il manubrio verticale al petto, con due mani.',
      'Piedi un po’ più larghi delle spalle.',
      'Scendi tra le ginocchia tenendo il petto alto.',
      'Risali spingendo con i talloni.',
    ],
    tip: 'In basso i gomiti stanno dentro le ginocchia e le aiutano ad aprirsi.',
    photo: 'squat-goblet',
  },

  // ---------- Stacchi e glutei ----------
  'stacco-elastico': {
    muscles: 'Retro coscia, glutei e schiena',
    steps: [
      'Piedi sull’elastico alla larghezza delle anche, maniglie in mano e braccia tese.',
      'Ginocchia leggermente piegate e ferme.',
      'Spingi il bacino indietro e fai scendere le mani lungo le gambe, schiena dritta.',
      'Risali spingendo il bacino in avanti e stringendo i glutei.',
    ],
    tip: 'Il movimento parte dall’anca: se la schiena si arrotonda, scendi di meno.',
    photo: 'stacco-manubri',
    photoNote: SAME_WITH_BAND,
  },
  'stacco-manubri': {
    muscles: 'Retro coscia, glutei e schiena',
    steps: [
      'In piedi, manubri davanti alle cosce, ginocchia leggermente piegate.',
      'Spingi il bacino indietro e fai scendere i manubri lungo le gambe.',
      'Schiena dritta per tutto il tempo.',
      'Risali spingendo il bacino in avanti e stringendo i glutei.',
    ],
    tip: 'I manubri restano vicini alle gambe.',
    photo: 'stacco-manubri',
  },
  'stacco-una-gamba': {
    muscles: 'Retro coscia, glutei ed equilibrio',
    steps: [
      'In piedi su una gamba, ginocchio appena piegato.',
      'Porta il busto in avanti e la gamba libera indietro, come una leva.',
      'Scendi finché busto e gamba sono quasi paralleli a terra.',
      'Torna su lentamente; finite le ripetizioni cambia gamba.',
    ],
    tip: 'Il bacino resta parallelo al pavimento: non aprire il fianco verso l’alto.',
    photo: 'stacco-una-gamba',
    photoNote: 'In foto con un kettlebell: va benissimo a corpo libero.',
  },
  'ponte-elastico': {
    muscles: 'Glutei',
    steps: [
      'Sdraiato sulla schiena, ginocchia piegate, piedi a terra.',
      'Passa l’elastico sopra il bacino e tienilo a terra con le mani ai lati.',
      'Spingi il bacino in alto finché spalle, anche e ginocchia sono in linea.',
      'Tieni un secondo stringendo i glutei, poi scendi piano.',
    ],
    tip: 'Spingi con i talloni, non inarcare la schiena.',
    photo: 'ponte-elastico',
    photoNote: 'In foto l’elastico è fermato da due pesi: puoi tenerlo a terra con le mani.',
  },
  'ponte-glutei': {
    muscles: 'Glutei',
    steps: [
      'Sdraiato sulla schiena, ginocchia piegate, piedi a terra.',
      'Braccia lungo il corpo.',
      'Spingi il bacino in alto finché spalle, anche e ginocchia sono in linea.',
      'Tieni un secondo stringendo i glutei, poi scendi piano.',
    ],
    tip: 'Spingi con i talloni, non inarcare la schiena.',
    photo: 'ponte-glutei',
  },
  'ponte-una-gamba': {
    muscles: 'Glutei',
    steps: [
      'Sdraiato, un piede a terra e l’altra gamba tesa verso l’alto.',
      'Spingi con il tallone a terra e solleva il bacino.',
      'Tieni un secondo in alto, bacino dritto.',
      'Scendi piano; finite le ripetizioni cambia gamba.',
    ],
    tip: 'Il bacino non deve inclinarsi da un lato.',
    photo: 'ponte-una-gamba',
  },
  'passi-laterali': {
    muscles: 'Glutei e lato dell’anca',
    steps: [
      'Metti l’elastico sopra le ginocchia o attorno alle caviglie.',
      'Piedi alla larghezza delle anche, ginocchia un po’ piegate.',
      'Fai un passo di lato, poi avvicina l’altro piede senza che l’elastico si allenti.',
      'Fai le ripetizioni in un verso, poi torna indietro.',
    ],
    tip: 'Resta basso e con il busto fermo: niente dondolii.',
    photo: 'passi-laterali',
  },

  // ---------- Affondi ----------
  'split-squat-elastico': {
    muscles: 'Cosce e glutei',
    steps: [
      'Piede davanti sull’elastico, maniglie alle spalle.',
      'Gambe divaricate avanti e dietro, tallone dietro sollevato.',
      'Scendi in verticale finché il ginocchio dietro sfiora terra.',
      'Risali spingendo con il piede davanti; finite le ripetizioni cambia gamba.',
    ],
    tip: 'Busto dritto: il ginocchio davanti resta sopra la caviglia.',
    photo: 'split-squat',
    photoNote: 'In foto senza elastico: il movimento è lo stesso.',
  },
  'affondo-indietro': {
    muscles: 'Cosce e glutei',
    steps: [
      'In piedi, piedi uniti.',
      'Fai un passo lungo indietro.',
      'Scendi finché il ginocchio dietro sfiora terra.',
      'Spingi con la gamba davanti e torna in piedi; alterna le gambe.',
    ],
    tip: 'Peso sul tallone della gamba davanti, busto alto.',
    photo: 'affondo-indietro',
  },
  'step-up': {
    muscles: 'Cosce e glutei',
    steps: [
      'In piedi davanti al gradino del camper, che deve essere ben stabile.',
      'Appoggia tutto un piede sul gradino.',
      'Spingi con quella gamba e sali, portando su anche l’altro piede.',
      'Scendi con calma; finite le ripetizioni cambia gamba.',
    ],
    tip: 'Spingi con la gamba sopra, senza darti lo slancio con quella sotto.',
    photo: 'step-up',
    photoNote: 'In foto con i manubri: a corpo libero va benissimo.',
  },
  'affondi-camminata': {
    muscles: 'Cosce e glutei',
    steps: [
      'Serve qualche metro libero davanti a te.',
      'Fai un passo lungo in avanti e scendi finché il ginocchio dietro sfiora terra.',
      'Spingi e porta avanti l’altra gamba nel passo successivo.',
      'Continua alternando le gambe.',
    ],
    tip: 'Passi lunghi e busto dritto; guarda avanti, non i piedi.',
    photo: 'affondi-camminata',
  },

  // ---------- Spinta ----------
  'pushup-piatt-petto': {
    muscles: 'Petto, spalle e tricipiti',
    steps: [
      'Metti le maniglie nella zona petto della piattaforma.',
      'Mani sulle maniglie, corpo dritto dalla testa ai talloni (o dalle ginocchia, se è troppo duro).',
      'Scendi piegando i gomiti finché il petto sfiora la piattaforma.',
      'Spingi e torna su.',
    ],
    tip: 'Pancia e glutei contratti: il bacino non deve cedere.',
    photo: 'pushup',
    photoNote: SAME_ON_PLATFORM,
  },
  'pushup-piatt-dorso': {
    muscles: 'Dorso, petto e spalle',
    steps: [
      'Metti le maniglie nella zona dorso, la più larga.',
      'Mani sulle maniglie, corpo dritto (ginocchia a terra se serve).',
      'Scendi piegando i gomiti verso l’esterno.',
      'Spingi e torna su.',
    ],
    tip: 'Con le mani larghe scendi un po’ meno: niente dolore alle spalle.',
    photo: 'pushup-larghi',
    photoNote: SAME_ON_PLATFORM,
  },
  'pushup-piatt-spalle': {
    muscles: 'Spalle e tricipiti',
    steps: [
      'Metti le maniglie nella zona spalle.',
      'Mani sulle maniglie, bacino un po’ più alto del solito.',
      'Scendi portando la testa verso la piattaforma.',
      'Spingi e torna su.',
    ],
    tip: 'Gomiti verso i piedi, non spalancati di lato.',
    photo: 'pushup-spalle',
    photoNote: SAME_ON_PLATFORM,
  },
  'pushup-piatt-tricipiti': {
    muscles: 'Tricipiti e petto',
    steps: [
      'Metti le maniglie nella zona tricipiti, la più stretta.',
      'Mani sulle maniglie, corpo dritto (ginocchia a terra se serve).',
      'Scendi tenendo i gomiti stretti lungo il corpo.',
      'Spingi e torna su.',
    ],
    tip: 'I gomiti sfiorano i fianchi per tutto il movimento.',
    photo: 'pushup-stretti',
    photoNote: SAME_ON_PLATFORM,
  },
  'chest-press-elastico': {
    muscles: 'Petto e spalle',
    steps: [
      'Passa l’elastico dietro la schiena, all’altezza delle scapole.',
      'Tieni le maniglie all’altezza del petto, gomiti piegati.',
      'Spingi le mani in avanti fino a braccia quasi tese.',
      'Torna indietro lentamente.',
    ],
    tip: 'Spalle basse e busto fermo: lavorano solo le braccia.',
    photo: 'chest-press',
    photoNote: SAME_WITH_CABLE,
  },
  'pushup-gradino': {
    muscles: 'Petto, spalle e tricipiti',
    steps: [
      'Mani sul bordo del gradino, poco più larghe delle spalle.',
      'Piedi indietro: corpo dritto come una tavola.',
      'Scendi con il petto verso il gradino.',
      'Spingi e torna su.',
    ],
    tip: 'Più è alto l’appoggio, più è facile.',
    photo: 'pushup-gradino',
  },
  'pushup-ginocchia': {
    muscles: 'Petto, spalle e tricipiti',
    steps: [
      'Mani a terra poco più larghe delle spalle, ginocchia appoggiate.',
      'Corpo dritto dalle ginocchia alla testa.',
      'Scendi piegando i gomiti finché il petto quasi tocca terra.',
      'Spingi e torna su.',
    ],
    tip: 'Non piegarti all’anca: fianchi in linea con il busto.',
  },
  pushup: {
    muscles: 'Petto, spalle e tricipiti',
    steps: [
      'Mani a terra poco più larghe delle spalle, braccia tese.',
      'Corpo dritto dalla testa ai talloni.',
      'Scendi finché il petto sfiora terra, gomiti a 45° dal corpo.',
      'Spingi e torna su.',
    ],
    tip: 'Se non riesci a finire le ripetizioni, appoggia le ginocchia.',
    photo: 'pushup',
  },
  'press-elastico': {
    muscles: 'Spalle e tricipiti',
    steps: [
      'Piedi sull’elastico, maniglie all’altezza delle spalle.',
      'Pancia contratta, schiena dritta.',
      'Spingi le mani verso l’alto fino a braccia tese.',
      'Riporta piano le mani alle spalle.',
    ],
    tip: 'Non inarcare la schiena quando spingi.',
    photo: 'press-elastico',
  },
  'press-manubri': {
    muscles: 'Spalle e tricipiti',
    steps: [
      'Manubri all’altezza delle spalle, palmi in avanti.',
      'Pancia contratta, schiena dritta.',
      'Spingi i manubri verso l’alto fino a braccia tese.',
      'Riportali piano alle spalle.',
    ],
    tip: 'Non inarcare la schiena quando spingi.',
    photo: 'press-manubri',
  },
  'pike-pushup': {
    muscles: 'Spalle',
    steps: [
      'Parti in posizione di push-up e porta il bacino in alto: il corpo forma una V rovesciata.',
      'Mani poco più larghe delle spalle.',
      'Piega i gomiti e porta la testa verso terra, davanti alle mani.',
      'Spingi e torna su.',
    ],
    tip: 'Più i piedi sono vicini alle mani, più è difficile.',
  },
  'alzate-laterali': {
    muscles: 'Spalle',
    steps: [
      'Piedi al centro dell’elastico, maniglie in mano lungo i fianchi.',
      'Gomiti appena piegati.',
      'Alza le braccia di lato fino all’altezza delle spalle.',
      'Scendi lentamente.',
    ],
    tip: 'Non salire oltre le spalle e non darti lo slancio con il busto.',
    photo: 'alzate-laterali',
  },
  'alzate-manubri': {
    muscles: 'Spalle',
    steps: [
      'Manubri lungo i fianchi, gomiti appena piegati.',
      'Busto fermo e dritto.',
      'Alza le braccia di lato fino all’altezza delle spalle.',
      'Scendi lentamente.',
    ],
    tip: 'Non salire oltre le spalle e non darti lo slancio con il busto.',
    photo: 'alzate-manubri',
  },

  // ---------- Tirata ----------
  'rematore-piedi': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Fissa l’elastico alla porta all’altezza del petto.',
      'Fai un passo indietro finché l’elastico è teso, ginocchia morbide.',
      'Tira le maniglie verso la pancia portando i gomiti indietro.',
      'Stringi le scapole un secondo, poi torna lentamente.',
    ],
    tip: 'Prima di tirare, controlla che la porta sia ben chiusa.',
  },
  'rematore-seduto': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Seduto a gambe tese, elastico attorno alla pianta dei piedi.',
      'Schiena dritta, maniglie in mano.',
      'Tira i gomiti indietro, vicini al corpo.',
      'Stringi le scapole, poi torna lentamente.',
    ],
    tip: 'Il busto resta fermo: non dondolare avanti e indietro.',
    photo: 'rematore-seduto',
    photoNote: SAME_WITH_CABLE,
  },
  'rematore-chinato': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Piedi sull’elastico, ginocchia morbide.',
      'Busto inclinato in avanti, schiena dritta.',
      'Tira le maniglie verso i fianchi.',
      'Torna lentamente a braccia tese.',
    ],
    tip: 'La schiena non si arrotonda: se succede, inclinati di meno.',
    photo: 'rematore-chinato',
    photoNote: SAME_WITH_BAND,
  },
  'rematore-trx': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Afferra le maniglie con le cinghie tese.',
      'Inclinati all’indietro con il corpo dritto, talloni a terra.',
      'Tira il petto verso le mani.',
      'Torna giù lentamente.',
    ],
    tip: 'Più sei inclinato, più è difficile.',
    photo: 'rematore-trx',
  },
  'rematore-manubrio': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Una mano e un ginocchio appoggiati al gradino o a una panca.',
      'Schiena dritta, manubrio nella mano libera.',
      'Tira il manubrio verso il fianco.',
      'Scendi piano; finite le ripetizioni cambia lato.',
    ],
    tip: 'Non ruotare il busto per tirare.',
    photo: 'rematore-manubrio',
  },
  trazioni: {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Afferra la sbarra con presa poco più larga delle spalle.',
      'Parti appeso, braccia tese.',
      'Tira finché il mento supera la sbarra.',
      'Scendi in modo controllato.',
    ],
    tip: 'Non dondolare: le gambe restano ferme.',
    photo: 'trazioni',
  },
  'trazioni-assistite': {
    muscles: 'Dorso e bicipiti',
    steps: [
      'Aggancia l’elastico alla sbarra.',
      'Appoggia un piede o un ginocchio nell’anello dell’elastico.',
      'Tira finché il mento supera la sbarra.',
      'Scendi lentamente.',
    ],
    tip: 'Elastico più forte vuol dire più aiuto.',
    photo: 'trazioni-assistite',
  },
  'lat-elastico': {
    muscles: 'Dorso',
    steps: [
      'Fissa l’elastico in alto sulla porta.',
      'In ginocchio, maniglie in mano e braccia tese in alto.',
      'Tira i gomiti verso i fianchi.',
      'Torna su lentamente.',
    ],
    tip: 'Petto alto: non piegarti in avanti per tirare.',
    photo: 'lat-elastico',
    photoNote: SAME_WITH_CABLE,
  },
  'pulldown-elastico': {
    muscles: 'Dorso e spalle',
    steps: [
      'Tieni l’elastico con le mani larghe, braccia tese sopra la testa.',
      'Allarga le mani e porta i gomiti giù verso i fianchi.',
      'L’elastico arriva dietro la testa, all’altezza delle spalle.',
      'Torna su lentamente.',
    ],
    tip: 'Petto alto e spalle basse.',
  },
  'face-pull': {
    muscles: 'Spalle e parte alta della schiena',
    steps: [
      'Fissa l’elastico alla porta all’altezza del viso.',
      'Afferralo con le due mani e fai un passo indietro.',
      'Tira verso la fronte aprendo i gomiti verso l’esterno.',
      'Torna lentamente.',
    ],
    tip: 'Gomiti alti, all’altezza delle spalle.',
    photo: 'face-pull',
    photoNote: SAME_WITH_CABLE,
  },
  'pull-apart': {
    muscles: 'Spalle e parte alta della schiena',
    steps: [
      'Braccia tese davanti al petto, elastico tra le mani.',
      'Mani alla larghezza delle spalle.',
      'Apri le braccia finché l’elastico tocca il petto.',
      'Torna lentamente.',
    ],
    tip: 'Stringi le scapole e tieni le braccia tese.',
    photo: 'pull-apart',
  },

  // ---------- Braccia ----------
  'curl-elastico': {
    muscles: 'Bicipiti',
    steps: [
      'Piedi sull’elastico, maniglie in mano, palmi in avanti.',
      'Gomiti fermi ai fianchi.',
      'Piega i gomiti e porta le mani verso le spalle.',
      'Scendi lentamente.',
    ],
    tip: 'Si muovono solo gli avambracci, non il busto.',
    photo: 'curl',
    photoNote: SAME_WITH_BAND,
  },
  'curl-manubri': {
    muscles: 'Bicipiti',
    steps: ['Manubri lungo i fianchi, palmi in avanti.', 'Gomiti fermi ai fianchi.', 'Piega i gomiti e porta i manubri verso le spalle.', 'Scendi lentamente.'],
    tip: 'Si muovono solo gli avambracci, non il busto.',
    photo: 'curl',
  },
  'tricipiti-elastico': {
    muscles: 'Tricipiti',
    steps: [
      'Pesta l’elastico dietro di te con un piede.',
      'Maniglie dietro la testa, gomiti puntati in alto.',
      'Distendi le braccia verso l’alto.',
      'Torna piano dietro la testa.',
    ],
    tip: 'Gomiti fermi e vicini alla testa.',
    photo: 'tricipiti-elastico',
    photoNote: 'In foto da seduto: in piedi va bene uguale.',
  },
  'dip-gradino': {
    muscles: 'Tricipiti',
    steps: [
      'Mani sul bordo del gradino dietro di te, dita in avanti.',
      'Gambe piegate davanti (tese è più difficile).',
      'Scendi piegando i gomiti fino a circa 90°.',
      'Spingi e torna su.',
    ],
    tip: 'Spalle basse e schiena vicina al gradino.',
    photo: 'dip-gradino',
  },

  // ---------- Core ----------
  'dead-bug': {
    muscles: 'Addome',
    steps: [
      'Sdraiato sulla schiena, braccia tese verso il soffitto.',
      'Ginocchia piegate a 90°, sopra le anche.',
      'Allunga piano un braccio dietro la testa e la gamba opposta in avanti.',
      'Torna al centro e cambia lato.',
    ],
    tip: 'La schiena bassa resta appoggiata a terra per tutto il tempo.',
    photo: 'dead-bug',
  },
  plank: {
    muscles: 'Addome e spalle',
    steps: ['Avambracci a terra, gomiti sotto le spalle.', 'Gambe tese, appoggiato sulle punte.', 'Corpo dritto dalla testa ai talloni.', 'Tieni respirando con calma.'],
    tip: 'Né bacino alto né pancia che scende.',
    photo: 'plank',
  },
  'bird-dog': {
    muscles: 'Addome e schiena',
    steps: [
      'A quattro zampe: mani sotto le spalle, ginocchia sotto le anche.',
      'Allunga un braccio in avanti e la gamba opposta indietro.',
      'Tieni un attimo con la schiena dritta.',
      'Torna e cambia lato.',
    ],
    tip: 'Muoviti piano: il bacino non deve ruotare.',
  },
  pallof: {
    muscles: 'Addome',
    steps: [
      'Fissa l’elastico di lato, all’altezza del petto.',
      'In piedi di fianco alla porta, mani al petto con l’elastico teso.',
      'Spingi le mani in avanti senza farti ruotare.',
      'Riportale al petto; finite le ripetizioni cambia lato.',
    ],
    tip: 'Più ti allontani dalla porta, più è difficile.',
    photo: 'pallof',
    photoNote: SAME_WITH_CABLE,
  },
  'plank-laterale': {
    muscles: 'Fianchi e addome',
    steps: [
      'Sdraiato su un fianco, appoggiato sull’avambraccio, gomito sotto la spalla.',
      'Piedi uno sopra l’altro (ginocchia a terra per renderlo più facile).',
      'Solleva il bacino: il corpo diventa una linea dritta.',
      'Tieni, poi cambia lato.',
    ],
    tip: 'Il bacino non deve scendere.',
    photo: 'plank-laterale',
  },
  crunch: {
    muscles: 'Addome',
    steps: ['Sdraiato, ginocchia piegate, piedi a terra.', 'Mani alle tempie, gomiti aperti.', 'Solleva le spalle da terra contraendo l’addome.', 'Scendi lentamente.'],
    tip: 'Non tirare la testa con le mani.',
    photo: 'crunch',
  },
  hollow: {
    muscles: 'Addome',
    steps: [
      'Sdraiato sulla schiena, braccia tese oltre la testa.',
      'Schiaccia la schiena bassa contro il pavimento.',
      'Solleva gambe, spalle e braccia di qualche centimetro.',
      'Tieni la posizione respirando.',
    ],
    tip: 'Se la schiena si stacca da terra, piega le ginocchia.',
  },

  // ---------- Polpacci ----------
  'polpacci-gradino': {
    muscles: 'Polpacci',
    steps: [
      'Avampiedi sul bordo del gradino, talloni fuori.',
      'Tieniti al camper per l’equilibrio.',
      'Sali sulle punte più in alto che puoi.',
      'Scendi lentamente portando i talloni sotto il bordo.',
    ],
    tip: 'Movimento lento, soprattutto in discesa.',
    photo: 'polpacci',
    photoNote: 'In foto a terra: sul gradino scendi di più.',
  },
  polpacci: {
    muscles: 'Polpacci',
    steps: ['In piedi, piedi alla larghezza delle anche.', 'Una mano appoggiata per l’equilibrio.', 'Sali sulle punte più in alto che puoi.', 'Scendi lentamente.'],
    tip: 'Movimento lento, soprattutto in discesa.',
    photo: 'polpacci',
  },

  // ---------- Cardio ----------
  'marcia-veloce': {
    muscles: 'Cuore e gambe',
    steps: ['In piedi, schiena dritta.', 'Porta le ginocchia in alto alternandole, a ritmo sostenuto.', 'Spingi con le braccia.', 'Mantieni il ritmo fino alla fine.'],
    tip: 'Atterra sugli avampiedi, leggero.',
  },
  'shadow-boxing': {
    muscles: 'Cuore, spalle e braccia',
    steps: [
      'Gambe piegate, un piede avanti e uno indietro.',
      'Pugni davanti al viso.',
      'Tira colpi veloci in avanti alternando le braccia.',
      'Riporta ogni volta il pugno davanti al viso.',
    ],
    tip: 'Non bloccare il gomito a braccio teso.',
  },
  'mountain-climber': {
    muscles: 'Cuore, addome e spalle',
    steps: ['Posizione di push-up, mani sotto le spalle.', 'Porta un ginocchio verso il petto.', 'Cambia gamba velocemente, come se corressi.', 'Tieni il bacino basso.'],
    tip: 'Le spalle restano sopra le mani.',
    photo: 'mountain-climber',
  },
  'jumping-jack': {
    muscles: 'Cuore e gambe',
    steps: [
      'In piedi, piedi uniti e braccia lungo i fianchi.',
      'Salta aprendo le gambe e portando le braccia sopra la testa.',
      'Salta ancora e torna alla posizione iniziale.',
      'Continua a ritmo costante.',
    ],
    tip: 'Meglio fuori: i salti fanno ballare il camper.',
  },
  'squat-jump': {
    muscles: 'Cuore, cosce e glutei',
    steps: ['Piedi alla larghezza delle spalle.', 'Scendi in squat.', 'Salta più in alto che puoi.', 'Atterra morbido e scendi subito nello squat successivo.'],
    tip: 'Atterra sugli avampiedi con le ginocchia morbide.',
    photo: 'squat-jump',
  },
  burpee: {
    muscles: 'Tutto il corpo',
    steps: [
      'In piedi, scendi in squat e appoggia le mani a terra.',
      'Porta i piedi indietro in posizione di push-up.',
      'Riporta i piedi vicino alle mani.',
      'Salta in alto con le braccia sopra la testa.',
    ],
    tip: 'Versione facile: niente salto e piedi indietro uno alla volta.',
  },
};

export function guideFor(id: string): Guide {
  const g = GUIDES[id];
  if (!g) throw new Error(`Spiegazione mancante: ${id}`);
  return g;
}
