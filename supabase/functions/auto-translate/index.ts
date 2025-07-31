
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

// Google Translate (free, no API key required)
async function translateWithGoogle(text: string, fromLang: string, toLang: string): Promise<string> {
  try {
    console.log(`Translating with Google: "${text}" from ${fromLang} to ${toLang}`);
    
    // Use Google Translate's free endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Translate response:', data);
    
    // Google Translate returns an array structure
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    throw new Error('Invalid response format from Google Translate');
  } catch (error) {
    console.error('Google Translate error:', error);
    throw error;
  }
}

// MyMemory API (backup)
async function translateWithMyMemory(text: string, fromLang: string, toLang: string): Promise<string> {
  try {
    console.log(`Translating with MyMemory: "${text}" from ${fromLang} to ${toLang}`);
    const encodedText = encodeURIComponent(text);
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${fromLang}|${toLang}`
    );

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('MyMemory response:', data);
    
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Invalid response from MyMemory');
  } catch (error) {
    console.error('MyMemory error:', error);
    throw error;
  }
}

// Language code mapping
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
    console.log(`Request: translate "${text}" from ${fromLang} to ${toLang}`);

    if (!text || !toLang) {
      console.log('Missing text or target language');
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
      // Try Google Translate first (free, no API key needed)
      console.log(`Attempting translation with Google Translate`);
      translatedText = await translateWithGoogle(text, sourceLang, targetLang);
      console.log(`Google Translate successful: ${translatedText}`);
    } catch (error) {
      console.log('Google Translate failed, trying MyMemory as backup:', error);
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
            error: 'Translation service temporarily unavailable. Please try again later.' 
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const response: TranslationResponse = {
      success: true,
      translatedText
    };

    console.log('Translation successful, returning response');
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
