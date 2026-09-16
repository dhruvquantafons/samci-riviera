import type { Metadata } from "next";
import LegalPage, { LegalSection } from "../components/LegalPage";
import { SITE } from "../lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Reservation, rate, and stay terms for ${SITE.name}, Srinagar, and terms of use for this website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms cover reservations made directly with ${SITE.name} and your use of this website. Booking a room with us means you accept them. If anything here is unclear, please ask the front desk before you book.`}
    >
      <LegalSection heading="Rates and what they include">
        <ul>
          <li>
            All published room rates are quoted in Indian Rupees on the <strong>CPAI plan</strong> — 
            accommodation with breakfast — and are inclusive of applicable taxes.
          </li>
          <li>
            Lunch, dinner, and additional-occupant charges are not part of the room rate and are billed at
            the published supplementary rates.
          </li>
          <li>
            Rates are subject to change, and peak-season and festival-period rates may differ from those
            shown. The rate confirmed to you at the time of booking is the rate that applies to your stay.
          </li>
          <li>Group, corporate, and conference rates are quoted on request.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Reservations">
        <p>
          A reservation is confirmed only once we have acknowledged it by phone or in writing. Enquiries
          submitted through this website are requests, not confirmed bookings, and are subject to
          availability. We may ask for a deposit or advance payment to hold a booking, particularly during
          peak periods and for group reservations.
        </p>
      </LegalSection>

      <LegalSection heading="Cancellation and no-show">
        <p>
          Cancellation, amendment, and no-show terms depend on the rate and the season, and are confirmed
          to you in writing at the time of booking. Bookings made through a travel agent or an online
          travel platform are governed by that provider&apos;s cancellation terms, not ours. Please contact us
          directly if you need to change or cancel a stay.
        </p>
      </LegalSection>

      <LegalSection heading="Check-in and check-out">
        <p>
          Standard check-in and check-out times are confirmed with your reservation; early check-in and
          late check-out are subject to availability and may carry a charge. Indian law requires every
          guest to present valid photo identification at check-in, and foreign nationals must present a
          passport and valid visa. We may decline accommodation where identification cannot be produced.
        </p>
      </LegalSection>

      <LegalSection heading="During your stay">
        <ul>
          <li>Guests are responsible for any loss or damage to hotel property caused during their stay.</li>
          <li>
            Please respect other guests. We may ask a guest to leave for behaviour that endangers or
            seriously disturbs others, without refund.
          </li>
          <li>
            Valuables should be kept in the in-room safe. The hotel is not liable for cash or valuables
            left unsecured in guest rooms or public areas.
          </li>
          <li>Smoking and pet policies are confirmed at the time of booking.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Events and conferences">
        <p>
          Meeting, conference, and banquet bookings are covered by a separate written agreement setting out
          the space, catering, minimum numbers, payment schedule, and cancellation terms. Where that
          agreement and these terms differ, the event agreement applies.
        </p>
      </LegalSection>

      <LegalSection heading="Use of this website">
        <p>
          The text, photographs, and design on this site belong to {SITE.name} or are used with permission,
          and may not be reproduced commercially without our written consent. We work to keep the
          information here accurate and current, but descriptions, images, and rates are indicative and do
          not form a binding offer.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of India, and the courts at Srinagar, Jammu &amp; Kashmir have
          jurisdiction over any dispute arising from them.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
