import React, { useState } from 'react';
import { 
  Languages, 
  ExternalLink, 
  X, 
  ArrowRightLeft, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { SupportedLanguage } from '../types/railway';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../utils/i18n';

interface RealtimeTranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: SupportedLanguage;
  onChangeLanguage?: (lang: SupportedLanguage) => void;
}

// Built-in offline dictionary database for Indian Railways phrases
const RAILWAY_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Where is platform 1?': {
    hi: 'प्लेटफॉर्म 1 कहाँ है?',
    ta: 'நடைமேடை 1 எங்கே உள்ளது?',
    te: 'ప్లాట్‌ఫాం 1 ఎక్కడ ఉంది?',
    bn: '১ নম্বর প্ল্যাটফর্ম কোথায়?',
    mr: 'प्लॅटफॉर्म १ कुठे आहे?',
    gu: 'પ્લેટફોર્મ ૧ ક્યાં છે?',
    kn: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 1 ಎಲ್ಲಿದೆ?',
    ml: 'പ്ലാറ്റ്ഫോം 1 എവിടെയാണ്?'
  },
  'Is this train going to Varanasi?': {
    hi: 'क्या यह ट्रेन वाराणसी जा रही है?',
    ta: 'இந்த ரயில் வாரணாசிக்குச் செல்கிறதா?',
    te: 'ఈ రైలు వారణాసికి వెళ్తుందా?',
    bn: 'এই ট্রেনটি কি বারাণসী যাচ্ছে?',
    mr: 'ही ट्रेन वाराणसीला जात आहे का?',
    gu: 'શું આ ટ્રેન વારાણસી જાય છે?',
    kn: 'ಈ ರೈಲು ವಾರಣಾಸಿಗೆ ಹೋಗುತ್ತಿದೆಯೇ?',
    ml: 'ഈ ട്രെയിൻ വാരണാസിയിലേക്കാണോ പോകുന്നത്?'
  },
  'What is the delay of this train?': {
    hi: 'यह ट्रेन कितनी लेट है?',
    ta: 'இந்த ரயில் எவ்வளவு நேரம் தாமதம்?',
    te: 'ఈ రైలు ఎంత ఆలస్యం అవుతుంది?',
    bn: 'এই ট্রেনটি কতক্ষণ দেরি হচ্ছে?',
    mr: 'ही ट्रेन किती उशीर आहे?',
    gu: 'આ ટ્રેન કેટલો સમય મોડી છે?',
    kn: 'ಈ ರೈಲು ಎಷ್ಟು ತಡವಾಗಿದೆ?',
    ml: 'ഈ ട്രെയിൻ എത്ര വൈകിയാണ്?'
  },
  'Where can I get hot drinking water?': {
    hi: 'गर्म पीने का पानी कहाँ मिलेगा?',
    ta: 'சூடான குடிநீர் எங்கு கிடைக்கும்?',
    te: 'వేడి త్రాగునీరు ఎక్కడ దొరుకుతుంది?',
    bn: 'গরম পানীয় জল কোথায় পাব?',
    mr: 'गरम पिण्याचे पाणी कुठे मिळेल?',
    gu: 'ગરમ પીવાનું પાણી ક્યાં મળશે?',
    kn: 'ಬಿಸಿ ಕುಡಿಯುವ ನೀರು ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
    ml: 'ചൂടുള്ള കുടിവെള്ളം എവിടെ ലഭിക്കും?'
  },
  'Please help me put my luggage under the berth.': {
    hi: 'कृपया मेरा सामान सीट के नीचे रखने में मदद करें।',
    ta: 'என் சாமான்களை சீட்டுக்கு அடியில் வைக்க உதவுங்கள்.',
    te: 'దయచేసి నా లగేజీని బెర్త్ కింద పెట్టడానికి సహాయం చేయండి.',
    bn: 'দয়া করে আমার লাগেজটি বার্থের নিচে রাখতে সাহায্য করুন।',
    mr: 'कृपया माझे सामान सीटच्या खाली ठेवण्यास मदत करा.',
    gu: 'કૃપા કરીને મારો સામાન સીટ નીચે મૂકવામાં મદદ કરો.',
    kn: 'ದಯವಿಟ್ಟು ನನ್ನ ಲಗೇಜನ್ನು ಬರ್ತ್ ಕೆಳಗೆ ಇಡಲು ಸಹಾಯ ಮಾಡಿ.',
    ml: 'എന്റെ ലഗേജ് ബർത്തിന് താഴെ വെക്കാൻ സഹായിക്കൂ.'
  },
  'Can we exchange berths? I have a lower berth.': {
    hi: 'क्या हम सीट बदल सकते हैं? मेरे पास नीचे की सीट है।',
    ta: 'நாம் இருக்கையை மாற்றிக்கொள்ளலாما? என்னிடம் கீழ் படுக்கை உள்ளது.',
    te: 'మనం బెర్త్‌లను మార్చుకోవచ్చా? నా దగ్గర లోయర్ బెర్త్ ఉంది.',
    bn: 'আমরা কি বার্থ বদল করতে পারি? আমার লোয়ার বার্থ আছে।',
    mr: 'आपण जागा बदलू शकतो का? माझ्याकडे खालची सीट आहे.',
    gu: 'શું આપણે સીટ બદલી શકીએ? મારી પાસે નીચેની સીટ છે.',
    kn: 'ನಾವು ಬರ್ತ್‌ಗಳನ್ನು ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳಬಹುದೇ? ನನ್ನಲ್ಲಿ ಲೋವರ್ ಬರ್ತ್ ಇದೆ.',
    ml: 'നമുക്ക് ബർത്തുകൾ പരസ്പരം മാറ്റാമോ? എനിക്ക് താഴത്തെ ബർത്തുണ്ട്.'
  }
};

export const RealtimeTranslateModal: React.FC<RealtimeTranslateModalProps> = ({
  isOpen,
  onClose,
  currentLang = 'hi',
  onChangeLanguage,
}) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState<string>(currentLang || 'hi');
  const [inputText, setInputText] = useState('Where is platform 1?');
  const [translatedText, setTranslatedText] = useState('प्लेटफॉर्म 1 कहाँ है?');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = (text?: string, target?: string) => {
    const q = (text !== undefined ? text : inputText).trim();
    const tLang = target || targetLang;
    if (!q) {
      setTranslatedText('');
      return;
    }

    // Check exact dictionary match
    const dictMatch = RAILWAY_TRANSLATIONS[q];
    if (dictMatch && dictMatch[tLang]) {
      setTranslatedText(dictMatch[tLang]);
      return;
    }

    // Check case insensitive
    const entry = Object.entries(RAILWAY_TRANSLATIONS).find(
      ([k]) => k.toLowerCase() === q.toLowerCase()
    );
    if (entry && entry[1][tLang]) {
      setTranslatedText(entry[1][tLang]);
      return;
    }

    // Language prefix format for generic queries
    const targetLabel = LANGUAGE_OPTIONS.find(l => l.code === tLang)?.label || tLang.toUpperCase();
    setTranslatedText(`[${targetLabel} Translation]: ${q}`);
  };

  const handleSwap = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleTranslateUrl = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(
    inputText
  )}&op=translate`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-sky-500/40 bg-slate-900 p-6 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Multilingual Railway Translator & Converter
              </h3>
              <p className="text-xs text-slate-400">
                Instant Indian regional language converter for station signboards and conversations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global App Interface Language Sync Option */}
        {onChangeLanguage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <span>Sync Whole App UI Language to: </span>
              <strong className="text-sky-400 uppercase">{targetLang}</strong>
            </div>
            <button
              onClick={() => {
                onChangeLanguage(targetLang as SupportedLanguage);
              }}
              className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-200 hover:bg-sky-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              Apply to App
            </button>
          </div>
        )}

        {/* Language Selectors Row */}
        <div className="mt-4 flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <select
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value);
            }}
            className="flex-1 bg-transparent px-3 py-1.5 text-white font-semibold focus:outline-none"
          >
            <option value="en" className="bg-slate-900 text-white">English</option>
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.label} ({l.nativeName})
              </option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 transition-colors"
            title="Swap languages"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              handleTranslate(inputText, e.target.value);
            }}
            className="flex-1 bg-transparent px-3 py-1.5 text-sky-300 font-semibold focus:outline-none"
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.label} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Input Text Area */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Input Text / Station Phrase
            </label>
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTranslate(e.target.value, targetLang);
              }}
              placeholder="Type phrase to translate..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none resize-none"
            />
          </div>

          {/* Quick Survival Phrases */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-sky-400" />
              <span>Common Indian Railways Phrases:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(RAILWAY_TRANSLATIONS).map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(phrase);
                    handleTranslate(phrase, targetLang);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-950 border border-slate-800 hover:border-sky-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Output Translation Area */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Translated Result</span>
              {translatedText && (
                <button
                  onClick={handleCopy}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] normal-case"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
            <div className="min-h-[64px] rounded-xl border border-sky-500/30 bg-slate-950 p-3 text-sm text-sky-200 font-medium">
              {translatedText || <span className="text-slate-500 text-xs">Translation will appear here...</span>}
            </div>
          </div>
        </div>

        {/* External Link for Audio / Camera Scan */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Need photo scan or voice mic?</span>
          <a
            href={googleTranslateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400/20 to-blue-500/20 border border-sky-400/40 text-sky-200 hover:text-white font-bold transition-all shadow-sm"
          >
            <span>Open Google Translate</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
