# J.A.R.V.I.S

Veebipõhine häälabiline, mis avaneb brauseris nagu Iron Mani ekraan. Vaikimisi räägib ja kuulab ta **eesti keeles**. Seadetes saad keeleks valida **Eesti** või **English**.

Töötab nii Macis kui iPhone’is. Telefonis on vaja tasuta Google Gemini võtit ja lehte, mis avaneb **https** aadressil (näiteks GitHub Pages).

## Käivitamine Macis

1. Paki see kaust lahti, näiteks Töölauale.
2. Tee topeltklõps failil `start.command`.
   - Kui Mac ütleb, et faili ei saa avada, tee sellel **paremklõps**, vali **Open** / **Ava** ja kinnita.
   - Kui Terminal ütleb, et luba puudub, kirjuta: `chmod +x start.command` ja proovi uuesti.
3. Avaneb Chrome aadressil [http://localhost:8000](http://localhost:8000). Jäta Terminali aken avatuks, kuni kasutad Jarvist.
4. Luba mikrofon, kui brauser seda küsib.

Rääkimiseks hoia all **tühikut** või vajuta mikrofoni nuppu. Võid ka alla serva sõnumi kirjutada ja vajutada Enter.

## Telefonis (tasuta): GitHub Pages + Gemini

iPhone’i Chrome kasutab WebKiti, seega brauseri enda kõnetuvastus on ebakindel. Telefonis salvestab Jarvis su jutu ja saadab selle Google Gemini tasuta tasemele, mis nii transkribeerib kui vastab.

Mikrofon töötab ainult **https** aadressil, seega on kõige lihtsam panna see leht tasuta GitHub Pages’i.

### 1. Loo tasuta GitHubi konto

1. Mine lehele [github.com/signup](https://github.com/signup).
2. Sisesta e-post, loo parool ja kasutajanimi (see nimi ilmub hiljem aadressis).
3. Kinnita e-post, kui GitHub seda küsib.

### 2. Loo avalik hoidla ja laadi failid üles

1. Pärast sisselogimist vajuta **New repository** / **Uus hoidla**.
2. Nimeks sobib näiteks `jarvis`. Jäta hoidla **Public** (Pages tasuta plaanil vajab avalikku hoidlat).
3. Ära lisa README-d, kui küsitakse, ja vajuta **Create repository**.
4. Lehel vajuta **Add file** ja seejärel **Upload files**.
5. Lohista siia **kõik selle kausta failid** (muu hulgas `index.html`, `styles.css`, `app.js`, `manifest.json`, `start.command`, `README.md`, kaust `fonts/` ning ikoonid). Jälgi, et `index.html` oleks hoidla juurika tasemel, mitte lisakausta sees.
6. Vajuta **Commit changes**.

Ära pane siia kunagi oma API võtit. Võti ei kuulu failidesse.

### 3. Lülita sisse GitHub Pages

1. Ava hoidlas **Settings**.
2. Vasakult vali **Pages**.
3. **Build and deployment** juures vali **Deploy from a branch**.
4. Haruks **main** (või `master`, kui see on ainus) ja kaustaks **/ (root)**. Salvesta.
5. Oota umbes minut. Samal lehel ilmub aadress kujul:

`https://<sinu-kasutajanimi>.github.io/jarvis/`

(kui hoidla nimi oli `jarvis`).

### 4. Ava iPhone’is ja lisa avaekraanile

1. Ava see https-aadress iPhone’i Safaris või Chrome’is.
2. Luba mikrofon, kui seda küsitakse.
3. Avaekraanile lisamiseks:
   - **Safaris:** jaga (ruut noolega) → **Add to Home Screen** / **Lisa avakuvale**.
   - **Chrome’is:** menüü ⋮ → **Add to Home Screen** / **Lisa avakuvale**.
4. Ava Jarvis avaekraani ikoonist.

### 5. Lisa tasuta Gemini võti

1. Arvutis või telefonis mine [aistudio.google.com/apikey](https://aistudio.google.com/apikey) ja logi sisse Google kontoga.
2. Loo API võti ja **kopeeri** see. Seda näidatakse hoolega — ära saada võtit kellelegi ega kleebi seda vestlusesse.
3. Jarvise lehel ava **Settings** (hammasratas), kleebi võti lahtrisse **Gemini API key** ja salvesta. Kui võti on olemas, valib Jarvis Gemini aju ise.
4. Võti salvestub **ainult selles seadmes** brauseri `localStorage`’isse. Seda ei laadita GitHubi. Leht ise on avalik, seega ära kirjuta võtit kunagi koodi ega README-sse.

Seejärel vajuta mikrofoni, räägi (eesti keeles, või inglise keeles, kui oled keeleks valinud English) ja vajuta uuesti, kui oled lõpetanud. Jarvis võib vaikuse järel ka ise lõpetada.

## Aju valimine

Ava hammasratas (**Settings**).

**Google Gemini (tasuta, soovitatav telefonis)**  
Vaikimisi mudel on `gemini-3.8-flash` (Google’i tasuta tase, [hinnakiri](https://ai.google.dev/gemini-api/docs/pricing)). Võti: [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Kui võti on salvestatud, on Gemini vaikimisi aju. Tasuta tasemel on päeva- ja minutipiirangud; kui vastus jääb tulemata, proovi hiljem uuesti.

**Ollama (tasuta, Macis)**  
Kasutab su Macis jooksvat mudelit, vaikimisi `llama3.2:3b`.

1. Paigalda [Ollama](https://ollama.com/download/mac), lohista see kausta Applications ja käivita.
2. Kui menüüribale ilmub laama ikoon, kirjuta Terminali:

```
ollama pull llama3.2:3b
```

3. Jäta Ollama taustal käima ja ava siis Jarvis (`start.command`).

Ollama lubab päringud aadressilt `http://localhost` (koos pordiga, näiteks `:8000`) **vaikimisi**. Kui brauser siiski blokeerib ühenduse, kirjuta Terminali `launchctl setenv OLLAMA_ORIGINS "*"` , sulge Ollama menüüribalt ja käivita see uuesti. `launchctl setenv` kestab kuni väljalogimise või taaskäivituseni. Ollama ei tööta iPhone’is, sest mudel jookseb su Macis.

**xAI Grok (tasuline)**  
Vali Settingsis **xAI Grok**, kleebi API võti [xAI konsoolist](https://console.x.ai) ja salvesta. Vaikimisi mudel on `grok-4.7`. Võti jääb ainult sellesse brauserisse.

## Hääl, kuulmine ja oskused

Seadetes vali **Keel**: Eesti (vaikimisi, ka olemasolevatele kasutajatele, kui keelt pole varem salvestatud) või English. Eesti keeles on ekraanitekstid, kõnetuvastus (`et-EE`) ja mudeli vastused eesti keeles. J.A.R.V.I.S-i nimi jääb samaks; pöördumine „söör“ tuleb ette harva.

**Kõnemootor** määrab, kuidas ta räägib:

- **Automaatne** — eesti keeles eelistatakse seadme eesti häält; kui seda pole (tavaline iPhone’is ja paljudes brauserites), kasutatakse Gemini tasuta TTS-i, kui Gemini võti on olemas.
- **Seadme hääl** — ainult brauseri `speechSynthesis`.
- **Gemini hääl** — Gemini TTS (`gemini-3.1-flash-tts-preview`), kui võti on olemas.

Inglise keeles jääb vaikimisi briti meeshääl (macOS-is ja iOS-is tavaliselt **Daniel**), nagu varem. iPhone’is tuleb esimene puudutus teha, et hääl avaneks — see avab ka Gemini hääle taasesituse. Hääle ja kõnemootori saad Settingsist valida. Kui eesti häält ega Gemini võtit pole, kasutab Jarvis seadme vaikimisi häält ja näitab lühikest vihjet.

**Recognition** määrab, kuidas ta sind kuuleb:

- **Automatic** — iPhone’is Gemini audio, arvuti Chrome’is brauseri kõne.
- **Gemini audio** — salvestus läheb Gemini juurde (töötab iPhone’is).
- **Browser speech** — Web Speech API (kindlaim laua-Chrome’is; iPhone’is ebakindel).

Ilma mudelita oskab ta öelda kellaaega ja kuupäeva, küsida ilma ([Open-Meteo](https://open-meteo.com); asukoht või vaikimisi Tallinn), avada veebilehe (näiteks „ava YouTube“) ja otsida veebist uues sakis.

Äratussõna („Jarvis“) vajab brauseri kõnetuvastust ja iPhone’is tavaliselt ei tööta.

## Kui miski ei tööta

- **Mikrofon iPhone’is** vajab https-aadressi (GitHub Pages) ja Gemini võtit. Luba mikrofon, kui iOS seda küsib. **Settings → Recognition** peaks olema Automatic või Gemini audio.
- **Kõnetuvastus arvutis** töötab kõige kindlamalt **Google Chrome’is**. Safaris on tugi osaline. Firefoxis kasuta Gemini audiot või kirjuta tekst. Ära ava `index.html` failina (`file://`).
- Chrome’i brauseri kõnetuvastus vajab internetti. Gemini ja Grok samuti. Ollama vastused jäävad su Maci.
- **„I can't reach the local model“** — veendu, et Ollama töötab: `curl http://localhost:11434`.
- **Gemini keeldub võtmest või annab 429** — kontrolli võtit Settingsis; tasuta tasemel võib olla limiit, proovi hiljem.
- **Uus sakk ei avanenud** — luba hüpikaknad.
- **Python puudub Macis** — paigalda [python.org](https://www.python.org/downloads/macos/) lehelt „macOS 64-bit universal2 installer“.
- Inteli Macil Homebrew’d ei ole vaja.

Kui midagi ikka ei tööta, kopeeri Terminali või brauseri veateade (ilma API võtmeta) ja saada see mulle.
