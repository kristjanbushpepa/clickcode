import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TranslationRequest {
  text: string;
  fromLang: string;
  toLang: string;
}

interface TranslationResponse {
  translatedText: string;
  success: boolean;
  error?: string;
}

// LibreTranslate API (free)
async function translateWithLibreTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text'
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    throw error;
  }
}

// MyMemory API (free backup)
async function translateWithMyMemory(text: string, fromLang: string, toLang: string): Promise<string> {
  try {
    const encodedText = encodeURIComponent(text);
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${fromLang}|${toLang}`
    );

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error('MyMemory error:', error);
    throw error;
  }
}

// Language code mapping for APIs
const LANGUAGE_MAP: Record<string, string> = {
  'sq': 'sq', // Albanian
  'it': 'it', // Italian
  'de': 'de', // German
  'fr': 'fr', // French
  'zh': 'zh', // Chinese
  'en': 'en'  // English
};

serve(async (req) => {
  console.log(`Auto-translate function called with method: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing translation request');
    const { text, fromLang = 'en', toLang }: TranslationRequest = await req.json();
    console.log(`Translating "${text}" from ${fromLang} to ${toLang}`);

    if (!text || !toLang) {
      return new Response(
        JSON.stringify({ success: false, error: 'Text and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip translation if target language is the same as source
    if (fromLang === toLang) {
      console.log('Source and target languages are the same, returning original text');
      return new Response(
        JSON.stringify({ success: true, translatedText: text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sourceLang = LANGUAGE_MAP[fromLang] || 'en';
    const targetLang = LANGUAGE_MAP[toLang];

    if (!targetLang) {
      console.log(`Unsupported target language: ${toLang}`);
      return new Response(
        JSON.stringify({ success: false, error: `Unsupported target language: ${toLang}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let translatedText: string;

    try {
      // Try LibreTranslate first (primary free API)
      console.log(`Attempting translation with LibreTranslate`);
      translatedText = await translateWithLibreTranslate(text, sourceLang, targetLang);
      console.log(`LibreTranslate successful: ${translatedText}`);
    } catch (error) {
      console.log('LibreTranslate failed, trying MyMemory as backup:', error);
      try {
        // Fallback to MyMemory
        console.log(`Attempting translation with MyMemory`);
        translatedText = await translateWithMyMemory(text, sourceLang, targetLang);
        console.log(`MyMemory successful: ${translatedText}`);
      } catch (fallbackError) {
        console.error('Both translation APIs failed:', error, fallbackError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Translation service temporarily unavailable' 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const response: TranslationResponse = {
      success: true,
      translatedText
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Auto-translate function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});