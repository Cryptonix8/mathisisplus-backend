/**
 * Greek (el-GR) copy for mandatory onboarding — Part A option labels and Part B fallbacks.
 */

/** Normalize occasional English labels in Greek questionnaire sources. */
const EL_GR_OPTION_LABEL_MAP: Record<string, string> = {
  Gaming: 'Ηλεκτρονικά παιχνίδια',
  gaming: 'Ηλεκτρονικά παιχνίδια',
};

export function normalizeElGROptionLabel(label: string): string {
  const trimmed = label.trim();
  return EL_GR_OPTION_LABEL_MAP[trimmed] ?? trimmed;
}

export function normalizeElGRQuestionnaireSections(sections: any[]): any[] {
  return sections.map((section) => ({
    ...section,
    questions: (section.questions || []).map((q: any) => ({
      ...q,
      options: (q.options || []).map((opt: any) => ({
        ...opt,
        label: normalizeElGROptionLabel(opt.label ?? ''),
      })),
    })),
  }));
}

export const GREEK_DIAGNOSTIC_GENERIC = {
  mostInteresting: (subject: string) =>
    `Τι σου φάνηκε πιο ενδιαφέρον στα ${subject} πέρυσι;`,
  improveArea: (subject: string) =>
    `Σε ποιον τομέα θα ήθελες να βελτιωθείς στα ${subject};`,
  optionsMostInteresting: [
    { value: 'a', label: 'Νέες έννοιες και ιδέες' },
    { value: 'b', label: 'Πρακτικές δραστηριότητες' },
    { value: 'c', label: 'Συνεργασία με άλλους' },
    { value: 'd', label: 'Επίλυση προβλημάτων' },
  ],
  optionsImproveArea: [
    { value: 'a', label: 'Κατανόηση βασικών ιδεών' },
    { value: 'b', label: 'Εφαρμογή όσων μαθαίνω' },
    { value: 'c', label: 'Απομνημόνευση γεγονότων' },
    { value: 'd', label: 'Όλα τα παραπάνω' },
  ],
};

/** Default 30 diagnostic questions (el-GR) when no PDF / AI content is available. */
export const GREEK_DEFAULT_DIAGNOSTIC_BASE: Array<{
  q: string;
  opts: string[];
  correct: number;
}> = [
  { q: 'Ποιος είναι ο κύριος σκοπός μιας προτάσεως-θέματος σε μια παράγραφο;', opts: ['Να κλείσει η παράγραφο', 'Να παρουσιάσει την κύρια ιδέα', 'Να δώσει παραδείγματα', 'Να μπερδέψει τον αναγνώστη'], correct: 1 },
  { q: 'Ποιο από τα παρακάτω είναι παράδειγμα παρομοίωσης;', opts: ['Ο άνεμος ούρλιαζε', 'Το χαμόγελό της ήταν σαν τον ήλιο', 'Είναι λιοντάρι στη μάχη', 'Τα φύλλα χόρευαν'], correct: 1 },
  { q: 'Πόσο κάνει 3/4 + 1/2;', opts: ['4/6', '5/4', '1 1/4', '4/8'], correct: 2 },
  { q: 'Λύσε ως προς x: 2x + 5 = 13', opts: ['x = 3', 'x = 4', 'x = 8', 'x = 9'], correct: 1 },
  { q: 'Ποιος είναι ο ρόλος του πυρήνα σε ένα κύτταρο;', opts: ['Να παράγει ενέργεια', 'Να ελέγχει το κύτταρο και να αποθηκεύει DNA', 'Να χωνεύει τροφή', 'Να προστατεύει το κύτταρο'], correct: 1 },
  { q: 'Ποια μετατροπή ενέργειας γίνεται σε μια φακός με μπαταρίες;', opts: ['Από φως σε χημική', 'Από χημική σε φως και θερμότητα', 'Από θερμότητα σε φως', 'Από ήχο σε φως'], correct: 1 },
  { q: 'Ποιος πλανήτης είναι πιο κοντά στον Ήλιο;', opts: ['Αφροδίτη', 'Ερμής', 'Γη', 'Άρης'], correct: 1 },
  { q: 'Πόσο κάνει 12 × 11;', opts: ['121', '132', '122', '111'], correct: 1 },
  { q: 'Ποια λέξη είναι ουσιαστικό;', opts: ['τρέχω', 'γρήγορα', 'ευτυχία', 'όμορφος'], correct: 2 },
  { q: 'Ποια είναι η πρωτεύουσα της Γαλλίας;', opts: ['Λυών', 'Παρίσι', 'Μασσαλία', 'Νίκαια'], correct: 1 },
  { q: 'Πόσες πλευρές έχει ένα εξάγωνο;', opts: ['5', '6', '7', '8'], correct: 1 },
  { q: 'Ποιος είναι ο μεγαλύτερος ωκεανός στη Γη;', opts: ['Ατλαντικός', 'Ινδικός', 'Ειρηνικός', 'Αρκτικός'], correct: 2 },
  { q: 'Ποιο κλάσμα ισούται με το 1/2;', opts: ['2/3', '3/6', '4/5', '1/4'], correct: 1 },
  { q: 'Ποια είναι η απλή αόριστη του ρήματος «πηγαίνω»;', opts: ['πήγαινα', 'πήγα', 'πάω', 'πηγαίνοντας'], correct: 1 },
  { q: 'Τι χρειάζονται τα φυτά για τη φωτοσύνθεση;', opts: ['Μόνο νερό', 'Μόνο φως', 'Φως, νερό και διοξείδιο του άνθρακα', 'Μόνο χώμα'], correct: 2 },
  { q: 'Πόσο είναι το 15% του 80;', opts: ['10', '12', '15', '18'], correct: 1 },
  { q: 'Ποια είναι ανανεώσιμη πηγή ενέργειας;', opts: ['Άνθρακας', 'Ηλιακή', 'Πετρέλαιο', 'Φυσικό αέριο'], correct: 1 },
  { q: 'Ποιος είναι ο μικρότερος πρώτος αριθμός;', opts: ['0', '1', '2', '3'], correct: 2 },
  { q: 'Σε μια ιστορία, τι είναι το «σκηνικό»;', opts: ['Ο κύριος χαρακτήρας', 'Ο χρόνος και ο τόπος', 'Το πρόβλημα', 'Η λύση'], correct: 1 },
  { q: 'Πόσο κάνει 7²;', opts: ['14', '49', '42', '56'], correct: 1 },
  { q: 'Ποιο όργανο αντλεί αίμα στο σώμα;', opts: ['Πνεύμονες', 'Συκώτι', 'Καρδιά', 'Νεφρά'], correct: 2 },
  { q: 'Τι είναι το επίθετο;', opts: ['Ρήμα δράσης', 'Λέξη που περιγράφει', 'Ουσιαστικό', 'Σύνδεσμος'], correct: 1 },
  { q: 'Πόσα εκατοστά έχει 1 μέτρο;', opts: ['10', '100', '1000', '50'], correct: 1 },
  { q: 'Ποιο είναι το κύριο αέριο στον αέρα που αναπνέουμε;', opts: ['Οξυγόνο', 'Διοξείδιο του άνθρακα', 'Άζωτο', 'Υδρογόνο'], correct: 2 },
  { q: 'Ποιο σχήμα έχει όλες τις πλευρές ίσες;', opts: ['Ορθογώνιο', 'Τετράγωνο', 'Τρίγωνο', 'Παραλληλόγραμμο'], correct: 1 },
  { q: 'Ποιο είναι το αντίθετο της λέξης «αρχαίος»;', opts: ['Παλιός', 'Σύγχρονος', 'Ιστορικός', 'Παρελθόν'], correct: 1 },
  { q: 'Πόσο κάνει 1000 − 237;', opts: ['763', '773', '753', '783'], correct: 0 },
  { q: 'Σε ποια ήπειρο βρίσκεται η Αίγυπτος;', opts: ['Ασία', 'Ευρώπη', 'Αφρική', 'Νότια Αμερική'], correct: 2 },
  { q: 'Τι είναι το ρήμα;', opts: ['Ονομαστική λέξη', 'Λέξη δράσης ή κατάστασης', 'Περιγραφική λέξη', 'Τοπωνύμιο'], correct: 1 },
  { q: 'Ποια είναι η θερμοκρασία βρασμού του νερού (σε °C);', opts: ['90', '100', '110', '0'], correct: 1 },
];

export function diagnosticExplanationElGR(yearNum: number): string {
  const labels = [
    '1ης Δημοτικού',
    '2ης Δημοτικού',
    '3ης Δημοτικού',
    '4ης Δημοτικού',
    '5ης Δημοτικού',
    '6ης Δημοτικού',
    '1ης Γυμνασίου',
    '2ης Γυμνασίου',
    '3ης Γυμνασίου',
    '1ης Λυκείου',
    '2ης Λυκείου',
    '3ης Λυκείου',
  ];
  const label = labels[yearNum - 1] || `${yearNum}ης τάξης`;
  return `Αυτή η ερώτηση αξιολογεί γνώσεις από την ${label}.`;
}

/** True when question text is mostly Latin (likely English) rather than Greek. */
export function onboardingQuestionsLookEnglish(questions: any[]): boolean {
  if (!questions?.length) return false;
  const sample = questions
    .slice(0, 8)
    .map((q) => `${q.question || ''} ${(q.options || []).map((o: any) => o.label || '').join(' ')}`)
    .join(' ');
  const greek = (sample.match(/[\u0370-\u03FF]/g) || []).length;
  const latin = (sample.match(/[a-zA-Z]/g) || []).length;
  return latin > 20 && latin > greek * 1.5;
}
