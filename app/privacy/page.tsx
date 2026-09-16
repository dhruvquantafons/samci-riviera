import type { Metadata } from "next";
import LegalPage, { LegalSection } from "../components/LegalPage";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects the personal information of guests and website visitors.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what personal information ${SITE.name} collects through this website and during your stay, why we collect it, and the choices you have. It applies to this website and to reservations made with us directly.`}
    >
      <LegalSection heading="Information we collect">
        <p>We only collect what we need to answer an enquiry, hold a reservation, or host your stay:</p>
        <ul>
          <li>
            <strong>Reservation enquiries.</strong> Your name, phone number, email address, arrival and
            departure dates, number of guests, and room preference.
          </li>
          <li>
            <strong>Newsletter sign-ups.</strong> The email address you submit, if you choose to subscribe
            to our offers and seasonal rates.
          </li>
          <li>
            <strong>Check-in records.</strong> The identification and guest-registration details that hotels
            in Jammu &amp; Kashmir are legally required to record, collected at the front desk rather than
            through this website.
          </li>
          <li>
            <strong>Basic technical data.</strong> Standard server information such as your IP address,
            browser type, and the pages you visited, used to keep the site secure and working.
          </li>
        </ul>
        <p>
          We do not collect payment card details through this website. Payment is taken at the hotel or
          through the channel you booked with.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <ul>
          <li>To respond to your enquiry and confirm, amend, or cancel a reservation.</li>
          <li>To provide the services you request during your stay, including dining and event bookings.</li>
          <li>To send offers and updates, only where you have asked to receive them.</li>
          <li>To meet our legal, tax, and guest-registration obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          We do not sell your personal information. We share it only with service providers who help us
          operate the hotel and this website — for example our booking, email, and hosting providers — and
          with government authorities where the law requires it. Those providers may only use the
          information to perform services for us.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and analytics">
        <p>
          This website does not set advertising or cross-site tracking cookies. Any cookies in use are
          strictly necessary to serve and secure the pages you request. If we add analytics in the future,
          we will update this policy before doing so.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Reservation and enquiry records are kept for as long as we need them to service your stay and to
          satisfy our legal and accounting obligations, after which they are deleted or anonymised.
          Newsletter subscriptions are kept until you unsubscribe.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <ul>
          <li>Ask us for a copy of the personal information we hold about you.</li>
          <li>Ask us to correct anything that is inaccurate or out of date.</li>
          <li>Ask us to delete information we no longer need to keep.</li>
          <li>Unsubscribe from our emails at any time, using the link in any message or by writing to us.</li>
        </ul>
        <p>
          To make any of these requests, contact us using the details below. We may need to verify your
          identity before we act on a request.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We may update this policy from time to time. The revision date at the top of this page always
          reflects the current version.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
