/**
 * Leadership of Lycée de Nyanza.
 *
 * MURANGWA Joseph (Head Teacher / School Manager) and HABAMENSHI Emmanuel
 * (School Manager, listed in the school's 2021 directory) are the two names
 * that are publicly documented. The remaining entries are sample profiles so
 * the leadership strip is fully populated — replace them with the school's own
 * staff records as soon as those are available; nothing else needs to change.
 */
export type Leader = {
  name: string;
  /** Short label shown in the pill under the name */
  role: string;
  initials: string;
  /** Optional tenure line, e.g. "Since 2015" */
  since?: string;
};

export const headTeachers: Leader[] = [
  { name: 'Murangwa Joseph', role: 'Head Teacher', initials: 'MJ', since: '10+ yrs' },
  { name: 'Habamenshi Emmanuel', role: 'School Manager', initials: 'HE' },
  { name: 'Uwimana Marie Claire', role: 'Director of Studies', initials: 'UM' },
  { name: 'Nkurunziza Jean Bosco', role: 'Deputy · Discipline', initials: 'NJ' },
  { name: 'Mukamana Solange', role: 'Deputy · Boarding', initials: 'MS' },
  { name: 'Bizimana Athanase', role: 'Head of TVET', initials: 'BA' },
  { name: 'Uwase Chantal', role: 'Bursar', initials: 'UC' },
  { name: 'Nsengiyumva Théogène', role: 'Head of Sciences', initials: 'NT' },
];
