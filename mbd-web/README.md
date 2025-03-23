# Welcome!

This is the web app for My Belly's Diary. It is actively under development as is this README. For now, please refer to the notes below and reach out to a dev when further clarification is needed.

# Development Setup

1. You must have [Node.js](https://nodejs.org) installed, the project was initially developed with Node v22.13.0
2. mbd-web utilizes [pnpm](https://pnpm.io) as its package manager. Please install using `npm i -g pnpm`
3. Install packages with `pnpm i`
4. Run dev server with `pnpm dev`
5. Navigate to [http://localhost:3000](http://localhost:3000)

## Dev Tools

- Install Chrome Extensions
  - React Developer Tools
  - Redux DevTools
- Install Recommended VS Code Extensions
  - Use VS Code's "Recommended" Extension filter, or check `.vscode/extensions.json`

# Important Tech Decisions

- Next.js is configured to export the app as a Single Page App (SPA) to save with hosting costs. **Please refrain from utilizing Server-Side Rendering (SSR) for now.**
- Variables are set locally using the `.env.development` file. Deployments to Stage and Prod bake in the contents of `.env.stage` and `.env.prod` respectively. See web_build.yml for details.

## Tech Used

- Next.js
- React
- TypeScript
- ESLint
- Material UI
- Emotion
- Redux
- Markdown
- pnpm
- VS Code
- Prettier
- Git

---

# Reference

- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
  - [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
