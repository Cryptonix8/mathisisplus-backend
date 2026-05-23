/**
 * Greek National Curriculum — canonical year groups and subjects (el-GR).
 * Used to seed the database so the mobile app shows the full subject list.
 */

export const GREEK_CURRICULUM_VERSION = 'gr_v1';

export interface GreekGradeLevelTemplate {
  code: string;
  displayName: string;
  orderIndex: number;
}

export interface GreekSubjectTemplate {
  name: string;
  displayName: string;
  orderIndex: number;
  description?: string;
  iconName?: string;
  colorCode?: string;
  skills: string[];
}

export const GREEK_GRADE_LEVELS: GreekGradeLevelTemplate[] = [
  { code: 'dimotiko_1', displayName: 'Δημοτικό - 1η Τάξη', orderIndex: 1 },
  { code: 'dimotiko_2', displayName: 'Δημοτικό - 2η Τάξη', orderIndex: 2 },
  { code: 'dimotiko_3', displayName: 'Δημοτικό - 3η Τάξη', orderIndex: 3 },
  { code: 'dimotiko_4', displayName: 'Δημοτικό - 4η Τάξη', orderIndex: 4 },
  { code: 'dimotiko_5', displayName: 'Δημοτικό - 5η Τάξη', orderIndex: 5 },
  { code: 'dimotiko_6', displayName: 'Δημοτικό - 6η Τάξη', orderIndex: 6 },
  { code: 'gymnasio_1', displayName: 'Γυμνάσιο - Α\' Τάξη', orderIndex: 7 },
  { code: 'gymnasio_2', displayName: 'Γυμνάσιο - Β\' Τάξη', orderIndex: 8 },
  { code: 'gymnasio_3', displayName: 'Γυμνάσιο - Γ\' Τάξη', orderIndex: 9 },
  { code: 'lykeio_1', displayName: 'Λύκειο - Α\' Τάξη', orderIndex: 10 },
  { code: 'lykeio_2', displayName: 'Λύκειο - Β\' Τάξη', orderIndex: 11 },
  { code: 'lykeio_3', displayName: 'Λύκειο - Γ\' Τάξη', orderIndex: 12 },
];

/** Full subject list matching the production Greek UI (19 subjects). */
export const GREEK_SUBJECTS: GreekSubjectTemplate[] = [
  {
    name: 'mathimatika',
    displayName: 'Μαθηματικά',
    orderIndex: 1,
    iconName: 'calculator',
    colorCode: '#2196F3',
    skills: ['Αριθμητική', 'Άλγεβρα', 'Γεωμετρία', 'Στατιστική', 'Επίλυση προβλημάτων'],
  },
  {
    name: 'glossa',
    displayName: 'Ελληνική Γλώσσα',
    orderIndex: 2,
    iconName: 'book',
    colorCode: '#4CAF50',
    skills: ['Ανάγνωση', 'Γραφή', 'Γραμματική', 'Λεξιλόγιο'],
  },
  {
    name: 'physiki_agogi',
    displayName: 'Φυσική Αγωγή',
    orderIndex: 3,
    iconName: 'activity',
    colorCode: '#8BC34A',
    skills: ['Φυσική κατάσταση', 'Ομαδικά αθλήματα', 'Ατομικά αθλήματα'],
  },
  {
    name: 'fysiki',
    displayName: 'Φυσική',
    orderIndex: 4,
    iconName: 'zap',
    colorCode: '#10B981',
    skills: ['Παρατήρηση', 'Πειράματα', 'Ανάλυση'],
  },
  {
    name: 'istoria',
    displayName: 'Ιστορία',
    orderIndex: 5,
    iconName: 'scroll',
    colorCode: '#795548',
    skills: ['Χρονολόγηση', 'Πηγές', 'Ερμηνεία'],
  },
  {
    name: 'agglika_deftera',
    displayName: 'Αγγλικά ως Δεύτερη Γλώσσα',
    orderIndex: 6,
    iconName: 'language',
    colorCode: '#3F51B5',
    skills: ['Ανάγνωση', 'Γραφή', 'Ομιλία', 'Ακρόαση'],
  },
  {
    name: 'agglika',
    displayName: 'Αγγλικά',
    orderIndex: 7,
    iconName: 'language',
    colorCode: '#5C6BC0',
    skills: ['Ανάγνωση', 'Γραφή', 'Ομιλία', 'Ακρόαση'],
  },
  {
    name: 'psychiki_ygeia',
    displayName: 'Ψυχική Υγεία',
    orderIndex: 8,
    iconName: 'heart',
    colorCode: '#E91E63',
    skills: ['Αυτογνωσία', 'Συναισθήματα', 'Σχέσεις'],
  },
  {
    name: 'koinoniki_politiki',
    displayName: 'Κοινωνική και Πολιτική Αγωγή',
    orderIndex: 9,
    iconName: 'users',
    colorCode: '#673AB7',
    skills: ['Κοινωνία', 'Δικαιώματα', 'Συμμετοχή'],
  },
  {
    name: 'thriskeutiki',
    displayName: 'Θρησκευτική Αγωγή',
    orderIndex: 10,
    iconName: 'book-open',
    colorCode: '#9E9E9E',
    skills: ['Γνώση', 'Ανάλυση', 'Έκφραση'],
  },
  {
    name: 'technologia',
    displayName: 'Τεχνολογία',
    orderIndex: 11,
    iconName: 'hammer',
    colorCode: '#FF5722',
    skills: ['Σχεδιασμός', 'Κατασκευή', 'Αξιολόγηση'],
  },
  {
    name: 'epistimi',
    displayName: 'Επιστήμη',
    orderIndex: 12,
    iconName: 'flask',
    colorCode: '#9C27B0',
    skills: ['Βιολογία', 'Χημεία', 'Φυσική', 'Έρευνα'],
  },
  {
    name: 'geografia',
    displayName: 'Γεωγραφία',
    orderIndex: 13,
    iconName: 'globe',
    colorCode: '#00BCD4',
    skills: ['Φυσική γεωγραφία', 'Ανθρωπογεωγραφία', 'Χάρτες'],
  },
  {
    name: 'xenes_gloses',
    displayName: 'Ξένες Γλώσσες',
    orderIndex: 14,
    iconName: 'language',
    colorCode: '#7E57C2',
    skills: ['Ανάγνωση', 'Γραφή', 'Ομιλία', 'Ακρόαση'],
  },
  {
    name: 'ispanika',
    displayName: 'Ισπανικά',
    orderIndex: 15,
    iconName: 'language',
    colorCode: '#FFC107',
    skills: ['Ανάγνωση', 'Γραφή', 'Ομιλία', 'Ακρόαση'],
  },
  {
    name: 'mousiki',
    displayName: 'Μουσική',
    orderIndex: 16,
    iconName: 'music',
    colorCode: '#E91E63',
    skills: ['Ερμηνεία', 'Σύνθεση', 'Ακρόαση'],
  },
  {
    name: 'techni_sxedio',
    displayName: 'Τέχνη & Σχέδιο',
    orderIndex: 17,
    iconName: 'palette',
    colorCode: '#FF9800',
    skills: ['Σχέδιο', 'Ζωγραφική', 'Ψηφιακή τέχνη'],
  },
  {
    name: 'pliroforiki',
    displayName: 'Πληροφορική',
    orderIndex: 18,
    iconName: 'laptop',
    colorCode: '#607D8B',
    skills: ['Προγραμματισμός', 'Αλγόριθμοι', 'Δεδομένα'],
  },
  {
    name: 'psifiaki_technologia',
    displayName: 'Ψηφιακή Τεχνολογία',
    orderIndex: 19,
    iconName: 'cpu',
    colorCode: '#455A64',
    skills: ['Ψηφιακή παιδεία', 'Ασφάλεια', 'Δημιουργία'],
  },
];

/** Minimum subjects per Greek year group before we consider seeding incomplete. */
export const GREEK_SUBJECTS_MIN_PER_YEAR = 15;
