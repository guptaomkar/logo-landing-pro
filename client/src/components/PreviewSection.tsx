import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code, Eye, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DownloadModal from "./DownloadModal";

interface PreviewSectionProps {
  generatedPage: any;
  isGenerating: boolean;
}

const PreviewSection = ({ generatedPage, isGenerating }: PreviewSectionProps) => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"html" | "react">("html");

  const handleDownloadClick = (format: "html" | "react") => {
    setDownloadFormat(format);
    setDownloadModalOpen(true);
  };

  const handleOpenInNewTab = () => {
    if (!generatedPage?.html) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedPage.html);
      newWindow.document.close();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        <Card className="glass-effect p-8 min-h-[600px] hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-secondary" />
              Preview & Export
            </h2>

            {generatedPage && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="hover:bg-accent/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadClick("html")}
                  className="hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadClick("react")}
                  className="hover:bg-secondary/10"
                >
                  <Code className="w-4 h-4 mr-2" />
                  React
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[500px] gap-4"
              >
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Generating your landing page...</p>
                  <p className="text-sm text-muted-foreground">
                    AI is analyzing your logo and creating content
                  </p>
                </div>
              </motion.div>
            ) : generatedPage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="bg-white rounded-lg overflow-hidden border border-border/50">
                  <iframe
                    srcDoc={generatedPage.html}
                    className="w-full h-[500px]"
                    title="Landing Page Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[500px] gap-4 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-primary opacity-20" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">No preview yet</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Upload your logo and company name to generate a stunning landing page
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        downloadFormat={downloadFormat}
        generatedPage={generatedPage}
      />
    </>
  );
};

export default PreviewSection;
