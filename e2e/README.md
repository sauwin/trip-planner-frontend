# E2E testy (Playwright)

Testy bežia v skutočnom prehliadači proti skutočnej aplikácii, preto potrebujú bežiaci backend a databázu.

## Príprava (jednorazovo)

```bash
npm i -D @playwright/test
npx playwright install chromium
```

## Spustenie

1. Backend a databáza (najlepšie samostatná testovacia DB, napr. `trip_planner_test`):
   `npm run dev` v repozitári `trip-planner-backend` (a `npx prisma migrate deploy` + `npm run db:seed` na prázdnej DB).
2. Frontend sa spustí automaticky z `playwright.config.ts` (`npm run dev`, port 5173).
3. V repozitári frontendu:

```bash
npm run test:e2e
```

Pozor: backend má rate limit 10 pokusov o prihlásenie/registráciu za 15 minút na jednu IP.
Jeden beh všetkých scenárov sa do limitu zmestí, opakované spúšťanie hneď po sebe nie. Pre E2E
spustite backend s vyššími limitmi alebo ho medzi behmi reštartujte (limit je v pamäti procesu).