/**
 * Route transition for the public site. Next gives a template a fresh key on
 * every navigation, so the animation replays as the visitor moves between
 * pages, while the header and footer stay put.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
