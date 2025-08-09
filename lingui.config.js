/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "es"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["<rootDir>/app", "<rootDir>/components", "<rootDir>/src"],
    },
  ],
  format: "po",
};
