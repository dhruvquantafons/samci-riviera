import type { Metadata } from "next";
import LegalPage, { LegalSection } from "../components/LegalPage";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `How ${SITE.name} approaches accessibility on this website, known limitations, and how to tell us about a barrier.`,
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility"
      intro={`${SITE.name} wants every guest to be able to use this website and to plan a stay with us. This statement sets out what we have done so far, what we know still needs work, and how to reach a person if something here gets in your way.`}
    >
      <LegalSection heading="What we aim for">
        <p>
          We are working towards the{" "}
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web Content Accessibility Guidelines (WCAG) 2.2, Level AA
          </a>
          . We have not yet completed a formal third-party audit, so we do not claim full conformance. We
          describe this site as <strong>partially conformant</strong>: most of it meets the standard, and
          some parts do not yet.
        </p>
      </LegalSection>

      <LegalSection heading="What we have done">
        <ul>
          <li>Every photograph and decorative image carries a meaningful text alternative or is hidden from screen readers.</li>
          <li>Interactive elements are real buttons and links, so they can be reached and operated with a keyboard.</li>
          <li>The photo gallery can be opened, navigated, and closed using the arrow and Escape keys.</li>
          <li>Visible focus outlines are kept in place rather than removed.</li>
          <li>Body text is set at a size and contrast intended to remain readable against our background colours.</li>
          <li>The layout reflows for small screens and supports browser zoom without loss of content.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Known limitations">
        <p>We are aware of the following and are working on them:</p>
        <ul>
          <li>
            The homepage hero rotates automatically. A control to pause it has not yet been added, which
            can be difficult for people who need more time to read.
          </li>
          <li>
            Some decorative gold-on-cream label text sits close to the minimum contrast ratio and is being
            reviewed.
          </li>
          <li>We have not yet tested the site end to end with every major screen reader.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Accessibility at the hotel">
        <p>
          If you have specific mobility, hearing, visual, or dietary requirements for your stay, please
          contact us before you book. We will tell you honestly what the property can and cannot
          accommodate, and arrange what we can — including room allocation, assistance at arrival, and
          meal arrangements.
        </p>
      </LegalSection>

      <LegalSection heading="Tell us about a barrier">
        <p>
          If you cannot access something on this site, or you run into a problem we have not listed here,
          please tell us. Describe the page and what happened, and we will get back to you and work on a
          fix. Feedback about accessibility is treated as a priority.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
