import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const logoBase64 = reader.result as string;

        // Call the edge function to generate the landing page
        const { data, error } = await supabase.functions.invoke("generate-landing-page", {
          body: {
            companyName,
            logoBase64,
          },
        });

        if (error) throw error;

        onGenerate(data);
        
        toast({
          title: "Success!",
          description: "Your landing page has been generated",
        });
      };
      reader.readAsDataURL(logoFile);
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
