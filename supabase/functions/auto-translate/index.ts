import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage } = await req.json();
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts array is required');
    }
    
    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    // Language code mapping for LibreTranslate
    const languageMap: Record<string, string> = {
      'sq': 'sq',   // Albanian
      'it': 'it',   // Italian
      'de': 'de',   // German
      'fr': 'fr',   // French
      'zh': 'zh'    // Chinese
    };

    const targetLang = languageMap[targetLanguage];
    if (!targetLang) {
      throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    const translations: string[] = [];

    // Translate each text individually using LibreTranslate (free API)
    for (const text of texts) {
      try {
        const response = await fetch('https://libretranslate.de/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        translations.push(data.translatedText || text);
      } catch (error) {
        console.error(`Error translating "${text}":`, error);
        translations.push(text); // Fallback to original text
      }
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});