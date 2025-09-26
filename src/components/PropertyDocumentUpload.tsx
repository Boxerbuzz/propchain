import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";

interface PropertyDocumentUploadProps {
  propertyId: string;
  existingDocuments?: any[];
  onUploadComplete: () => void;
}

const documentTypes = [
  { id: "deed", name: "Property Deed/Title", required: true },
  { id: "survey", name: "Survey Plan", required: true },
  { id: "valuation", name: "Property Valuation", required: true },
  { id: "permits", name: "Building Permits", required: false },
  { id: "insurance", name: "Insurance Documents", required: false },
  { id: "other", name: "Other", required: false },
];

export const PropertyDocumentUpload = ({ 
  propertyId, 
  existingDocuments = [], 
  onUploadComplete 
}: PropertyDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedType) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const docType = documentTypes.find(dt => dt.id === selectedType);
        
        if (!docType) continue;

        // First upload to HFS
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('propertyId', propertyId);

        const { data: hfsResult, error: hfsError } = await supabase.functions.invoke('upload-to-hfs', {
          body: formData,
        });

        if (hfsError) {
          throw new Error(`HFS upload failed: ${hfsError.message}`);
        }

        if (!hfsResult.success) {
          throw new Error(`HFS upload failed: ${hfsResult.error}`);
        }

        // Then upload to Supabase Storage and save document record
        const document = await supabaseService.properties.uploadPropertyDocument(
          propertyId, 
          file,
          selectedType,
          docType.name
        );

        // Update document record with HFS details
        const { error: updateError } = await supabase
          .from('property_documents')
          .update({
            hfs_file_id: hfsResult.data.fileId,
            file_hash: hfsResult.data.fileHash,
          })
          .eq('id', document.id);

        if (updateError) {
          console.error('Failed to update document with HFS details:', updateError);
        }

        toast({
          title: "Document uploaded",
          description: `${file.name} uploaded to HFS and storage`,
        });
      }

      // Update property with HFS file IDs
      const { data: documents } = await supabase
        .from('property_documents')
        .select('hfs_file_id')
        .eq('property_id', propertyId)
        .not('hfs_file_id', 'is', null);

      if (documents && documents.length > 0) {
        const hfsFileIds = documents.map(doc => doc.hfs_file_id);
        await supabase
          .from('properties')
          .update({ hfs_file_ids: hfsFileIds })
          .eq('id', propertyId);
      }

      setSelectedType("");
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Upload New Document</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-input bg-background rounded-md"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.required && "(Required)"}
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Select files to upload (will be stored on HFS)
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedType}
            >
              <FileText className="h-4 w-4 mr-2" />
              {uploading ? (
                <div className="flex items-center">
                  <Spinner size={16} className="mr-2" />
                  Uploading to HFS...
                </div>
              ) : (
                "Select Files"
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, JPG, PNG. Max size: 10MB per file
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {existingDocuments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            <div className="space-y-3">
              {existingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.verification_status)}
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                      {doc.hfs_file_id && (
                        <p className="text-xs text-success">HFS: {doc.hfs_file_id}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(doc.verification_status) as any}>
                    {doc.verification_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};