import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function AdminNav() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-background">
      <div className="mx-auto flex w-full max-w-[var(--container-width,1440px)] flex-wrap items-center justify-between gap-4 px-6 py-6 md:px-12">
        <Link to="/" className="nav-caps hover-red">
          Cliclac studio | Admin
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/admin" className="nav-caps hover-red" activeOptions={{ exact: true }} activeProps={{ style: { color: "var(--accent)" } }}>
            Projects
          </Link>
          <Link to="/admin/tags" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Tags
          </Link>
          <Link to="/admin/about" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            About
          </Link>
          <Link to="/admin/services" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Services
          </Link>
          <Link to="/admin/hero" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Hero
          </Link>
          <Link to="/admin/home" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Home
          </Link>
          <Link to="/admin/appearance" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Apparence
          </Link>
          <Link to="/admin/settings" className="nav-caps hover-red" activeProps={{ style: { color: "var(--accent)" } }}>
            Settings
          </Link>
          <Link to="/" className="nav-caps hover-red">
            View site
          </Link>
          <button type="button" onClick={signOut} className="nav-caps hover-red">
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}