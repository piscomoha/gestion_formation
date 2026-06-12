import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";

const demoAccounts = [
  { role: "Admin", email: "admin@ofppt.ma" },
  { role: "Formateur", email: "formateur@ofppt.ma" },
  { role: "Stagiaire", email: "stagiaire@ofppt.ma" },
];

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@ofppt.ma");
  const [password, setPassword] = useState("password");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? `/${user.role}`, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-xl lg:grid-cols-[1fr_420px]">
        <section className="hidden bg-emerald-700 p-10 text-white lg:block">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-3">
              <img src="/logoo-ofppt.png" alt="OFPPT" className="h-14 w-20 object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">Office de la Formation</p>
              <h1 className="text-2xl font-bold">Gestion de Formation</h1>
            </div>
          </div>
          <div className="mt-20 space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Espace sécurisé pour admin, formateur et stagiaire.
            </h2>
            <p className="text-emerald-50">
              Gérez les affectations, les notes, les présences, les validations et les bulletins par année scolaire.
            </p>
          </div>
        </section>

        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-2">
            <img src="/logoo-ofppt.png" alt="OFPPT" className="mb-2 h-16 w-28 object-contain lg:hidden" />
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Connectez-vous avec votre rôle.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-9" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
              </div>
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 rounded-xl bg-muted p-4 text-sm">
              <p className="font-medium">Comptes de test</p>
              <p className="text-muted-foreground">Mot de passe: password</p>
              <div className="mt-3 space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    className="block text-left text-primary hover:underline"
                    onClick={() => setEmail(account.email)}
                    type="button"
                  >
                    {account.role}: {account.email}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
