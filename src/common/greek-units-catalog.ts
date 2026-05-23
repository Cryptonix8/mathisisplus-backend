import { KeyStage } from '@prisma/client';

export type GreekEducationLevel = 'PRIMARY' | 'LOWER_SECONDARY' | 'UPPER_SECONDARY';

export interface GreekUnitTemplate {
  topicName: string;
  coreContent?: string;
  learningObjectives?: string[];
  keySkills?: string[];
  nationalCurriculumRef?: string;
}

export const GREEK_TOPICS_MIN_PER_SUBJECT = 3;

export function gradeCodeToEducationLevel(gradeCode: string): GreekEducationLevel {
  if (gradeCode.startsWith('dimotiko')) return 'PRIMARY';
  if (gradeCode.startsWith('gymnasio')) return 'LOWER_SECONDARY';
  return 'UPPER_SECONDARY';
}

export function educationLevelToKeyStage(level: GreekEducationLevel): KeyStage {
  switch (level) {
    case 'PRIMARY':
      return KeyStage.KS2;
    case 'LOWER_SECONDARY':
      return KeyStage.KS3;
    case 'UPPER_SECONDARY':
      return KeyStage.KS4;
    default:
      return KeyStage.KS3;
  }
}

function unit(
  topicName: string,
  subjectDisplayName: string,
  gradeDisplayName: string,
  coreContent?: string,
  keySkills?: string[],
): GreekUnitTemplate {
  return {
    topicName,
    coreContent: coreContent ?? `Περιεχόμενο ενότητας «${topicName}» για ${gradeDisplayName}.`,
    learningObjectives: [
      `Κατανόηση βασικών εννοιών της ενότητας «${topicName}»`,
      `Εφαρμογή γνώσεων σε ασκήσεις και δραστηριότητες`,
    ],
    keySkills: keySkills ?? [],
    nationalCurriculumRef: `${subjectDisplayName} — ${gradeDisplayName} — ${topicName}`,
  };
}

function primaryGradeNum(gradeCode: string): number {
  const m = gradeCode.match(/dimotiko_(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function secondaryGradeNum(gradeCode: string): number {
  const g = gradeCode.match(/gymnasio_(\d+)/);
  if (g) return parseInt(g[1], 10);
  const l = gradeCode.match(/lykeio_(\d+)/);
  return l ? parseInt(l[1], 10) : 1;
}

/**
 * Curriculum units (κεφάλαια/ενότητες) per subject and grade — aligned with Greek school structure.
 */
export function getGreekUnitsForSubjectGrade(
  subjectName: string,
  subjectDisplayName: string,
  gradeCode: string,
  gradeDisplayName: string,
): GreekUnitTemplate[] {
  const level = gradeCodeToEducationLevel(gradeCode);

  switch (subjectName) {
    case 'mathimatika':
      return getMathUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'glossa':
      return getGreekLanguageUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'epistimi':
      return getScienceUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'fysiki':
      return level === 'PRIMARY'
        ? getScienceUnits(subjectDisplayName, gradeCode, gradeDisplayName, 'PRIMARY').slice(0, 4)
        : getPhysicsUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'istoria':
      return getHistoryUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'geografia':
      return getGeographyUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'agglika':
    case 'agglika_deftera':
      return getEnglishUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    case 'pliroforiki':
    case 'psifiaki_technologia':
      return level === 'PRIMARY'
        ? getPrimaryDigitalUnits(subjectDisplayName, gradeDisplayName)
        : getComputingUnits(subjectDisplayName, gradeCode, gradeDisplayName, level);
    default:
      return getDefaultSubjectUnits(subjectDisplayName, gradeDisplayName, level);
  }
}

function getMathUnits(
  subject: string,
  gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  if (level === 'PRIMARY') {
    const g = primaryGradeNum(gradeCode);
    const byGrade: Record<number, string[]> = {
      1: ['Αριθμοί μέχρι το 20', 'Πρόσθεση και αφαίρεση', 'Γεωμετρικά σχήματα', 'Μέτρηση μήκους και μάζας'],
      2: ['Πολλαπλασιασμός', 'Διαίρεση', 'Κλάσματα — εισαγωγή', 'Χρήματα και αγορές'],
      3: ['Κλάσματα και δεκαδικοί', 'Προβλήματα πράξεων', 'Περίμετρος και εμβαδόν', 'Στατιστική — γραφήματα'],
      4: ['Δεκαδικοί αριθμοί', 'Γωνίες και τρίγωνα', 'Κλάσματα — πράξεις', 'Συλλογή και ανάλυση δεδομένων'],
      5: ['Ποσοστά — εισαγωγή', 'Συμμετρία και μετασχηματισμοί', 'Εξισώσεις — εισαγωγή', 'Πιθανότητες — βασικές έννοιες'],
      6: ['Αναλογίες και αναλογίες', 'Άλγεβρα — εκφράσεις', 'Όγκος και εμβαδόν', 'Στατιστική — μέσος όρος'],
    };
    return (byGrade[g] || byGrade[6]).map((name) =>
      unit(name, subject, gradeDisplay, undefined, ['Αριθμητική', 'Γεωμετρία', 'Επίλυση προβλημάτων']),
    );
  }
  if (level === 'LOWER_SECONDARY') {
    const g = secondaryGradeNum(gradeCode);
    const byGrade: Record<number, string[]> = {
      1: ['Ακέραιοι και ρητοί αριθμοί', 'Ποσοστά και αναλογίες', 'Εξισώσεις (1ου βαθμού)', 'Γεωμετρία — ευθείες και γωνίες'],
      2: ['Πολυώνυμα και ταυτότητες', 'Ρίζες και εξισώσεις', 'Πυθαγόρειο θεώρημα', 'Στατιστική — διακύμανση'],
      3: ['Συναρτήσεις — εισαγωγή', 'Κυκλομετρία', 'Πιθανότητες', 'Μοντελοποίηση προβλημάτων'],
    };
    return (byGrade[g] || byGrade[3]).map((name) =>
      unit(name, subject, gradeDisplay, undefined, ['Άλγεβρα', 'Γεωμετρία', 'Στατιστική']),
    );
  }
  const g = secondaryGradeNum(gradeCode);
  const lykeio: Record<number, string[]> = {
    1: ['Πραγματικοί αριθμοί', 'Εκθετικές και λογαριθμικές συναρτήσεις', 'Τριγωνομετρία', 'Στατιστική — κατανομές'],
    2: ['Όρια και συνέχεια', 'Παραγώγοι', 'Ολοκληρώματα — εισαγωγή', 'Στοχαστική'],
    3: ['Επανάληψη πανελληνίων θεμάτων', 'Συνδυαστική ανάλυση', 'Διανυσματικοί χώροι', 'Εφαρμογές σε πραγματικά προβλήματα'],
  };
  return (lykeio[g] || lykeio[3]).map((name) =>
    unit(name, subject, gradeDisplay, undefined, ['Άλγεβρα', 'Ανάλυση', 'Στατιστική']),
  );
}

function getGreekLanguageUnits(
  subject: string,
  gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  if (level === 'PRIMARY') {
    const g = primaryGradeNum(gradeCode);
    const byGrade: Record<number, string[]> = {
      1: ['Γραμματική — βασικές κατηγορίες', 'Ανάγνωση κατανοώντας', 'Γραφή προτάσεων', 'Ορθογραφία'],
      2: ['Γραμματική — χρόνοι ρημάτων', 'Παραγωγή κειμένου', 'Λογοτεχνία — παραμύθια', 'Λεξιλόγιο'],
      3: ['Σύνταξη', 'Έκθεση — περιγραφή', 'Ποίηση', 'Διαβάζω και κατανοώ'],
      4: ['Γραμματική — επιθήκες', 'Έκθεση — αφήγηση', 'Λογοτεχνικά κείμενα', 'Ορθογραφικοί κανόνες'],
      5: ['Έκφραση απόψεων', 'Έρευνα και παρουσίαση', 'Λογοτεχνία — μυθιστορήματα', 'Γλωσσική ποικιλότητα'],
      6: ['Έκθεση — συζήτηση', 'Κριτική ανάγνωση', 'Δημιουργική γραφή', 'Προετοιμασία για Γυμνάσιο'],
    };
    return (byGrade[g] || byGrade[6]).map((name) =>
      unit(name, subject, gradeDisplay, undefined, ['Ανάγνωση', 'Γραφή', 'Γραμματική']),
    );
  }
  const names =
    level === 'LOWER_SECONDARY'
      ? [
          'Αρχαία ελληνική γλώσσα — εισαγωγή',
          'Νεοελληνική λογοτεχνία',
          'Έκθεση — επιχειρηματολογία',
          'Γραμματική — σύνθετες δομές',
          'Παραγωγή λόγου',
        ]
      : [
          'Λογοτεχνία — ποιητικά κείμενα',
          'Έκθεση — αναλυτική προσέγγιση',
          'Κείμενα πολιτισμού',
          'Γλωσσική επικοινωνία',
          'Προετοιμασία εξετάσεων',
        ];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Ανάγνωση', 'Γραφή', 'Λογοτεχνία']));
}

function getScienceUnits(
  subject: string,
  gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  if (level === 'PRIMARY') {
    const g = primaryGradeNum(gradeCode);
    const byGrade: Record<number, string[]> = {
      1: ['Το ανθρώπινο σώμα', 'Ζώα και φυτά', 'Υλικά γύρω μας', 'Καιρός και εποχές'],
      2: ['Διατροφή και υγεία', 'Οικοσυστήματα', 'Δυνάμεις και κίνηση', 'Μαγνήτες και ηλεκτρισμός — εισαγωγή'],
      3: ['Σκελετός και μύες', 'Ζωή στα εδάφη', 'Φως και σκιά', 'Νερό και κύκλος του νερού'],
      4: ['Αναπνοή και κυκλοφορία', 'Τροφικές αλυσίδες', 'Ήχος', 'Γεωλογία — πετρώματα'],
      5: ['Αναπαραγωγή', 'Περιβάλλον και ρύπανση', 'Ηλεκτρικό ρεύμα', 'Διάστημα και πλανήτες'],
      6: ['Γενετικό υλικό — εισαγωγή', 'Κλίμα και αλλαγές', 'Χημεία στην καθημερινότητα', 'Επιστημονική μέθοδος'],
    };
    return (byGrade[g] || byGrade[6]).map((name) =>
      unit(name, subject, gradeDisplay, undefined, ['Βιολογία', 'Φυσική', 'Έρευνα']),
    );
  }
  const names =
    level === 'LOWER_SECONDARY'
      ? ['Κύτταρο και οργανισμοί', 'Χημεία — στοιχεία και ενώσεις', 'Φυσική — δύναμη και ενέργεια', 'Γεωλογία', 'Επιστημονική έρευνα']
      : ['Βιολογία — μεταβολισμός', 'Χημεία — αντιδράσεις', 'Φυσική — κυματομηχανική', 'Οικολογία', 'Εργαστηριακές ασκήσεις'];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Βιολογία', 'Χημεία', 'Φυσική']));
}

function getPhysicsUnits(subject: string, gradeCode: string, gradeDisplay: string, level: GreekEducationLevel): GreekUnitTemplate[] {
  const names =
    level === 'LOWER_SECONDARY'
      ? ['Κινητική', 'Δυναμική', 'Ενέργεια και θερμότητα', 'Ηλεκτρομαγνητισμός', 'Πειράματα φυσικής']
      : ['Μηχανική', 'Ηλεκτροδυναμική', 'Κύματα', 'Πυρηνική φυσική — εισαγωγή', 'Φυσική — επανάληψη'];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Παρατήρηση', 'Πειράματα']));
}

function getHistoryUnits(
  subject: string,
  _gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  const names =
    level === 'PRIMARY'
      ? ['Η ζωή στην αρχαιότητα', 'Βυζαντινή αυτοκρατορία — εισαγωγή', 'Ελληνική Επανάσταση', 'Τοπική ιστορία']
      : level === 'LOWER_SECONDARY'
        ? ['Αρχαία Ελλάδα', 'Ρωμαϊκή και βυζαντινή περίοδος', 'Νεότερη Ελληνική Ιστορία', 'Παγκόσμια ιστορία', 'Πηγές και ιστορική έρευνα']
        : ['Ιστορία 19ου–20ού αιώνα', 'Ψυχρός πόλεμος', 'Σύγχρονος κόσμος', 'Ιστορία τέχνης', 'Ιστορική συνθέση'];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Χρονολόγηση', 'Πηγές']));
}

function getGeographyUnits(
  subject: string,
  _gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  const names =
    level === 'PRIMARY'
      ? ['Χάρτες και κατευθύνσεις', 'Ελλάδα — τοπία', 'Κλίματα', 'Πόλεις και χωριά']
      : level === 'LOWER_SECONDARY'
        ? ['Γεωμορφολογία Ελλάδας', 'Πληθυσμός και μεταναστεύσεις', 'Οικονομική γεωγραφία', 'Γεωγραφία Ευρώπης', 'Χάρτες GIS']
        : ['Γεωπολιτική', 'Αστικοποίηση', 'Βιώσιμη ανάπτυξη', 'Κλιματική αλλαγή', 'Γεωγραφία — έρευνα'];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Χάρτες', 'Έρευνα']));
}

function getEnglishUnits(
  subject: string,
  gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  if (level === 'PRIMARY') {
    const g = primaryGradeNum(gradeCode);
    const byGrade: Record<number, string[]> = {
      1: ['Greetings and classroom English', 'Colours and numbers', 'My family', 'Simple instructions'],
      2: ['Daily routines', 'Food and drinks', 'Animals', 'Present simple'],
      3: ['Hobbies', 'Places in town', 'Past simple — introduction', 'Reading short texts'],
      4: ['Travel and holidays', 'Comparatives', 'Writing emails', 'Listening comprehension'],
      5: ['Future plans', 'Environment vocabulary', 'Project presentation', 'Grammar revision'],
      6: ['Secondary school preparation', 'Opinions and discussions', 'Reading longer texts', 'Writing paragraphs'],
    };
    return (byGrade[g] || byGrade[6]).map((name) =>
      unit(name, subject, gradeDisplay, `Ενότητα Αγγλικών: ${name}`, ['Reading', 'Writing', 'Speaking']),
    );
  }
  const names =
    level === 'LOWER_SECONDARY'
      ? ['Unit 1: Identity and culture', 'Unit 2: School life', 'Unit 3: Travel', 'Unit 4: Media', 'Grammar and vocabulary']
      : ['Unit 1: Global issues', 'Unit 2: Science and technology', 'Unit 3: Literature', 'Exam skills', 'Speaking and writing'];
  return names.map((name) => unit(name, subject, gradeDisplay, `Ενότητα: ${name}`, ['Ανάγνωση', 'Γραφή', 'Ομιλία']));
}

function getPrimaryDigitalUnits(subject: string, gradeDisplay: string): GreekUnitTemplate[] {
  return [
    'Ψηφιακή αλφαβητοποίηση',
    'Ασφάλεια στο διαδίκτυο',
    'Βασικές δεξιότητες υπολογιστή',
    'Δημιουργικότητα με τεχνολογία',
  ].map((name) => unit(name, subject, gradeDisplay, undefined, ['Ψηφιακή παιδεία']));
}

function getComputingUnits(
  subject: string,
  _gradeCode: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  const names =
    level === 'LOWER_SECONDARY'
      ? ['Αλγόριθμοι και προγραμματισμός', 'Δεδομένα και βάσεις', 'Δίκτυα υπολογιστών', 'Ψηφιακή ασφάλεια', 'Έργο προγραμματισμού']
      : ['Προγραμματισμός — προχωρημένα', 'Τεχνητή νοημοσύνη — εισαγωγή', 'Ανάπτυξη εφαρμογών', 'Δεδομένα και ανάλυση', 'Πτυχιακή προετοιμασία'];
  return names.map((name) => unit(name, subject, gradeDisplay, undefined, ['Προγραμματισμός', 'Δεδομένα']));
}

function getDefaultSubjectUnits(
  subject: string,
  gradeDisplay: string,
  level: GreekEducationLevel,
): GreekUnitTemplate[] {
  const prefix = level === 'PRIMARY' ? 'Ενότητα' : 'Κεφάλαιο';
  const topicsBySubject: Record<string, string[]> = {
    'Φυσική Αγωγή': ['Αθλητικές δεξιότητες', 'Ομαδικά παιχνίδια', 'Υγεία και ευεξία', 'Ατομική άσκηση'],
    'Ψυχική Υγεία': ['Συναισθήματα', 'Σχέσεις', 'Άγχος και διαχείριση', 'Αυτοεκτίμηση'],
    'Κοινωνική και Πολιτική Αγωγή': ['Δημοκρατία', 'Δικαιώματα', 'Μέσα και πληροφόρηση', 'Συμμετοχή πολιτών'],
    'Θρησκευτική Αγωγή': ['Ηθικές αξίες', 'Πολιτισμός και παράδοση', 'Διάλογος θρησκειών', 'Κοινωνική προσφορά'],
    Τεχνολογία: ['Σχεδιασμός προϊόντος', 'Υλικά και κατασκευή', 'Μηχανισμοί', 'Αξιολόγηση έργου'],
    'Ξένες Γλώσσες': ['Βασικό λεξιλόγιο', 'Καθημερινός διάλογος', 'Πολιτισμός χώρας', 'Γραπτή έκφραση'],
    Ισπανικά: ['Presente de indicativo', 'Vocabulario básico', 'Cultura hispana', 'Comprensión auditiva'],
    Μουσική: ['Ρυθμός και μέτρο', 'Μουσική ανάγνωση', 'Χορωδία', 'Ιστορία μουσικής'],
    'Τέχνη & Σχέδιο': ['Σχέδιο', 'Χρώμα και σύνθεση', 'Καλλιτεχνικά ρεύματα', 'Ψηφιακή τέχνη'],
  };
  const names = topicsBySubject[subject] || [
    `${prefix} 1: Εισαγωγή`,
    `${prefix} 2: Βασικές έννοιες`,
    `${prefix} 3: Εφαρμογές`,
    `${prefix} 4: Αξιολόγηση`,
  ];
  return names.map((name) => unit(name, subject, gradeDisplay));
}
