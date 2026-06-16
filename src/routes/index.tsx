import { createFileRoute } from "@tanstack/react-router";
import { AuthActionButton, RedirectSignedInToTasks } from "../auth";

export const Route = createFileRoute("/")({
  component: SplashPage,
});

function SplashPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 p-6 md:p-10">
      <RedirectSignedInToTasks />
      <section className="grid gap-5">
        <p className="text-sm font-bold text-ink-muted">Todo by AI</p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-normal text-ink-strong md:text-6xl">
          Todo by AI
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-ink">
          Decide, organize, and complete the Tasks that matter without turning your day into a
          second job.
        </p>
        <div className="flex flex-wrap gap-3">
          <AuthActionButton
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-accent bg-accent px-4 text-sm font-semibold text-surface"
            intent="sign-in"
          >
            Sign in
          </AuthActionButton>
          <AuthActionButton
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-rule bg-surface px-4 text-sm font-semibold text-ink"
            intent="sign-up"
          >
            Sign up
          </AuthActionButton>
        </div>
      </section>
    </main>
  );
}
