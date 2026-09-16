import { getPublicRates } from "./lib/rates";
import HomeShell from "./components/HomeShell";

export default async function Home() {
  // Rates come from the admin panel when Supabase is configured, and from the
  // published tariff in code otherwise.
  const { rooms, charges } = await getPublicRates();

  return <HomeShell rooms={rooms} charges={charges} />;
}
