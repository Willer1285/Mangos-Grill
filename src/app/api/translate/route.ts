import { NextResponse } from "next/server";

function detectLanguage(text: string): "en" | "es" {
  if (/[áéíóúñ¿¡ü]/i.test(text)) return "es";
  const spanishWords =
    /\b(el|la|los|las|del|con|que|por|para|una?|está|tiene|hace|como|más|pero|también|sobre|puede|desde|hasta|todo|bien|ahora|muy|mucho|nuevo|nueva|parte|donde|solo|esto|esto|ser|hay|sin|cada|otro|otra|otros|estas|estos)\b/gi;
  const matches = text.match(spanishWords) || [];
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 0 && matches.length / wordCount > 0.1) return "es";
  return "es"; // Default to Spanish (native language)
}

async function translateOne(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return "";
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}`
  );
  const data = await res.json();
  return data.responseData?.translatedText || text;
}

export async function POST(request: Request) {
  try {
    const { texts } = (await request.json()) as { texts: string[] };

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: "texts array required" }, { status: 400 });
    }

    const translations = await Promise.all(
      texts.map(async (text) => {
        if (!text.trim()) return { en: "", es: "" };
        const lang = detectLanguage(text);
        const target = lang === "es" ? "en" : "es";
        try {
          const translated = await translateOne(text, lang, target);
          return lang === "es" ? { es: text, en: translated } : { en: text, es: translated };
        } catch {
          return { en: text, es: text };
        }
      })
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
