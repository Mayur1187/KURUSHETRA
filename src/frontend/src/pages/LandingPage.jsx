import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { projectConfig } from "../config/projectConfig";

export function LandingPage() {
  return (
    <div>
      <Navbar />
      <main className="landing">
        <section className="landing-hero">
          <h1>{projectConfig.landing.heroTitle}</h1>
          <p>{projectConfig.landing.heroSubtitle}</p>
          <div className="landing-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get started
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Log in
            </Link>
          </div>
        </section>

        <section className="landing-features">
          {projectConfig.landing.features.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </section>

        <section className="landing-how">
          <h2>How it works</h2>
          <ol>
            {projectConfig.landing.howItWorks.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
