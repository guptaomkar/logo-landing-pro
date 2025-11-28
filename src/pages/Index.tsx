import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import GeneratorForm from "@/components/GeneratorForm";
import PreviewSection from "@/components/PreviewSection";

const Index = () => {
  const [generatedPage, setGeneratedPage] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Landing Page Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create Stunning
            <span className="block gradient-text">Landing Pages</span>
            <span className="block">in Seconds</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload your logo and company name. Our AI generates a complete, 
            professional landing page with content, design, and code—ready to export.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wand2 className="w-4 h-4 text-primary" />
              <span>AI Content Generation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Auto Color Extraction</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wand2 className="w-4 h-4 text-accent" />
              <span>Export Ready Code</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <GeneratorForm
            onGenerate={setGeneratedPage}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
          
          <PreviewSection
            generatedPage={generatedPage}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
