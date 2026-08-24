/* ==========================================================================
   preguntas.js — Contenido del examen
   Capítulos 9 y 10: La era del reino y la era del exilio
   (30 días para entender la Biblia)
   --------------------------------------------------------------------------
   Para editar el examen solo hace falta tocar este archivo.
   Tipos disponibles:
     mc         una sola alternativa correcta
     multi      varias alternativas correctas
     vf         verdadero o falso
     completar  huecos para escribir dentro de una frase
     corta      respuesta escrita libre
     orden      colocar los pasos en secuencia
     emparejar  unir dos columnas
     intrusos   tachar las opciones que sobran
     mapa       arrastrar nombres sobre el mapa
   ========================================================================== */

window.EX = window.EX || {};

EX.SECCIONES = [
  {
    id: 'I',
    titulo: 'Verdadero o falso',
    resumen: 'Seis afirmaciones sobre la era del reino y la era del exilio.',
    pasos: [
      'Lee la afirmación completa: un solo detalle puede cambiarlo todo.',
      'Elige «Verdadero» o «Falso»; se responde con un solo toque.',
      'Cuando la respuesta sea falsa, se explica por qué.'
    ]
  },
  {
    id: 'II',
    titulo: 'Completar la frase',
    resumen: 'Escribe la palabra o el concepto que falta en cada afirmación.',
    pasos: [
      'Escribe dentro de la línea dorada; no importan mayúsculas ni tildes.',
      'Basta la palabra clave: no hace falta escribir la frase completa.',
      'Pulsa Enter o «Responder» para confirmar.'
    ]
  },
  {
    id: 'III',
    titulo: 'Anular agregados',
    resumen: 'Detecta al intruso en cada grupo de personajes, libros o lugares.',
    pasos: [
      'Toca la opción que NO pertenece al grupo: quedará tachada.',
      'Deja intactas las que sí forman parte de la respuesta.',
      'Cada intruso bien tachado suma; cada acierto tachado por error resta.'
    ]
  },
  {
    id: 'IV',
    titulo: 'Opción múltiple',
    resumen: 'Datos históricos y cronológicos de la era del reino y el exilio.',
    pasos: [
      'Toca la alternativa que consideres correcta.',
      'Verás de inmediato cuál era la correcta antes de pasar a la siguiente.'
    ]
  },
  {
    id: 'V',
    titulo: 'Ubicar en el mapa',
    resumen: 'Coloca los reinos y los imperios en su lugar del Cercano Oriente Antiguo.',
    pasos: [
      'Toca un nombre de la lista y después el círculo del mapa donde va.',
      'También puedes arrastrarlo directamente hasta el círculo.',
      'Para corregir, toca el nombre ya colocado y vuelve a la lista.'
    ]
  }
];

EX.PREGUNTAS = [

  /* ---------------- I. Verdadero o falso ---------------- */
  {
    n: 1, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'La era del reino fue un tiempo de total estabilidad y paz constante, donde los reyes de Israel siempre gobernaron con justicia.',
    correcta: false,
    nota: 'Fue un tiempo turbulento con altibajos, condicionado por la obediencia del rey en turno.'
  },
  {
    n: 2, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'Saúl fue el primer rey de Israel, ungido por el último juez, Samuel.',
    correcta: true,
    nota: 'Samuel, el último juez, ungió a Saúl como primer rey.'
  },
  {
    n: 3, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'El reino del norte, compuesto por diez tribus, adoptó el nombre nacional de "Judá" tras la guerra civil.',
    correcta: false,
    nota: 'El reino del norte retuvo el nombre de "Israel"; el del sur fue el que adoptó el nombre de "Judá".'
  },
  {
    n: 4, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'Jeroboam gobernó el reino del norte y fue un líder impío, al igual que los otros 19 reyes que le sucedieron en dicho reino.',
    correcta: true,
    nota: 'Jeroboam y todos sus 19 sucesores en el reino del norte fueron impíos.'
  },
  {
    n: 5, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'La cautividad en Babilonia, profetizada por Jeremías, estaba prevista para durar exactamente setenta años.',
    correcta: true,
    nota: 'Jeremías profetizó que la cautividad duraría exactamente 70 años.'
  },
  {
    n: 6, seccion: 'I', tipo: 'vf', puntos: 1,
    enunciado: 'El profeta Ezequiel se destacó por ser un prominente líder del gobierno en el exilio, alcanzando una posición muy similar a la de José en Egipto.',
    correcta: false,
    nota: 'Fue Daniel quien alcanzó esa posición prominente en el gobierno; de la vida personal de Ezequiel no se sabe mucho.'
  },

  /* ---------------- II. Completar la frase ---------------- */
  {
    n: 7, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['Como resultado del alejamiento espiritual de Salomón, a su muerte estalló una guerra civil y el reino se ', '.'],
    huecos: [{ acepta: ['dividio', 'dividió', 'partio', 'fracciono'], ancho: 14 }],
    nota: 'El reino se dividió en el reino del norte y el reino del sur.'
  },
  {
    n: 8, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['Debido a la injusticia del reino del norte, Dios levantó a la nación de ', ' para conquistarlo y esparcir a su pueblo a los cuatro vientos.'],
    huecos: [{ acepta: ['asiria'], ancho: 12 }],
    nota: 'Asiria fue el instrumento de Dios para conquistar y dispersar al reino del norte.'
  },
  {
    n: 9, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['En el reino del sur (Judá), un total de ', ' reyes fueron justos, de un total de veinte monarcas.'],
    huecos: [{ acepta: ['ocho', '8'], ancho: 10 }],
    nota: 'Ocho de veinte reyes de Judá fueron justos.'
  },
  {
    n: 10, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['El profeta Jeremías, quien advirtió sobre el cautiverio venidero, es conocido bíblicamente como "el profeta ', '".'],
    huecos: [{ acepta: ['lloron', 'llorón'], ancho: 10 }],
    nota: 'Se le conoce como "el profeta llorón" por su lamento ante el destino de su pueblo.'
  },
  {
    n: 11, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['Mientras los judíos estaban cautivos en Babilonia, la nación de ', ' conquistó a Babilonia y se convirtió en el poder militar dominante de la región.'],
    huecos: [{ acepta: ['persia'], ancho: 12 }],
    nota: 'Persia conquistó a Babilonia y se convirtió en el nuevo poder dominante.'
  },
  {
    n: 12, seccion: 'II', tipo: 'completar', puntos: 1,
    partes: ['El Imperio persa se extendía geográficamente desde el río ', ' hasta el mar Mediterráneo.'],
    huecos: [{ acepta: ['tigris'], ancho: 12 }],
    nota: 'El Imperio persa iba desde el río Tigris hasta el mar Mediterráneo.'
  },

  /* ---------------- III. Anular agregados ---------------- */
  {
    n: 13, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha el personaje que NO pertenece a la era de la monarquía unida.',
    opciones: [
      { id: 'a', texto: 'Saúl' },
      { id: 'b', texto: 'David' },
      { id: 'c', texto: 'Salomón' },
      { id: 'd', texto: 'Moisés' }
    ],
    intrusos: ['d'],
    nota: 'Moisés es el intruso: pertenece a la era del Éxodo, mucho antes de la monarquía.'
  },
  {
    n: 14, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha el libro profético que NO corresponde al período del exilio en Babilonia.',
    opciones: [
      { id: 'a', texto: 'Ezequiel' },
      { id: 'b', texto: 'Daniel' },
      { id: 'c', texto: 'Malaquías' }
    ],
    intrusos: ['c'],
    nota: 'Malaquías es el intruso: profetizó en la era del regreso, no en el exilio.'
  },
  {
    n: 15, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha la tribu que NO conformó el reino del sur (Judá).',
    opciones: [
      { id: 'a', texto: 'Judá' },
      { id: 'b', texto: 'Benjamín' },
      { id: 'c', texto: 'Efraín' }
    ],
    intrusos: ['c'],
    nota: 'Efraín es el intruso: solo Judá y Benjamín formaron el reino del sur.'
  },
  {
    n: 16, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha lo que NO es una de las cuatro divisiones principales de la era del exilio.',
    opciones: [
      { id: 'a', texto: 'Profecía' },
      { id: 'b', texto: 'Profetas' },
      { id: 'c', texto: 'Exilios' },
      { id: 'd', texto: 'Conquista' }
    ],
    intrusos: ['d'],
    nota: 'Conquista es el intruso: las cuatro divisiones son Profecía, Profetas, Exilios y Cambio de poder.'
  },
  {
    n: 17, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha lo que NO corresponde a las clases de personas que Babilonia llevó cautivas desde Judá.',
    opciones: [
      { id: 'a', texto: 'Líderes' },
      { id: 'b', texto: 'Artesanos' },
      { id: 'c', texto: 'Músicos' },
      { id: 'd', texto: 'Soldados de Asiria' }
    ],
    intrusos: ['d'],
    nota: '"Soldados de Asiria" es el intruso: Babilonia se llevó líderes, artesanos, músicos y jóvenes prometedores de Judá.'
  },
  {
    n: 18, seccion: 'III', tipo: 'intrusos', puntos: 3,
    enunciado: 'Tacha lo que NO es uno de los períodos principales de la era del reino.',
    opciones: [
      { id: 'a', texto: 'Reino unido' },
      { id: 'b', texto: 'División del reino' },
      { id: 'c', texto: 'Reino del norte' },
      { id: 'd', texto: 'Reino del este' }
    ],
    intrusos: ['d'],
    nota: '"Reino del este" es el intruso: los períodos son reino unido, dividido, del norte y del sur.'
  },

  /* ---------------- IV. Opción múltiple ---------------- */
  {
    n: 19, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿Qué imperio conquistó finalmente al reino del sur (Judá) tras sitiar y destruir Jerusalén?',
    opciones: [
      { id: 'a', texto: 'El Imperio asirio' },
      { id: 'b', texto: 'El Imperio babilónico' },
      { id: 'c', texto: 'El Imperio persa' }
    ],
    correcta: 'b',
    nota: 'Babilonia sitió y destruyó Jerusalén, conquistando al reino del sur.'
  },
  {
    n: 20, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿En qué año fue conquistado y dispersado el reino del norte (Israel) a manos de Asiria?',
    opciones: [
      { id: 'a', texto: '586 A.C.' },
      { id: 'b', texto: '722 A.C.' },
      { id: 'c', texto: '333 A.C.' }
    ],
    correcta: 'b',
    nota: 'El reino del norte cayó ante Asiria en el año 722 A.C.'
  },
  {
    n: 21, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿Cuál de los siguientes profetas del exilio escribió un libro con un alto contenido biográfico, mostrando su ejemplo de vida en el gobierno extranjero?',
    opciones: [
      { id: 'a', texto: 'Jeremías' },
      { id: 'b', texto: 'Ezequiel' },
      { id: 'c', texto: 'Daniel' }
    ],
    correcta: 'c',
    nota: 'Daniel narra en detalle su propia vida y su papel en el gobierno de Babilonia y Persia.'
  },
  {
    n: 22, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿Cuántos años duró la dinastía del reino del norte (Israel) antes de su destrucción final por su constante injusticia?',
    opciones: [
      { id: 'a', texto: 'Setenta años' },
      { id: 'b', texto: 'Doscientos cincuenta años' },
      { id: 'c', texto: 'Cuatrocientos años' }
    ],
    correcta: 'b',
    nota: 'El reino del norte duró alrededor de 250 años antes de su destrucción.'
  },
  {
    n: 23, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿Cuál de estos reyes prolongó la vida del reino del sur (Judá) por 400 años gracias a que fue uno de los pocos reyes justos?',
    opciones: [
      { id: 'a', texto: 'Roboam' },
      { id: 'b', texto: 'Jeroboam' },
      { id: 'c', texto: 'David (sucesor indirecto en la dinastía de Judá, donde hubo 8 reyes justos)' }
    ],
    correcta: 'c',
    nota: 'La dinastía continuó la línea de David; solo hubo 8 reyes justos en Judá, y eso prolongó su duración.'
  },
  {
    n: 24, seccion: 'IV', tipo: 'mc', puntos: 1,
    enunciado: '¿Qué hecho describe el texto con la analogía de un hombre que salta del Empire State y es perdonado a mitad de camino?',
    opciones: [
      { id: 'a', texto: 'Que el perdón de Dios elimina inmediatamente las consecuencias físicas del pecado.' },
      { id: 'b', texto: 'Que el pecado tiene consecuencias inevitables, aunque Dios otorgue su perdón.' },
      { id: 'c', texto: 'Que el exilio fue evitado gracias al arrepentimiento de Israel.' }
    ],
    correcta: 'b',
    nota: 'El perdón no anula las consecuencias que el pecado ya puso en marcha.'
  },

  /* ---------------- V. Ubicar en el mapa ---------------- */
  {
    n: 25, seccion: 'V', tipo: 'mapa', puntos: 6,
    enunciado: 'Coloca cada reino e imperio en su lugar del Cercano Oriente Antiguo.',
    etiquetas: ['Israel', 'Jerusalén', 'Asiria', 'Babilonia', 'Persia', 'Egipto'],
    nota: 'Israel (reino del norte) junto a la costa; Jerusalén, capital del reino del sur, cerca del mar Muerto; Asiria al norte, entre las cabeceras del Tigris y el Éufrates; Babilonia en Mesopotamia; Persia junto al golfo Pérsico; Egipto al suroeste.'
  },
  {
    n: 26, seccion: 'V', tipo: 'mc', puntos: 1,
    enunciado: 'En la geografía actual, los ríos Tigris y Éufrates (límites de las tierras del Antiguo Testamento) fluyen principalmente a través de:',
    opciones: [
      { id: 'a', texto: 'Irán' },
      { id: 'b', texto: 'Irak' },
      { id: 'c', texto: 'Siria' }
    ],
    correcta: 'b',
    nota: 'El Tigris y el Éufrates atraviesan principalmente el actual Irak.'
  }
];
