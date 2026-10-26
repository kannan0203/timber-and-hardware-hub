import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/store/site-layout";
import { useStoreCart } from "@/hooks/use-store-cart";
import { claimStoreAdmin, storeOwnerStatus } from "@/lib/store.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Owner Sign In | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Sign-in area reserved for the shop owner." },
      { property: "og:title", content: "Owner Sign In | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Sign-in area reserved for the shop owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerSignInPage,
});

function OwnerSignInPage() {
  const { signedIn } = useStoreCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["store-owner-status"],
    queryFn: () => storeOwnerStatus(),
  });
  const hasOwner = status ? status.hasOwner : true;

  // When the visitor arrives signed in — directly, or returning from the
  // confirmation email link — the first account claims ownership and the
  // dashboard opens. Every later account without the owner role is turned away.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const result = await claimStoreAdmin();
        if (cancelled) return;
        if (result.role === "admin") {
          await queryClient.invalidateQueries();
          navigate({ to: "/admin", replace: true });
        } else {
          setError("This account is not the shop owner's account.");
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, navigate, queryClient]);

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw new Error(signInError.message);
      // The signed-in effect above claims the owner role and navigates.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        emailRedirectTo: `${window.location.origin}/admin-login`,
      });
      if (signUpError) throw new Error(signUpError.message);
      setConfirmationSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The owner account could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem 4rem", maxWidth: 520 }}>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Owner sign in</h1>
              <p className="text-sm text-muted-foreground">Private area for the shop owner only.</p>
            </div>
          </div>

          {confirmationSent ? (
            <div className="space-y-3 text-center" role="status">
              <MailCheck size={32} className="mx-auto text-primary" />
              <h2 className="font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Open it, then come back here and
                sign in — the first account created becomes the shop owner.
              </p>
              <Button variant="outline" size="sm" onClick={() => setConfirmationSent(false)}>
                Back to sign in
              </Button>
            </div>
          ) : hasOwner ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="owner-email">Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner-password">Password</Label>
                <Input
                  id="owner-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                <KeyRound size={16} /> {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            mode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="owner-email">Email</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-password">Password</Label>
                  <Input
                    id="owner-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
                <Button type="submit" className="w-full" disabled={busy}>
                  <KeyRound size={16} /> {busy ? "Signing in…" : "Sign in"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted-foreground underline underline-offset-4"
                  onClick={() => { setMode("create"); setError(null); }}
                >
                  First time here? Create the owner account
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  No owner account exists yet. The first account you create here becomes the shop owner.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-email-create">Email</Label>
                  <Input
                    id="owner-email-create"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-password-create">Password</Label>
                  <Input
                    id="owner-password-create"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating…" : "Create owner account"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted-foreground underline underline-offset-4"
                  onClick={() => { setMode("signin"); setError(null); }}
                >
                  I already have an account — sign in
                </button>
              </form>
            )
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
