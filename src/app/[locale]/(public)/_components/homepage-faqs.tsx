"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";
import { ChevronRight } from "lucide-react";

interface FAQItem {
  _id: string;
  question: { en: string; es: string };
  answer: { en: string; es: string };
}

export function HomepageFAQs({ faqs }: { faqs: FAQItem[] }) {
  const locale = useLocale() as "en" | "es";

  if (faqs.length === 0) return null;

  const half = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, half);
  const rightFaqs = faqs.slice(half);

  return (
    <div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
        <Accordion type="single" collapsible>
          {leftFaqs.map((faq, i) => (
            <AccordionItem key={faq._id} value={`faq-l-${i}`} className="border-cream-300">
              <AccordionTrigger className="text-left text-sm font-medium text-brown-900 hover:text-terracotta-500 [&>svg]:text-brown-500">
                {faq.question[locale] || faq.question.en}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-brown-600">
                {faq.answer[locale] || faq.answer.en}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {rightFaqs.length > 0 && (
          <Accordion type="single" collapsible>
            {rightFaqs.map((faq, i) => (
              <AccordionItem key={faq._id} value={`faq-r-${i}`} className="border-cream-300">
                <AccordionTrigger className="text-left text-sm font-medium text-brown-900 hover:text-terracotta-500 [&>svg]:text-brown-500">
                  {faq.question[locale] || faq.question.en}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-brown-600">
                  {faq.answer[locale] || faq.answer.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <div className="mt-8 text-center">
        <Link href="/faqs">
          <Button variant="secondary" size="sm" className="gap-1">
            View All FAQs <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
