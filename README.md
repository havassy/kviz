# 🌍 Földrajz Kvíz Alkalmazás

## 📦 Mit tartalmaz a csomag?

- **index.html** - A főoldal
- **style.css** - Reszponzív stílusok
- **script.js** - Kvíz logika
- **csillagaszat.xlsx** - Minta Excel (**16 kérdés**: 7 könnyű, 5 közepes, 4 nehéz)

## 🚀 Használat

### 1. Fájlok elhelyezése
Helyezd el az összes fájlt egy mappába:
```
/kviz-projekt
  ├── index.html
  ├── style.css
  ├── script.js
  ├── csillagaszat.xlsx
  ├── kozetbolygo.xlsx
  ├── legkor.xlsx
  ├── vizburok.xlsx
  └── geoszferak.xlsx
```

### 2. Excell fájlok készítése

Az Excel fájloknak az alábbi oszlopokat kell tartalmazniuk:

| Oszlop neve | Leírás | Példa |
|-------------|--------|-------|
| **kerdés** | A kérdés szövege | "Mi az eltérítő erő másik neve?" |
| **tipus** | "egyszeres", "tobbszoros" vagy "szoveges" | "szoveges" |
| **helyes_valaszok** | Helyes válaszok, pontosvesszővel elválasztva | "Coriolis" |
| **hibas_valaszok** | Hibás válaszok, pontosvesszővel elválasztva | "Newton;Kepler;Einstein" |
| **pontErtek** | Hány pontot ér a kérdés | 8 |
| **nehezseg** | "könnyű", "közepes" vagy "nehéz" | "közepes" |

**Fontos:**
- A pontosvesszővel (`;`) válaszd el a több választ
- A szöveges kérdéseknél a `hibas_valaszok` üres lehet
- A típus értékek: `egyszeres`, `tobbszoros`, `szoveges`
- A nehézség értékek: `könnyű`, `közepes`, `nehéz`

### 3. Futtatás

**Helyi gépről:**
1. Nyisd meg az `index.html` fájlt böngészőben
2. ⚠️ **Fontos:** Néhány böngésző nem engedi az Excel fájlok betöltését `file://` protokollal
3. **Megoldás:** Használj helyi szervert:

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

Majd nyisd meg: `http://localhost:8000`

**GitHub Pages:**
1. Hozz létre egy új repository-t
2. Töltsd fel az összes fájlt
3. Engedélyezd a GitHub Pages-t a Settings menüben
4. Az alkalmazás elérhető lesz: `https://[felhasználónév].github.io/[repo-név]`

## 🏆 Szintrendszer

A kvíz **mindig megy 10 kérdésig** (vagy amíg vannak kérdések), nem áll meg 30 pontnál!

### Szintek:
- 🥉 **Bronz szint** (30-39 pont)
  - Bronz színű tanúsítvány
  - ⭐ egy csillag
  
- 🥈 **Ezüst szint** (40-49 pont)
  - Ezüst színű tanúsítvány
  - ⭐⭐ két csillag
  
- 🥇 **Arany szint** (50+ pont)
  - Arany színű tanúsítvány
  - ⭐🌟✨ három csillag

### Játékmenet:
1. Válassz témakört
2. Minden kérdés előtt választhatsz nehézséget
3. A visszajelzésnél látod az aktuális pontszámod és szinted
4. 30 pont alatt látod: "Még X pont kell a bronz szinthez!"
5. 30 pont felett látod: "🥉 Bronz szint elérve! Még X pont az ezüstig!"
6. **50 pontnál (arany szint) automatikusan vége a kvíznek** - nincs értelme tovább menni!
7. Vagy válaszolsz 10 kérdésre (ha van annyi), vagy elfogynak a kérdések
8. A végén az elért szintnek megfelelő színes tanúsítványt töltesz le

**Stratégia:** 
- 10× könnyű (2-3 pont) = max ~30 pont → csak bronz
- Mix: 5× közepes + 5× nehéz = 40-60 pont → ezüst vagy arany! 🏆

## ✨ Funkciók

✅ 5 témakör választás  
✅ Nehézségi szintek (könnyű, közepes, nehéz)  
✅ **Változó kérdésszám**: Maximum 10 kérdés (vagy 50 pont, vagy ha elfogynak a kérdések)  
✅ **Szintrendszer**:
  - 🥉 30-39 pont: **Bronz szint** (bronz tanúsítvány, ⭐)
  - 🥈 40-49 pont: **Ezüst szint** (ezüst tanúsítvány, ⭐⭐)
  - 🥇 50+ pont: **Arany szint** (arany tanúsítvány, ⭐🌟✨) - **automatikus vége!**
✅ **Automatikus folytatás**: Nem áll meg 30 pontnál, de 50 pontnál (arany) igen!  
✅ **Valós idejű szintjelzés**: Látod, mikor éred el a következő szintet  
✅ Feleletválasztós (egyszeres és többszörös)  
✅ Szöveges válaszok  
✅ Pontozás kérdésenként beállított pontértékekkel  
✅ **30 pont minimum** a tanúsítványhoz  
✅ **Színes tanúsítványok** szintenként (bronz/ezüst/arany)  
✅ Tanúsítvány csak egyszer letölthető  
✅ Reszponzív dizájn (mobil, tablet, desktop)  
✅ Helyes válaszok megjelenítése a végén  

## 🎨 Testreszabás

### Színek módosítása
A `style.css` fájlban található a színséma. Főbb változók:
- Főszín: `#667eea` és `#764ba2` (gradiens)
- Könnyű gomb: `#2ecc71` (zöld)
- Közepes gomb: `#3498db` (kék)
- Nehéz gomb: `#e74c3c` (piros)

### Kérdések száma és pontküszöb
A `script.js` fájlban módosíthatod:
- **Maximális kérdésszám**: Keress rá: `selectedQuestions.length >= 10` és változtasd meg a 10-et
- **Bronz szint**: Keress rá: `earnedPoints >= 30` (30-39 pont)
- **Ezüst szint**: Keress rá: `earnedPoints >= 40` (40-49 pont)
- **Arany szint**: Keress rá: `earnedPoints >= 50` (50+ pont)

### Tanúsítvány színek
A `script.js` `generateCertificate()` függvényében:
- **Bronz**: `color1 = '#CD7F32'`, `color2 = '#A0522D'`
- **Ezüst**: `color1 = '#C0C0C0'`, `color2 = '#A8A8A8'`
- **Arany**: `color1 = '#FFD700'`, `color2 = '#FFA500'`

### Tanúsítvány dizájn
A `script.js` fájl `generateCertificate()` függvényében testreszabható:
- Méret: `canvas.width` és `canvas.height`
- Színek: `gradient.addColorStop()`
- Betűtípusok: `ctx.font`
- Emoji: `const emoji = ...`

## 🐛 Hibakeresés

**Probléma:** "A fájl nem található"
- Ellenőrizd, hogy az Excel fájl neve pontosan megegyezik-e (pl. `csillagaszat.xlsx`)
- Használj helyi szervert a futtatáshoz

**Probléma:** "Hiba a kérdések betöltésekor"
- Nyisd meg a böngésző konzolt (F12)
- Ellenőrizd az Excel fájl oszlopneveit
- Győződj meg róla, hogy nincs üres sor az Excel-ben

**Probléma:** "Beragadtam, nincs tovább gomb"
- Ez akkor fordul elő, ha elfogynak a kérdések
- **Megoldva!** Most automatikusan megjelenik az eredmény, ha nincs több kérdés
- **Javaslat:** Készíts legalább 15-20 kérdést témakörönként minden nehézségből

**Probléma:** A tanúsítvány nem tölthető le
- Ellenőrizd a böngésző popup blokkolóját
- Próbáld meg másik böngészővel

## 📝 Megjegyzések

- A minta Excel fájl **16 kérdést** tartalmaz (7 könnyű, 5 közepes, 4 nehéz)
- Ajánlott legalább **15-20 kérdés** témakörönként a zavartalan játékélményhez
- A rangsorolásos kérdések későbbre maradtak (még nincs implementálva)
- A képeket tartalmazó kérdések későbbre maradtak
- A válaszok NEM a HTML kódban vannak, hanem az Excel fájlokban
- A LocalStorage használata miatt a letöltés korlátozás csak azonos böngészőben működik

## 🆘 Támogatás

Ha bármi kérdésed van, nézd meg a konzolt (F12 → Console) a részletes hibaüzenetekért!

---

**Készítette:** Claude Assistant  
**Verzió:** 1.0  
**Dátum:** 2024
