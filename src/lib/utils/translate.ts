export async function autoTranslate(
  texts: string[]
): Promise<Array<{ en: string; es: string }>> {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) throw new Error("Translation failed");
    const { translations } = await res.json();
    return translations;
  } catch {
    return texts.map((t) => ({ en: t, es: t }));
  }
}
