import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import "../globals.css";
import "../home.css";
import "../terms/legal.css";

export const metadata = {
  title: "Privacy Policy · Kezia Kenova",
};

export default function PrivacyPage() {
  return (
    <>
      <LoadingScreen />
      <main className="page">
        <div className="grain"></div>
        <div className="vignette"></div>

        <div className="legal-shell">
          <div className="detail-nav">
            <Link href="/" className="detail-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Back</span>
            </Link>
          </div>

          <header className="legal-header">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </header>

          <div className="legal-content">
            <section>
              <h2>What we collect</h2>
              <p>
                We collect only what you give us directly. That means:
              </p>
              <ul>
                <li><strong>Email address</strong> — only if you sign up for the newsletter.</li>
                <li><strong>Anonymous click data</strong> — when you tap a product link, we log that a click happened (so Kezia can see what's popular). No personal info is attached.</li>
              </ul>
            </section>

            <section>
              <h2>What we don't collect</h2>
              <p>
                We don't run third-party tracking, analytics, or advertising cookies. We don't sell, rent, or share your data with anyone. Ever.
              </p>
            </section>

            <section>
              <h2>How we use your email</h2>
              <p>
                If you subscribe, we use your email only to send you updates from Kezia — new drops, recommendations, behind-the-scenes. You can unsubscribe at any time. Your email is stored securely in our database.
              </p>
            </section>

            <section>
              <h2>Third parties</h2>
              <p>
                Affiliate links take you to retailer websites (e.g. brand stores, Amazon). Those retailers have their own privacy policies and may set their own cookies once you leave our site. Please review their policies if you have concerns.
              </p>
            </section>

            <section>
              <h2>Cookies</h2>
              <p>
                We use essential cookies only — the ones needed to keep the admin portal logged in. No tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2>Your rights</h2>
              <p>
                You can request access to or deletion of your email at any time by emailing <a href="mailto:keziakenwork@gmail.com">keziakenwork@gmail.com</a>. We'll handle the request within a reasonable time.
              </p>
            </section>

            <section>
              <h2>Children</h2>
              <p>
                This site is not directed at children under 13, and we do not knowingly collect data from them.
              </p>
            </section>

            <section>
              <h2>Changes</h2>
              <p>
                We may update this policy occasionally. The "last updated" date at the top reflects the most recent revision.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Privacy questions? Email <a href="mailto:keziakenwork@gmail.com">keziakenwork@gmail.com</a>.
              </p>
            </section>
          </div>

          <footer className="footer" style={{ marginTop: 48 }}>
            <div className="rule"></div>
            <div className="footer-links">
              <Link href="/terms">Terms</Link>
              <span className="footer-dot">·</span>
              <Link href="/privacy">Privacy</Link>
            </div>
            <p>© {new Date().getFullYear()} Kezia Kenova</p>
          </footer>
        </div>
      </main>
    </>
  );
}
