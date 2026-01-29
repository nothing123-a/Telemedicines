import { NextResponse } from "next/server";

function splitText(text, maxLength = 400) {
  if (text.length <= maxLength) return [text];
  
  const sentences = text.split(/[.!?]+/);
  const chunks = [];
  let current = '';
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    
    if ((current + trimmed).length > maxLength) {
      if (current) chunks.push(current.trim());
      current = trimmed;
    } else {
      current += (current ? '. ' : '') + trimmed;
    }
  }
  
  if (current) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

export async function POST(req) {
  try {
    const { text, targetLang } = await req.json();
    
    if (!text || targetLang === 'en') {
      return NextResponse.json({ translatedText: text || '' });
    }

    // Handle long text by chunking
    const chunks = splitText(text, 400);
    const translatedChunks = [];
    
    for (const chunk of chunks) {
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`);
        
        if (response.ok) {
          const data = await response.json();
          translatedChunks.push(data.responseData?.translatedText || chunk);
        } else {
          translatedChunks.push(chunk);
        }
        
        // Small delay to avoid rate limiting
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (chunkError) {
        console.error('Chunk translation error:', chunkError);
        translatedChunks.push(chunk);
      }
    }
    
    return NextResponse.json({ 
      translatedText: translatedChunks.join(' ')
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ translatedText: text || '' });
  }
}