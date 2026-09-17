import { getPublicRates } from "../lib/rates";
import SiteShell from "../components/SiteShell";

/**
 * Chrome shared by every public page.
 *
 * Rates are loaded once here rather than per page, so the header, footer and
 * reservation panel all agree, and the panel keeps its state while the visitor
 * moves between pages.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { rooms } = await getPublicRates();

  return (
    <SiteShell rooms={rooms}>
      {children}
    </SiteShell>
  );
}
