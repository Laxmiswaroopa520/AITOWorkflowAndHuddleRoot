/*Shows the original AITO sign-in UI and starts Microsoft login only when the user clicks Sign in with Microsoft.*/
import {
  InteractionStatus,
} from "@azure/msal-browser";

import {
  useIsAuthenticated,
  useMsal,
} from "@azure/msal-react";

import {
  type PropsWithChildren,
  useState,
} from "react";

import {
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  loginRequest,
} from "@/auth/msalConfig";

import aitoLogo from "@/assets/AITO New Logo.png";

export function AuthGate({
  children,
}: PropsWithChildren) {
  const {
    instance,
    inProgress,
  } = useMsal();

  const isAuthenticated =
    useIsAuthenticated();

  const [
    isStartingLogin,
    setIsStartingLogin,
  ] = useState(false);

  const [
    loginError,
    setLoginError,
  ] = useState<string | null>(null);

  const isMsalBusy =
    inProgress !== InteractionStatus.None;

  const isLoading =
    inProgress === InteractionStatus.Startup ||
    inProgress ===
      InteractionStatus.HandleRedirect;

  const handleLogin = async (): Promise<void> => {
    if (isMsalBusy || isStartingLogin) {
      return;
    }

    setLoginError(null);
    setIsStartingLogin(true);

    try {
      await instance.loginRedirect(
        loginRequest,
      );

      /*
       * With loginRedirect, the browser normally leaves
       * this page immediately. Therefore, resetting
       * isStartingLogin is usually unnecessary here.
       */
    } catch (error: unknown) {
      console.error(
        "Login redirect failed:",
        error,
      );

      setLoginError(
        error instanceof Error
          ? error.message
          : "Microsoft sign-in could not be started.",
      );

      setIsStartingLogin(false);
    }
  };

  const Shell = ({
    children: shellChildren,
  }: PropsWithChildren) => (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-background
      "
    >
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        <div
          className="
            absolute
            right-0
            top-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-primary/20
            opacity-30
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-[400px]
            w-[400px]
            rounded-full
            bg-accent/10
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
        "
      >
        {shellChildren}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Shell>
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
          role="status"
          aria-live="polite"
        >
            <img
  src={aitoLogo}
  alt="AITO"
  className="mb-3 h-14 w-14 object-contain dark:invert"
/>
         {/* <img
            src={aitoLogo}
            alt="AITO"
            className="
              h-12
              w-12
              object-contain
              dark:invert
            "
          />*/}

          <Loader2
            className="
              h-6
              w-6
              animate-spin
              text-primary
            "
            aria-hidden="true"
          />

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Setting things up…
          </p>
        </div>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    const isSignInDisabled =
      isMsalBusy || isStartingLogin;

    return (
      <Shell>
        <div
          className="
            w-full
            max-w-sm
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card/95
            shadow-xl
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              px-8
              pb-6
              pt-8
              text-center
            "
          >
            <img
              src={aitoLogo}
              alt="AITO"
              className="
                mb-3
                h-14
                w-14
                object-contain
                dark:invert
              "
            />

            <div className="mb-1 leading-none">
              <span
                className="
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-foreground
                "
              >
                AITO
              </span>
            </div>

            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              Workflow &amp; Huddle Generator
            </p>
          </div>

          <div
            className="
              mx-8
              h-px
              bg-border
            "
          />

          <div
            className="
              flex
              flex-col
              items-center
              gap-5
              px-8
              pb-8
              pt-6
              text-center
            "
          >
            <p
              className="
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              Sign in with your Microsoft account to
              access your personalized AI-powered
              workflow.
            </p>

            <Button
              type="button"
              className="w-full gap-2"
              size="lg"
              disabled={isSignInDisabled}
              onClick={() => {
                void handleLogin();
              }}
            >
              {isSignInDisabled ? (
                <>
                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                    aria-hidden="true"
                  />

                  Signing in…
                </>
              ) : (
                <>
                  <MicrosoftLogo />

                  Sign in with Microsoft
                </>
              )}
            </Button>

            {loginError && (
              <div
                role="alert"
                className="
                  w-full
                  rounded-md
                  border
                  border-destructive/30
                  bg-destructive/10
                  px-3
                  py-2
                  text-left
                  text-xs
                  text-destructive
                "
              >
                {loginError}
              </div>
            )}

            <div
              className="
                flex
                items-center
                gap-1.5
                text-xs
                text-muted-foreground
              "
            >
              <ShieldCheck
                className="
                  h-3.5
                  w-3.5
                  flex-shrink-0
                  text-primary
                "
                aria-hidden="true"
              />

              Your data stays within your Microsoft
              tenant
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return <>{children}</>;
}

function MicrosoftLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 21 21"
      fill="none"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="9"
        height="9"
        fill="#f25022"
      />

      <rect
        x="11"
        y="1"
        width="9"
        height="9"
        fill="#7fba00"
      />

      <rect
        x="1"
        y="11"
        width="9"
        height="9"
        fill="#00a4ef"
      />

      <rect
        x="11"
        y="11"
        width="9"
        height="9"
        fill="#ffb900"
      />
    </svg>
  );
}