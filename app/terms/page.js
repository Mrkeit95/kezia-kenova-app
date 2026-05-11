import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import "../globals.css";
import "../home.css";
import "./legal.css";

export const metadata = {
  title: "Terms of Service · Kezia Kenova",
};

export default function TermsPage() {
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
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </header>

          <div className="legal-content">
            <section>
              <h2>Welcome</h2>
              <p>
                By accessing keziakenova.com (the "site"), you agree to these terms. If you don't agree with any part, please don't use the site.
              </p>
            </section>

            <section>
              <h2>About the site</h2>
              <p>
                This is a personal website operated by Kezia Kenova. It features curated product recommendations, social links, and a newsletter signup. The site is provided "as is" without any warranties.
              </p>
            </section>

            <section>
              <h2>Affiliate links</h2>
              <p>
                Many product links on this site are affiliate links. This means that if you click through and make a purchase, Kezia may earn a small commission, at no additional cost to you. We only recommend products genuinely used or believed in. Affiliate relationships do not influence editorial content.
              </p>
            </section>

            <section>
              <h2>External sites</h2>
              <p>
                Clicking an affiliate or social link takes you to a third-party website. We are not responsible for the content, privacy practices, or availability of those external sites. Please review their terms and privacy policies independently.
              </p>
            </section>

            <section>
              <h2>Intellectual property</h2>
              <p>
                All original content on this site — including photography, text, and design — belongs to Kezia Kenova unless otherwise noted. Don't reproduce, republish, or distribute without permission.
              </p>
            </section>

            <section>
              <h2>Newsletter</h2>
              <p>
                By subscribing, you agree to receive occasional emails. You can unsubscribe at any time using the link in any email or by emailing us directly.
              </p>
            </section>

            <section>
              <h2>Changes to these terms</h2>
              <p>
                These terms may be updated occasionally. Continued use of the site after changes means you accept the new terms.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions? Email <a href="mailto:keziakenwork@gmail.com">keziakenwork@gmail.com</a>.
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
