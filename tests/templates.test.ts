import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATES, pickTemplate, renderTemplate, unknownPlaceholders } from "../app/lib/message-templates";
import { guestTags } from "../app/lib/types";
import type { MessageTemplate } from "../app/lib/types";

describe("renderTemplate", () => {
  it("fills placeholders and leaves unknown ones visible", () => {
    expect(renderTemplate("Dear {FirstName}, see you on {CheckInDate}. {Oops}", { FirstName: "Asha", CheckInDate: "5 Oct" })).toBe(
      "Dear Asha, see you on 5 Oct. {Oops}",
    );
  });

  it("drops a line whose placeholder has no value", () => {
    const text = "Thank you for staying.\nWe would love to hear about your stay: {FeedbackLink}";
    expect(renderTemplate(text, { FeedbackLink: "" })).toBe("Thank you for staying.");
    expect(renderTemplate(text, { FeedbackLink: "https://x/f/abc" })).toContain("https://x/f/abc");
  });

  it("flags placeholders that do not exist", () => {
    expect(unknownPlaceholders("{GuestName} {CheckinDate} {Reference}")).toEqual(["CheckinDate"]);
  });
});

describe("pickTemplate", () => {
  const hi: MessageTemplate = { template: "confirmation", language: "hi", subject: "बुकिंग पक्की — {Reference}", body: "", footer: "", sms: "" };
  const en: MessageTemplate = { template: "confirmation", language: "en", subject: "Confirmed {Reference}", body: "", footer: "", sms: "" };

  it("prefers the guest's language, then the default, then English, then the built-in text", () => {
    expect(pickTemplate([hi, en], "confirmation", ["hi", "en"]).subject).toBe(hi.subject);
    expect(pickTemplate([hi, en], "confirmation", ["fr", "en"]).subject).toBe(en.subject);
    expect(pickTemplate([hi], "confirmation", ["fr", "de"]).subject).toBe(DEFAULT_TEMPLATES.confirmation.subject);
    expect(pickTemplate([], "cancellation", [null]).subject).toBe(DEFAULT_TEMPLATES.cancellation.subject);
  });
});

describe("guestTags", () => {
  it("derives Repeat Guest and Corporate and keeps a fixed order", () => {
    expect(guestTags({ tags: ["Blacklisted", "VIP", "odd"], company_id: "c" }, { stays: 3 })).toEqual([
      "VIP",
      "Blacklisted",
      "Repeat Guest",
      "Corporate",
    ]);
    expect(guestTags({ tags: [], company_id: null }, { stays: 1 })).toEqual([]);
  });
});
