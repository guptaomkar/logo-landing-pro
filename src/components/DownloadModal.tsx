import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Code, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadFormat: "html" | "react";
  generatedPage: any;
}

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  contactNumber: z.string().trim().min(1, "Contact number is required").max(20),
  businessName: z.string().trim().min(1, "Business name is required").max(200),
  location: z.string().trim().min(1, "Location is required").max(200),
});

const DownloadModal = ({
  isOpen,
  onClose,
  downloadFormat,
  generatedPage,
}: DownloadModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    businessName: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = leadSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("download_leads").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact_number: formData.contactNumber.trim(),
        business_name: formData.businessName.trim(),
        location: formData.location.trim(),
        download_format: downloadFormat,
      });

      if (error) throw error;

      // Proceed with download
      const content =
        downloadFormat === "html" ? generatedPage.html : generatedPage.react;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `landing-page.${downloadFormat === "html" ? "html" : "jsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: `Your ${downloadFormat.toUpperCase()} file has been downloaded`,
      });

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        contactNumber: "",
        businessName: "",
        location: "",
      });
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {downloadFormat === "html" ? (
              <Download className="w-5 h-5 text-primary" />
            ) : (
              <Code className="w-5 h-5 text-secondary" />
            )}
            Download {downloadFormat.toUpperCase()} Code
          </DialogTitle>
          <DialogDescription>
            Please fill in your details to download the generated code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="John Doe"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              placeholder="+1 234 567 8900"
              className={errors.contactNumber ? "border-destructive" : ""}
            />
            {errors.contactNumber && (
              <p className="text-xs text-destructive">{errors.contactNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              placeholder="Acme Inc."
              className={errors.businessName ? "border-destructive" : ""}
            />
            {errors.businessName && (
              <p className="text-xs text-destructive">{errors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="New York, USA"
              className={errors.location ? "border-destructive" : ""}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
