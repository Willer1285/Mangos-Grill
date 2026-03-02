import { useTranslations } from "next-intl";

export default function JobsPage() {
  const t = useTranslations("jobs");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brown-900">{t("title")}</h1>
    </div>
  );
}
