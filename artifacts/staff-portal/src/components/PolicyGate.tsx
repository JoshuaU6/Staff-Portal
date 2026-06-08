import { useState } from "react";
import { Shield, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolicyData {
  id: number;
  version: string;
  body: string;
  publishedAt: string;
  acknowledgedAt: string | null;
}

interface PolicyGateProps {
  policy: PolicyData;
  onAcknowledge: () => Promise<void>;
}

export function PolicyGate({ policy, onAcknowledge }: PolicyGateProps) {
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      await onAcknowledge();
    } catch {
      setError("Failed to record your acknowledgment. Please try again.");
      setAccepting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      data-testid="policy-gate"
    >
      {/* Header bar */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">MTC Group Staff Policy</p>
            <p className="text-xs text-muted-foreground">Version {policy.version} — Acknowledgment Required</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-yellow-500 font-medium bg-yellow-500/10 border border-yellow-500/20 rounded-sm px-3 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          Action Required
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Staff Policy Document</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            Published {new Date(policy.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Scrollable policy body */}
        <div
          className="flex-1 overflow-y-auto border border-border rounded-sm bg-card p-6 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-light"
          data-testid="policy-body"
        >
          {policy.body}
        </div>
      </div>

      {/* Footer action bar */}
      <div className="border-t border-border bg-card px-6 py-5 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground max-w-lg">
            By clicking "I Accept", you confirm that you have read, understood, and agree to comply with the MTC Group Staff Policy. This acknowledgment is recorded and audited.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {error && (
              <p className="text-xs text-destructive" data-testid="policy-gate-error">{error}</p>
            )}
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="gap-2 min-w-[140px]"
              data-testid="button-accept-policy"
            >
              <CheckCircle2 className="h-4 w-4" />
              {accepting ? "Recording..." : "I Accept"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
