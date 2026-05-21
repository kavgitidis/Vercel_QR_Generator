# 📍 QR Pro Studio

A State-Of-The-Art (SOTA), browser-based designer suite for generating premium, brand-aligned Google Maps QR codes. 

Built with modern web technologies, this tool completely rethinks the standard "utility" interface, offering a sleek **Bento Box Dashboard** inspired by the design language of top-tier SaaS platforms.

---

## ✨ Features

*   **🎨 SOTA Bento Box UI:** A highly structured, distraction-free interface featuring deep glassmorphism, an ultra-dark `#050505` theme, and a dynamic "Aurora" mesh background.
*   **⚡ Real-Time Interactive Canvas:** The QR code preview is a sticky, floating stage that updates instantly as you tweak settings—no "Generate" button required.
*   **🏢 Professional Branding:** Upload a custom brand logo or select an emoji to sit perfectly in the center of your QR code.
*   **🛠️ Deep Customization Engine:**
    *   **Matrix Architecture:** Choose between Sharp Squares, Modern Rounded, Circular Dots, or Classy interconnected paths.
    *   **Anchor Styles:** Customize the corner "eyes" independently (Rigid Square, Smooth Corner, Circular Dot).
    *   **Color Engineering:** Apply solid tones or precise linear gradients with custom Primary and Secondary colors.
    *   **Isolation Logic:** Automatically clear the QR modules behind your center logo/emoji for a flawless, clean look.
*   **📦 Production-Ready Export:** Download your masterpiece in ultra-high resolution **PNG** for digital use, or scalable **SVG** for professional printing (billboards, business cards).

---

## 💻 Tech Stack

This project is built for blistering speed and visual excellence:

*   **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Using the new `@tailwindcss/postcss` engine)
*   **QR Engine:** [qr-code-styling](https://qr-code-styling.com/) (Canvas/SVG Hybrid)
*   **Iconography:** [Lucide React](https://lucide.dev/)
*   **Typography:** [Inter](https://fonts.google.com/specimen/Inter)

---

## 🚀 Local Development

To run this project on your own machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

---

## 🌍 Deployment

This application runs entirely in the browser (client-side) and requires no backend server, making it perfect for free, edge-network hosting.

**Deploying to Vercel (Recommended):**
1. Push your code to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Import your GitHub repository.
4. Vercel will auto-detect the Vite framework. Simply click **Deploy**.
5. Your QR Pro Studio is now live!

---

*Designed for excellence. Built for the modern web.*
