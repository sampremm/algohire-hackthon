export function renderTemplate(text, data) {
  return text.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
}

export default renderTemplate;
