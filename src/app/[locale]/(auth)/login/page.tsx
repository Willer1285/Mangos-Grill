import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-brown-900">{t("login")}</h1>
    </div>
  );
}
