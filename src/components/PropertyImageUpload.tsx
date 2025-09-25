import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Star, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";

interface PropertyImageUploadProps {
  propertyId: string;
  existingImages?: any[];
  onUploadComplete: () => void;
}

export const PropertyImageUpload = ({ 
  propertyId, 
  existingImages = [], 
  onUploadComplete 
}: PropertyImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files",
            variant: "destructive",
          });
          continue;
        }

        await supabaseService.properties.uploadPropertyImage(
          propertyId, 
          file, 
          existingImages.length === 0 && i === 0
        );
      }

      toast({
        title: "Images uploaded successfully",
        description: `${files.length} image(s) uploaded`,
      });

      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Property Images</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop images here, or click to select files
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Image className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Select Images"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: JPG, PNG, WEBP. Max size: 10MB per file
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {existingImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {image.is_primary && (
                    <Badge className="absolute top-2 left-2">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};