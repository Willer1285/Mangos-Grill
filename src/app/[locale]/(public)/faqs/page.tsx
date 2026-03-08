"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Spinner } from "@/components/ui";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";

interface FAQItem {
  _id: string;
  question: { en: string; es: string };
  answer: { en: string; es: string };
}

export default function AllFAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale() as "en" | "es";

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFaqs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          Help Center
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-4xl font-semibold text-white">
          Frequently Asked Questions
        </h1>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-brown-500">No FAQs available at the moment.</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq._id} value={`faq-${i}`} className="rounded-lg border border-cream-200 bg-white px-4">
                <AccordionTrigger className="text-left font-medium text-brown-900 hover:text-terracotta-500 [&>svg]:text-brown-500">
                  {faq.question[locale] || faq.question.en}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-brown-600">
                  {faq.answer[locale] || faq.answer.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </>
  );
}
