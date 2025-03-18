import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { ThemeProvider } from "./components/ThemeProvider";
import { Footer } from "./components/Footer";

function App() {
  // Create a separate element for Tempo routes to avoid conflicts
  const tempoRoutesElement =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <ThemeProvider defaultTheme="light">
      <Suspense fallback={<p>Loading...</p>}>
        {/* Render Tempo routes first */}
        {tempoRoutesElement}

        {/* Then render our application routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add this to prevent conflicts with Tempo routes */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>

        <Footer />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
