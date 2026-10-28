export default {
  privacy: {
    label: 'Právne informácie',
    title: 'Ochrana súkromia',
    description: 'Aké údaje TripPlanner ukladá, prečo a ako ich máte pod kontrolou.',
    updated: 'Naposledy aktualizované: 27. októbra 2026',
    summary: {
      collect: {
        title: 'Čo ukladáme',
        text: 'Údaje o účte, vaše cestovateľské preferencie a cesty, recenzie a výdavky, ktoré vytvoríte.',
      },
      never: {
        title: 'Čo nerobíme',
        text: 'Nepredávame vaše údaje, nezobrazujeme reklamy ani nepoužívame sledovacie cookies.',
      },
      control: {
        title: 'Vaša kontrola',
        text: 'Kedykoľvek nás môžete požiadať o zobrazenie, opravu alebo vymazanie svojich údajov.',
      },
    },
    sections: {
      who: {
        title: 'Kto sme',
        p1: 'TripPlanner je študentský projekt, ktorý pomáha objavovať destinácie, získavať osobné odporúčania, plánovať cesty a sledovať cestovný rozpočet. Tieto zásady vysvetľujú, s akými osobnými údajmi aplikácia pracuje a prečo. Ak máte otázky, môžete nás kontaktovať cez stránku Kontakt.',
      },
      collect: {
        title: 'Aké údaje zhromažďujeme',
        intro: 'Ukladáme len to, čo aplikácia potrebuje na fungovanie:',
        items: {
          account: 'Údaje o účte: e-mailovú adresu, meno a heslo. Heslo ukladáme iba ako bezpečný hash, nikdy nie ako čistý text.',
          preferences: 'Cestovateľské preferencie: vaše odpovede v kvíze s preferenciami.',
          activity: 'Aktivitu: ktoré destinácie si prezeráte, označíte ako obľúbené, uložíte alebo ohodnotíte. Z toho vzniká váš prehľad.',
          content: 'Obsah, ktorý vytvoríte: recenzie, cesty, termíny destinácií, údaje o ubytovaní a výdavky.',
          messages: 'Správy z kontaktu: vaše meno, e-mail a správa nám prídu e-mailom. V databáze aplikácie ich neukladáme.',
          technical: 'Technické údaje: krátkodobé tokeny na obnovenie hesla (uložené ako hashe) a prihlasovacie tokeny, vďaka ktorým zostanete prihlásení.',
        },
      },
      use: {
        title: 'Ako údaje používame',
        intro: 'Vaše údaje používame iba na poskytovanie funkcií TripPlanner:',
        items: {
          features: 'na vytvorenie účtu, prihlásenie a uchovanie vašich ciest, recenzií a výdavkov;',
          recommendations: 'na porovnanie vašich preferencií s destináciami a výpočet odporúčaní a skóre zhody;',
          email: 'na odosielanie e-mailov na obnovenie hesla a odpovedanie na vaše správy;',
          safety: 'na ochranu služby pred zneužitím, napríklad obmedzením opakovaných požiadaviek.',
        },
        promise: 'Vaše osobné údaje nepredávame, neposkytujeme na reklamné účely ani ich nepoužívame na tvorbu profilov pre tretie strany.',
      },
      storage: {
        title: 'Cookies a úložisko v prehliadači',
        p1: 'TripPlanner nepoužíva reklamné ani sledovacie cookies.',
        p2: 'Aplikácia ukladá do lokálneho úložiska vášho prehliadača niekoľko položiek: prihlasovacie tokeny, aby ste zostali prihlásení, a zvolený jazyk. Prihlasovacie tokeny sa po odhlásení odstránia.',
      },
      thirdParties: {
        title: 'Služby tretích strán',
        intro: 'Niektoré časti aplikácie načítavajú zdroje z iných služieb alebo sa na ne spoliehajú. Tieto služby môžu dostať technické údaje, napríklad vašu IP adresu:',
        items: {
          fonts: 'Google Fonts, ktoré poskytujú písma použité na stránke;',
          maps: 'OpenStreetMap, ktorý poskytuje mapové dlaždice na stránkach destinácií a ciest;',
          email: 'poskytovateľ e-mailu, ktorý doručuje e-maily na obnovenie hesla a správy z kontaktu.',
        },
      },
      security: {
        title: 'Bezpečnosť',
        p1: 'Vaše údaje chránime primeranými opatreniami: heslá sú hashované, prihlásenia vypršia a citlivé akcie, ako prihlásenie a obnovenie hesla, majú obmedzený počet pokusov. Žiadna online služba nemôže byť úplne bezpečná, preto používajte silné a jedinečné heslo.',
      },
      retention: {
        title: 'Ako dlho údaje uchovávame',
        p1: 'Údaje uchovávame, kým existuje váš účet. Ak chcete, aby sme účet a súvisiace údaje vymazali, kontaktujte nás a odstránime ich.',
      },
      rights: {
        title: 'Vaše práva',
        intro: 'Podľa predpisov o ochrane údajov, vrátane GDPR tam, kde sa uplatňuje, máte právo:',
        items: {
          access: 'požiadať o informáciu, aké osobné údaje o vás uchovávame, a získať ich kópiu;',
          rectify: 'požiadať o opravu nepresných údajov;',
          erase: 'požiadať o vymazanie svojich údajov;',
          object: 'namietať proti určitému spracúvaniu alebo žiadať jeho obmedzenie;',
          complain: 'podať sťažnosť dozornému orgánu na ochranu osobných údajov vo svojej krajine.',
        },
      },
      children: {
        title: 'Deti',
        p1: 'TripPlanner nie je určený deťom mladším ako 16 rokov a vedome o nich nezhromažďujeme údaje. Ak sa domnievate, že si dieťa vytvorilo účet, kontaktujte nás.',
      },
      changes: {
        title: 'Zmeny týchto zásad',
        p1: 'Tieto zásady môžeme upraviť, keď sa aplikácia vyvíja. Dátum navrchu ukazuje, kedy boli naposledy zmenené.',
      },
    },
    contactTitle: 'Kontakt',
    contactText: 'V prípade akejkoľvek otázky alebo žiadosti k ochrane súkromia použite našu',
    contactLink: 'stránku Kontakt.',
  },
} as const