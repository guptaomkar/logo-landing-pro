import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Wand2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneratorFormProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const GeneratorForm = ({ onGenerate, isGenerating, setIsGenerating }: GeneratorFormProps) => {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const { toast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      return;
    }

    if (!companyDescription.trim()) {
      toast({
        title: "Company description required",
        description: "Please describe your company to generate relevant content",
        variant: "destructive",
      });
      return;
    }

    if (!logoFile) {
      toast({
        title: "Logo required",
        description: "Please upload your company logo",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Convert logo to base64
      const logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoFile);
      });

      // Call the edge function to generate the landing page
      const { data, error } = await supabase.functions.invoke("generate-landing-page", {
        body: {
          companyName,
          companyDescription,
          logoBase64,
        },
      });

      if (error) throw error;

      onGenerate(data);
      
      toast({
        title: "Success!",
        description: "Your landing page has been generated",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate landing page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="glass-effect p-8 hover-lift">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          Generate Your Page
        </h2>

        <div className="space-y-6">
          {/* Company Name Input */}
          <div className="space-y-2">
            <Label htmlFor="company-name" className="text-base font-medium">
              Company Name
            </Label>
            <Input
              id="company-name"
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          {/* Company Description Input */}
          <div className="space-y-2">
            <Label htmlFor="company-description" className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Company Description
            </Label>
            <Textarea
              id="company-description"
              placeholder="Describe your company, products/services, target audience, and what makes you unique..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              className="bg-background/50 border-border/50 min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              The more details you provide, the better your landing page content will be tailored.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload" className="text-base font-medium">
              Company Logo
            </Label>
            <div className="relative">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-32 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-20 max-w-full object-contain"
                    />
                    <span className="text-xs text-muted-foreground">Click to change</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm">Upload logo (PNG, JPG, SVG)</span>
                    <span className="text-xs text-muted-foreground">Max 5MB</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Landing Page
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Our AI will analyze your logo, extract colors, and generate professional 
            content including headlines, features, testimonials, and more.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default GeneratorForm;
