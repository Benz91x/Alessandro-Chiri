# Analytics — Istruzioni di attivazione (2 minuti)

La pagina ha **due livelli di analytics**, già integrati nel codice:

---

## 1) Contatore visite live — già attivo, zero configurazione

In fondo alla pagina (footer) compare il badge **◎ VISITE: N**, aggiornato a ogni
apertura della pagina. Non richiede account né configurazione.

## 2) GoatCounter — dashboard completa (visite, lettura, click, provenienza)

La pagina è già cablata per **GoatCounter** (gratuito, privacy-friendly, senza cookie,
conforme GDPR senza banner). Traccia già questi eventi:

| Evento | Cosa ti dice |
|---|---|
| Visite pagina | quante volte è stata vista, da quali paesi/dispositivi/browser |
| `scroll-25/50/75/100` | quanto in fondo leggono la pagina |
| `tempo-15s/30s/1min/3min` | quanto tempo restano a leggere |
| `download-cv` | chi scarica il CV in PDF |
| `click-email` / `click-linkedin` / `click-github` | quali contatti usano |
| `fonte-<nome>` | provenienza campagne: aggiungi `?ref=linkedin` (o `?ref=cv`, `?ref=email`…) al link che condividi, es. `https://benz91x.github.io/Alessandro-Chiri/?ref=linkedin` |
| `/bot-nojs` | crawler e bot di anteprima (LinkedIn, WhatsApp…) |

### Attivazione

1. Vai su **https://www.goatcounter.com/signup** e crea l'account gratuito.
   Come *site code* scegli ad esempio `alessandrochiri`
   (diventerà `alessandrochiri.goatcounter.com`).
2. In `index.html` cerca **`TUOCODICE`** (compare 2 volte: nel template, vicino a
   `data-goatcounter=`, e nel pixel `<noscript>` in fondo) e sostituiscilo con il
   tuo code, es. `alessandrochiri`.
3. Commit → la dashboard su **https://alessandrochiri.goatcounter.com** inizia a
   popolarsi entro pochi minuti.

> Nota: nessun sistema di analytics serio mostra l'identità dei singoli visitatori
> (nome/email) senza il loro consenso — per motivi di privacy e GDPR. GoatCounter ti
> mostra tutto il resto: paese, dispositivo, pagine, referrer, durata e profondità di lettura.

## Alternativa: Google Analytics 4

Se preferisci GA4: crea una proprietà su https://analytics.google.com, prendi il
`Measurement ID` (G-XXXXXXXXXX) e incolla lo snippet `gtag.js` nel template di
`index.html`, subito prima dello script GoatCounter.
