import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  useGetLockStatus,
  useActivateEmergencyLock,
  useLiftEmergencyLock,
  getGetLockStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldOff, AlertTriangle, Lock, Unlock, Users, MonitorSmartphone, UserCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Redirect } from "wouter";

export default function ChairmanEmergencyPage() {
  const { data: profile, isLoading: profileLoading } = useGetCurrentUser();
  const isChairman = profile?.role === "chairman";

  const qc = useQueryClient();
  const { data: lockStatus, isLoading: lockLoading } = useGetLockStatus({
    query: { queryKey: getGetLockStatusQueryKey(), enabled: isChairman, refetchInterval: 15_000 },
  });

  const activateLock = useActivateEmergencyLock();
  const liftLock = useLiftEmergencyLock();

  const [confirmStep, setConfirmStep] = useState<"idle" | "lock" | "unlock">("idle");
  const [confirmInput, setConfirmInput] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  if (!profileLoading && !isChairman) {
    return <Redirect to="/dashboard" />;
  }

  const lockActive = lockStatus?.active ?? false;

  const handleActivateLock = () => {
    if (confirmInput !== "CONFIRM LOCK") return;
    activateLock.mutate(undefined, {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetLockStatusQueryKey() });
        setLastResult(data.message);
        setConfirmStep("idle");
        setConfirmInput("");
      },
    });
  };

  const handleLiftLock = () => {
    liftLock.mutate(undefined, {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetLockStatusQueryKey() });
        setLastResult(data.message);
        setConfirmStep("idle");
        setConfirmInput("");
      },
    });
  };

  return (
    <AppLayout title="Emergency Controls">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Emergency Controls</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Chairman-only. Activating the lock suspends all staff accounts and terminates active sessions.
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-widest border shrink-0",
              lockActive
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-green-500/10 text-green-500 border-green-500/30"
            )}
            data-testid="lock-status-badge"
          >
            {lockActive ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {lockActive ? "LOCK ACTIVE" : "NORMAL OPERATION"}
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="lock-stats-grid">
          <div className="bg-card border border-border rounded-sm p-4" data-testid="stat-active-users">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Accounts</p>
              <UserCheck className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold tabular-nums">
              {lockLoading ? "—" : lockStatus?.activeUsers ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4" data-testid="stat-suspended-count">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suspended by Lock</p>
              <Users className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold tabular-nums">
              {lockLoading ? "—" : lockStatus?.suspendedCount ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4" data-testid="stat-active-sessions">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Sessions</p>
              <MonitorSmartphone className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold tabular-nums">
              {lockLoading ? "—" : lockStatus?.activeSessions ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4" data-testid="stat-lock-state">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lock State</p>
              {lockActive ? <Shield className="h-4 w-4 text-destructive" /> : <ShieldOff className="h-4 w-4 text-green-500" />}
            </div>
            <p className={cn("text-base font-bold uppercase tracking-wide", lockActive ? "text-destructive" : "text-green-500")}>
              {lockActive ? "Active" : "Inactive"}
            </p>
            {lockStatus?.lastActivatedAt && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(lockStatus.lastActivatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Last result message */}
        {lastResult && (
          <div
            className="flex items-start gap-2 p-3 rounded-sm bg-muted border border-border text-sm"
            data-testid="lock-result-message"
          >
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{lastResult}</span>
          </div>
        )}

        {/* Action panel */}
        {confirmStep === "idle" && (
          <div className="bg-card border border-border rounded-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {!lockActive && (
                <button
                  onClick={() => { setConfirmStep("lock"); setConfirmInput(""); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-semibold rounded-sm transition-colors"
                  data-testid="button-initiate-lock"
                >
                  <Lock className="h-4 w-4" />
                  Activate Emergency Lock
                </button>
              )}
              {lockActive && (
                <button
                  onClick={() => setConfirmStep("unlock")}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-sm transition-colors"
                  data-testid="button-initiate-unlock"
                >
                  <Unlock className="h-4 w-4" />
                  Lift Emergency Lock
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lock confirmation */}
        {confirmStep === "lock" && (
          <div
            className="bg-destructive/5 border border-destructive/30 rounded-sm p-6 space-y-4"
            data-testid="lock-confirm-panel"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Confirm Emergency Lock</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will immediately suspend{" "}
                  <strong>{lockStatus?.activeUsers ?? "all"} active staff account(s)</strong> and forcibly terminate
                  all sessions. Type <strong>CONFIRM LOCK</strong> to proceed.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type CONFIRM LOCK"
              className="w-full h-10 px-3 rounded-sm border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-destructive/40"
              data-testid="lock-confirm-input"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleActivateLock}
                disabled={confirmInput !== "CONFIRM LOCK" || activateLock.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-destructive hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed text-destructive-foreground text-sm font-semibold rounded-sm transition-colors"
                data-testid="button-confirm-lock"
              >
                <Lock className="h-4 w-4" />
                {activateLock.isPending ? "Activating…" : "Activate Lock"}
              </button>
              <button
                onClick={() => { setConfirmStep("idle"); setConfirmInput(""); }}
                className="px-5 py-2.5 border border-border text-sm rounded-sm hover:bg-muted transition-colors"
                data-testid="button-cancel-lock"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Unlock confirmation */}
        {confirmStep === "unlock" && (
          <div
            className="bg-green-500/5 border border-green-500/30 rounded-sm p-6 space-y-4"
            data-testid="unlock-confirm-panel"
          >
            <div className="flex items-start gap-3">
              <Unlock className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">Lift Emergency Lock</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will reactivate only the <strong>{lockStatus?.suspendedCount ?? 0} account(s)</strong> suspended
                  by the emergency lock. Accounts suspended for other reasons remain suspended.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLiftLock}
                disabled={liftLock.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-sm transition-colors"
                data-testid="button-confirm-unlock"
              >
                <Unlock className="h-4 w-4" />
                {liftLock.isPending ? "Lifting…" : "Lift Lock"}
              </button>
              <button
                onClick={() => setConfirmStep("idle")}
                className="px-5 py-2.5 border border-border text-sm rounded-sm hover:bg-muted transition-colors"
                data-testid="button-cancel-unlock"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Recent lock events */}
        <div className="bg-card border border-border rounded-sm p-5" data-testid="lock-events-panel">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Lock Events
          </h3>
          {lockLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : !lockStatus?.recentEvents?.length ? (
            <p className="text-xs text-muted-foreground" data-testid="no-lock-events">No lock events recorded.</p>
          ) : (
            <div className="space-y-2">
              {lockStatus.recentEvents.map((event) => {
                const isActivation = event.eventType === "EMERGENCY_LOCK_ACTIVATED";
                const meta = event.metadata ? (() => { try { return JSON.parse(event.metadata); } catch { return {}; } })() : {};
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    data-testid={`lock-event-${event.id}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isActivation ? "bg-destructive" : "bg-green-500"
                      )} />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {isActivation ? "Lock Activated" : "Lock Lifted"}
                        </p>
                        {isActivation && meta.suspended != null && (
                          <p className="text-[10px] text-muted-foreground">
                            {meta.suspended} account(s) suspended, {meta.sessionTerminated ?? 0} session(s) terminated
                          </p>
                        )}
                        {!isActivation && meta.reactivated != null && (
                          <p className="text-[10px] text-muted-foreground">
                            {meta.reactivated} account(s) reactivated
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Warning notice */}
        <div className="bg-muted/50 border border-border rounded-sm p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Note:</strong> The emergency lock is a last-resort security measure.
            Only accounts suspended by the lock are restored on unlock — any accounts previously suspended for disciplinary
            or security reasons are not affected. All lock activations and lifts are permanently recorded in the audit log.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
