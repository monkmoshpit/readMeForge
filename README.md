# readMeForge
> Generate polished GitHub READMEs in seconds using AI.

![Open Source](https://img.shields.io/badge/Open%20Source-✓-3fb950?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A web tool that eliminates the "blank-page problem" when writing project documentation. Built to help developers ship professional, multi-language READMEs faster.

---

## 🚀 How it Works

The generation process follows a streamlined workflow to ensure the AI has enough context to build a high-quality document without manual typing:

1.  **API Configuration**: Provide your own **Groq API Key** (llama-3-powered).
2.  **Repository Fetching**: Paste a GitHub URL to automatically pull metadata (name, description, stars, languages, and topics).
3.  **Refinement**: Adjust the fetched data or select specific templates and tones.
4.  **Generation**: The engine streams three versions simultaneously: **Portuguese**, **English**, and **Spanish**.
5.  **Smart Preview**: Use the interactive preview to fix "Forge Warnings" or auto-generate specific excerpts.

---

## 📝 Field Documentation

Understanding how each field impacts the final output:

### 1. Configuration
*   **Groq API Key**: Essential for generation. The key is stored only in your browser's `localStorage` and used to communicate directly with the Groq API. No data is stored on our servers.

### 2. Project Context
*   **GitHub URL**: Fetching a URL populates the project data fields. It also helps the AI understand the repository structure for better badge generation and link formatting.
*   **Project Type (Template)**:
    *   `Open Source`: Focuses on contribution guidelines, community, and licenses.
    *   `SaaS`: Focuses on features, value proposition, and deployment.
    *   `API`: Focuses on endpoints, authentication, and request/response examples.
    *   `Portfolio`: Highlights personal motivation, stack, and live demos.
    *   `CLI`: Focuses on command-line flags, installation, and usage examples.
    *   `Full Stack`: Focuses on architecture, folder structure, and environment variables.
*   **Tone**:
    *   `Technical`: Precise, direct, and focused on implementation.
    *   `Casual`: Friendly, approachable, and community-oriented.
    *   `Recruiter`: Focused on impact, metrics, and high-level architecture.

### 3. Project Data
*   **Project Name**: The main `H1` header.
*   **Description**: The initial summary.
*   **Languages & Topics**: Used to generate "Stack" sections and category badges.
*   **Extra Context**: **Crucial field.** Use this to provide details the AI can't fetch, such as installation steps, specific environment variables, or unique features.

---

## 🛠 Features

| Feature | Description |
|---|---|
| **Multi-Language Streaming** | Generates PT, EN, and ES versions in parallel using streaming for instant feedback. |
| **Forge Warnings** | Identifies missing information in the generated text (like placeholders) and highlights them in red. |
| **Auto-Generate Excerpts** | Click on a warning to have the AI re-generate only that specific section based on your updated context. |
| **User-Based AI** | Use your own API keys to avoid shared rate limits and keep costs at zero. |

---

## ⚙ Stack

- **Core**: React + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq SDK (Llama 3 models)
- **Internationalization**: i18next

## ⬇ Install & run

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📄 License

MIT
