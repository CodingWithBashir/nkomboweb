'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Three languages the school actually speaks: English, Kinyarwanda and French.
 *
 * The dictionary is deliberately small and hand-written — it covers the pages
 * families read (the parent portal and certificate verification). Staff pages
 * stay in English, which is what the office asked for, and any missing key
 * falls back to English instead of showing a raw identifier.
 */
export type Locale = 'en' | 'rw' | 'fr';

export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'rw', label: 'Kinyarwanda', short: 'RW' },
  { id: 'fr', label: 'Français', short: 'FR' },
];

type Entry = { en: string; rw: string; fr: string };

const STRINGS: Record<string, Entry> = {
  'brand.portal': { en: 'Parent portal', rw: 'Urubuga rw’ababyeyi', fr: 'Portail des parents' },
  'brand.verify': { en: 'Certificate verification', rw: 'Kugenzura icyemezo', fr: 'Vérification de certificat' },
  'common.website': { en: 'Website', rw: 'Urubuga', fr: 'Site web' },
  'common.print': { en: 'Print bulletin', rw: 'Sohora urupapuro', fr: 'Imprimer le bulletin' },
  'common.loading': { en: 'Opening the portal…', rw: 'Turafungura urubuga…', fr: 'Ouverture du portail…' },
  'common.retry': { en: 'Try again', rw: 'Ongera ugerageze', fr: 'Réessayer' },

  'portal.enrolled': { en: 'Enrolled', rw: 'Yandikishijwe', fr: 'Inscrit(e)' },
  'portal.relation': { en: 'you are the', rw: 'uri', fr: 'vous êtes le/la' },
  'portal.average': { en: 'Average this term', rw: 'Impuzandengo y’iri gihembwe', fr: 'Moyenne du trimestre' },
  'portal.position': { en: 'Position', rw: 'Umwanya', fr: 'Place' },
  'portal.of': { en: 'of', rw: 'kuri', fr: 'sur' },
  'portal.nomarks': { en: 'No marks published yet', rw: 'Nta manota arasohoka', fr: 'Aucune note publiée' },
  'portal.attendance': { en: 'Attendance', rw: 'Kwitabira', fr: 'Présence' },
  'portal.present': { en: 'present', rw: 'yitabiriye', fr: 'présent(s)' },
  'portal.absent': { en: 'absent', rw: 'yabuze', fr: 'absent(s)' },
  'portal.late': { en: 'late', rw: 'yakererewe', fr: 'en retard' },
  'portal.notrecorded': { en: 'Not recorded yet', rw: 'Ntibirabikwa', fr: 'Pas encore enregistré' },
  'portal.fees': { en: 'Fees remaining', rw: 'Amafaranga asigaye', fr: 'Frais restants' },
  'portal.paidof': { en: 'paid of', rw: 'byishyuwe kuri', fr: 'payés sur' },
  'portal.results': { en: 'Term results', rw: 'Ibisubizo by’igihembwe', fr: 'Résultats du trimestre' },
  'portal.subject': { en: 'Subject', rw: 'Isomo', fr: 'Matière' },
  'portal.mark': { en: 'Mark', rw: 'Amanota', fr: 'Note' },
  'portal.grade': { en: 'Grade', rw: 'Urwego', fr: 'Mention' },
  'portal.nomarksbody': {
    en: 'No marks have been published for this term yet. They appear here as soon as the teachers enter them.',
    rw: 'Nta manota y’iri gihembwe yarasohowe. Azagaragara ako kanya abarimu bayashyizeho.',
    fr: 'Aucune note n’a encore été publiée pour ce trimestre. Elles apparaîtront dès que les enseignants les saisiront.',
  },
  'portal.meet': {
    en: 'Meet the class teacher at the office for a full conversation.',
    rw: 'Sura umwarimu w’ishuri ku biro kugira ngo muganire ku buryo burambuye.',
    fr: 'Rencontrez le titulaire de classe au bureau pour un entretien complet.',
  },
  'portal.notlinked.title': {
    en: 'Your account is not linked yet',
    rw: 'Konti yawe ntabwo irahuzwa n’umwana',
    fr: 'Votre compte n’est pas encore lié',
  },
  'portal.notlinked.body': {
    en: 'The school has not connected a child to this account. Call the office on +250 788 502 229 with the student number, or sign in with the e-mail address the school has on file.',
    rw: 'Ishuri ntirarekeye umwana kuri iyi konti. Hamagara ibiro kuri +250 788 502 229 ufite nimero y’umunyeshuri, cyangwa winjire ukoresheje imeyili ishuri rifiteho.',
    fr: 'L’école n’a pas encore relié un enfant à ce compte. Appelez le bureau au +250 788 502 229 avec le numéro d’élève, ou connectez-vous avec l’adresse e-mail que l’école possède.',
  },
  'portal.notlinked.hint': {
    en: 'Students can follow their own lessons in the student portal.',
    rw: 'Abanyeshuri bakurikira amasomo yabo mu rubuga rw’umunyeshuri.',
    fr: 'Les élèves suivent leurs cours dans le portail élève.',
  },
  'portal.failed': {
    en: 'We could not load your children just now.',
    rw: 'Ntitwashoboye kugaragaza abana bawe ubu.',
    fr: 'Nous n’avons pas pu charger vos enfants pour le moment.',
  },

  'verify.eyebrow': { en: 'Public check', rw: 'Igenzura rusange', fr: 'Vérification publique' },
  'verify.title': {
    en: 'Is this certificate genuine?',
    rw: 'Ese iki cyemezo ni icy’ukuri?',
    fr: 'Ce certificat est-il authentique ?',
  },
  'verify.lede': {
    en: 'Every certificate issued by the school carries a number. Type it below — or scan the QR code on the document — and you will see who it belongs to, and whether it is still valid.',
    rw: 'Burí cyemezo ishuri ritanga kigira nimero. Yandike hasi — cyangwa usikane kode ya QR iri ku rupapuro — urebe uwo kiri kwe niba kikiriho.',
    fr: 'Chaque certificat délivré par l’école porte un numéro. Saisissez-le ci-dessous — ou scannez le QR code du document — pour voir à qui il appartient et s’il est toujours valable.',
  },
  'verify.placeholder': { en: 'LDN-2026-A1B2C3', rw: 'LDN-2026-A1B2C3', fr: 'LDN-2026-A1B2C3' },
  'verify.button': { en: 'Verify', rw: 'Genzura', fr: 'Vérifier' },
  'verify.valid': { en: 'Valid certificate', rw: 'Icyemezo nyakuri', fr: 'Certificat valide' },
  'verify.validbody': {
    en: 'The school confirms that this certificate was issued to the holder below.',
    rw: 'Ishuri ryemeza ko iki cyemezo cyahawe uwanditse hepfo.',
    fr: 'L’école confirme que ce certificat a été délivré à la personne ci-dessous.',
  },
  'verify.revoked': { en: 'This certificate was revoked', rw: 'Iki cyemezo cyakuweho', fr: 'Ce certificat a été annulé' },
  'verify.notfound': { en: 'Not found', rw: 'Nticyabonetse', fr: 'Introuvable' },
  'verify.notfoundbody': {
    en: 'No certificate with that number was issued by Lycée de Nyanza. Check the number and try again.',
    rw: 'Nta cyemezo gifite iyi nimero cyatanzwe na Lycée de Nyanza. Reba nimero wongere ugerageze.',
    fr: 'Aucun certificat portant ce numéro n’a été délivré par le Lycée de Nyanza. Vérifiez le numéro et réessayez.',
  },
  'verify.holder': { en: 'Holder', rw: 'Nyiricyo', fr: 'Titulaire' },
  'verify.studentno': { en: 'Student number', rw: 'Nimero y’umunyeshuri', fr: 'Numéro d’élève' },
  'verify.certificate': { en: 'Certificate', rw: 'Icyemezo', fr: 'Certificat' },
  'verify.leveltrade': { en: 'Level / trade', rw: 'Urwego / umwuga', fr: 'Niveau / métier' },
  'verify.serial': { en: 'Serial', rw: 'Nimero y’urukurikirane', fr: 'Numéro de série' },
  'verify.issued': { en: 'Issued', rw: 'Yatanzwe', fr: 'Délivré le' },
  'verify.checked': { en: 'checked', rw: 'byagenzuwe', fr: 'vérifié le' },
  'verify.emptycode': {
    en: 'Type the certificate number printed on the document.',
    rw: 'Andika nimero y’icyemezo iri ku rupapuro.',
    fr: 'Saisissez le numéro imprimé sur le document.',
  },
  'verify.unreachable': {
    en: 'We could not reach the verification service. Please try again.',
    rw: 'Ntitwashoboye kugera kuri serivisi y’igenzura. Ongera ugerageze.',
    fr: 'Le service de vérification est injoignable. Veuillez réessayer.',
  },
  'verify.doubt': {
    en: 'Doubt about a document? Call the school office on +250 788 502 229 with the certificate number. This page is public on purpose: an employer should never have to trust a photocopy.',
    rw: 'Ufite ikibazo ku cyemezo? Hamagara ibiro by’ishuri kuri +250 788 502 229 ufite nimero y’icyemezo. Iyi paji ni rusange nkana: umukoresha ntagomba kwizera kopi.',
    fr: 'Un doute sur un document ? Appelez le bureau de l’école au +250 788 502 229 avec le numéro du certificat. Cette page est publique à dessein : un employeur ne devrait jamais devoir faire confiance à une photocopie.',
  },
};

const STORAGE_KEY = 'lycee.locale';
const listeners = new Set<(locale: Locale) => void>();

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'rw' || value === 'fr';
}

/** Read the language the visitor picked last time. */
export function readLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : 'en';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(readLocale());
    const listener = (next: Locale) => setLocaleState(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next);
    listeners.forEach((listener) => listener(next));
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = STRINGS[key];
      if (!entry) return key;
      return entry[locale] || entry.en;
    },
    [locale]
  );

  return { locale, setLocale, t };
}

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={`flex items-center gap-1 rounded-full ${
        compact ? 'bg-white/10 p-0.5' : 'border border-navy-100 bg-white p-0.5'
      }`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((item) => {
        const active = item.id === locale;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLocale(item.id)}
            aria-pressed={active}
            title={item.label}
            className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition ${
              active
                ? compact
                  ? 'bg-white text-navy-500'
                  : 'bg-navy-500 text-white'
                : compact
                  ? 'text-white/70 hover:text-white'
                  : 'text-navy-400 hover:text-navy-500'
            }`}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
