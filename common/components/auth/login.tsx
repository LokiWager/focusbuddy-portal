import { useLogin } from "@/common/api/api";
import { toast } from "@/common/hooks/use-toast";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { useAuth } from "./AuthContext";

export function Login() {
  const loginMutation = useLogin();
  const authContext = useAuth();

  const login = useCallback(() => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (token === undefined) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Failed to login",
        });
      }
      const request = {
        token: token!,
      };
      loginMutation.mutate(request, {
        onError(err) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: err.message,
          });
        },
        onSuccess(data) {
          authContext.setUser(data);
        },
      });
    });
  }, [authContext, loginMutation]);

  return (
    <div>
      <Button onClick={login}>Login</Button>
    </div>
  );
}
