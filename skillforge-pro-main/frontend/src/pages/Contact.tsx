import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.subject.trim().length > 0 &&
      form.message.trim().length > 0
    );
  }, [form]);

  const onChange = (key: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Demo-only: no backend wired yet
      await new Promise((r) => setTimeout(r, 450));
      toast({
        title: "Message sent",
        description: "Thanks for reaching out. We’ll get back to you shortly.",
      });
      setForm(initialState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-10">
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <p className="text-sm uppercase tracking-widest text-primary">Contact</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Let’s talk.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question, feedback, or want to partner? Send a message and we’ll respond soon.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Contact info */}
            <div className="space-y-4">
              <GlassCard className="p-6 space-y-4">
                <h2 className="font-display text-xl font-semibold">Contact info</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">hello@chainhire.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">+1 (555) 010-2424</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-muted-foreground">Remote-first</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-2">
                <h3 className="font-display text-lg font-semibold">Recruiting teams</h3>
                <p className="text-sm text-muted-foreground">
                  If you’re hiring, check the recruiter workflow and start posting roles.
                </p>
                <div className="pt-2">
                  <GradientButton variant="outline" asChild>
                    <a href="/recruiters">For Recruiters</a>
                  </GradientButton>
                </div>
              </GlassCard>
            </div>

            {/* Form */}
            <GlassCard className="p-6 lg:col-span-2">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" value={form.name} onChange={onChange("name")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={onChange("email")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={onChange("subject")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us a bit more…"
                    value={form.message}
                    onChange={onChange("message")}
                    className="min-h-36"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    This is a demo form (no backend). It will show a confirmation toast.
                  </p>
                  <GradientButton type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </GradientButton>
                </div>
              </form>
            </GlassCard>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
