# 🌍 Földrajz Kvíz 
# Interaktív kvíz alkalmazás Excel-alapú kérdésbankkal, képes kérdésekkel és letölthető tanúsítvánnyal
Az alábbi leírást MI generálta, fejlesztő ellenőrizte és javította.

## 📦 Fájlstruktúra

```
/kviz-projekt
  ├── index.html
  ├── style.css
  ├── script.js
  ├── csillagaszat.xlsx      (minta fájl)
  ├── kozetbolygo.xlsx
  ├── legkor.xlsx
  ├── vizburok.xlsx
  ├── geoszferak.xlsx
  └── kepek/
      ├── csillagaszat/
      ├── kozetbolygo/
      ├── legkor/
      ├── vizburok/
      └── geoszferak/
```

## 📊 Excel fájl felépítése

### Struktúra:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **Ponthatárok** | **30** | **40** | **50** | | | |
| **kerdés** | **tipus** | **helyes_valaszok** | **hibas_valaszok** | **pontErtek** | **nehezseg** | **kep** |
| Melyik bolygó... | egyszeres | Jupiter | Mars;Föld;Szaturnusz | 5 | könnyű | jupiter.jpg |

### 1. sor - Ponthatárok:
- **B1**: Bronz minimum (pl. 30)
- **C1**: Ezüst küszöb (pl. 40)  
- **D1**: Arany küszöb (pl. 50)

### 2. sor - Header (oszlopnevek):
- **kerdés**: Kérdés szövege
- **tipus**: `egyszeres` / `tobbszoros` / `szoveges` (ékezet nélkül!)
- **helyes_valaszok**: Helyes válaszok, `;` jellel elválasztva
- **hibas_valaszok**: Hibás válaszok, `;` jellel elválasztva
- **pontErtek**: Pont érték (szám!)
- **nehezseg**: `könnyű` / `közepes` / `nehéz`
- **kep**: Kép fájlnév (opcionális, csak fájlnév: `jupiter.jpg`)

### 3. sortól - Kérdések

**Fontos szabályok:**
- Pontosvesszővel (`;`) válaszd el a választási lehetőségeket
- Szöveges kérdéseknél több szinonima megadható: `Coriolis;Coriolis-erő`
- Szöveges kérdéseknél `hibas_valaszok` üres lehet
- Típusok és nehézség **ékezet nélkül** (egyszeres, tobbszoros, szoveges)
- `pontErtek` legyen **szám formátum**, nem szöveg!
- Üres sorok automatikusan kihagyásra kerülnek

## 🖼️ Képek használata (opcionális)

**Képek helye:**
```
kepek/[temakor]/[kepnev].jpg
```

**Támogatott formátumok:** JPG, PNG, GIF

**Excel-ben:** Csak a fájlnevet add meg → `jupiter.jpg`  
**Program automatikusan:** `kepek/csillagaszat/jupiter.jpg`

**Fontos:**
- Témakör mappa neve **ékezet nélkül** (csillagaszat, kozetbolygo, legkor, vizburok, geoszferak)
- Fájlnév **kis/nagybetű számít!**
- **Szóköz és ékezet** kerülendő a fájlnevekben

## 🚀 Futtatás

### Helyi szerver (ajánlott):

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

Majd nyisd meg: `http://localhost:8000`

⚠️ **Miért szükséges?** Néhány böngésző nem engedi Excel fájlok betöltését `file://` protokollal.

## 🎮 Játékmenet

1. **Témaválasztás** → Excel betöltése
2. **Nehézség választása** minden kérdés előtt (könnyű/közepes/nehéz)
3. **Maximum 10 kérdés** vagy elfogynak a kérdések vagy eléri az arany szintet (50+ pont)
4. **Visszajelzés** minden válasz után (pont, összpont, szint, hátra lévő kérdések)
5. **Eredmény** + helyes válaszok megjelenítése
6. **Tanúsítvány letöltés** (ha legalább bronz szintet elért)

## 🏆 Szintrendszer

- 🥉 **Bronz** (30-39 pont) - Bronz tanúsítvány, 1 emoji
- 🥈 **Ezüst** (40-49 pont) - Ezüst tanúsítvány, 2 emoji
- 🥇 **Arany** (50+ pont) - Arany tanúsítvány, 3 emoji (játék automatikusan véget ér!)

**Ponthatárok** témakörönként módosíthatók az Excel első sorában.

**Tanúsítvány emojik:** Témakörönként különbözőek (csillagászat: űr emojik, kőzetbolygó: hegyek/kövek stb.)

## ✨ Főbb funkciók

✅ 5 témakör (csillagászat, kőzetbolygó, légkör, vízburok, geoszférák)  
✅ 3 kérdéstípus (egyszeres, többszörös választás, szöveges)  
✅ Képes kérdések támogatása  
✅ Ponthatárok témakörönként beállíthatók  
✅ Dinamikus pontszám és szint követés  
✅ Színes tanúsítványok (bronz/ezüst/arany)  
✅ Tanúsítvány csak egyszer letölthető  
✅ Reszponzív dizájn (mobil/tablet/desktop)  
✅ Helyes válaszok megjelenítése a végén

## 🐛 Gyakori problémák

**"A fájl nem található" hiba:**
- Ellenőrizd az Excel fájl nevét (ékezet nélkül: `csillagaszat.xlsx`)
- Használj helyi szervert

**Kép nem jelenik meg:**
- Ellenőrizd a fájl nevét (kis/nagybetű!)
- Ellenőrizd a mappa struktúrát (`kepek/[temakor]/[kep].jpg`)
- Nyisd meg a böngésző konzolt (F12) a hibaüzenetekért

**Excel nem töltődik be:**
- Ellenőrizd az oszlopneveket (ékezet nélkül!)
- Ellenőrizd az első sort (Ponthatárok sor)
- Nézd meg a konzolt (F12) a részletes hibaüzenetekért

## 💡 Tippek

- Ajánlott **legalább 15-20 kérdés** témakörönként (különben elfogyhatnak)
- Kevés könnyű kérdés javasolt (max 5-6), hogy ne lehessen csak könnyűvel bronzot szerezni
- Fájlnevek: kerüld a szóközt, ékezetet, speciális karaktereket
- **Biztonsági megjegyzés:** A helyes válaszok a böngészőben láthatók (F12 → Console → `allQuestions`). Szorgalmi feladathoz elfogadható, dolgozathoz nem.

## 🤝 Közreműködés

Ha hibát találsz vagy új funkciót javasolnál, írj e-mailt: havassy@budai-rfg.hu.

---

**Készítette**: Havassy András (földrajz tanár)  
**Verzió**: 1.0  
**Utolsó frissítés**: 2025. december
