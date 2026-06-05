// Versículos de alabanza y adoración — texto embebido para RVR1960 y NVI
// Para otras versiones se consulta bible-api.com

export interface VerseEntry {
  ref: string;         // Referencia legible, ej. "Salmos 100:1-2"
  apiRef: string;      // Formato para bible-api.com, ej. "psalms 100:1-2"
  rvr1960: string;
  nvi: string;
}

export const WORSHIP_VERSES: VerseEntry[] = [
  {
    ref: "Salmos 100:1-2",
    apiRef: "psalms 100:1-2",
    rvr1960: "Cantad alegres a Dios, habitantes de toda la tierra. Servid a Jehová con alegría; venid ante su presencia con regocijo.",
    nvi: "Aclamen alegres al Señor, habitantes de toda la tierra; adoren al Señor con regocijo. Preséntense ante él con cánticos de júbilo.",
  },
  {
    ref: "Salmos 150:6",
    apiRef: "psalms 150:6",
    rvr1960: "Todo lo que respira alabe a JAH. Aleluya.",
    nvi: "¡Que todo lo que respira alabe al Señor! ¡Aleluya! ¡Alabado sea el Señor!",
  },
  {
    ref: "Juan 4:24",
    apiRef: "john 4:24",
    rvr1960: "Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.",
    nvi: "Dios es espíritu, y quienes lo adoran deben hacerlo en espíritu y en verdad.",
  },
  {
    ref: "Apocalipsis 4:11",
    apiRef: "revelation 4:11",
    rvr1960: "Señor, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas, y por tu voluntad existen y fueron creadas.",
    nvi: "Digno eres, Señor y Dios nuestro, de recibir la gloria, la honra y el poder, porque tú creaste todas las cosas; por tu voluntad existen y fueron creadas.",
  },
  {
    ref: "Salmos 34:1",
    apiRef: "psalms 34:1",
    rvr1960: "Bendeciré a Jehová en todo tiempo; su alabanza estará de continuo en mi boca.",
    nvi: "Bendeciré al Señor en todo tiempo; mis labios siempre lo alabarán.",
  },
  {
    ref: "Salmos 22:3",
    apiRef: "psalms 22:3",
    rvr1960: "Pero tú eres santo, tú que habitas entre las alabanzas de Israel.",
    nvi: "Pero tú eres santo, tú eres rey, ¡tú eres la alabanza de Israel!",
  },
  {
    ref: "Romanos 12:1",
    apiRef: "romans 12:1",
    rvr1960: "Así que, hermanos, os ruego por las misericordias de Dios, que presentéis vuestros cuerpos en sacrificio vivo, santo, agradable a Dios, que es vuestro culto racional.",
    nvi: "Por lo tanto, hermanos, tomando en cuenta la misericordia de Dios, les ruego que cada uno de ustedes, en adoración espiritual, ofrezca su cuerpo como sacrificio vivo, santo y agradable a Dios.",
  },
  {
    ref: "Salmos 95:1-2",
    apiRef: "psalms 95:1-2",
    rvr1960: "Venid, aclamemos alegremente a Jehová; cantemos con júbilo a la roca de nuestra salvación. Lleguemos ante su presencia con alabanza; aclamémosle con cánticos.",
    nvi: "Vengan, cantemos con júbilo al Señor; aclamemos a la roca de nuestra salvación. Lleguemos ante él con acción de gracias, aclamémoslo con cánticos.",
  },
  {
    ref: "Salmos 96:1",
    apiRef: "psalms 96:1",
    rvr1960: "Cantad a Jehová cántico nuevo; cantad a Jehová, toda la tierra.",
    nvi: "Canten al Señor un cántico nuevo; canten al Señor, habitantes de toda la tierra.",
  },
  {
    ref: "1 Crónicas 16:29",
    apiRef: "1 chronicles 16:29",
    rvr1960: "Dad a Jehová la gloria debida a su nombre; traed ofrenda, y venid delante de él; postraos delante de Jehová en la hermosura de la santidad.",
    nvi: "Tributen al Señor la gloria que merece su nombre; tráiganle sus ofrendas y preséntense ante él. Póstrense ante el Señor en la majestuosidad de su santuario.",
  },
  {
    ref: "Efesios 5:19",
    apiRef: "ephesians 5:19",
    rvr1960: "Hablando entre vosotros con salmos, con himnos y cánticos espirituales, cantando y alabando al Señor en vuestros corazones.",
    nvi: "Anímense unos a otros con salmos, himnos y canciones espirituales. Canten y alaben al Señor con el corazón.",
  },
  {
    ref: "Colosenses 3:16",
    apiRef: "colossians 3:16",
    rvr1960: "La palabra de Cristo more en abundancia en vosotros, enseñándoos y exhortándoos unos a otros en toda sabiduría, cantando con gracia en vuestros corazones al Señor con salmos e himnos y cánticos espirituales.",
    nvi: "Que habite en ustedes la palabra de Cristo con toda su riqueza: instrúyanse y aconséjense unos a otros con toda sabiduría; canten salmos, himnos y canciones espirituales a Dios, con gratitud de corazón.",
  },
  {
    ref: "Salmos 103:1-2",
    apiRef: "psalms 103:1-2",
    rvr1960: "Bendice, alma mía, a Jehová, y bendiga todo mi ser su santo nombre. Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios.",
    nvi: "Alaba, alma mía, al Señor; alabe todo mi ser su santo nombre. Alaba, alma mía, al Señor, y no olvides ninguno de sus beneficios.",
  },
  {
    ref: "Salmos 47:1",
    apiRef: "psalms 47:1",
    rvr1960: "Pueblos todos, batid las manos; aclamad a Dios con voz de júbilo.",
    nvi: "Aplaudan, pueblos todos; aclamen a Dios con gritos de alegría.",
  },
  {
    ref: "Isaías 6:3",
    apiRef: "isaiah 6:3",
    rvr1960: "Y el uno al otro daba voces, diciendo: Santo, santo, santo, Jehová de los ejércitos; toda la tierra está llena de su gloria.",
    nvi: "Y se decían el uno al otro: «Santo, santo, santo es el Señor Todopoderoso; toda la tierra está llena de su gloria.»",
  },
  {
    ref: "Salmos 63:3-4",
    apiRef: "psalms 63:3-4",
    rvr1960: "Porque mejor es tu misericordia que la vida; mis labios te alabarán. Así te bendeciré en mi vida; en tu nombre alzaré mis manos.",
    nvi: "Porque tu amor es mejor que la vida, mis labios te alabarán. Te bendeciré mientras viva, y alzando mis manos te invocaré.",
  },
  {
    ref: "Hebreos 13:15",
    apiRef: "hebrews 13:15",
    rvr1960: "Así que, ofrezcamos siempre a Dios, por medio de él, sacrificio de alabanza, es decir, fruto de labios que confiesan su nombre.",
    nvi: "Así que ofrezcamos continuamente a Dios, por medio de Jesucristo, un sacrificio de alabanza, es decir, el fruto de los labios que confiesan su nombre.",
  },
  {
    ref: "Salmos 145:3",
    apiRef: "psalms 145:3",
    rvr1960: "Grande es Jehová, y digno de suprema alabanza; y su grandeza es inescrutable.",
    nvi: "Grande es el Señor, y digno de alabanza; su grandeza es insondable.",
  },
  {
    ref: "Apocalipsis 5:12",
    apiRef: "revelation 5:12",
    rvr1960: "Que decían a gran voz: El Cordero que fue inmolado es digno de tomar el poder, las riquezas, la sabiduría, la fortaleza, la honra, la gloria y la alabanza.",
    nvi: "Cantaban con todas sus fuerzas: «¡Digno es el Cordero, que ha sido sacrificado, de recibir el poder, la riqueza y la sabiduría, la fortaleza y la honra, la gloria y la alabanza!»",
  },
  {
    ref: "Salmos 27:4",
    apiRef: "psalms 27:4",
    rvr1960: "Una cosa he demandado a Jehová, ésta buscaré; que esté yo en la casa de Jehová todos los días de mi vida, para contemplar la hermosura de Jehová, y para inquirir en su templo.",
    nvi: "Una sola cosa le pido al Señor, y es lo único que persigo: habitar en la casa del Señor todos los días de mi vida, para contemplar la hermosura del Señor y recrearme en su templo.",
  },
  {
    ref: "Salmos 84:1-2",
    apiRef: "psalms 84:1-2",
    rvr1960: "¡Cuán amables son tus moradas, oh Jehová de los ejércitos! Anhela mi alma y aun ardientemente desea los atrios de Jehová; mi corazón y mi carne cantan al Dios vivo.",
    nvi: "¡Cuán hermosas son tus moradas, Señor Todopoderoso! Anhelo con el alma los atrios del Señor; casi agonizo por estar en ellos. Con el corazón, con todo el cuerpo, canto alegre al Dios de la vida.",
  },
  {
    ref: "Salmos 46:10",
    apiRef: "psalms 46:10",
    rvr1960: "Estad quietos, y conoced que yo soy Dios; seré exaltado entre las naciones; enaltecido seré en la tierra.",
    nvi: "«Quédense quietos, reconozcan que yo soy Dios. ¡Yo seré exaltado entre las naciones! ¡Yo seré enaltecido en la tierra!»",
  },
  {
    ref: "Filipenses 4:4",
    apiRef: "philippians 4:4",
    rvr1960: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!",
    nvi: "Alégrense siempre en el Señor. Insisto: ¡Alégrense!",
  },
  {
    ref: "Salmos 92:1-2",
    apiRef: "psalms 92:1-2",
    rvr1960: "Bueno es alabarte, oh Jehová, y cantar salmos a tu nombre, oh Altísimo; anunciar por la mañana tu misericordia, y tu fidelidad cada noche.",
    nvi: "Bueno es alabarte, Señor, y entonar salmos a tu nombre, oh Altísimo; proclamar tu gran amor por la mañana, y tu fidelidad por la noche.",
  },
  {
    ref: "Salmos 113:3",
    apiRef: "psalms 113:3",
    rvr1960: "Desde el nacimiento del sol hasta donde se pone, sea alabado el nombre de Jehová.",
    nvi: "Desde la salida del sol hasta su ocaso, sea alabado el nombre del Señor.",
  },
  {
    ref: "1 Pedro 2:9",
    apiRef: "1 peter 2:9",
    rvr1960: "Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable.",
    nvi: "Pero ustedes son linaje escogido, real sacerdocio, nación santa, pueblo que pertenece a Dios, para que proclamen las obras maravillosas de aquel que los llamó de las tinieblas a su luz admirable.",
  },
  {
    ref: "Salmos 136:1",
    apiRef: "psalms 136:1",
    rvr1960: "Alabad a Jehová, porque él es bueno, porque para siempre es su misericordia.",
    nvi: "Den gracias al Señor, porque él es bueno; su gran amor perdura para siempre.",
  },
  {
    ref: "2 Samuel 22:47",
    apiRef: "2 samuel 22:47",
    rvr1960: "Jehová vive, y bendita sea mi roca, y engrandecido sea Dios, la roca de mi salvación.",
    nvi: "El Señor vive. ¡Bendita sea mi roca! ¡Exaltado sea Dios, la Roca, mi Salvador!",
  },
  {
    ref: "Salmos 57:9-10",
    apiRef: "psalms 57:9-10",
    rvr1960: "Te alabaré entre los pueblos, oh Señor; cantaré de ti entre las naciones. Porque grande es hasta los cielos tu misericordia, y hasta las nubes tu verdad.",
    nvi: "Te alabaré entre los pueblos, Señor; te cantaré salmos entre las naciones. Pues tu amor es tan grande que llega a las nubes, ¡tu verdad llega hasta el firmamento!",
  },
  {
    ref: "Salmos 18:3",
    apiRef: "psalms 18:3",
    rvr1960: "Invocaré a Jehová, quien es digno de ser alabado, y seré salvo de mis enemigos.",
    nvi: "Invoco al Señor, que es digno de alabanza, y quedo a salvo de mis enemigos.",
  },
];

// Devuelve el versículo del día basado en la fecha
export function getDailyVerse(): VerseEntry {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return WORSHIP_VERSES[dayOfYear % WORSHIP_VERSES.length];
}
