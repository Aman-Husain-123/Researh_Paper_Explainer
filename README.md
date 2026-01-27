# InsightScholar | Deep Research Explainer

![Landing Page](./screenshots/landing.png)

**InsightScholar** is an advanced AI-powered mentorship platform that deconstructs complex research papers into intuitive, interactive learning experiences. It goes beyond summarization to rebuild a user's mental model of a paper from first principles.

## 🚀 Core Philosophy: "Don't just read. Understand."

Most tools summarize text. InsightScholar acts as a **Socratic Mentor**, breaking down papers into a 10-step cognitive journey:
1.  **The Core Problem**: Animating the "Why" and the bottleneck of previous methods.
2.  **History & Evolution**: Visualizing the timeline of ideas leading to this moment.
3.  **The Insight**: Isolating the single "Aha!" moment that changed the field.
4.  **Deep System Architecture**: An interactive, node-based simulation of the proposed model.
5.  **Active Learning**: An endless, adaptive quiz engine to test mastery.

---

## 🏗️ Technical Architecture

The platform is built on a **Modern Next.js Stack** tailored for high-performance interactive visualizations.

### **1. Frontend Layer (The Experience)**
-   **Framework**: Next.js 14 (App Router)
-   **Animation Engine**: `Framer Motion` for complex, state-driven transitions.
-   **Visualizers**: Custom SVG-based interactive graph engines for Neural Network architectures.
-   **Styling**: Glassmorphism UI with Tailwind-like utility patterns in native CSS.

### **2. Reasoning Core (The Brain)**
-   **Analysis Engine**: A multi-stage AI pipeline (GPT-4o class models) that parses raw PDF text.
-   **Structure Enforcer**: Strict JSON schema enforcement to ensure every paper yields a consistent 10-step data structure.
-   **Math Intuition Bridge**: Specialized prompting to translate LaTeX equations into plain-English "real world" analogies.

### **3. Data Processing Pipeline**
-   **PDF Ingestion**: Robust parsing with `pdf-parse` (supporting both ESM and CJS modules).
-   **Fallback Mechanisms**: Auto-recovery systems that switch to "Title-based Analysis" if PDF text extraction fails.

---

## ✨ Key Features & Visuals

### 1. Interactive Architecture Flow
Users don't just see a static diagram. They interact with a **Live Simulation Stage**.
-   **Dynamic Nodes**: The system extracts the paper's specific components (e.g., "Encoder", "Attention Head").
-   **Data Flow**: Hovering over components reveals the logical flow of tensors/information.

![Architecture](./screenshots/architecture.png)

### 2. Adaptive "Endless" Quiz Mode
A dedicated **Active Learning Engine** generates unique questions on the fly.
-   **Difficulty Toggles**: Easy (Recall), Medium (Concept), Hard (Synthesis).
-   **Mastery Tracking**: Real-time score updates and "Intuition Feedback" for every answer.

![Quiz Mode](./screenshots/quiz.png)

### 3. Contextual Animation
Every section features data-driven animations:
-   **History**: A timeline of the field's eras.
-   **Failure**: Visualizing the specific bottleneck (e.g., Vanishing Gradient).
-   **Insight**: Morphing "Old Assumptions" into "New Reality".

---

## 🛠️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Aman-Husain-123/Research-Explainer.git
    cd Research-Explainer
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file and add your API keys:
    ```env
    NEXT_PUBLIC_API_URL=https://api.euron.one/api/v1/euri/chat/completions
    NEXT_PUBLIC_API_KEY=your_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Open Localhost**
    Navigate to `http://localhost:3000` to start the mentorship engine.

---

## 🤝 Contribution

We welcome contributions to the **Reasoning Core** prompts and **Visualization Components**.
1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Open a Pull Request.

---

**Built with ❤️ for Science.**
