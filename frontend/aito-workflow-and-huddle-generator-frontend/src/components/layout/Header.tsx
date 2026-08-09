import {
  InteractionStatus,
} from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useCurrentUser } from "@/auth/useCurrentUser";
import { loginRequest } from "@/auth/msalConfig";

export function Header() {
  const { instance, inProgress } = useMsal();
  const currentUserQuery = useCurrentUser();

  const account =
    instance.getActiveAccount();

  const handleSignIn = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const handleSignOut = async () => {
    await instance.logoutRedirect({
      account: account ?? undefined,
      postLogoutRedirectUri:
        import.meta.env.VITE_REDIRECT_URI,
    });
  };

  return (
    <header>
      <div>
        <strong>
          AITO Workflow and Huddle Generator
        </strong>
      </div>

      <div>
        {currentUserQuery.isLoading && (
          <span>Loading user...</span>
        )}

        {currentUserQuery.data && (
          <>
            <span>
              {currentUserQuery.data.displayName ??
                currentUserQuery.data.email ??
                "Signed-in user"}
            </span>

            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
            >
              Sign out
            </button>
          </>
        )}

        {!account &&
          inProgress === InteractionStatus.None && (
            <button
              type="button"
              onClick={() => {
                void handleSignIn();
              }}
            >
              Sign in
            </button>
          )}
      </div>
    </header>
  );
}