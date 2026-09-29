import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  Database,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

function Landing() {
  return (
    <main className="landing-page">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            AI + CLOUD COMPUTING
          </span>

          <h1>
            AI-Powered Personal
            <span className="landing-highlight">
              {" "}Diet Planner
            </span>
          </h1>

          <p className="landing-hero-description">
            Create personalized general-wellness meal plans,
            track your daily progress, and keep your planning
            data organized with a cloud-backed application.
          </p>

          <div className="landing-hero-actions">
            <Link
              to="/register"
              className="landing-primary-button"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="landing-secondary-button"
            >
              Sign In
            </Link>
          </div>

          <p className="landing-note">
            Educational and general wellness project.
            Generated plans are not medical advice.
          </p>
        </div>

        {/* Hero visual */}
        <div className="landing-hero-visual">
          <div className="landing-dashboard-card">
            <div className="landing-card-top">
              <div>
                <span>
                  PERSONAL WELLNESS
                </span>

                <h3>
                  Your Planning Flow
                </h3>
              </div>

              <div className="landing-card-icon">
                <Sparkles size={22} />
              </div>
            </div>

            <div className="landing-flow">
              <div className="landing-flow-item">
                <div className="landing-flow-icon">
                  <ClipboardCheck size={19} />
                </div>

                <div>
                  <strong>
                    Profile
                  </strong>

                  <span>
                    Your basic information
                  </span>
                </div>
              </div>

              <div className="landing-flow-line" />

              <div className="landing-flow-item">
                <div className="landing-flow-icon">
                  <BrainCircuit size={19} />
                </div>

                <div>
                  <strong>
                    AI Plan
                  </strong>

                  <span>
                    Personalized demo plan
                  </span>
                </div>
              </div>

              <div className="landing-flow-line" />

              <div className="landing-flow-item">
                <div className="landing-flow-icon">
                  <BarChart3 size={19} />
                </div>

                <div>
                  <strong>
                    Progress
                  </strong>

                  <span>
                    Track your daily activity
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">
            CORE FEATURES
          </span>

          <h2>
            One workflow for your wellness planning
          </h2>

          <p>
            The application combines AI-assisted planning,
            cloud database services, authentication, and
            progress tracking into one project.
          </p>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <BrainCircuit size={22} />
            </div>

            <h3>
              AI-Assisted Planning
            </h3>

            <p>
              Generate a structured general-wellness meal
              plan based on your selected preferences and
              goals.
            </p>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <Cloud size={22} />
            </div>

            <h3>
              Cloud-Backed Data
            </h3>

            <p>
              Store authenticated user information, saved
              plans, tracker data, and file metadata in
              Firebase services.
            </p>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <ShieldCheck size={22} />
            </div>

            <h3>
              Secure User Access
            </h3>

            <p>
              Firebase Authentication and user-specific
              Firestore rules keep each user's application
              data separated.
            </p>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <Database size={22} />
            </div>

            <h3>
              Daily Tracking
            </h3>

            <p>
              Record meal completion and hydration activity
              and review your progress through the dashboard.
            </p>
          </article>
        </div>
      </section>

      {/* Cloud architecture */}
      <section className="landing-section landing-cloud-section">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">
            CLOUD COMPUTING
          </span>

          <h2>
            How the application works
          </h2>

          <p>
            The project follows a client-server architecture
            where the React application communicates with
            cloud services and the FastAPI backend.
          </p>
        </div>

        <div className="landing-architecture">
          <div className="landing-architecture-step">
            <span>01</span>
            <strong>React Frontend</strong>
            <p>
              User interface and application workflow.
            </p>
          </div>

          <ArrowRight
            className="landing-architecture-arrow"
            size={20}
          />

          <div className="landing-architecture-step">
            <span>02</span>
            <strong>Authentication</strong>
            <p>
              Firebase handles user sign-in and identity.
            </p>
          </div>

          <ArrowRight
            className="landing-architecture-arrow"
            size={20}
          />

          <div className="landing-architecture-step">
            <span>03</span>
            <strong>FastAPI Backend</strong>
            <p>
              REST APIs provide backend application logic.
            </p>
          </div>

          <ArrowRight
            className="landing-architecture-arrow"
            size={20}
          />

          <div className="landing-architecture-step">
            <span>04</span>
            <strong>Cloud Database</strong>
            <p>
              Firestore stores user-specific application data.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div>
          <span className="landing-eyebrow">
            START YOUR WORKFLOW
          </span>

          <h2>
            Build your personalized planning journey
          </h2>

          <p>
            Create an account and explore the complete
            AI and cloud-based workflow.
          </p>
        </div>

        <Link
          to="/register"
          className="landing-primary-button"
        >
          Create Account
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

export default Landing;