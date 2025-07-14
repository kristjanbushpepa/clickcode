
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d68d6feb-97b1-4947-a9c1-94cf489226b0

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment. To deploy:

1. Push your code to the `main` branch
2. Go to your repository settings on GitHub
3. Navigate to "Pages" in the left sidebar
4. Select "GitHub Actions" as the source
5. The deployment will happen automatically on every push to main

Your site will be available at: `https://yourusername.github.io/repository-name`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d68d6feb-97b1-4947-a9c1-94cf489226b0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local Development

To run the project locally:

```bash
npm install
npm run dev
```

## Building for Production

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Can I connect a custom domain to my GitHub Pages site?

Yes! After deployment:

1. Add a `CNAME` file to the `public` directory with your domain
2. Configure your domain's DNS to point to GitHub Pages
3. Enable custom domain in your repository's Pages settings

Read more: [GitHub Pages custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
