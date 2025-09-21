import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, FileImage, ArrowLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function UploadID() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/kyc/document-type">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="text-xl font-bold text-foreground">PropChain</span>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Step 2 of 5</span>
              <Progress value={40} className="w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Upload Your ID Document
          </h1>
          <p className="text-muted-foreground">
            Please upload a clear photo of your National ID (NIN)
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <Card className="border-border mb-8">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <FileImage className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Drag and drop your ID here
                      </p>
                      <p className="text-muted-foreground">
                        or choose from your device
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer">
                          <FileImage className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                      
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Photo Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">✅ Good Photo</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• All four corners visible</li>
                    <li>• Text is clear and readable</li>
                    <li>• Good lighting, no shadows</li>
                    <li>• Document is flat and straight</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">❌ Avoid</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Blurry or unclear images</li>
                    <li>• Glare or reflections</li>
                    <li>• Cropped or cut-off edges</li>
                    <li>• Screenshots or photocopies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center">
            <Link to={uploadedFile ? "/kyc/selfie" : "#"}>
              <Button 
                size="lg" 
                className="px-8" 
                disabled={!uploadedFile}
              >
                Continue to Selfie
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}