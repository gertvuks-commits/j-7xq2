/* J.A.R.V.I.S web assistant */
"use strict";

const STORAGE = {
  backend: "jarvis.backend",
  ollamaUrl: "jarvis.ollamaUrl",
  ollamaModel: "jarvis.ollamaModel",
  xaiModel: "jarvis.xaiModel",
  xaiKey: "jarvis.xaiKey",
  geminiModel: "jarvis.geminiModel",
  geminiKey: "jarvis.geminiKey",
  voiceURI: "jarvis.voiceURI",
  wakeWord: "jarvis.wakeWord",
  recognition: "jarvis.recognition",
  bridgeUrl: "jarvis.bridgeUrl",
  bridgeAuth: "jarvis.bridgeAuth",
  bridgeAuto: "jarvis.bridgeAuto",
  replyTopic: "jarvis.replyTopic",
  replyLastId: "jarvis.replyLastId",
  lang: "jarvis.lang",
  voiceEngine: "jarvis.voiceEngine",
  geminiVoice: "jarvis.geminiVoice",
  ttsHintShown: "jarvis.ttsHintShown",
};

const DEFAULTS = {
  backend: "ollama",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.2:3b",
  xaiModel: "grok-4.7",
  xaiKey: "",
  geminiModel: "gemini-3.8-flash",
  geminiKey: "",
  voiceURI: "",
  wakeWord: false,
  recognition: "auto",
  bridgeUrl: "",
  bridgeAuth: "",
  bridgeAuto: true,
  lang: "et",
  voiceEngine: "auto",
  geminiVoice: "Charon",
};

const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models/";

const AUDIO_JSON_PROMPT_EN =
  "The user sent a voice recording in English. Transcribe it faithfully, then reply as J.A.R.V.I.S. " +
  'Return ONLY a JSON object with this exact shape: {"heard":"<verbatim transcript>","reply":"<your spoken reply>"}. ' +
  "If the audio is silent or unintelligible, set heard to an empty string and ask them to repeat, briefly.";

const AUDIO_JSON_PROMPT_ET =
  "Kasutaja saatis eestikeelse helisalvestise. Transkribeeri see täpselt eesti keeles, siis vasta J.A.R.V.I.S-ina eesti keeles. " +
  'Tagasta AINULT JSON-objekt täpselt sellisel kujul: {"heard":"<sõnasõnaline transkriptsioon>","reply":"<suuline vastus>"}. ' +
  "Kui heli on vaikne või arusaamatu, jäta heard tühjaks ja palu lühidalt korrata.";

const SYSTEM_PROMPT_EN =
  "You are J.A.R.V.I.S., a witty, polite British butler and personal assistant in the style of Iron Man's J.A.R.V.I.S. " +
  'The user\'s name is Gert; address him as "sir" or "Mr. Gert".\n\n' +
  "Rules:\n" +
  "- Speak English.\n" +
  "- Keep answers short and conversational, as they will be spoken aloud. Do not use lists, asterisks, Markdown, or long paragraphs.\n" +
  "- Be polite and lightly witty, never cold and never overly jokey.\n" +
  "- If you cannot do something, say so honestly and suggest a simple next step.";

const SYSTEM_PROMPT_ET =
  "Sa oled J.A.R.V.I.S., viisakas ja kergelt vaimukas isiklik abiline Iron Mani J.A.R.V.I.S-i stiilis. " +
  'Kasutaja nimi on Gert; võid teda vahetevahel kutsuda "söör" või "härra Gert", aga mitte igas lauses.\n\n' +
  "Reeglid:\n" +
  "- Vasta eesti keeles.\n" +
  "- Hoia vastused lühikesed ja kõneldavad. Ära kasuta loendeid, tärne, Markdowni ega pikki lõike.\n" +
  "- Ole viisakas ja kergelt vaimukas, mitte külm ega liiga naljatlev.\n" +
  "- Kui midagi ei saa teha, ütle seda ausalt ja paku lihtsat järgmist sammu.";

let injectedFetch = null;
function apiFetch(url, init) {
  return (injectedFetch || fetch)(url, init);
}

const GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const GEMINI_TTS_VOICE = "Charon";
const GEMINI_TTS_VOICES = ["Charon", "Algieba", "Iapetus", "Orus"];
const GEMINI_TTS_STYLE_ET =
  "Räägi rahulikult, sujuvalt ja viisakalt, nagu rafineeritud tehisintellektist butler, madala häälega, kerge kuiva huumoriga, ühtlases tempos: ";
const GEMINI_TTS_STYLE_EN =
  "Speak calmly, smoothly and politely, like a refined artificial-intelligence butler, in a low voice, with a hint of dry wit, at an even measured pace: ";

const GEMINI_TTS_RATE = 24000;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

const STRINGS = {
  en: {
    "langLegend": "Language",
    "langEt": "Eesti",
    "langEn": "English",
    "brainLegend": "Brain",
    "brainGemini": "<strong>Google Gemini</strong> — free tier, works in the browser and on iPhone. Used automatically once you add a key.",
    "brainOllama": "<strong>Ollama</strong> — free, runs on this Mac.",
    "brainXai": "<strong>xAI Grok</strong> — uses your prepaid xAI API credits.",
    "ollamaUrl": "Ollama URL",
    "ollamaModel": "Ollama model",
    "xaiModel": "xAI model",
    "xaiKey": "xAI API key",
    "xaiKeyFine": "The key is stored only in this browser’s localStorage. It never leaves your computer except when talking to api.x.ai. Do not paste it into a chat.",
    "geminiModel": "Gemini model",
    "geminiKey": "Gemini API key",
    "geminiKeyFine": "Get a free key at <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">aistudio.google.com/apikey</a>. It is stored only in this device’s localStorage and is sent only to Google when you talk to Jarvis. Never put the key into a public GitHub repository or this chat.",
    "bridgeLegend": "It Juht (actions)",
    "webhookUrl": "Webhook URL",
    "authHeader": "Authorization header",
    "bridgeAuto": "<strong>Send action requests automatically</strong> — email, calendar, weather, web lookup, and similar tasks go to It Juht when the webhook is set.",
    "replyChannel": "Reply channel",
    "ntfyNotify": "Get notifications on this phone (ntfy app)",
    "copyChannel": "Copy channel",
    "newChannel": "New reply channel",
    "ntfyFine": "Install the free ntfy app first. If the app doesn't open, open ntfy, tap +, and paste the copied channel name (server ntfy.sh).",
    "bridgeFine": "The URL, authorization header, and reply channel are stored only on this device. It Juht sends answers to this private channel. Regenerating it disconnects the old one. Never share them in a chat.",
    "voiceLegend": "Voice and hearing",
    "spokenVoice": "Spoken voice",
    "voiceEngine": "Voice engine",
    "voiceEngineAuto": "Automatic",
    "voiceEngineDevice": "Device voice",
    "voiceEngineGemini": "Gemini voice",
    "jarvisVoice": "Jarvis voice",
    "voiceCharon": "Charon — calm and informative",
    "voiceAlgieba": "Algieba — smooth and refined",
    "voiceIapetus": "Iapetus — clear and even",
    "voiceOrus": "Orus — firm and polite",
    "recognition": "Recognition",
    "recAuto": "Automatic (Gemini audio on iPhone, browser speech elsewhere)",
    "recGemini": "Gemini audio — works on iPhone",
    "recBrowser": "Browser speech (Chrome on a computer)",
    "wakeWord": "<strong>Wake word</strong> — continuously listen for “Jarvis”, then the command. Needs browser speech recognition, which is unreliable on iPhone.",
    "testVoice": "Test voice",
    "clearLog": "Clear log",
    "save": "Save",
    "settings": "Settings",
    "closeSettings": "Close settings",
    "commLog": "Comm log",
    "closeLog": "Close comm log",
    "systems": "Systems",
    "closeSys": "Close systems",
    "openLog": "Open comm log",
    "openSys": "Open systems",
    "logBtn": "Log",
    "sysBtn": "Sys",
    "dtState": "State",
    "dtBackend": "Backend",
    "dtModel": "Model",
    "dtVoice": "Voice",
    "dtMic": "Microphone",
    "dtRecognition": "Recognition",
    "dtWake": "Wake word",
    "send": "Send",
    "task": "Task",
    "taskAria": "Send task to It Juht",
    "taskTitle": "Send this as a task to It Juht",
    "messageAria": "Message for Jarvis",
    "placeholderType": "Address J.A.R.V.I.S, or hold Space to speak…",
    "placeholderMic": "Tap the mic, or type here…",
    "micAria": "Start listening",
    "micTitle": "Tap to talk, or hold Space on a computer",
    "dockHintSpace": "<kbd>Space</kbd> push to talk · type a message anytime",
    "dockHintMic": "Tap the mic, speak, then tap again · or type",
    "awaitingItJuht": "Awaiting It Juht",
    "waiting": "Awaiting input, sir.",
    "stateIdleHud": "SYSTEMS ONLINE",
    "stateListeningHud": "LISTENING",
    "stateThinkingHud": "PROCESSING",
    "stateSpeakingHud": "SPEAKING",
    "stateIdle": "Idle",
    "stateListening": "Listening",
    "stateThinking": "Thinking",
    "stateSpeaking": "Speaking",
    "online": "ONLINE",
    "initializing": "INITIALIZING",
    "on": "On",
    "off": "Off",
    "browserDefault": "Browser default",
    "recLabelGemini": "Gemini audio",
    "recLabelBrowser": "Browser speech",
    "micNeedsHttps": "Needs https",
    "micNeedsKey": "Needs Gemini key",
    "micReadyGemini": "Gemini audio",
    "micUnavailable": "Unavailable",
    "micReadyBrowser": "Ready (browser speech)",
    "micBlocked": "Blocked",
    "micChecking": "Checking…",
    "whoUser": "Mr. Gert",
    "whoJarvis": "J.A.R.V.I.S",
    "copied": "Copied",
    "copyFailed": "Copy failed",
    "voiceAutoDeviceEn": "Automatic (prefer British male)",
    "voiceAutoDeviceEt": "Automatic (prefer an Estonian voice)",
    "testVoiceLine": "At your service, Mr. Gert.",
    "logCleared": "Log cleared, sir. Awaiting input.",
    "yesSir": "Yes, sir?",
    "greetingMorning": "J.A.R.V.I.S. online. Good morning, Mr. Gert. How may I assist you?",
    "greetingAfternoon": "J.A.R.V.I.S. online. Good afternoon, Mr. Gert. How may I assist you?",
    "greetingEvening": "J.A.R.V.I.S. online. Good evening, Mr. Gert. How may I assist you?",
    "compatInsecure": "The microphone needs https or http://localhost. On a phone, open the GitHub Pages address. On a Mac, use start.command rather than opening the file directly.",
    "compatNeedKey": "Add a free Gemini API key in Settings to talk with your voice on this device.",
    "compatGeminiHow": "Tap the microphone, speak, then tap again when you have finished. The recording is sent to Gemini.",
    "compatNoSpeech": "Browser speech recognition is not available. Switch Recognition to Gemini audio, or type instead.",
    "compatIos": "On iPhone, add this page to your Home Screen and use a Gemini key. Chrome on iOS uses WebKit, so browser speech is unreliable.",
    "ttsHint": "This device has no Estonian speaking voice. Add a free Gemini API key in Settings to let J.A.R.V.I.S. speak Estonian, or switch Voice engine to Device voice.",
    "yourLocation": "your location",
    "weatherUnknown": "unusual conditions",
    "weatherLine": "It's {temp} degrees in {where}, sir, with {desc} and a wind of {wind} kilometres per hour.",
    "weatherFeels": " It feels more like {feel}.",
    "cityNotFound": "I couldn't find {city} on the map, sir.",
    "searchBlocked": "I tried to search the web for {q}, sir, but the browser blocked the new tab. Please allow pop-ups for this page.",
    "searching": "Searching the web for {q} now, sir.",
    "openUnknownBlocked": "I don't have a saved address for that, sir, and the browser blocked a search tab.",
    "openUnknownSearch": "I don't have a saved address for {target}, sir, so I've opened a web search instead.",
    "openBlocked": "I couldn't open the page, sir. Please allow pop-ups for this page.",
    "opening": "Opening that now, sir.",
    "timeOnly": "It's {time}, sir.",
    "timeDate": "It's {time}, sir. {weekday}, the {day} of {month} {year}.",
    "dateOnly": "Today is {weekday}, the {day} of {month} {year}, sir.",
    "bridgeNotConfigured": "It Juht is not configured yet, sir. Please add the webhook URL and authorization header in Settings.",
    "bridgeUnreachable": "I couldn't reach It Juht, sir (network or browser blocked the request).",
    "bridgeSent": "Task sent to It Juht, sir. I'll read you the answer as soon as it arrives.",
    "bridgeStatus": " The server responded with status {status}.",
    "bridgeAuthHint": " Please check the authorization header in Settings.",
    "emptyModelReply": "I didn't catch a reply from the model, sir.",
    "genericError": "Something went wrong, sir.",
    "micStartFail": "I couldn't start the microphone, sir.",
    "micBlockedLong": "Microphone access is blocked, sir. Please allow it in the browser.",
    "noSpeech": "I didn't catch that, sir.",
    "speechProblem": "Speech recognition had a problem, sir.",
    "noAudio": "I didn't catch any audio, sir. Please tap the microphone and try again.",
    "audioUnclear": "I didn't quite catch that, sir. Please try again.",
    "audioProcessFail": "I couldn't process the recording, sir.",
    "noRecorder": "This browser cannot record audio, sir. Please type instead.",
    "voiceNeedsKey": "A Gemini API key is needed in Settings for voice on this device, sir.",
    "micBlockedPage": "Microphone access is blocked, sir. Please allow it for this page.",
    "recorderStartFail": "I couldn't start the recorder, sir. Please type instead.",
    "recorderProblem": "The recorder had a problem, sir.",
    "recorderStartShort": "I couldn't start the recorder, sir.",
    "errOllamaMissing": "The local model wasn't found, sir. In Terminal, run ollama pull {model} and try again.",
    "errOllamaStatus": "Ollama returned an error ({status}), sir. Is the app running?",
    "errGemini400": "Gemini could not use that request, sir.",
    "errGemini400Detail": " Google says: {detail}",
    "errGemini400Retry": " Please try again, or check the model name in Settings.",
    "errKeyRefused": "The {who} key was refused, sir. Please check it in Settings. Don't send the key in a chat.",
    "errRateLimit": "{who} is rate-limiting us at the moment, sir. The free tier has daily limits — please try again in a little while.",
    "errServer": "The {who} service is having trouble, sir. Please try again shortly.",
    "errModelFailed": "The language model failed ({status}), sir.",
    "errNeedGeminiKey": "A free Gemini API key is needed in Settings, sir. You can create one at aistudio.google.com/apikey.",
    "errReachGemini": "I couldn't reach Gemini, sir. Please check your internet connection.",
    "errNeedXaiKey": "An xAI API key is needed in Settings, sir. On a phone, the free Gemini key is the easier option.",
    "errReachXai": "I couldn't reach xAI, sir. Please check your internet connection.",
    "errReachOllama": "I can't reach the local model, sir. Please make sure Ollama is running, then try again.",
    "errGeminiBlocked": "Gemini blocked that reply, sir. Please try phrasing it another way.",
    "listeningEllipsis": "Listening…"
  },
  et: {
    "langLegend": "Keel",
    "langEt": "Eesti",
    "langEn": "English",
    "brainLegend": "Aju",
    "brainGemini": "<strong>Google Gemini</strong> — tasuta tase, töötab brauseris ja iPhone’is. Valitakse ise, kui lisad võtme.",
    "brainOllama": "<strong>Ollama</strong> — tasuta, jookseb selles Macis.",
    "brainXai": "<strong>xAI Grok</strong> — kasutab sinu ettemakstud xAI API krediiti.",
    "ollamaUrl": "Ollama URL",
    "ollamaModel": "Ollama mudel",
    "xaiModel": "xAI mudel",
    "xaiKey": "xAI API võti",
    "xaiKeyFine": "Võti salvestub ainult selles brauseris localStorage’isse. Ta lahkub arvutist ainult siis, kui räägid api.x.ai-ga. Ära kleebi võtit vestlusesse.",
    "geminiModel": "Gemini mudel",
    "geminiKey": "Gemini API võti",
    "geminiKeyFine": "Tasuta võtme saad lehelt <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">aistudio.google.com/apikey</a>. See jääb ainult selle seadme localStorage’isse ja saadetakse Google’ile vaid siis, kui räägid Jarvisega. Ära pane võtit kunagi avalikku GitHubi hoidlasse ega sellesse vestlusesse.",
    "bridgeLegend": "It Juht (tegevused)",
    "webhookUrl": "Veebikonksu URL",
    "authHeader": "Autoriseerimise päis",
    "bridgeAuto": "<strong>Saada tegevussoovid automaatselt</strong> — kirjad, kalender, ilm, veebiotsing ja sarnased ülesanded lähevad It Juhile, kui veebikonks on seatud.",
    "replyChannel": "Vastuskanal",
    "ntfyNotify": "Saa teavitused sellesse telefoni (ntfy äpp)",
    "copyChannel": "Kopeeri kanal",
    "newChannel": "Uus vastuskanal",
    "ntfyFine": "Paigalda esmalt tasuta ntfy äpp. Kui äpp ei avane, ava ntfy, toksa + ja kleebi kopeeritud kanali nimi (server ntfy.sh).",
    "bridgeFine": "URL, autoriseerimise päis ja vastuskanal jäävad ainult sellesse seadmesse. It Juht saadab vastused sellesse privaatsesse kanalisse. Uue kanali loomine katkestab vana. Ära jaga neid vestluses.",
    "voiceLegend": "Hääl ja kuulmine",
    "spokenVoice": "Kõne hääl",
    "voiceEngine": "Kõnemootor",
    "voiceEngineAuto": "Automaatne",
    "voiceEngineDevice": "Seadme hääl",
    "voiceEngineGemini": "Gemini hääl",
    "jarvisVoice": "Jarvise hääl",
    "voiceCharon": "Charon — asjalik ja rahulik",
    "voiceAlgieba": "Algieba — sile ja rafineeritud",
    "voiceIapetus": "Iapetus — selge ja ühtlane",
    "voiceOrus": "Orus — kindel ja viisakas",
    "recognition": "Tuvastus",
    "recAuto": "Automaatne (iPhone’is Gemini audio, mujal brauseri kõne)",
    "recGemini": "Gemini audio — töötab iPhone’is",
    "recBrowser": "Brauseri kõne (Chrome arvutis)",
    "wakeWord": "<strong>Äratsõna</strong> — kuulab pidevalt sõna „Jarvis“ ja seejärel käsku. Vajab brauseri kõnetuvastust, mis iPhone’is on ebakindel.",
    "testVoice": "Proovi häält",
    "clearLog": "Tühjenda logi",
    "save": "Salvesta",
    "settings": "Seaded",
    "closeSettings": "Sulge seaded",
    "commLog": "Sidepäevik",
    "closeLog": "Sulge sidepäevik",
    "systems": "Süsteemid",
    "closeSys": "Sulge süsteemid",
    "openLog": "Ava sidepäevik",
    "openSys": "Ava süsteemid",
    "logBtn": "Logi",
    "sysBtn": "Sys",
    "dtState": "Olek",
    "dtBackend": "Mootor",
    "dtModel": "Mudel",
    "dtVoice": "Hääl",
    "dtMic": "Mikrofon",
    "dtRecognition": "Tuvastus",
    "dtWake": "Äratsõna",
    "send": "Saada",
    "task": "Ülesanne",
    "taskAria": "Saada ülesanne It Juhile",
    "taskTitle": "Saada see ülesandena It Juhile",
    "messageAria": "Sõnum Jarviselle",
    "placeholderType": "Pöördu J.A.R.V.I.S-i poole või hoia tühikut…",
    "placeholderMic": "Toksa mikrofoni või kirjuta siia…",
    "micAria": "Alusta kuulamist",
    "micTitle": "Toksa, et rääkida, või hoia arvutis tühikut",
    "dockHintSpace": "<kbd>Tühik</kbd> hoia all rääkimiseks · või kirjuta sõnum",
    "dockHintMic": "Toksa mikrofoni, räägi, toksa uuesti · või kirjuta",
    "awaitingItJuht": "Ootan It Juhti",
    "waiting": "Ootan käsku.",
    "stateIdleHud": "SÜSTEEMID SEES",
    "stateListeningHud": "KUULAN",
    "stateThinkingHud": "TÖÖTLEN",
    "stateSpeakingHud": "RÄÄGIN",
    "stateIdle": "Valmis",
    "stateListening": "Kuulan",
    "stateThinking": "Mõtlen",
    "stateSpeaking": "Räägin",
    "online": "SEES",
    "initializing": "KÄIVITAN",
    "on": "Sees",
    "off": "Väljas",
    "browserDefault": "Brauseri vaikimisi",
    "recLabelGemini": "Gemini audio",
    "recLabelBrowser": "Brauseri kõne",
    "micNeedsHttps": "Vajab https-i",
    "micNeedsKey": "Vajab Gemini võtit",
    "micReadyGemini": "Gemini audio",
    "micUnavailable": "Puudub",
    "micReadyBrowser": "Valmis (brauseri kõne)",
    "micBlocked": "Blokitud",
    "micChecking": "Kontrollin…",
    "whoUser": "Härra Gert",
    "whoJarvis": "J.A.R.V.I.S",
    "copied": "Kopeeritud",
    "copyFailed": "Kopeerimine ebaõnnestus",
    "voiceAutoDeviceEn": "Automaatne (eelista briti meeshäält)",
    "voiceAutoDeviceEt": "Automaatne (eelista eesti häält)",
    "testVoiceLine": "Teie teenistuses, härra Gert.",
    "logCleared": "Logi on tühjendatud. Ootan käsku.",
    "yesSir": "Kuulan.",
    "greetingMorning": "J.A.R.V.I.S on valmis. Tere hommikust, söör. Kuidas saan aidata?",
    "greetingAfternoon": "J.A.R.V.I.S on valmis. Tere päevast, söör. Kuidas saan aidata?",
    "greetingEvening": "J.A.R.V.I.S on valmis. Tere õhtust, söör. Kuidas saan aidata?",
    "compatInsecure": "Mikrofon vajab https-i või aadressi http://localhost. Telefonis ava GitHub Pages’i aadress. Macis kasuta start.command’i, ära ava faili otse.",
    "compatNeedKey": "Lisa seadetes tasuta Gemini API võti, et saaksid sellel seadmel häälega rääkida.",
    "compatGeminiHow": "Toksa mikrofoni, räägi ja toksa uuesti, kui oled lõpetanud. Salvestus saadetakse Geminiile.",
    "compatNoSpeech": "Brauseri kõnetuvastust pole. Vali tuvastuseks Gemini audio või kirjuta tekst.",
    "compatIos": "iPhone’is lisa see leht avakuvale ja kasuta Gemini võtit. Chrome iOS-is kasutab WebKiti, seega brauseri kõne on ebakindel.",
    "ttsHint": "Sellel seadmel pole eesti kõnesüntesaatorit. Lisa seadetes tasuta Gemini võti, et J.A.R.V.I.S saaks eesti keeles rääkida, või vali kõnemootoriks seadme hääl.",
    "yourLocation": "sinu asukohas",
    "weatherUnknown": "ebatavalised olud",
    "weatherLine": "{where} on {temp} kraadi, {desc}, tuul {wind} kilomeetrit tunnis.",
    "weatherFeels": " Tundub pigem {feel} kraadi.",
    "cityNotFound": "Ma ei leidnud kaardilt kohta nimega {city}.",
    "searchBlocked": "Üritasin otsida veebist „{q}“, aga brauser blokeeris uue saki. Palun luba sellel lehel hüpikaknad.",
    "searching": "Otsin veebist: {q}.",
    "openUnknownBlocked": "Mul pole selle jaoks salvestatud aadressi ja brauser blokeeris otsingusaki.",
    "openUnknownSearch": "Mul pole {target} jaoks salvestatud aadressi, seega avasin veebiotsingu.",
    "openBlocked": "Lehte ei õnnestunud avada. Palun luba sellel lehel hüpikaknad.",
    "opening": "Avan selle praegu.",
    "timeOnly": "Kell on {time}.",
    "timeDate": "Kell on {time}. Täna on {weekday}, {day}. {month} {year}.",
    "dateOnly": "Täna on {weekday}, {day}. {month} {year}.",
    "bridgeNotConfigured": "It Juht pole veel seadistatud. Palun lisa seadetes veebikonksu URL ja autoriseerimise päis.",
    "bridgeUnreachable": "It Juhtini ei õnnestunud jõuda (võrk või brauser blokeeris päringu).",
    "bridgeSent": "Ülesanne saadetud It Juhile. Loen vastuse ette, niipea kui see saabub.",
    "bridgeStatus": " Server vastas staatusega {status}.",
    "bridgeAuthHint": " Palun kontrolli seadetes autoriseerimise päist.",
    "emptyModelReply": "Mudelist ei tulnud vastust.",
    "genericError": "Midagi läks valesti.",
    "micStartFail": "Mikrofoni ei õnnestunud käivitada.",
    "micBlockedLong": "Mikrofoni kasutamine on blokitud. Palun luba see brauseris.",
    "noSpeech": "Ma ei saanud aru. Palun korda.",
    "speechProblem": "Kõnetuvastusel tekkis tõrge.",
    "noAudio": "Ma ei kuulnud heli. Palun toksa mikrofoni ja proovi uuesti.",
    "audioUnclear": "Ma ei saanud päris täpselt aru. Palun proovi uuesti.",
    "audioProcessFail": "Salvestust ei õnnestunud töödelda.",
    "noRecorder": "See brauser ei oska heli salvestada. Palun kirjuta selle asemel.",
    "voiceNeedsKey": "Hääle jaoks on vaja seadetes Gemini API võtit.",
    "micBlockedPage": "Mikrofoni kasutamine on blokitud. Palun luba see selle lehe jaoks.",
    "recorderStartFail": "Salvestit ei õnnestunud käivitada. Palun kirjuta selle asemel.",
    "recorderProblem": "Salvestil tekkis tõrge.",
    "recorderStartShort": "Salvestit ei õnnestunud käivitada.",
    "errOllamaMissing": "Kohalikku mudelit ei leitud. Kirjuta Terminali: ollama pull {model} ja proovi uuesti.",
    "errOllamaStatus": "Ollama andis vea ({status}). Kas rakendus töötab?",
    "errGemini400": "Gemini ei saanud seda päringut kasutada.",
    "errGemini400Detail": " Google ütleb: {detail}",
    "errGemini400Retry": " Palun proovi uuesti või kontrolli seadetes mudeli nime.",
    "errKeyRefused": "{who} võti lükati tagasi. Palun kontrolli seda seadetes. Ära saada võtit vestlusesse.",
    "errRateLimit": "{who} piirab praegu päringuid. Tasuta tasemel on päevalimiidid — palun proovi natuke hiljem.",
    "errServer": "{who} teenusel on praegu tõrge. Palun proovi varsti uuesti.",
    "errModelFailed": "Keelemudel ebaõnnestus ({status}).",
    "errNeedGeminiKey": "Seadetes on vaja tasuta Gemini API võtit. Selle saad luua aadressil aistudio.google.com/apikey.",
    "errReachGemini": "Geminiini ei õnnestunud jõuda. Palun kontrolli internetiühendust.",
    "errNeedXaiKey": "Seadetes on vaja xAI API võtit. Telefonis on lihtsam kasutada tasuta Gemini võtit.",
    "errReachXai": "xAI-ni ei õnnestunud jõuda. Palun kontrolli internetiühendust.",
    "errReachOllama": "Kohaliku mudelini ei õnnestu jõuda. Palun veendu, et Ollama töötab, ja proovi uuesti.",
    "errGeminiBlocked": "Gemini keelas selle vastuse. Palun sõnasta küsimus teistmoodi.",
    "listeningEllipsis": "Kuulan…"
  }
};

const WMO_ET = {
  0: "selge taevas",
  1: "peamiselt selge",
  2: "osaliselt pilves",
  3: "pilves",
  45: "udu",
  48: "härmatiseudu",
  51: "nõrk uduvihm",
  53: "uduvihm",
  55: "tihe uduvihm",
  56: "nõrk jäätuv uduvihm",
  57: "jäätuv uduvihm",
  61: "nõrk vihm",
  63: "vihm",
  65: "tugev vihm",
  66: "nõrk jäätuv vihm",
  67: "jäätuv vihm",
  71: "nõrk lumi",
  73: "lumi",
  75: "tugev lumi",
  77: "lumeterad",
  80: "nõrk hoovihm",
  81: "hoovihm",
  82: "tugev hoovihm",
  85: "nõrk hooglumi",
  86: "tugev hooglumi",
  95: "äike",
  96: "äike ja veidi rahet",
  99: "tugev äike ja rahe"
};

function isEt() {
  return !settings || settings.lang !== "en";
}

function currentLang() {
  return isEt() ? "et" : "en";
}

function t(key, vars) {
  const pack = STRINGS[currentLang()] || STRINGS.en;
  let s = pack[key];
  if (s == null) s = STRINGS.en[key];
  if (s == null) s = key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.split("{" + k + "}").join(String(vars[k] == null ? "" : vars[k]));
    });
  }
  return s;
}

function systemPrompt() {
  return isEt() ? SYSTEM_PROMPT_ET : SYSTEM_PROMPT_EN;
}

function audioJsonPrompt() {
  return isEt() ? AUDIO_JSON_PROMPT_ET : AUDIO_JSON_PROMPT_EN;
}

function recognitionLang() {
  return isEt() ? "et-EE" : "en-US";
}

function dateLocale() {
  return isEt() ? "et-EE" : "en-GB";
}

function refreshConversationPrompt() {
  if (conversation[0] && conversation[0].role === "system") {
    conversation[0].content = systemPrompt();
  }
}

function applyI18n() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = currentLang();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.setAttribute("title", t(key));
  });
  if (els.awaitingItJuht) els.awaitingItJuht.textContent = t("awaitingItJuht");
}

function applyLanguage() {
  refreshConversationPrompt();
  applyI18n();
  applyCompatNote();
  setState(uiState);
  refreshStats();
  fillVoiceSelect();
}

const SITE_MAP = {
  youtube: "https://www.youtube.com",
  google: "https://www.google.com",
  gmail: "https://mail.google.com",
  maps: "https://maps.google.com",
  "googlemaps": "https://maps.google.com",
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  twitter: "https://x.com",
  x: "https://x.com",
  github: "https://github.com",
  netflix: "https://www.netflix.com",
  wikipedia: "https://en.wikipedia.org",
  reddit: "https://www.reddit.com",
  amazon: "https://www.amazon.com",
  twitch: "https://www.twitch.tv",
  linkedin: "https://www.linkedin.com",
  outlook: "https://outlook.live.com",
  bbc: "https://www.bbc.com",
  spotify: "https://open.spotify.com",
  news: "https://news.google.com",
  translate: "https://translate.google.com",
  drive: "https://drive.google.com",
  calendar: "https://calendar.google.com",
  duckduckgo: "https://duckduckgo.com",
  wikipediaorg: "https://en.wikipedia.org",
};

const WMO = {
  0: "clear skies",
  1: "mainly clear skies",
  2: "partly cloudy conditions",
  3: "overcast skies",
  45: "fog",
  48: "rime fog",
  51: "light drizzle",
  53: "drizzle",
  55: "dense drizzle",
  56: "light freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  85: "light snow showers",
  86: "heavy snow showers",
  95: "a thunderstorm",
  96: "a thunderstorm with some hail",
  99: "a heavy thunderstorm with hail",
};

const TALLINN = { name: "Tallinn", latitude: 59.437, longitude: 24.7536 };

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const els = {};
let settings = loadSettings();
let uiState = "idle";
let conversation = [{ role: "system", content: systemPrompt() }];
let clickRecognition = null;
let wakeRecognition = null;
let holdingSpace = false;
let clickListening = false;
let wakeArmedForCommand = false;
let currentUtterance = null;
let busy = false;
let voicesReady = false;
let ttsUnlocked = false;
let mediaRecorder = null;
let mediaChunks = [];
let mediaStream = null;
let stopSilenceWatch = null;
let recording = false;
let recMaxTimer = null;
let ttsAudio = null;
let audioUnlocked = false;
let speakingGemini = false;
let replyTopic = "";
let lastReplyId = "";
let seenReplyIds = new Set();
let replySource = null;
let replyReconnectTimer = null;
let awaitingTimer = null;
let speakQueue = [];
let drainingSpeakQueue = false;

function loadSettings() {
  const s = { ...DEFAULTS };
  try {
    s.ollamaUrl = localStorage.getItem(STORAGE.ollamaUrl) || s.ollamaUrl;
    s.ollamaModel = localStorage.getItem(STORAGE.ollamaModel) || s.ollamaModel;
    s.xaiModel = localStorage.getItem(STORAGE.xaiModel) || s.xaiModel;
    s.xaiKey = localStorage.getItem(STORAGE.xaiKey) || "";
    s.geminiModel = localStorage.getItem(STORAGE.geminiModel) || s.geminiModel;
    s.geminiKey = localStorage.getItem(STORAGE.geminiKey) || "";
    s.voiceURI = localStorage.getItem(STORAGE.voiceURI) || "";
    s.wakeWord = localStorage.getItem(STORAGE.wakeWord) === "1";
    s.bridgeUrl = localStorage.getItem(STORAGE.bridgeUrl) || "";
    s.bridgeAuth = localStorage.getItem(STORAGE.bridgeAuth) || "";
    const bridgeAuto = localStorage.getItem(STORAGE.bridgeAuto);
    if (bridgeAuto === "0") s.bridgeAuto = false;
    else s.bridgeAuto = true;
    const lang = localStorage.getItem(STORAGE.lang);
    if (lang === "en") s.lang = "en";
    else s.lang = "et";
    const ve = localStorage.getItem(STORAGE.voiceEngine);
    if (ve === "auto" || ve === "device" || ve === "gemini") s.voiceEngine = ve;
    else s.voiceEngine = "auto";
    s.geminiVoice = normalizeGeminiVoice(localStorage.getItem(STORAGE.geminiVoice));
    const rec = localStorage.getItem(STORAGE.recognition);
    if (rec === "auto" || rec === "gemini" || rec === "browser") s.recognition = rec;
    const backend = localStorage.getItem(STORAGE.backend);
    if (backend === "ollama" || backend === "xai" || backend === "gemini") {
      s.backend = backend;
    } else {
      s.backend = s.geminiKey ? "gemini" : "ollama";
    }
  } catch {
    /* private mode */
  }
  return s;
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE.backend, settings.backend);
    localStorage.setItem(STORAGE.ollamaUrl, settings.ollamaUrl);
    localStorage.setItem(STORAGE.ollamaModel, settings.ollamaModel);
    localStorage.setItem(STORAGE.xaiModel, settings.xaiModel);
    localStorage.setItem(STORAGE.xaiKey, settings.xaiKey);
    localStorage.setItem(STORAGE.geminiModel, settings.geminiModel);
    localStorage.setItem(STORAGE.geminiKey, settings.geminiKey);
    localStorage.setItem(STORAGE.voiceURI, settings.voiceURI);
    localStorage.setItem(STORAGE.wakeWord, settings.wakeWord ? "1" : "0");
    localStorage.setItem(STORAGE.recognition, settings.recognition);
    localStorage.setItem(STORAGE.bridgeUrl, settings.bridgeUrl || "");
    localStorage.setItem(STORAGE.bridgeAuth, settings.bridgeAuth || "");
    localStorage.setItem(STORAGE.bridgeAuto, settings.bridgeAuto ? "1" : "0");
    localStorage.setItem(STORAGE.lang, settings.lang === "en" ? "en" : "et");
    localStorage.setItem(STORAGE.voiceEngine, settings.voiceEngine || "auto");
    localStorage.setItem(STORAGE.geminiVoice, normalizeGeminiVoice(settings.geminiVoice));
  } catch {
    /* ignore quota */
  }
}

function isIOS() {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return false;
}

function usesGeminiAudio() {
  const mode = settings.recognition || "auto";
  if (mode === "gemini") return true;
  if (mode === "browser") return false;
  if (isIOS()) return true;
  if (typeof SpeechRecognitionAPI !== "function") return true;
  return false;
}

function $(id) {
  return document.getElementById(id);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nowStamp() {
  const d = new Date();
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}

function ordinal(n) {
  const v = n % 100;
  const s = ["th", "st", "nd", "rd"];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateClock() {
  const d = new Date();
  els.clockTime.textContent =
    pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  const fmt = new Intl.DateTimeFormat(dateLocale(), {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZoneName: "short",
  });
  els.clockDate.textContent = fmt.format(d).toUpperCase();
}

function syncReactorMotion(state) {
  const durs = {
    idle: { slow: 48, rev: 22, mid: 16 },
    listening: { slow: 16, rev: 8, mid: 10 },
    thinking: { slow: 10, rev: 3.5, mid: 4 },
    speaking: { slow: 28, rev: 14, mid: 7 },
  };
  const d = durs[state] || durs.idle;
  const map = { "spin-slow": d.slow, "spin-rev": d.rev, "spin-mid": d.mid };
  Object.keys(map).forEach((cls) => {
    const anim = document.querySelector("." + cls + " animateTransform");
    if (anim) anim.setAttribute("dur", map[cls] + "s");
  });
}

function setState(next) {
  uiState = next;
  els.reactor.dataset.state = next;
  syncReactorMotion(next);
  const labels = {
    idle: t("stateIdleHud"),
    listening: t("stateListeningHud"),
    thinking: t("stateThinkingHud"),
    speaking: t("stateSpeakingHud"),
  };
  const stat = {
    idle: t("stateIdle"),
    listening: t("stateListening"),
    thinking: t("stateThinking"),
    speaking: t("stateSpeaking"),
  };
  els.stateLabel.textContent = labels[next] || next.toUpperCase();
  els.statState.textContent = stat[next] || (next.charAt(0).toUpperCase() + next.slice(1));
  els.sysPill.className = "sys-pill " + (next === "idle" ? "online" : next);
  if (next === "idle") els.sysLabel.textContent = t("online");
  else els.sysLabel.textContent = labels[next];
  const showEq = next === "listening" || next === "speaking";
  els.eq.hidden = !showEq;
}

function backendLabel() {
  if (settings.backend === "xai") return "xAI Grok";
  if (settings.backend === "gemini") return "Gemini";
  return "Ollama";
}

function currentModelName() {
  if (settings.backend === "xai") return settings.xaiModel;
  if (settings.backend === "gemini") return settings.geminiModel;
  return settings.ollamaModel;
}

function recognitionLabel() {
  if (usesGeminiAudio()) return t("recLabelGemini");
  return t("recLabelBrowser");
}

function refreshStats() {
  els.statBackend.textContent = backendLabel();
  els.statModel.textContent = currentModelName();
  els.statWake.textContent = settings.wakeWord && !usesGeminiAudio() ? t("on") : t("off");
  if (els.statRecognition) els.statRecognition.textContent = recognitionLabel();
  const voice = pickVoice();
  if (shouldUseGeminiTts()) els.statVoice.textContent = "Gemini · " + currentGeminiVoice();
  else els.statVoice.textContent = voice ? voice.name : t("browserDefault");
}

function setTranscript(text, interim) {
  els.transcript.textContent = text || t("waiting");
  els.transcript.classList.toggle("interim", !!interim);
}

function scrollLog() {
  els.log.scrollTop = els.log.scrollHeight;
}

function addMessage(role, text, opts) {
  const options = opts || {};
  const node = document.createElement("article");
  node.className = "msg " + role + (options.streaming ? " streaming" : "") + (options.error ? " error" : "");
  const who = role === "user" ? t("whoUser") : t("whoJarvis");
  node.innerHTML =
    '<div class="msg-meta">' +
    escapeHtml(who) +
    " · " +
    nowStamp() +
    "</div>" +
    '<div class="msg-body"></div>';
  node.querySelector(".msg-body").textContent = text;
  els.log.appendChild(node);
  const count = els.log.querySelectorAll(".msg").length;
  els.logCount.textContent = pad2(count);
  scrollLog();
  return node;
}

function updateMessage(node, text, done) {
  node.querySelector(".msg-body").textContent = text;
  if (done) node.classList.remove("streaming");
  scrollLog();
}

function wakeNamePattern() {
  return "(?:d[zž]|j)arvis(?:e|t)?";
}

function stripWake(text) {
  const re = new RegExp("^(?:(?:hei|hey|ok|okei|okay|tere|hi)\s+)?" + wakeNamePattern() + "[,:.]?\s*", "i");
  return String(text).replace(re, "").trim();
}

function normalizeCommand(text) {
  return stripWake(text)
    .replace(/[‘’]/g, "'")
    .replace(/[?!]+$/g, "")
    .replace(/\s+please\.?$/i, "")
    .replace(/\s+palun\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchSkill(raw) {
  const text = normalizeCommand(raw);
  if (!text) return null;

  const asksTime =
    /^(?:(?:what(?:'s| is)|tell me|give me) )?(?:the |current )?time(?: is it)?(?: now)?$/i.test(text) ||
    /^what time is it(?: now)?$/i.test(text);
  const asksDate =
    /^(?:(?:what(?:'s| is)|tell me) )?(?:the |today'?s |current )?(?:date|day)(?:(?: is it)?(?: today)?)?$/i.test(text) ||
    /^what(?:'s| is) today(?:'s date)?$/i.test(text) ||
    /^what day is it(?: today)?$/i.test(text);
  if (/^(?:(?:what(?:'s| is)?|tell me) )?(?:the )?(?:date and time|time and date)(?: is it)?(?: now)?$/i.test(text) || (asksTime && asksDate)) {
    return { type: "datetime" };
  }
  if (asksTime) return { type: "time" };
  if (asksDate) return { type: "date" };

  let m = text.match(
    /^(?:(?:what(?:'s| is)|how(?:'s| is)|tell me) )?(?:the |current )?(?:weather|forecast|temperature)(?: like| now| today| outside)?(?: (?:like )?(?:in|for|at) (.+))?$/i
  );
  if (m) return { type: "weather", city: (m[1] || "").trim() || null };
  m = text.match(/^is it (?:raining|cold|hot|warm|nice)(?: out(?:side)?)?(?: (?:in|at) (.+))?$/i);
  if (m) return { type: "weather", city: (m[1] || "").trim() || null };

  m = text.match(/^(?:search(?: the web)?(?: for)?|google|look up)\s+(.+)$/i);
  if (m) return { type: "search", query: m[1].trim() };

  m = text.match(/^open(?: up)?(?: the (?:website|site|page))?\s+(.+)$/i);
  if (m) return { type: "open", target: m[1].trim() };

  if (isEt()) {
    const asksTimeEt =
      /^(?:mis kell(?: on)?(?: praegu)?|ütle(?: mulle)? kellaeg|kellaaeg|palun kell)$/i.test(text);
    const asksDateEt =
      /^(?:mis (?:kuupäev|päev)(?: (?:täna|praegu))? on|mis täna on|kuupäev|mis päev täna on)$/i.test(text);
    if (/^(?:kuupäev ja kellaeg|kellaeg ja kuupäev|mis kell ja kuupäev(?: on)?)$/i.test(text) || (asksTimeEt && asksDateEt)) {
      return { type: "datetime" };
    }
    if (asksTimeEt) return { type: "time" };
    if (asksDateEt) return { type: "date" };
    m = text.match(/^(?:milline |kuidas |mis )?(?:on )?(?:ilm|ilmaennustus|temperatuur)(?: (?:täna|praegu|väljas))?(?: (?:linnas |kohas |(?:in|for|at) )?(.+))?$/i);
    if (m) return { type: "weather", city: (m[1] || "").trim() || null };
    m = text.match(/^kas (?:sajab|on (?:külm|soe|kuum|ilus))(?: väljas)?(?: (?:linnas |kohas )?(.+))?$/i);
    if (m) return { type: "weather", city: (m[1] || "").trim() || null };
    m = text.match(/^(?:otsi(?:\s+üles|\s+veebist|\s+interneti?st)?|google)\s+(.+)$/i);
    if (m) return { type: "search", query: m[1].trim() };
    m = text.match(/^(?:ava|avage)\s+(?:leht |sait |veebileht )?(.+)$/i);
    if (m) return { type: "open", target: m[1].trim() };
  }

  return null;
}

function formatTimeSpeech(includeDate) {
  const d = new Date();
  const time = new Intl.DateTimeFormat(dateLocale(), isEt()
    ? { hour: "2-digit", minute: "2-digit", hour12: false }
    : { hour: "numeric", minute: "2-digit", hour12: true }
  ).format(d);
  const weekday = new Intl.DateTimeFormat(dateLocale(), { weekday: "long" }).format(d);
  const month = new Intl.DateTimeFormat(dateLocale(), { month: "long" }).format(d);
  const day = isEt() ? String(d.getDate()) : ordinal(d.getDate());
  const year = d.getFullYear();
  if (includeDate) return t("timeDate", { time: time, weekday: weekday, day: day, month: month, year: year });
  return t("timeOnly", { time: time });
}

function formatDateSpeech() {
  const d = new Date();
  const weekday = new Intl.DateTimeFormat(dateLocale(), { weekday: "long" }).format(d);
  const month = new Intl.DateTimeFormat(dateLocale(), { month: "long" }).format(d);
  const day = isEt() ? String(d.getDate()) : ordinal(d.getDate());
  return t("dateOnly", { weekday: weekday, day: day, month: month, year: d.getFullYear() });
}

function geolocate(timeoutMs) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const t = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(t);
        resolve({
          name: t("yourLocation"),
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        clearTimeout(t);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
    );
  });
}

async function geocodeCity(name) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(name) +
    "&count=1&language=" + (isEt() ? "et" : "en") + "&format=json";
  const res = await fetch(url);
  if (!res.ok) throw new Error("lookup failed");
  const data = await res.json();
  const hit = data.results && data.results[0];
  if (!hit) return null;
  const label = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
  return { name: hit.name || name, label: label, latitude: hit.latitude, longitude: hit.longitude };
}

async function fetchWeather(place) {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(place.latitude) +
    "&longitude=" +
    encodeURIComponent(place.longitude) +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
    "&wind_speed_unit=kmh&timezone=auto";
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather failed");
  const data = await res.json();
  const cur = data.current || {};
  const table = isEt() ? WMO_ET : WMO;
  const desc = table[cur.weather_code] || t("weatherUnknown");
  const temp = Math.round(cur.temperature_2m);
  const feel = Math.round(cur.apparent_temperature);
  const wind = Math.round(cur.wind_speed_10m);
  const where = place.label || place.name;
  let line = t("weatherLine", { temp: temp, where: where, desc: desc, wind: wind });
  if (Number.isFinite(feel) && feel !== temp) {
    line += t("weatherFeels", { feel: feel });
  }
  return line;
}

async function skillWeather(city) {
  let place = null;
  if (city) {
    place = await geocodeCity(city);
    if (!place) {
      return t("cityNotFound", { city: city });
    }
  } else {
    place = (await geolocate(3000)) || TALLINN;
  }
  return fetchWeather(place);
}

function resolveSite(target) {
  let t = String(target || "")
    .trim()
    .replace(/[.,]+$/, "")
    .replace(/^the\s+/i, "");
  if (!t) return null;
  const key = t.toLowerCase().replace(/\s+/g, "");
  if (SITE_MAP[key]) return SITE_MAP[key];
  try {
    if (/^https?:\/\//i.test(t)) {
      const u = new URL(t);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.href;
    }
  } catch {
    return null;
  }
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/\S*)?$/i.test(t)) {
    return "https://" + t;
  }
  return null;
}

function openTab(href) {
  const win = window.open(href, "_blank", "noopener,noreferrer");
  return !!win;
}

async function runSkill(skill) {
  if (skill.type === "time") return formatTimeSpeech(false);
  if (skill.type === "date") return formatDateSpeech();
  if (skill.type === "datetime") return formatTimeSpeech(true);
  if (skill.type === "weather") return skillWeather(skill.city);
  if (skill.type === "search") {
    const q = skill.query;
    const ok = openTab("https://www.google.com/search?q=" + encodeURIComponent(q));
    if (!ok) {
      return t("searchBlocked", { q: q });
    }
    return t("searching", { q: q });
  }
  if (skill.type === "open") {
    const href = resolveSite(skill.target);
    if (!href) {
      const ok = openTab("https://www.google.com/search?q=" + encodeURIComponent(skill.target));
      if (!ok) {
        return t("openUnknownBlocked");
      }
      return t("openUnknownSearch", { target: skill.target });
    }
    const ok = openTab(href);
    if (!ok) {
      return t("openBlocked");
    }
    return t("opening");
  }
  return null;
}

function preferBritishMale(voices) {
  const list = voices || [];
  const score = (v) => {
    const name = (v.name || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase();
    let n = 0;
    if (name.includes("daniel")) n += 80;
    if (name.includes("arthur")) n += 50;
    if (name.includes("uk english male") || name.includes("english united kingdom")) n += 60;
    if (lang.startsWith("en-gb")) n += 40;
    if (/(male|man|david|george|rishi|tom)/.test(name) && lang.startsWith("en")) n += 15;
    if (lang.startsWith("en-us") && /male|daniel/.test(name)) n += 8;
    if (lang.startsWith("en")) n += 5;
    if (v.default) n += 1;
    if (name.includes("female") || name.includes("woman") || name.includes("samantha") || name.includes("karen")) n -= 20;
    return n;
  };
  return [...list].sort((a, b) => score(b) - score(a))[0] || null;
}

function allVoices() {
  if (!window.speechSynthesis) return [];
  return speechSynthesis.getVoices() || [];
}

function estonianVoices(voices) {
  return (voices || []).filter((v) => (v.lang || "").toLowerCase().startsWith("et"));
}

function hasEstonianDeviceVoice() {
  return estonianVoices(allVoices()).length > 0;
}

function preferEstonianVoice(voices) {
  const list = estonianVoices(voices);
  return list[0] || null;
}

function pickVoice() {
  const voices = allVoices();
  if (!voices.length) return null;
  if (settings.voiceURI) {
    const found = voices.find((v) => v.voiceURI === settings.voiceURI);
    if (found) return found;
  }
  if (isEt()) return preferEstonianVoice(voices) || preferBritishMale(voices);
  return preferBritishMale(voices);
}

function fillVoiceSelect() {
  const sel = els.cfgVoice;
  if (!sel) return;
  const voices = allVoices();
  const current = sel.value || settings.voiceURI;
  sel.innerHTML = "";
  const auto = document.createElement("option");
  auto.value = "";
  auto.textContent = isEt() ? t("voiceAutoDeviceEt") : t("voiceAutoDeviceEn");
  sel.appendChild(auto);
  const preferred = isEt()
    ? estonianVoices(voices).concat(voices.filter((v) => !estonianVoices([v]).length))
    : voices.filter((v) => /^en/i.test(v.lang) || !v.lang).concat(voices.filter((v) => v.lang && !/^en/i.test(v.lang)));
  preferred.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = v.name + (v.lang ? " (" + v.lang + ")" : "");
    sel.appendChild(opt);
  });
  sel.value = current;
  if (sel.value !== current) sel.value = "";
  voicesReady = voices.length > 0;
  refreshStats();
}

function shouldUseGeminiTts() {
  const engine = settings.voiceEngine || "auto";
  if (!settings.geminiKey) return false;
  if (engine === "gemini") return true;
  if (engine === "device") return false;
  return isEt() && !hasEstonianDeviceVoice();
}

function maybeTtsHint() {
  if (!isEt()) return "";
  if (hasEstonianDeviceVoice() || settings.geminiKey) return "";
  return t("ttsHint");
}

function getTtsAudio() {
  if (!ttsAudio) {
    ttsAudio = new Audio();
    ttsAudio.preload = "auto";
  }
  return ttsAudio;
}

function unlockTTS() {
  if (!audioUnlocked) {
    try {
      const a = getTtsAudio();
      a.src = SILENT_WAV;
      const play = a.play();
      if (play && play.catch) play.catch(function () {});
      audioUnlocked = true;
    } catch {
      audioUnlocked = true;
    }
  }
  if (ttsUnlocked || !window.speechSynthesis) {
    ttsUnlocked = true;
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.rate = 1;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || (isEt() ? "et-EE" : "en-GB");
    speechSynthesis.speak(u);
    ttsUnlocked = true;
  } catch {
    ttsUnlocked = true;
  }
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
  if (ttsAudio) {
    try {
      ttsAudio.pause();
      ttsAudio.removeAttribute("src");
      ttsAudio.load();
    } catch {
      /* ignore */
    }
  }
  currentUtterance = null;
  speakingGemini = false;
}

function isSpeechPlaying() {
  return !!(currentUtterance || speakingGemini || (ttsAudio && !ttsAudio.paused && !ttsAudio.ended));
}

function b64ToBytes(b64) {
  const raw = String(b64 || "").replace(/\s+/g, "");
  const bin = atob(raw);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function pcm16leToWav(pcmBytes, sampleRate) {
  const pcm = pcmBytes instanceof Uint8Array ? pcmBytes : new Uint8Array(pcmBytes);
  const rate = sampleRate || GEMINI_TTS_RATE;
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const dataSize = pcm.byteLength;
  function writeStr(offset, s) {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
  }
  writeStr(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, "data");
  v.setUint32(40, dataSize, true);
  return new Blob([header, pcm], { type: "audio/wav" });
}

function isWavBytes(bytes) {
  return (
    bytes &&
    bytes.length >= 12 &&
    bytes[0] === 82 &&
    bytes[1] === 73 &&
    bytes[2] === 70 &&
    bytes[3] === 70 &&
    bytes[8] === 87 &&
    bytes[9] === 65 &&
    bytes[10] === 86 &&
    bytes[11] === 69
  );
}

function wavFromGeminiAudio(b64, mimeType) {
  const bytes = b64ToBytes(b64);
  const mime = String(mimeType || "").toLowerCase();
  if (isWavBytes(bytes) || mime.indexOf("wav") !== -1) {
    return new Blob([bytes], { type: "audio/wav" });
  }
  return pcm16leToWav(bytes, GEMINI_TTS_RATE);
}

function extractGeminiInlineAudio(data) {
  const parts =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts;
  if (!parts) return null;
  for (let i = 0; i < parts.length; i++) {
    const inline = parts[i] && (parts[i].inlineData || parts[i].inline_data);
    if (inline && inline.data) {
      return { data: inline.data, mimeType: inline.mimeType || inline.mime_type || "" };
    }
  }
  return null;
}

function normalizeGeminiVoice(name) {
  const n = String(name || "").trim();
  if (GEMINI_TTS_VOICES.indexOf(n) !== -1) return n;
  return GEMINI_TTS_VOICE;
}

function currentGeminiVoice() {
  return normalizeGeminiVoice(settings && settings.geminiVoice);
}

function geminiTtsStylePreamble() {
  return isEt() ? GEMINI_TTS_STYLE_ET : GEMINI_TTS_STYLE_EN;
}

function geminiTtsPrompt(text) {
  const spoken = String(text || "").trim();
  // Documented generateContent style for gemini-3.1-flash-tts-preview:
  // "Say cheerfully: Have a wonderful day!" — style before the colon is not spoken.
  return geminiTtsStylePreamble() + spoken;
}

function buildGeminiTtsBody(text) {
  const spoken = String(text || "").trim();
  const body = {
    contents: [{ parts: [{ text: geminiTtsPrompt(spoken) }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: currentGeminiVoice() },
        },
      },
    },
    model: GEMINI_TTS_MODEL,
  };
  if (isEt()) body.generationConfig.speechConfig.languageCode = "et-EE";
  else body.generationConfig.speechConfig.languageCode = "en-GB";
  return body;
}

function geminiTtsEndpoint() {
  return GEMINI_API_ROOT + encodeURIComponent(GEMINI_TTS_MODEL) + ":generateContent";
}

async function speakWithGemini(text) {
  const res = await apiFetch(geminiTtsEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": settings.geminiKey,
    },
    body: JSON.stringify(buildGeminiTtsBody(text)),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(friendlyHttpError("gemini", res.status, errText));
  }
  const data = await res.json();
  const inline = extractGeminiInlineAudio(data);
  if (!inline) throw new Error("no audio");
  const blob = wavFromGeminiAudio(inline.data, inline.mimeType);
  const url = URL.createObjectURL(blob);
  const audio = getTtsAudio();
  speakingGemini = true;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      speakingGemini = false;
      URL.revokeObjectURL(url);
      audio.onended = null;
      audio.onerror = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("audio play failed"));
    };
    audio.src = url;
    const play = audio.play();
    if (play && play.catch) {
      play.catch((err) => {
        cleanup();
        reject(err);
      });
    }
  });
}

function speakWithDevice(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) {
      resolve();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 0.9;
    utter.volume = 1;
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    if (voice && voice.lang) utter.lang = voice.lang;
    else utter.lang = isEt() ? "et-EE" : "en-GB";
    currentUtterance = utter;
    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null;
      resolve();
    };
    utter.onerror = () => {
      if (currentUtterance === utter) currentUtterance = null;
      resolve();
    };
    try {
      speechSynthesis.speak(utter);
    } catch {
      if (currentUtterance === utter) currentUtterance = null;
      resolve();
    }
  });
}

async function speak(text) {
  const line = String(text || "").trim();
  if (!line) return;
  stopSpeaking();
  setState("speaking");
  try {
    if (shouldUseGeminiTts()) {
      try {
        await speakWithGemini(line);
      } catch {
        await speakWithDevice(line);
      }
    } else {
      await speakWithDevice(line);
    }
  } finally {
    if (uiState === "speaking") setState("idle");
    maybeResumeWake();
    flushSpeakQueue();
  }
}

async function readNdjsonStream(response, onDelta) {
  const reader = response.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }
      if (obj.error) throw new Error(String(obj.error));
      const piece = obj.message && obj.message.content ? obj.message.content : "";
      if (piece) {
        full += piece;
        onDelta(full);
      }
    }
  }
  if (buf.trim()) {
    try {
      const obj = JSON.parse(buf);
      if (obj.error) throw new Error(String(obj.error));
      const piece = obj.message && obj.message.content ? obj.message.content : "";
      if (piece) {
        full += piece;
        onDelta(full);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        /* trailing fragment */
      } else {
        throw err;
      }
    }
  }
  return full;
}

async function readSseStream(response, onDelta) {
  const reader = response.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop();
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      let obj;
      try {
        obj = JSON.parse(data);
      } catch {
        continue;
      }
      const piece =
        obj.choices &&
        obj.choices[0] &&
        obj.choices[0].delta &&
        obj.choices[0].delta.content
          ? obj.choices[0].delta.content
          : "";
      if (piece) {
        full += piece;
        onDelta(full);
      }
    }
  }
  return full;
}


function geminiModelName() {
  return settings.geminiModel || DEFAULTS.geminiModel;
}

function geminiEndpoint(method, stream) {
  const url = GEMINI_API_ROOT + encodeURIComponent(geminiModelName()) + ":" + method;
  return stream ? url + "?alt=sse" : url;
}

function geminiHeaders() {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": settings.geminiKey,
  };
}

function toGeminiContents(messages) {
  const contents = [];
  (messages || []).forEach((m) => {
    if (!m || m.role === "system") return;
    const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
    const text = String(m.content || "");
    if (!text) return;
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += "\n" + text;
    } else {
      contents.push({ role: role, parts: [{ text: text }] });
    }
  });
  return contents;
}

function buildGeminiTextBody(messages) {
  return {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents: toGeminiContents(messages),
    generationConfig: { temperature: 0.7 },
  };
}

function buildGeminiAudioBody(base64, mimeType) {
  return {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents: toGeminiContents(conversation).concat([
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mimeType || "audio/mp4", data: base64 } },
          { text: audioJsonPrompt() },
        ],
      },
    ]),
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  };
}

function extractGeminiText(data) {
  if (!data) return "";
  if (data.error && data.error.message) {
    throw new Error(String(data.error.message));
  }
  const parts =
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts;
  if (!parts || !parts.length) {
    const reason =
      data.candidates && data.candidates[0] && data.candidates[0].finishReason;
    if (reason && /SAFETY|BLOCK/i.test(reason)) {
      throw new Error(t("errGeminiBlocked"));
    }
    return "";
  }
  return parts
    .map((p) => (p && p.text ? p.text : ""))
    .join("");
}

function parseHeardReply(text) {
  const raw = String(text || "").trim();
  if (!raw) return { heard: "", reply: "" };
  let s = raw;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const brace = s.match(/\{[\s\S]*\}/);
  if (brace) s = brace[0];
  try {
    const obj = JSON.parse(s);
    return {
      heard: String(obj.heard || obj.transcript || obj.text || "").trim(),
      reply: String(obj.reply || obj.response || obj.answer || "").trim(),
    };
  } catch {
    return { heard: "", reply: raw };
  }
}

function parseGeminiSseChunk(obj) {
  try {
    return extractGeminiText(obj) || "";
  } catch (err) {
    throw err;
  }
}

async function readGeminiSseStream(response, onDelta) {
  const reader = response.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop();
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let obj;
      try {
        obj = JSON.parse(data);
      } catch {
        continue;
      }
      const piece = parseGeminiSseChunk(obj);
      if (piece) {
        full += piece;
        onDelta(full);
      }
    }
  }
  if (buf.trim().startsWith("data:")) {
    try {
      const data = buf.trim().slice(5).trim();
      const piece = parseGeminiSseChunk(JSON.parse(data));
      if (piece) {
        full += piece;
        onDelta(full);
      }
    } catch {
      /* trailing fragment */
    }
  }
  return full;
}

function friendlyHttpError(kind, status, bodyText) {
  if (kind === "ollama") {
    if (status === 404) {
      return t("errOllamaMissing", { model: settings.ollamaModel });
    }
    return t("errOllamaStatus", { status: status });
  }
  const who = kind === "gemini" ? "Gemini" : "xAI";
  if (status === 400 && kind === "gemini") {
    let detail = "";
    try { detail = (JSON.parse(bodyText).error || {}).message || ""; } catch {}
    detail = String(detail).replace(/AIza[0-9A-Za-z_\-]+/g, "[key]").slice(0, 160);
    return t("errGemini400") + (detail ? t("errGemini400Detail", { detail: detail }) : t("errGemini400Retry"));
  }
  if (status === 401 || status === 403) {
    return t("errKeyRefused", { who: who });
  }
  if (status === 429) {
    return t("errRateLimit", { who: who });
  }
  if (status >= 500) return t("errServer", { who: who });
  return t("errModelFailed", { status: status });
}

async function chatGeminiText(messages, onDelta) {
  if (!settings.geminiKey) {
    throw new Error(t("errNeedGeminiKey"));
  }
  let res;
  try {
    res = await apiFetch(geminiEndpoint("streamGenerateContent", true), {
      method: "POST",
      headers: geminiHeaders(),
      body: JSON.stringify(buildGeminiTextBody(messages)),
    });
  } catch {
    throw new Error(t("errReachGemini"));
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(friendlyHttpError("gemini", res.status, errText));
  }
  return readGeminiSseStream(res, onDelta);
}

async function chatGeminiAudio(base64, mimeType) {
  if (!settings.geminiKey) {
    throw new Error(t("errNeedGeminiKey"));
  }
  let res;
  try {
    res = await apiFetch(geminiEndpoint("generateContent", false), {
      method: "POST",
      headers: geminiHeaders(),
      body: JSON.stringify(buildGeminiAudioBody(base64, mimeType)),
    });
  } catch {
    throw new Error(t("errReachGemini"));
  }
  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(friendlyHttpError("gemini", res.status, raw));
  }
  return extractGeminiText(data);
}

async function chatWithBackend(onDelta) {
  const messages = conversation.map((m) => ({ role: m.role, content: m.content }));
  if (settings.backend === "ollama") {
    const base = (settings.ollamaUrl || DEFAULTS.ollamaUrl).replace(/\/$/, "");
    let res;
    try {
      res = await apiFetch(base + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: settings.ollamaModel || DEFAULTS.ollamaModel,
          messages: messages,
          stream: true,
        }),
      });
    } catch {
      throw new Error(
        t("errReachOllama")
      );
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(friendlyHttpError("ollama", res.status, errText));
    }
    return readNdjsonStream(res, onDelta);
  }

  if (settings.backend === "gemini") {
    return chatGeminiText(messages, onDelta);
  }

  const key = settings.xaiKey;
  if (!key) {
    throw new Error(t("errNeedXaiKey"));
  }
  let res;
  try {
    res = await apiFetch(XAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({
        model: settings.xaiModel || DEFAULTS.xaiModel,
        messages: messages,
        stream: true,
        temperature: 0.7,
      }),
    });
  } catch {
    throw new Error(t("errReachXai"));
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(friendlyHttpError("xai", res.status, errText));
  }
  return readSseStream(res, onDelta);
}

function trimConversation() {
  const system = conversation[0];
  const rest = conversation.slice(1);
  const keep = 16;
  if (rest.length > keep) {
    conversation = [system].concat(rest.slice(-keep));
  }
}



const NTFY_ORIGIN = "https://ntfy.sh";
const REPLY_TOPIC_RE = /^jarvis-[a-z0-9]{24}$/;
const AWAITING_MS = 5 * 60 * 1000;

function generateReplyTopic() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (let i = 0; i < 24; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return "jarvis-" + suffix;
}

function readStoredReplyTopic() {
  try {
    return localStorage.getItem(STORAGE.replyTopic) || "";
  } catch {
    return "";
  }
}

function readStoredLastReplyId() {
  try {
    return localStorage.getItem(STORAGE.replyLastId) || "";
  } catch {
    return "";
  }
}

function persistReplyTopic(topic) {
  try {
    localStorage.setItem(STORAGE.replyTopic, topic);
  } catch {
    /* private mode */
  }
}

function persistLastReplyId(id) {
  lastReplyId = id || "";
  try {
    if (lastReplyId) localStorage.setItem(STORAGE.replyLastId, lastReplyId);
    else localStorage.removeItem(STORAGE.replyLastId);
  } catch {
    /* ignore */
  }
}

function ensureReplyTopic() {
  let topic = readStoredReplyTopic();
  if (!REPLY_TOPIC_RE.test(topic)) {
    topic = generateReplyTopic();
    persistReplyTopic(topic);
    persistLastReplyId("");
    seenReplyIds = new Set();
  }
  replyTopic = topic;
  if (!lastReplyId) lastReplyId = readStoredLastReplyId();
  return replyTopic;
}

function getReplyTopic() {
  return replyTopic || ensureReplyTopic();
}

function rotateReplyTopic() {
  const topic = generateReplyTopic();
  replyTopic = topic;
  persistReplyTopic(topic);
  seenReplyIds = new Set();
  persistLastReplyId("");
  hideAwaitingItJuht();
  syncReplyChannelUi();
  startReplyListener(true);
  return topic;
}

function ntfyAppDeepLink(topic) {
  return "ntfy://ntfy.sh/" + encodeURIComponent(topic);
}

function syncReplyChannelUi() {
  const topic = replyTopic || getReplyTopic();
  if (els.cfgReplyTopic) els.cfgReplyTopic.value = topic || "";
  if (els.btnNtfyNotify) {
    els.btnNtfyNotify.setAttribute("href", topic ? ntfyAppDeepLink(topic) : "ntfy://ntfy.sh/");
  }
}

function copyTextFallback(text) {
  const input = els.cfgReplyTopic;
  if (input && input.value === text) {
    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);
    const ok = document.execCommand("copy");
    if (typeof input.blur === "function") input.blur();
    if (ok) return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

async function copyReplyTopic() {
  const topic = getReplyTopic();
  if (!topic) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(topic);
      return true;
    }
  } catch {
    /* fall through to execCommand */
  }
  try {
    return copyTextFallback(topic);
  } catch {
    return false;
  }
}

async function onCopyReplyChannel() {
  const ok = await copyReplyTopic();
  if (!els.btnCopyReplyChannel) return ok;
  els.btnCopyReplyChannel.textContent = ok ? t("copied") : t("copyFailed");
  setTimeout(() => {
    if (els.btnCopyReplyChannel) els.btnCopyReplyChannel.textContent = t("copyChannel");
  }, 1600);
  return ok;
}

function onNtfyNotifyClick() {
  syncReplyChannelUi();
  copyReplyTopic();
}

function ntfySseUrl(topic, since) {
  let url = NTFY_ORIGIN + "/" + encodeURIComponent(topic) + "/sse";
  if (since) url += "?since=" + encodeURIComponent(since);
  return url;
}

function ntfyPollUrl(topic, since) {
  const marker = since || "10m";
  return NTFY_ORIGIN + "/" + encodeURIComponent(topic) + "/json?poll=1&since=" + encodeURIComponent(marker);
}

function showAwaitingItJuht() {
  if (els.awaitingItJuht) els.awaitingItJuht.hidden = false;
  if (awaitingTimer) clearTimeout(awaitingTimer);
  awaitingTimer = setTimeout(() => {
    awaitingTimer = null;
    hideAwaitingItJuht();
  }, AWAITING_MS);
}

function hideAwaitingItJuht() {
  if (awaitingTimer) {
    clearTimeout(awaitingTimer);
    awaitingTimer = null;
  }
  if (els.awaitingItJuht) els.awaitingItJuht.hidden = true;
}

function isSpeakBusy() {
  return !!(busy || drainingSpeakQueue || isSpeechPlaying() || uiState === "speaking");
}

function enqueueSpeak(text) {
  const line = String(text || "").trim();
  if (!line) return;
  speakQueue.push(line);
  flushSpeakQueue();
}

function flushSpeakQueue() {
  if (isSpeakBusy()) return;
  const next = speakQueue.shift();
  if (!next) return;
  drainingSpeakQueue = true;
  Promise.resolve(speak(next)).finally(() => {
    drainingSpeakQueue = false;
    flushSpeakQueue();
  });
}

function markReplySeen(id) {
  if (!id) return false;
  if (id === lastReplyId || seenReplyIds.has(id)) return false;
  seenReplyIds.add(id);
  persistLastReplyId(id);
  return true;
}

function presentItJuhtAnswer(text) {
  const line = String(text || "").trim();
  if (!line) return;
  hideAwaitingItJuht();
  addMessage("jarvis", line);
  conversation.push({ role: "assistant", content: line });
  trimConversation();
  setTranscript(line, false);
  unlockTTS();
  enqueueSpeak(line);
}

function handleNtfyPayload(data) {
  if (!data || data.event !== "message") return false;
  const id = data.id ? String(data.id) : "";
  if (id) {
    if (id === lastReplyId || seenReplyIds.has(id)) return false;
    if (!markReplySeen(id)) return false;
  }
  const text = data.message != null ? String(data.message) : "";
  if (!text.trim()) return false;
  presentItJuhtAnswer(text);
  return true;
}

function onNtfySseMessage(ev) {
  if (!ev || ev.data == null || ev.data === "") return;
  let data;
  try {
    data = JSON.parse(ev.data);
  } catch {
    return;
  }
  handleNtfyPayload(data);
}

function stopReplyListener() {
  if (replyReconnectTimer) {
    clearTimeout(replyReconnectTimer);
    replyReconnectTimer = null;
  }
  if (replySource) {
    try {
      replySource.onerror = null;
      replySource.onmessage = null;
      replySource.removeEventListener("message", onNtfySseMessage);
      replySource.close();
    } catch {
      /* already closed */
    }
    replySource = null;
  }
}

function scheduleReplyReconnect() {
  if (replyReconnectTimer) return;
  replyReconnectTimer = setTimeout(() => {
    replyReconnectTimer = null;
    startReplyListener(false);
  }, 3000);
}

function startReplyListener(forceRestart) {
  const topic = getReplyTopic();
  if (!topic || typeof EventSource !== "function") return;
  if (
    !forceRestart &&
    replySource &&
    replySource._topic === topic &&
    replySource.readyState !== EventSource.CLOSED
  ) {
    return;
  }
  stopReplyListener();
  try {
    const es = new EventSource(ntfySseUrl(topic, lastReplyId || ""));
    es._topic = topic;
    es.addEventListener("message", onNtfySseMessage);
    es.onerror = () => {
      if (!replySource || replySource !== es) return;
      if (es.readyState === EventSource.CLOSED) scheduleReplyReconnect();
    };
    replySource = es;
  } catch {
    scheduleReplyReconnect();
  }
}

async function pollMissedReplies() {
  const topic = getReplyTopic();
  if (!topic) return;
  const since = lastReplyId || "10m";
  let res;
  try {
    res = await apiFetch(ntfyPollUrl(topic, since));
  } catch {
    return;
  }
  if (!res || !res.ok) return;
  const raw = await res.text();
  const lines = String(raw || "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let data;
    try {
      data = JSON.parse(line);
    } catch {
      continue;
    }
    handleNtfyPayload(data);
  }
}

function onReplyVisibilityChange() {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return;
  startReplyListener(false);
  pollMissedReplies();
}

function normalizeBridgeAuth(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/\s/.test(v) || /^(Bearer|Basic|Token|Digest)\b/i.test(v)) return v;
  return "Bearer " + v;
}

function isBridgeConfigured() {
  const url = (settings.bridgeUrl || "").trim();
  const auth = normalizeBridgeAuth(settings.bridgeAuth);
  return !!(url && auth);
}

function shortUserAgent() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "unknown";
  if (ua.length <= 160) return ua;
  return ua.slice(0, 157) + "...";
}

const BRIDGE_PREFIXES = [
  /^\s*tell\s+it\s+juht\b[,:.]?\s*/i,
  /^\s*it\s+juht\b[,:.]?\s*/i,
  /^\s*agent\b[,:.]?\s*/i,
  /^\s*task\b[,:.]?\s*/i,
  /^\s*(?:hey |ok |okay |hi )?jarvis[,:.]?\s*do\b[,:.]?\s*/i,
];

const BRIDGE_PREFIXES_ET = [
  /^\s*(?:ütle\s+)?it\s+juht\b[,:.]?\s*/i,
  /^\s*ülesanne\b[,:.]?\s*/i,
  /^\s*küsi\b[,:.]?\s*/i,
  /^\s*(?:(?:hei|hey|ok|okei|tere|hi)\s+)?(?:d[zž]|j)arvis(?:e|t)?[,:.]?\s*(?:tee|teeks)\b[,:.]?\s*/i,
];

const BRIDGE_AUTO_RE =
  /\b(?:emails?|mails?|inbox|calendars?|meetings?|schedule|remind(?:ers?|s)?|weather|forecast)\b|\bsearch the web\b|\blook up\b|\brun\b|\bscripts?\b|\bservers?\b|\bcheck my\b/i;

const BRIDGE_AUTO_RE_ET =
  /\b(?:kirjad?|meilid?|e-?kirjad?|postkast|kalender|kohtumine|koosolek|meeldetuletus|ilm|ilmaennustus)\b|\botsi(?:\s+üles|\s+veebist)?\b|\bkäivita\b|\bskriptid?\b|\bserverid?\b|\bkontrolli mu\b|\bmehaanik(?:u|ut)?\b|\bjurist(?:i|i)?\b/i;

function matchesBridgePrefix(text) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return false;
  const stripped = stripWake(raw);
  const list = BRIDGE_PREFIXES.concat(isEt() ? BRIDGE_PREFIXES_ET : []);
  for (let i = 0; i < list.length; i++) {
    if (list[i].test(raw) || list[i].test(stripped)) return true;
  }
  return false;
}

function isActionRequest(text, autoOverride) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return false;
  if (matchesBridgePrefix(raw)) return true;
  const autoOn = autoOverride === undefined ? !!settings.bridgeAuto : !!autoOverride;
  if (!autoOn) return false;
  const probe = stripWake(raw);
  if (BRIDGE_AUTO_RE.test(probe)) return true;
  if (isEt() && BRIDGE_AUTO_RE_ET.test(probe)) return true;
  return false;
}

function shouldSendToBridge(text, options) {
  const opts = options || {};
  if (opts.forceBridge) return true;
  return isBridgeConfigured() && isActionRequest(text);
}

async function sendBridgeTask(text) {
  const url = (settings.bridgeUrl || "").trim();
  const auth = normalizeBridgeAuth(settings.bridgeAuth);
  if (!url || !auth) {
    throw new Error(
      t("bridgeNotConfigured")
    );
  }
  const payload = {
    command: text,
    source: "jarvis-web",
    device: shortUserAgent(),
    time: new Date().toISOString(),
    reply_to: getReplyTopic(),
    lang: currentLang(),
  };
  let res;
  try {
    res = await apiFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(t("bridgeUnreachable"));
  }
  if (res && res.ok) {
    showAwaitingItJuht();
    return t("bridgeSent");
  }
  const status = res && res.status;
  let msg = t("bridgeUnreachable");
  if (status) {
    msg += t("bridgeStatus", { status: status });
    if (status === 401 || status === 403) {
      msg += t("bridgeAuthHint");
    }
  }
  throw new Error(msg);
}

async function handleUserText(raw, options) {
  const opts = options || {};
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (!text || busy) return;
  busy = true;
  stopSpeaking();
  stopClickRecognition();
  pauseWake();

  addMessage("user", text);
  conversation.push({ role: "user", content: text });
  trimConversation();
  setTranscript(text, false);

  try {
    if (shouldSendToBridge(text, opts)) {
      setState("thinking");
      const reply = await sendBridgeTask(text);
      conversation.push({ role: "assistant", content: reply });
      addMessage("jarvis", reply);
      setTranscript(reply, false);
      if (!opts.silent) await speak(reply);
      else setState("idle");
      return;
    }

    const skill = matchSkill(text);
    if (skill) {
      setState("thinking");
      const reply = await runSkill(skill);
      conversation.push({ role: "assistant", content: reply });
      addMessage("jarvis", reply);
      setTranscript(reply, false);
      if (!opts.silent) await speak(reply);
      else setState("idle");
      return;
    }

    setState("thinking");
    const node = addMessage("jarvis", "", { streaming: true });
    let reply = "";
    try {
      reply = (await chatWithBackend((full) => {
        reply = full;
        updateMessage(node, full, false);
      })).trim();
    } finally {
      updateMessage(node, reply || "…", true);
    }
    if (!reply) {
      reply = t("emptyModelReply");
      updateMessage(node, reply, true);
    }
    conversation.push({ role: "assistant", content: reply });
    setTranscript(reply, false);
    if (!opts.silent) await speak(reply);
    else setState("idle");
  } catch (err) {
    const msg = err && err.message ? err.message : t("genericError");
    addMessage("jarvis", msg, { error: true });
    conversation.push({ role: "assistant", content: msg });
    setTranscript(msg, false);
    if (!opts.silent) await speak(msg);
    else setState("idle");
  } finally {
    busy = false;
    if (uiState === "thinking") setState("idle");
    maybeResumeWake();
    flushSpeakQueue();
  }
}

function speechSupported() {
  return typeof SpeechRecognitionAPI === "function";
}

function newRecognizer(continuous) {
  const rec = new SpeechRecognitionAPI();
  rec.lang = recognitionLang();
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.continuous = !!continuous;
  return rec;
}

function transcriptFromEvent(event) {
  let interim = "";
  let finalText = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const res = event.results[i];
    const piece = res[0] && res[0].transcript ? res[0].transcript : "";
    if (res.isFinal) finalText += piece + " ";
    else interim += piece + " ";
  }
  return { finalText: finalText.trim(), interim: interim.trim() };
}

function stopClickRecognition() {
  clickListening = false;
  els.btnMic.setAttribute("aria-pressed", "false");
  els.btnMic.classList.remove("hot");
  if (clickRecognition) {
    try {
      clickRecognition.onresult = null;
      clickRecognition.onend = null;
      clickRecognition.onerror = null;
      clickRecognition.stop();
    } catch {
      /* already ended */
    }
    clickRecognition = null;
  }
}

function startPushToTalk(fromSpace) {
  unlockTTS();
  if (!speechSupported() || busy) return;
  if (clickListening) return;
  stopSpeaking();
  pauseWake();
  let collected = "";
  try {
    clickRecognition = newRecognizer(!!fromSpace);
  } catch {
    setTranscript(t("micStartFail"), false);
    return;
  }
  clickListening = true;
  els.btnMic.setAttribute("aria-pressed", "true");
  els.btnMic.classList.add("hot");
  setState("listening");
  setTranscript(t("listeningEllipsis"), true);

  clickRecognition.onresult = (event) => {
    const t = transcriptFromEvent(event);
    if (t.finalText) collected = (collected + " " + t.finalText).trim();
    const live = (collected + " " + t.interim).trim();
    if (live) setTranscript(live, !t.finalText || !!t.interim);
  };
  clickRecognition.onerror = (event) => {
    const err = event && event.error;
    if (err === "not-allowed") {
      setTranscript(t("micBlockedLong"), false);
      els.statMic.textContent = t("micBlocked");
    } else if (err === "no-speech") {
      setTranscript(t("noSpeech"), false);
    } else if (err && err !== "aborted") {
      setTranscript(t("speechProblem"), false);
    }
  };
  clickRecognition.onend = () => {
    const said = collected.trim();
    const was = clickListening;
    clickListening = false;
    els.btnMic.setAttribute("aria-pressed", "false");
    els.btnMic.classList.remove("hot");
    clickRecognition = null;
    if (uiState === "listening") setState("idle");
    if (was && said) {
      handleUserText(said);
    } else if (was) {
      setTranscript(t("waiting"), false);
      maybeResumeWake();
    }
  };
  try {
    clickRecognition.start();
  } catch {
    stopClickRecognition();
    maybeResumeWake();
  }
}

function pickRecorderMime() {
  if (!window.MediaRecorder) return "";
  const types = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  for (let i = 0; i < types.length; i++) {
    try {
      if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    } catch {
      /* ignore */
    }
  }
  return "";
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function startSilenceWatch(stream, onSilent) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return function () {};
  let ctx;
  try {
    ctx = new AC();
    if (ctx.resume) ctx.resume();
  } catch {
    return function () {};
  }
  let src;
  try {
    src = ctx.createMediaStreamSource(stream);
  } catch {
    try { ctx.close(); } catch { /* ignore */ }
    return function () {};
  }
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  src.connect(analyser);
  const data = new Uint8Array(analyser.fftSize);
  let heardSpeech = false;
  let silentMs = 0;
  const iv = setInterval(() => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    if (rms > 0.045) {
      heardSpeech = true;
      silentMs = 0;
    } else if (heardSpeech) {
      silentMs += 100;
      if (silentMs >= 1600) {
        onSilent();
      }
    }
  }, 100);
  return function () {
    clearInterval(iv);
    try { src.disconnect(); } catch { /* ignore */ }
    try { ctx.close(); } catch { /* ignore */ }
  };
}

function setMicHot(on) {
  els.btnMic.setAttribute("aria-pressed", on ? "true" : "false");
  els.btnMic.classList.toggle("hot", !!on);
}

function cleanupRecording() {
  recording = false;
  setMicHot(false);
  if (recMaxTimer) {
    clearTimeout(recMaxTimer);
    recMaxTimer = null;
  }
  if (stopSilenceWatch) {
    try { stopSilenceWatch(); } catch { /* ignore */ }
    stopSilenceWatch = null;
  }
  if (mediaRecorder) {
    try {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    } catch {
      /* ignore */
    }
    mediaRecorder = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((tr) => {
      try { tr.stop(); } catch { /* ignore */ }
    });
    mediaStream = null;
  }
}

async function blobToWav16k(blob) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error("no AudioContext");
  const ctx = new AC();
  let decoded;
  try {
    const buf = await blob.arrayBuffer();
    decoded = await new Promise((res, rej) => {
      const pr = ctx.decodeAudioData(buf, res, rej);
      if (pr && pr.then) pr.then(res, rej);
    });
  } finally {
    try { ctx.close(); } catch {}
  }
  const rate = 16000;
  const len = Math.max(1, Math.ceil(decoded.duration * rate));
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new OAC(1, len, rate);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start(0);
  const out = await off.startRendering();
  const data = out.getChannelData(0);
  const ab = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(ab);
  const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + data.length * 2, true); w(8, "WAVE");
  w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    const x = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return new Blob([ab], { type: "audio/wav" });
}

async function handleAudioBlob(blob, mime, options) {
  const opts = options || {};
  if (!blob || blob.size < 200) {
    setTranscript(t("noAudio"), false);
    return;
  }
  if (busy) return;
  busy = true;
  stopSpeaking();
  pauseWake();
  setState("thinking");
  setTranscript(isEt() ? "Töötlen salvestust…" : "Processing the recording, sir…", true);
  try {
    let sendBlob = blob;
    let sendMime = String(mime || blob.type || "audio/mp4").split(";")[0].trim();
    try {
      sendBlob = await blobToWav16k(blob);
      sendMime = "audio/wav";
    } catch (e) {
      console.warn("WAV conversion failed, sending original audio", e);
      if (sendMime === "audio/mp4" || sendMime === "audio/x-m4a") sendMime = "audio/aac";
    }
    const b64 = await blobToBase64(sendBlob);
    const raw = await chatGeminiAudio(b64, sendMime);
    const parsed = parseHeardReply(raw);
    const heard = parsed.heard;
    if (!heard) {
      const reply = parsed.reply || t("audioUnclear");
      addMessage("jarvis", reply);
      setTranscript(reply, false);
      if (!opts.silent) await speak(reply);
      else setState("idle");
      return;
    }
    addMessage("user", heard);
    conversation.push({ role: "user", content: heard });
    trimConversation();
    setTranscript(heard, false);
    const skill = matchSkill(heard);
    let reply;
    if (skill) {
      reply = await runSkill(skill);
    } else {
      reply = parsed.reply || (isEt() ? "Ma kuulsin teid, aga mul pole midagi lisada." : "I heard you, sir, but I have nothing to add.");
    }
    conversation.push({ role: "assistant", content: reply });
    addMessage("jarvis", reply);
    setTranscript(reply, false);
    if (!opts.silent) await speak(reply);
    else setState("idle");
  } catch (err) {
    const msg = err && err.message ? err.message : t("audioProcessFail");
    addMessage("jarvis", msg, { error: true });
    setTranscript(msg, false);
    if (!opts.silent) await speak(msg);
    else setState("idle");
  } finally {
    busy = false;
    if (uiState === "thinking") setState("idle");
    maybeResumeWake();
    flushSpeakQueue();
  }
}

async function startAudioRecording() {
  if (recording || busy) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setTranscript(t("noRecorder"), false);
    return;
  }
  if (!settings.geminiKey) {
    setTranscript(t("voiceNeedsKey"), false);
    openSettings();
    return;
  }
  unlockTTS();
  stopSpeaking();
  pauseWake();
  mediaChunks = [];
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    els.statMic.textContent = t("micBlocked");
    setTranscript(t("micBlockedPage"), false);
    return;
  }
  const mime = pickRecorderMime();
  try {
    mediaRecorder = mime ? new MediaRecorder(mediaStream, { mimeType: mime }) : new MediaRecorder(mediaStream);
  } catch {
    cleanupRecording();
    setTranscript(t("recorderStartFail"), false);
    return;
  }
  const usedMime = mediaRecorder.mimeType || mime || "audio/mp4";
  mediaRecorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size) mediaChunks.push(ev.data);
  };
  mediaRecorder.onerror = () => {
    cleanupRecording();
    setTranscript(t("recorderProblem"), false);
  };
  mediaRecorder.onstop = () => {
    if (recMaxTimer) {
      clearTimeout(recMaxTimer);
      recMaxTimer = null;
    }
    const blob = new Blob(mediaChunks, { type: usedMime });
    mediaChunks = [];
    const stream = mediaStream;
    mediaStream = null;
    mediaRecorder = null;
    recording = false;
    setMicHot(false);
    if (stopSilenceWatch) {
      try { stopSilenceWatch(); } catch { /* ignore */ }
      stopSilenceWatch = null;
    }
    if (stream) stream.getTracks().forEach((tr) => { try { tr.stop(); } catch { /* ignore */ } });
    if (uiState === "listening") setState("idle");
    handleAudioBlob(blob, usedMime);
  };
  recording = true;
  setMicHot(true);
  setState("listening");
  setTranscript("Listening… tap the microphone again when you have finished.", true);
  try {
    mediaRecorder.start();
  } catch {
    cleanupRecording();
    setTranscript(t("recorderStartShort"), false);
    return;
  }
  stopSilenceWatch = startSilenceWatch(mediaStream, () => {
    if (recording) stopAudioRecording();
  });
  if (recMaxTimer) clearTimeout(recMaxTimer);
  recMaxTimer = setTimeout(() => {
    recMaxTimer = null;
    if (recording) stopAudioRecording();
  }, 25000);
}

function stopAudioRecording() {
  if (!recording || !mediaRecorder) {
    cleanupRecording();
    return;
  }
  try {
    if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
  } catch {
    cleanupRecording();
  }
}

function toggleMic() {
  unlockTTS();
  if (usesGeminiAudio()) {
    if (recording) stopAudioRecording();
    else startAudioRecording();
    return;
  }
  if (clickListening) {
    if (clickRecognition) {
      try {
        clickRecognition.stop();
      } catch {
        stopClickRecognition();
      }
    }
    return;
  }
  startPushToTalk(false);
}

function extractWakeCommand(text) {
  const raw = String(text || "").trim();
  if (!raw) return { woke: false, command: "" };
  const name = wakeNamePattern();
  const lead = "(?:.*\\b)?(?:(?:hey|ok|okay|hi|hei|okei|tere)\\s+)?";
  const m = raw.match(new RegExp("^" + lead + name + "(?:[,:.]\\s*|\\s+)(.*)$", "i"));
  if (m) return { woke: true, command: (m[1] || "").trim() };
  if (new RegExp("^(?:(?:hey|ok|okay|hi|hei|okei|tere)\\s+)?" + name + "[.!?]*$", "i").test(raw)) {
    return { woke: true, command: "" };
  }
  return { woke: false, command: "" };
}

function pauseWake() {
  if (!wakeRecognition) return;
  try {
    wakeRecognition.onend = null;
    wakeRecognition.stop();
  } catch {
    /* ignore */
  }
  wakeRecognition = null;
}

function maybeResumeWake() {
  if (!settings.wakeWord || usesGeminiAudio() || busy || holdingSpace || clickListening || recording || isSpeechPlaying()) return;
  startWakeWord();
}

function startWakeWord() {
  if (!settings.wakeWord || !speechSupported()) return;
  if (wakeRecognition || busy || clickListening || holdingSpace) return;
  try {
    wakeRecognition = newRecognizer(true);
  } catch {
    return;
  }
  let pending = "";
  wakeRecognition.onresult = (event) => {
    const t = transcriptFromEvent(event);
    const live = (t.finalText || t.interim).trim();
    if (live) setTranscript(live, !t.finalText);
    const chunk = (t.finalText || "").trim();
    if (!chunk) return;
    if (wakeArmedForCommand) {
      wakeArmedForCommand = false;
      pending = "";
      pauseWake();
      handleUserText(chunk);
      return;
    }
    const hit = extractWakeCommand(chunk);
    if (!hit.woke) {
      pending = "";
      return;
    }
    if (hit.command) {
      pauseWake();
      handleUserText(hit.command);
    } else {
      wakeArmedForCommand = true;
      setState("listening");
      setTranscript(t("yesSir"), false);
    }
  };
  wakeRecognition.onerror = (event) => {
    if (event && event.error === "not-allowed") {
      els.statMic.textContent = t("micBlocked");
      settings.wakeWord = false;
      saveSettings();
      refreshStats();
      fillSettingsForm();
    }
  };
  wakeRecognition.onend = () => {
    wakeRecognition = null;
    if (settings.wakeWord && !busy && !clickListening && !holdingSpace && !isSpeechPlaying()) {
      setTimeout(startWakeWord, 250);
    }
  };
  try {
    wakeRecognition.start();
  } catch {
    wakeRecognition = null;
  }
}

function greetingText() {
  const h = new Date().getHours();
  if (h < 12) return t("greetingMorning");
  if (h < 18) return t("greetingAfternoon");
  return t("greetingEvening");
}

function applyCompatNote() {
  const bits = [];
  const host = location.hostname;
  const secure =
    location.protocol === "https:" || host === "localhost" || host === "127.0.0.1";
  if (!secure) {
    bits.push(t("compatInsecure"));
    els.statMic.textContent = t("micNeedsHttps");
  } else if (usesGeminiAudio()) {
    els.statMic.textContent = settings.geminiKey ? t("micReadyGemini") : t("micNeedsKey");
    if (!settings.geminiKey) {
      bits.push(t("compatNeedKey"));
    } else {
      bits.push(t("compatGeminiHow"));
    }
  } else if (!speechSupported()) {
    bits.push(t("compatNoSpeech"));
    els.statMic.textContent = t("micUnavailable");
  } else {
    els.statMic.textContent = t("micReadyBrowser");
  }
  if (isIOS()) {
    bits.push(t("compatIos"));
  }
  const hint = maybeTtsHint();
  if (hint) bits.push(hint);
  els.compatNote.textContent = bits.join(" ");
  if (els.dockHint) {
    els.dockHint.innerHTML = usesGeminiAudio() ? t("dockHintMic") : t("dockHintSpace");
  }
  if (els.textInput) {
    els.textInput.placeholder = usesGeminiAudio() ? t("placeholderMic") : t("placeholderType");
  }
}

function showFieldGroups(backend) {
  if (els.xaiFields) els.xaiFields.hidden = backend !== "xai";
  if (els.ollamaFields) els.ollamaFields.hidden = backend !== "ollama";
  if (els.geminiFields) els.geminiFields.hidden = backend !== "gemini";
}

function closeDrawers() {
  document.body.classList.remove("show-log", "show-sys");
  if (els.drawerBackdrop) els.drawerBackdrop.hidden = true;
}

function toggleDrawer(kind) {
  const cls = kind === "sys" ? "show-sys" : "show-log";
  const open = !document.body.classList.contains(cls);
  closeDrawers();
  if (open) {
    document.body.classList.add(cls);
    if (els.drawerBackdrop) els.drawerBackdrop.hidden = false;
  }
}

function fillSettingsForm() {
  const radio = document.querySelector('input[name="backend"][value="' + settings.backend + '"]');
  if (radio) radio.checked = true;
  els.cfgOllamaUrl.value = settings.ollamaUrl;
  els.cfgOllamaModel.value = settings.ollamaModel;
  els.cfgXaiModel.value = settings.xaiModel;
  els.cfgXaiKey.value = settings.xaiKey;
  if (els.cfgGeminiModel) els.cfgGeminiModel.value = settings.geminiModel;
  if (els.cfgGeminiKey) els.cfgGeminiKey.value = settings.geminiKey;
  const langRadio = document.querySelector('input[name="uiLang"][value="' + (settings.lang === "en" ? "en" : "et") + '"]');
  if (langRadio) langRadio.checked = true;
  if (els.cfgVoiceEngine) els.cfgVoiceEngine.value = settings.voiceEngine || "auto";
  if (els.cfgGeminiVoice) els.cfgGeminiVoice.value = currentGeminiVoice();
  if (els.cfgRecognition) els.cfgRecognition.value = settings.recognition || "auto";
  if (els.cfgBridgeUrl) els.cfgBridgeUrl.value = settings.bridgeUrl || "";
  if (els.cfgBridgeAuth) els.cfgBridgeAuth.value = settings.bridgeAuth || "";
  if (els.cfgBridgeAuto) els.cfgBridgeAuto.checked = settings.bridgeAuto !== false;
  syncReplyChannelUi();
  els.cfgWake.checked = settings.wakeWord;
  showFieldGroups(settings.backend);
  fillVoiceSelect();
  if (settings.voiceURI) els.cfgVoice.value = settings.voiceURI;
}

function openSettings() {
  fillSettingsForm();
  els.settingsModal.hidden = false;
  els.btnCloseSettings.focus();
}

function closeSettings() {
  els.settingsModal.hidden = true;
}

function readSettingsForm() {
  const backendEl = document.querySelector('input[name="backend"]:checked');
  const backend = backendEl ? backendEl.value : "ollama";
  if (backend === "xai" || backend === "gemini" || backend === "ollama") settings.backend = backend;
  else settings.backend = "ollama";
  settings.ollamaUrl = els.cfgOllamaUrl.value.trim() || DEFAULTS.ollamaUrl;
  settings.ollamaModel = els.cfgOllamaModel.value.trim() || DEFAULTS.ollamaModel;
  settings.xaiModel = els.cfgXaiModel.value.trim() || DEFAULTS.xaiModel;
  settings.xaiKey = els.cfgXaiKey.value.trim();
  settings.geminiModel = (els.cfgGeminiModel && els.cfgGeminiModel.value.trim()) || DEFAULTS.geminiModel;
  settings.geminiKey = (els.cfgGeminiKey && els.cfgGeminiKey.value.trim()) || "";
  if (settings.geminiKey && !backendEl) settings.backend = "gemini";
  settings.voiceURI = els.cfgVoice.value || "";
  settings.recognition = (els.cfgRecognition && els.cfgRecognition.value) || "auto";
  const langEl = document.querySelector('input[name="uiLang"]:checked');
  settings.lang = langEl && langEl.value === "en" ? "en" : "et";
  const ve = els.cfgVoiceEngine && els.cfgVoiceEngine.value;
  settings.voiceEngine = ve === "device" || ve === "gemini" ? ve : "auto";
  settings.geminiVoice = normalizeGeminiVoice(els.cfgGeminiVoice && els.cfgGeminiVoice.value);
  settings.bridgeUrl = (els.cfgBridgeUrl && els.cfgBridgeUrl.value.trim()) || "";
  settings.bridgeAuth = normalizeBridgeAuth((els.cfgBridgeAuth && els.cfgBridgeAuth.value) || "");
  settings.bridgeAuto = !(els.cfgBridgeAuto) || els.cfgBridgeAuto.checked;
  const wantWake = els.cfgWake.checked;
  if (wantWake && (usesGeminiAudio() || !speechSupported())) {
    settings.wakeWord = false;
    els.cfgWake.checked = false;
  } else {
    settings.wakeWord = wantWake;
  }
  saveSettings();
  applyLanguage();
  if (settings.wakeWord && !usesGeminiAudio()) startWakeWord();
  else {
    wakeArmedForCommand = false;
    pauseWake();
  }
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

function bindEvents() {
  const unlockOnGesture = () => unlockTTS();
  document.addEventListener("pointerdown", unlockOnGesture, { passive: true });
  document.addEventListener("touchstart", unlockOnGesture, { passive: true });
  document.addEventListener("click", unlockOnGesture);

  els.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    unlockTTS();
    const text = els.textInput.value;
    els.textInput.value = "";
    handleUserText(text);
  });
  if (els.btnTask) {
    els.btnTask.addEventListener("click", (e) => {
      e.preventDefault();
      unlockTTS();
      const text = els.textInput.value;
      els.textInput.value = "";
      handleUserText(text, { forceBridge: true });
    });
  }
  els.btnMic.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMic();
  });
  els.btnSettings.addEventListener("click", openSettings);
  if (els.btnNewReplyChannel) {
    els.btnNewReplyChannel.addEventListener("click", (e) => {
      e.preventDefault();
      rotateReplyTopic();
    });
  }
  if (els.btnCopyReplyChannel) {
    els.btnCopyReplyChannel.addEventListener("click", (e) => {
      e.preventDefault();
      onCopyReplyChannel();
    });
  }
  if (els.btnNtfyNotify) {
    els.btnNtfyNotify.addEventListener("click", () => {
      onNtfyNotifyClick();
    });
  }
  document.addEventListener("visibilitychange", onReplyVisibilityChange);
  els.btnCloseSettings.addEventListener("click", closeSettings);
  els.settingsModal.addEventListener("click", (e) => {
    if (e.target === els.settingsModal) closeSettings();
  });
  els.settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    readSettingsForm();
    closeSettings();
  });
  document.querySelectorAll('input[name="backend"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const v = document.querySelector('input[name="backend"]:checked').value;
      showFieldGroups(v);
    });
  });
  document.querySelectorAll('input[name="uiLang"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const v = document.querySelector('input[name="uiLang"]:checked');
      settings.lang = v && v.value === "en" ? "en" : "et";
      saveSettings();
      applyLanguage();
    });
  });
  if (els.cfgVoiceEngine) {
    els.cfgVoiceEngine.addEventListener("change", () => {
      const ve = els.cfgVoiceEngine.value;
      settings.voiceEngine = ve === "device" || ve === "gemini" ? ve : "auto";
      saveSettings();
      refreshStats();
      applyCompatNote();
    });
  }
  if (els.cfgGeminiVoice) {
    els.cfgGeminiVoice.addEventListener("change", () => {
      settings.geminiVoice = normalizeGeminiVoice(els.cfgGeminiVoice.value);
      saveSettings();
      refreshStats();
    });
  }
  if (els.cfgGeminiKey) {
    els.cfgGeminiKey.addEventListener("input", () => {
      if (els.cfgGeminiKey.value.trim()) {
        const radio = document.querySelector('input[name="backend"][value="gemini"]');
        if (radio) radio.checked = true;
        showFieldGroups("gemini");
      }
    });
  }
  els.btnTestVoice.addEventListener("click", () => {
    unlockTTS();
    settings.voiceURI = els.cfgVoice.value || "";
    if (els.cfgGeminiVoice) settings.geminiVoice = normalizeGeminiVoice(els.cfgGeminiVoice.value);
    speak(t("testVoiceLine"));
  });
  els.btnClearLog.addEventListener("click", () => {
    conversation = [{ role: "system", content: systemPrompt() }];
    els.log.innerHTML = "";
    els.logCount.textContent = "00";
    setTranscript(t("logCleared"), false);
  });
  els.cfgVoice.addEventListener("change", () => {
    settings.voiceURI = els.cfgVoice.value || "";
    refreshStats();
  });

  if (els.btnToggleLog) els.btnToggleLog.addEventListener("click", () => toggleDrawer("log"));
  if (els.btnToggleSys) els.btnToggleSys.addEventListener("click", () => toggleDrawer("sys"));
  if (els.btnCloseLog) els.btnCloseLog.addEventListener("click", closeDrawers);
  if (els.btnCloseSys) els.btnCloseSys.addEventListener("click", closeDrawers);
  if (els.drawerBackdrop) els.drawerBackdrop.addEventListener("click", closeDrawers);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.settingsModal.hidden) {
        closeSettings();
        return;
      }
      if (document.body.classList.contains("show-log") || document.body.classList.contains("show-sys")) {
        closeDrawers();
        return;
      }
    }
    if (e.code !== "Space" && e.key !== " ") return;
    if (isTypingTarget(e.target) || !els.settingsModal.hidden) return;
    if (e.repeat) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    holdingSpace = true;
    unlockTTS();
    if (usesGeminiAudio()) {
      if (!recording) startAudioRecording();
    } else {
      startPushToTalk(true);
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (!holdingSpace) return;
    holdingSpace = false;
    if (usesGeminiAudio()) {
      if (recording) stopAudioRecording();
      return;
    }
    if (clickRecognition) {
      try {
        clickRecognition.stop();
      } catch {
        stopClickRecognition();
      }
    }
  });
  window.addEventListener("blur", () => {
    if (holdingSpace) {
      holdingSpace = false;
      if (recording) stopAudioRecording();
      if (clickRecognition) {
        try {
          clickRecognition.stop();
        } catch {
          stopClickRecognition();
        }
      }
    }
  });

  if (window.speechSynthesis) {
    speechSynthesis.addEventListener("voiceschanged", fillVoiceSelect);
  }
}

function cacheEls() {
  const ids = [
    "clockTime",
    "clockDate",
    "sysPill",
    "sysLabel",
    "reactor",
    "eq",
    "stateLabel",
    "transcript",
    "log",
    "logCount",
    "statState",
    "statBackend",
    "statModel",
    "statVoice",
    "statMic",
    "statWake",
    "compatNote",
    "chatForm",
    "textInput",
    "btnSend",
    "btnTask",
    "btnMic",
    "btnSettings",
    "settingsModal",
    "btnCloseSettings",
    "settingsForm",
    "ollamaFields",
    "xaiFields",
    "cfgOllamaUrl",
    "cfgOllamaModel",
    "cfgXaiModel",
    "cfgXaiKey",
    "geminiFields",
    "cfgGeminiModel",
    "cfgGeminiKey",
    "cfgVoice",
    "cfgVoiceEngine",
    "cfgGeminiVoice",
    "cfgRecognition",
    "cfgBridgeUrl",
    "cfgBridgeAuth",
    "cfgBridgeAuto",
    "cfgReplyTopic",
    "btnNewReplyChannel",
    "btnCopyReplyChannel",
    "btnNtfyNotify",
    "awaitingItJuht",
    "cfgWake",
    "btnTestVoice",
    "btnClearLog",
    "statRecognition",
    "dockHint",
    "btnToggleLog",
    "btnToggleSys",
    "btnCloseLog",
    "btnCloseSys",
    "drawerBackdrop",
  ];
  ids.forEach((id) => {
    els[id] = $(id);
  });
}

function boot() {
  cacheEls();
  ensureReplyTopic();
  lastReplyId = readStoredLastReplyId();
  syncReplyChannelUi();
  startReplyListener(false);
  pollMissedReplies();
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("animateTransform").forEach((node) => node.remove());
  }
  updateClock();
  setInterval(updateClock, 1000);
  setState("idle");
  applyCompatNote();
  applyI18n();
  fillVoiceSelect();
  refreshStats();
  bindEvents();

  const hello = greetingText();
  addMessage("jarvis", hello);
  conversation.push({ role: "assistant", content: hello });
  setTranscript(hello, false);
  els.sysPill.classList.add("online");
  els.sysLabel.textContent = "ONLINE";

  let greeted = false;
  const markGreeted = () => {
    greeted = true;
    document.removeEventListener("click", speakHello);
    document.removeEventListener("keydown", speakHello);
  };
  function speakHello() {
    if (greeted || busy) return;
    unlockTTS();
    markGreeted();
    if (uiState === "idle") speak(hello);
  }
  if (window.speechSynthesis) {
    if (!isIOS()) {
      speak(hello).then(() => {
        if (currentUtterance || uiState === "speaking") markGreeted();
      });
    }
    document.addEventListener("click", speakHello);
    document.addEventListener("keydown", speakHello);
  }

  if (settings.wakeWord) startWakeWord();
}

document.addEventListener("DOMContentLoaded", boot);

window.Jarvis = {
  submit: (text, opts) => handleUserText(text, opts || { silent: true }),
  submitAudio: (blob, mime, opts) => handleAudioBlob(blob, mime, opts || { silent: true }),
  getState: () => uiState,
  getLogText: () =>
    Array.from(document.querySelectorAll("#log .msg-body"))
      .map((n) => n.textContent)
      .join("\n"),
  getSettings: () => {
    const copy = { ...settings };
    copy.xaiKey = copy.xaiKey ? "(set)" : "";
    copy.geminiKey = copy.geminiKey ? "(set)" : "";
    copy.bridgeAuth = copy.bridgeAuth ? "(set)" : "";
    return copy;
  },
  setSetting: (key, value) => {
    if (key === "xaiKey" || key === "geminiKey" || key === "bridgeAuth") return;
    if (Object.prototype.hasOwnProperty.call(settings, key)) {
      settings[key] = value;
      saveSettings();
      if (key === "lang" || key === "voiceEngine" || key === "geminiVoice") applyLanguage();
      else {
        refreshStats();
        applyCompatNote();
      }
    }
  },
  setFetch: (fn) => {
    injectedFetch = fn;
  },
  setTestCredential: (name, value) => {
    if (name === "geminiKey" || name === "xaiKey" || name === "bridgeAuth") settings[name] = value;
  },
  matchSkill,
  isActionRequest,
  isBridgeConfigured,
  normalizeBridgeAuth,
  shouldSendToBridge,
  matchesBridgePrefix,
  sendBridgeTask,
  t,
  isEt,
  currentLang,
  systemPrompt,
  audioJsonPrompt,
  recognitionLang,
  shouldUseGeminiTts,
  buildGeminiTtsBody,
  geminiTtsPrompt,
  geminiTtsStylePreamble,
  currentGeminiVoice,
  normalizeGeminiVoice,
  GEMINI_TTS_VOICE,
  GEMINI_TTS_VOICES,
  wavFromGeminiAudio,
  pcm16leToWav,
  extractGeminiInlineAudio,
  applyLanguage,
  GEMINI_TTS_MODEL,
  getReplyTopic,
  rotateReplyTopic,
  ntfyAppDeepLink,
  copyReplyTopic,
  syncReplyChannelUi,
  pollMissedReplies,
  handleNtfyPayload,
  presentItJuhtAnswer,
  startReplyListener,
  replyListenerReady: () => !!(replySource && typeof EventSource === "function" && replySource.readyState === EventSource.OPEN),
  resolveSite,
  formatTimeSpeech,
  isIOS,
  usesGeminiAudio,
  extractGeminiText,
  parseHeardReply,
  parseGeminiSseChunk,
  buildGeminiTextBody,
  buildGeminiAudioBody,
  toGeminiContents,
  geminiEndpoint,
};
