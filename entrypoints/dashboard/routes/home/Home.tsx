import { useLogin } from "@/common/api/api";
import { Button } from "@/common/components/ui/button";
import { toast } from "@/common/hooks/use-toast";
import { useState } from "react";

export function Home() {
  const loginMutation = useLogin();
  const [isShowingLogin, setIsShowingLogin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPicture, setUserPicture] = useState<string | null>(null);

  return (
    <div>
      <Button
        onClick={() => {
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
                setIsShowingLogin(true);
                setUserEmail(data.email);
                setUserPicture(data.picture);
              },
            });
          });
        }}
      >
        Login
      </Button>

      {isShowingLogin && (
        <div>
          <img src={userPicture!} alt="User" />
          <p>{userEmail}</p>
        </div>
      )}
    </div>
  );
}
