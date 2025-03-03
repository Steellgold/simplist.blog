"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/hooks/use-toast";
import { Airplay, Laptop, Loader2, Monitor, Smartphone, Tablet, Tv, Unplug, Watch, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useSessions } from "@/hooks/use-sessions";
import { useRouter } from "next/navigation";
import { UAParser } from "ua-parser-js";
import { Badge } from "@workspace/ui/components/badge";

export const SectionSessionsCard = () => {  
  const [isLoading, setLoading] = useState<boolean>(false);
  const { refetch, isPending, data } = authClient.useSession();

  const [isTerminating, setTerminating] = useState<string>("");
  const [revokeds, setRevokeds] = useState<string[]>([]);

  const sessions = useSessions();
  const router = useRouter();

  if (!data) return <></>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle>Sessions</CardTitle>
          <CardDescription className="mt-1 text-sm">Manage your active sessions and revoke access.</CardDescription>
          {revokeds.length > 0 && (
            <CardDescription className="mt-1 text-sm text-red-400">
              {revokeds.length} session{revokeds.length > 1 ? "s" : ""} revoked (After refresh this page, this message and revoked sessions will disappear)
            </CardDescription>
          )}
        </div>

        <Button
          variant={"destructive"}
          size="sm"
          disabled={isLoading || isTerminating !== ""}
          onClick={async () => {
            await authClient.revokeSessions({
              fetchOptions: {
                onSuccess: () => {
                  toast({
                    title: "Sessions revoked",
                    description: "All active sessions have been successfully revoked."
                  });

                  refetch();
                  router.push("/auth");
                },
                onRequest: () => {
                  toast({
                    title: "Revoking sessions",
                    description: "Please wait while we revoke all active sessions."
                  });
                  setLoading(true);
                },
                onError: (error) => {
                  console.log(error);
                  toast({
                    title: "Error while revoking sessions",
                    description: error.error.message || "An error occurred while revoking all active sessions.",
                    variant: "destructive"
                  });

                  setLoading(false);
                }
              }
            })
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Unplug size={16} />
              <span className="hidden sm:block">Revoke all sessions</span>
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {isPending || sessions.pending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            {sessions && sessions.list.length > 0 ? (
              <div className="space-y-2">
                {sessions.list.map((session) => {
                  if (!session.userAgent) return <></>;

                  const device = new UAParser(session.userAgent).getDevice();
                  const browser = new UAParser(session.userAgent).getBrowser();
                  const os = new UAParser(session.userAgent).getOS();

                  return (
                    <div key={session.id} className="flex flex-row items-center justify-between p-4 space-x-4 bg-bg-secondary rounded-lg border border-border">
                      <div className="flex flex-row space-x-3 items-center">
                        <div className="flex border border-border rounded-full p-2">
                          {
                            device.type === "mobile"
                              ? (<Smartphone size={16} />)
                              : device.type === "tablet" ? (<Tablet size={16} />)
                              : device.type === "smarttv" ? (<Tv size={16} />)
                              : device.type === "wearable" ? (<Watch size={16} />)
                              : device.type === "console" ? (<Monitor size={16} />)
                              : device.type === "embedded" || device.type === "xr" ? (<Airplay size={16} />)
                              : <Laptop size={16} />
                            }
                          </div>

                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {os.name} {session.token === data.session.token
                              ? <Badge>This device</Badge>
                              : <></>
                            }
                          </span>
                          <span className="text-sm text-muted-foreground">{browser.name}</span>
                        </div>
                      </div>

                      {!revokeds.includes(session.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isTerminating !== ""}
                          onClick={async () => {
                            await authClient.revokeSession({
                              token: session.token,
                              fetchOptions: {
                                onSuccess: () => {
                                  if (data.session.token === session.token) {
                                    router.push("/auth");
                                    toast({
                                      title: "Session revoked",
                                      description: "You have been logged out from this session."
                                    });
                                  }

                                  toast({
                                    title: "Session revoked",
                                    description: "The session has been successfully revoked."
                                  });

                                  setTerminating("");
                                  setRevokeds([...revokeds, session.id]);

                                  refetch();
                                  router.refresh();
                                },
                                onRequest: () => {
                                  setTerminating(session.token);
                                  toast({
                                    title: "Revoking session",
                                    description: "Please wait while we revoke the active session."
                                  });
                                },
                                onError: (error) => {
                                  console.log(error);
                                  setTerminating("");
                                  toast({
                                    title: "Error while revoking session",
                                    description: error.error.message || "An error occurred while revoking the active session.",
                                    variant: "destructive"
                                  });
                                }
                              }
                            })
                          }}>
                            {isTerminating === session.token ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <>
                                {data.session.token === session.token
                                  ? "Disconnect"
                                  : "Revoke"
                                }
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm" disabled>
                            Revoked
                          </Button>
                        )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 space-y-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                  <X className="h-5 w-5 text-destructive" />
                </div>

                <p className="text-sm text-center">
                  No active sessions. (WTF?)
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}