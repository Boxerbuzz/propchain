import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Image, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadDocs = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const requiredDocuments = [
    {
      id: "deed",
      title: "Property Deed/Title",
      description: "Legal proof of ownership",
      required: true,
      formats: "PDF, JPG, PNG"
    },
    {
      id: "survey",
      title: "Survey Plan",
      description: "Official survey documentation",
      required: true,
      formats: "PDF, JPG, PNG"
    },
    {
      id: "valuation",
      title: "Property Valuation",
      description: "Professional valuation report",
      required: true,
      formats: "PDF"
    },
    {
      id: "photos",
      title: "Property Photos",
      description: "High-quality property images",
      required: true,
      formats: "JPG, PNG"
    },
    {
      id: "permits",
      title: "Building Permits",
      description: "Valid construction/occupancy permits",
      required: false,
      formats: "PDF, JPG, PNG"
    },
    {
      id: "insurance",
      title: "Insurance Documents",
      description: "Property insurance coverage",
      required: false,
      formats: "PDF"
    }
  ];

  const handleFileUpload = (documentId: string) => {
    // Simulate file upload
    setUploadedFiles(prev => ({ ...prev, [documentId]: true }));
  };

  const completedUploads = Object.keys(uploadedFiles).length;
  const requiredUploads = requiredDocuments.filter(doc => doc.required).length;
  const progressPercentage = (completedUploads / requiredDocuments.length) * 100;

  const canProceed = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => uploadedFiles[doc.id]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-spartan">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Documents</h1>
        <p className="text-muted-foreground">
          Upload required documentation for property verification
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {requiredDocuments.map((doc) => {
            const isUploaded = uploadedFiles[doc.id];
            const IconComponent = doc.id === "photos" ? Image : FileText;
            
            return (
              <Card key={doc.id} className={`transition-all duration-200 ${isUploaded ? 'border-success bg-success/5' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${isUploaded ? 'bg-success/20' : 'bg-muted'}`}>
                        <IconComponent className={`h-6 w-6 ${isUploaded ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{doc.title}</h3>
                          {doc.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          {isUploaded && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {doc.description}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          Supported formats: {doc.formats}
                        </p>
                        
                        {isUploaded && (
                          <div className="mt-3 p-2 bg-success/10 rounded border border-success/20">
                            <p className="text-sm text-success font-medium">
                              ✓ Document uploaded successfully
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isUploaded ? (
                        <Button variant="outline" size="sm">
                          Replace
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleFileUpload(doc.id)}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completed</span>
                  <span>{completedUploads}/{requiredDocuments.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Required documents:</span>
                  <span className={requiredUploads === Object.keys(uploadedFiles).filter(id => 
                    requiredDocuments.find(doc => doc.id === id && doc.required)
                  ).length ? 'text-success' : 'text-muted-foreground'}>
                    {Object.keys(uploadedFiles).filter(id => 
                      requiredDocuments.find(doc => doc.id === id && doc.required)
                    ).length}/{requiredUploads}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Optional documents:</span>
                  <span className="text-muted-foreground">
                    {Object.keys(uploadedFiles).filter(id => 
                      requiredDocuments.find(doc => doc.id === id && !doc.required)
                    ).length}/{requiredDocuments.filter(doc => !doc.required).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p>Ensure all documents are clear and legible</p>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p>Maximum file size: 10MB per document</p>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p>All documents will be verified by our team</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/properties/my-properties")}
              disabled={!canProceed}
              className="w-full"
            >
              Continue to Review
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/properties/register")}
              className="w-full"
            >
              Back to Registration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocs;