import { describe, it, expect } from 'vitest';
import createCsvLoader from './csv';

describe('CSV Loader', () => {
  const sampleCsv = `id,en,fr,de,it
home,Home,Accueil,Startseite,Home
user,User,Utilisateur,Benutzer,Utente`;

  it('should pull translations for a specific locale', async () => {
    const loader = createCsvLoader().setLocale('fr');
    const result = await loader.pull(sampleCsv);

    expect(result).toEqual({
      home: 'Accueil',
      user: 'Utilisateur'
    });
  });

  it('should handle empty translations', async () => {
    const csvWithEmpty = `id,en,fr,de,it
home,Home,,,Casa
user,User,,,Utente`;

    const loader = createCsvLoader().setLocale('fr');
    const result = await loader.pull(csvWithEmpty);

    expect(result).toEqual({});
  });
});

