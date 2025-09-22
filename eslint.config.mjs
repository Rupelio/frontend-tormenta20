import nextPlugin from "eslint-config-next";

const eslintConfig = [
  nextPlugin,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Você pode adicionar suas regras customizadas aqui
    }
  },
];

export default eslintConfig;
