import { useState } from "react";
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

export default function Certificates() {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [mintingId, setMintingId] = useState<string | null>(null);

  const handleMint = async (certId: string) => {
    setMintingId(certId);
    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setMintingId(null);
    toast({
      title: "NFT Minted Successfully! 🎉",
      description: "Your certificate has been minted as an NFT on the blockchain.",
    });
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
                  <span className="text-6xl">{cert.image}</span>
                  {cert.nftMinted && (
                    <div className="absolute top-3 right-3">
                      <Badge className="gradient-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        NFT
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-primary"
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
              onClick={() => setUploadModalOpen(false)}
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
                      onClick={() => setUploadModalOpen(false)}
                      className="p-2 rounded-lg hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">Drop your certificate here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse (PDF, PNG, JPG)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="name">Certificate Name</Label>
                      <Input id="name" placeholder="e.g., AWS Solutions Architect" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="issuer">Issuing Organization</Label>
                      <Input id="issuer" placeholder="e.g., Amazon Web Services" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="date">Issue Date</Label>
                      <Input id="date" type="date" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="credential">Credential ID (Optional)</Label>
                      <Input id="credential" placeholder="Enter credential ID for verification" className="mt-1" />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setUploadModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <GradientButton
                        className="flex-1"
                        onClick={() => {
                          setUploadModalOpen(false);
                          toast({
                            title: "Certificate Uploaded!",
                            description: "Your certificate is pending verification.",
                          });
                        }}
                      >
                        Upload & Verify
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
