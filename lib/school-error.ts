export function schoolError(message: string, locale: "zh" | "en") {
  const separator = " / ";
  if (!message.includes(separator)) return message;
  const [en, zh] = message.split(separator, 2);
  return locale === "zh" ? zh : en;
}
