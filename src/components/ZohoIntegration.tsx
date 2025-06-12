import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ZohoIntegration = () => {
  const [refreshToken, setRefreshToken] = useState('');
  const [orgId, setOrgId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const handleSubmit = async () => {
    console.log("🧪 Submitting with:", { refreshToken, orgId, accessToken });

    if (!refreshToken || !orgId || !accessToken) {
      setStatus("⚠️ Please fill all fields");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("https://hjaqnjjptipnxeonojip.supabase.co/functions/v1/sync-zoho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          org_id: orgId,
          access_token: accessToken,
        }),
      });

      const raw = await res.text();
      console.log("📦 Raw response:", raw);

      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        setStatus("❌ Server returned invalid JSON");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setStatus(`❌ Failed: ${result.error || "Unknown error"}`);
      } else {
        setStatus(`✅ Credentials saved! ${result.message || "Success"}`);
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setStatus("❌ Unexpected error");
    }

    setLoading(false);
  };

  const handleInvoiceSync = async () => {
    if (!orgId) {
      setSyncStatus("⚠️ Please enter an organization ID first");
      return;
    }

    setSyncStatus("🔄 Syncing invoices...");

    try {
      const res = await fetch("https://hjaqnjjptipnxeonojip.supabase.co/functions/v1/sync-invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ org_id: orgId })
      });

      const raw = await res.text();
      console.log("📦 Invoice sync response:", raw);

      const result = JSON.parse(raw);
      if (!res.ok) {
        setSyncStatus(`❌ Sync failed: ${result.error || "Unknown error"}`);
      } else {
        setSyncStatus(`✅ Synced ${result.count} invoices`);
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      setSyncStatus("❌ Unexpected sync error");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🔗 Link Zoho Books</h2>

      <div className="mb-4">
        <Label htmlFor="refreshToken">Refresh Token</Label>
        <Input
          id="refreshToken"
          value={refreshToken}
          onChange={(e) => setRefreshToken(e.target.value)}
          placeholder="Enter Zoho refresh token"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="orgId">Organization ID</Label>
        <Input
          id="orgId"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="Enter Zoho organization ID"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="accessToken">Access Token</Label>
        <Input
          id="accessToken"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Enter Zoho access token"
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Credentials"}
        </Button>
        <Button variant="secondary" onClick={handleInvoiceSync}>
          Sync Invoices
        </Button>
      </div>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      {syncStatus && <p className="mt-2 text-sm text-blue-600">{syncStatus}</p>}
    </div>
  );
};

export default ZohoIntegration;

