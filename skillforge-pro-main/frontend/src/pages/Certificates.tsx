import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Upload,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Shield,
  X,
  FileText,
  Calendar,
  Building,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiClient";
import { getAuthToken } from "@/lib/apiClient";

export default function Certificates() {
  const { user, refreshMe } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [explorerUrlByCertId, setExplorerUrlByCertId] = useState<Record<string, string>>({});

  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    issuer: "",
    date: "",
    credentialId: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apiBaseUrl = useMemo(() => {
    const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;
    return (raw || "").trim().replace(/\/$/, "");
  }, []);

  const certificateImageUrl = (src: string) => {
    const s = String(src || "");
    if (!s) return "";
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.startsWith("/uploads/")) return `${apiBaseUrl}${s}`;
    return "";
  };

  const certificateFileKind = (cert: any): "image" | "pdf" | "none" => {
    const mime = String(cert?.fileMime || "").toLowerCase();
    const url = String(cert?.image || "");
    const fileName = String(cert?.fileName || "").toLowerCase();
    if (mime === "application/pdf" || url.toLowerCase().endsWith(".pdf") || fileName.endsWith(".pdf")) return "pdf";
    if (mime.startsWith("image/")) return "image";
    if (certificateImageUrl(url)) return "image";
    return "none";
  };

  const downloadWithAuth = async (path: string, fallbackFileName: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`${apiBaseUrl}${path}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText || "Download failed");
      }

      const contentType = String(res.headers.get("content-type") || "").toLowerCase();
      const cd = String(res.headers.get("content-disposition") || "");
      const nameFromHeader = (() => {
        // filename*=UTF-8''... OR filename="..."
        const m1 = cd.match(/filename\*=(?:UTF-8''|)([^;]+)/i);
        if (m1 && m1[1]) {
          const raw = m1[1].trim().replace(/^"|"$/g, "");
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        }
        const m2 = cd.match(/filename="([^"]+)"/i);
        if (m2 && m2[1]) return m2[1].trim();
        return "";
      })();

      let finalName = String(nameFromHeader || fallbackFileName || "file").trim() || "file";
      if (contentType.includes("application/pdf") && !finalName.toLowerCase().endsWith(".pdf")) {
        finalName = `${finalName}.pdf`;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: e?.message || "Please try again",
      });
    }
  };

  const viewPdfWithAuth = async (path: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(`${apiBaseUrl}${path}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText || "Unable to open file");
      }

      const contentType = String(res.headers.get("content-type") || "").toLowerCase();
      if (!contentType.includes("application/pdf")) {
        throw new Error("This uploaded file is not a PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // Best-effort cleanup after some time; tab might still be reading it.
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Unable to open PDF",
        description: e?.message || "Please try again",
      });
    }
  };

  const resetUploadModal = () => {
    setUploadFile(null);
    setUploadForm({ name: "", issuer: "", date: "", credentialId: "" });
  };

  const handleUpload = async () => {
    try {
      if (!uploadForm.name.trim() || !uploadForm.issuer.trim() || !uploadForm.date.trim()) {
        toast({
          title: "Missing fields",
          description: "Certificate name, issuer, and date are required.",
          variant: "destructive",
        });
        return;
      }
      if (!uploadFile) {
        toast({
          title: "No file selected",
          description: "Please select a PDF, PNG, or JPG file.",
          variant: "destructive",
        });
        return;
      }

      setUploadBusy(true);
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("name", uploadForm.name.trim());
      form.append("issuer", uploadForm.issuer.trim());
      form.append("date", uploadForm.date.trim());
      if (uploadForm.credentialId.trim()) form.append("credentialId", uploadForm.credentialId.trim());

      await apiFetch<{ certificate: any }>("/api/certificates/me", { method: "POST", body: form });
      await refreshMe();
      setUploadModalOpen(false);
      resetUploadModal();
      toast({ title: "Certificate Uploaded", description: "Your certificate is pending verification." });
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploadBusy(false);
    }
  };

  const handleVerifyOnChain = async (certId: string) => {
    try {
      const out = await apiFetch<{ verified: boolean; explorerUrl?: string; txHash?: string }>(
        `/api/certificates/me/${certId}/verify`,
        { method: "POST", body: {} }
      );
      if (out?.explorerUrl) {
        setExplorerUrlByCertId((p) => ({ ...p, [certId]: String(out.explorerUrl) }));
      }
      await refreshMe();
      toast({
        title: out.verified ? "Verified on Blockchain" : "Not verified",
        description: out.verified
          ? "This certificate hash exists on-chain."
          : "This certificate hash was not found on-chain.",
        variant: out.verified ? undefined : "destructive",
      });
    } catch (e: any) {
      toast({
        title: "Verification failed",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleMint = async (certId: string) => {
    try {
      setMintingId(certId);
      const out = await apiFetch<{ tokenId?: string; txHash?: string; explorerUrl?: string }>(
        `/api/certificates/me/${certId}/mint`,
        { method: "POST", body: {} }
      );

      if (out?.explorerUrl) {
        setExplorerUrlByCertId((prev) => ({ ...prev, [certId]: String(out.explorerUrl) }));
      }

      await refreshMe();
      toast({
        title: "NFT Minted Successfully!",
        description: out?.txHash
          ? `Transaction: ${String(out.txHash).slice(0, 10)}...`
          : "Your certificate has been minted on the blockchain.",
      });
    } catch (e: any) {
      toast({
        title: "Unable to mint",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setMintingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              NFT <span className="gradient-text">Certificates</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your verified credentials and mint them as NFTs
            </p>
          </div>
          <GradientButton onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Upload Certificate
          </GradientButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{user?.certificates?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Certificates</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">
              {user?.certificates?.filter((c) => c.nftMinted).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Minted as NFT</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">
              {user?.certificates?.filter((c) => c.verified).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </GlassCard>
          <GlassCard hover={false} className="p-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">
              {user?.certificates?.filter((c) => !c.nftMinted).length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Pending Mint</p>
          </GlassCard>
        </motion.div>

        {/* Certificates Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.certificates?.map((cert) => (
            <StaggerItem key={cert.id}>
              <GlassCard className="overflow-hidden">
                {/* Certificate Preview */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center px-3">
                    <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                      {certificateFileKind(cert) === "pdf" ? "PDF Certificate" : "Uploaded File"}
                    </p>
                  </div>
                  {cert.nftMinted && (
                    <div className="absolute top-3 right-3">
                      <Badge className="gradient-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        NFT
                      </Badge>
                    </div>
                  )}
                  {certificateFileKind(cert) === "pdf" && (
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="secondary" className="bg-muted/40 border-border">
                        PDF
                      </Badge>
                    </div>
                  )}
                  {cert.verified && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Certificate Info */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-1">{cert.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building className="h-4 w-4" />
                    {cert.issuer}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {cert.date}
                  </div>

                  {cert.nftMinted ? (
                    <div className="mt-4 p-3 rounded-lg bg-muted">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Token ID</span>
                        <span className="font-mono">{cert.tokenId}</span>
                      </div>

                      {!cert.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleVerifyOnChain(cert.id)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Verify on Blockchain
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        disabled={!String((cert as any).image || "")}
                        onClick={() => {
                          const isPdf = certificateFileKind(cert) === "pdf";
                          const fallback = isPdf ? `${cert.name || "certificate"}.pdf` : `${cert.name || "certificate"}`;
                          const name = String((cert as any).fileName || "").trim() || fallback;
                          void downloadWithAuth(`/api/certificates/me/${cert.id}/file`, name);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download Uploaded File
                      </Button>

                      {certificateFileKind(cert) === "pdf" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          disabled={!String((cert as any).image || "")}
                          onClick={() => void viewPdfWithAuth(`/api/certificates/me/${cert.id}/file`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-primary"
                        onClick={() => {
                          const url = explorerUrlByCertId[cert.id];
                          if (url) {
                            window.open(url, "_blank", "noopener,noreferrer");
                            return;
                          }
                          toast({
                            title: "Explorer link unavailable",
                            description: "Mint again to fetch a fresh explorer link.",
                          });
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Blockchain
                      </Button>
                    </div>
                  ) : (
                    <GradientButton
                      className="w-full mt-4"
                      onClick={() => handleMint(cert.id)}
                      loading={mintingId === cert.id}
                    >
                      {mintingId === cert.id ? (
                        "Minting..."
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Mint as NFT
                        </>
                      )}
                    </GradientButton>
                  )}
                </div>
              </GlassCard>
            </StaggerItem>
          ))}

          {/* Add New Card */}
          <StaggerItem>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="h-full min-h-[300px] w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="font-medium">Add New Certificate</p>
                <p className="text-sm">Upload and verify your credentials</p>
              </div>
            </button>
          </StaggerItem>
        </StaggerContainer>

        {/* Upload Modal */}
        <AnimatePresence>
          {uploadModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setUploadModalOpen(false);
                resetUploadModal();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg"
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">Upload Certificate</h2>
                    <button
                      onClick={() => {
                        setUploadModalOpen(false);
                        resetUploadModal();
                      }}
                      className="p-2 rounded-lg hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setUploadFile(f);
                      }}
                    />

                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const f = e.dataTransfer.files?.[0] || null;
                        if (f) setUploadFile(f);
                      }}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">Drop your certificate here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse (PDF, PNG, JPG)
                      </p>
                      {uploadFile && (
                        <p className="text-sm mt-3 text-muted-foreground">Selected: {uploadFile.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="name">Certificate Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., AWS Solutions Architect"
                        className="mt-1"
                        value={uploadForm.name}
                        onChange={(e) => setUploadForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="issuer">Issuing Organization</Label>
                      <Input
                        id="issuer"
                        placeholder="e.g., Amazon Web Services"
                        className="mt-1"
                        value={uploadForm.issuer}
                        onChange={(e) => setUploadForm((p) => ({ ...p, issuer: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Issue Date</Label>
                      <Input
                        id="date"
                        type="date"
                        className="mt-1"
                        value={uploadForm.date}
                        onChange={(e) => setUploadForm((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="credential">Credential ID (Optional)</Label>
                      <Input
                        id="credential"
                        placeholder="Enter credential ID for verification"
                        className="mt-1"
                        value={uploadForm.credentialId}
                        onChange={(e) => setUploadForm((p) => ({ ...p, credentialId: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setUploadModalOpen(false);
                          resetUploadModal();
                        }}
                      >
                        Cancel
                      </Button>
                      <GradientButton
                        className="flex-1"
                        onClick={handleUpload}
                        loading={uploadBusy}
                      >
                        {uploadBusy ? "Uploading..." : "Upload & Verify"}
                      </GradientButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
