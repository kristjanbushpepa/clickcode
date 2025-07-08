import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const languageNames = {
      'sq': 'Albanian',
      'it': 'Italian', 
      'de': 'German',
      'fr': 'French',
      'zh': 'Chinese'
    };

    const targetLanguageName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following texts to ${targetLanguageName}. Return only the translations in the same array format, maintaining the same order. Keep restaurant/food terminology accurate and appetizing. Do not add any extra formatting or explanations.`
          },
          {
            role: 'user',
            content: `Translate these texts to ${targetLanguageName}:\n${JSON.stringify(texts)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.choices[0].message.content;
    
    try {
      const translations = JSON.parse(translatedContent);
      return new Response(JSON.stringify({ translations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      // If JSON parsing fails, split by lines as fallback
      const translations = translatedContent.split('\n').filter((line: string) => line.trim());
      return new Response(JSON.stringify({ translations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});