# InsightScholar | Deep Research Explainer

**InsightScholar** is an advanced AI-powered platform that deconstructs complex research papers into intuitive, interactive learning experiences. It goes beyond simple summarization, acting as a Socratic Mentor to help users rebuild their mental model of a paper from first principles.

## 🚀 Key Features

*   **Socratic Analysis**: Breaks down papers into a 10-step cognitive journey (Problem, History, Insight, Architecture, etc.).
*   **Interactive Visualizations**: Custom SVG-based graph engines for visualizing Neural Network architectures and data flows.
*   **Mathematical Intuition**: Translates complex LaTeX equations into "real-world" analogies and plain-English explanations.
*   **Adaptive Quiz Engine**: Generates unique, difficulty-tuned questions (Easy, Medium, Hard) to test and reinforce mastery.
*   **Dual Mode Analytics**: Switches between high-performance GPT-4 class reasoning and a robust "Vanilla" local extraction fallback.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15+ (App Router), Framer Motion, Mermaid.js, KaTeX.
*   **Backend**: Next.js API Routes, PDF-parse for robust document ingestion.
*   **AI Core**: GPT-4 class models via Euri API for deep reasoning and JSON-structured output.

## ⚙️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Aman-Husain-123/Research-Explainer.git
    cd Research-Explainer
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your credentials:
    ```env
    EURI_API_KEY=your_api_key_here
    EURI_API_URL=https://api.euron.one/api/v1/euri/chat/completions
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
Built with ❤️ for Science.
