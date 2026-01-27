import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Configuration, ProjectsApi } from "@/api-client";
import { useAuth } from "@clerk/clerk-react";

const GenerateRequirements: React.FC<{ defaultProjectId?: string }> = ({ defaultProjectId }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    requirements: "",
    project_id: defaultProjectId || "",
    auto_create_tasks: true
  });

  useEffect(() => {
    if (defaultProjectId) {
      setFormData((prev) => ({
        ...prev,
        project_id: defaultProjectId
      }));
    }
  }, [defaultProjectId]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: "requirements" | "project_id" | "auto_create_tasks", value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get session token and create authenticated API instance
      const sessionToken = await getToken();
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_BACKEND_API_KEY,
        accessToken: sessionToken || undefined,
      });
      const projectsApi = new ProjectsApi(configuration);

      const result = await projectsApi.projectsControllerCreateConversational(formData);
      setResponse(result.data);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setResponse(null);
      }, 5000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
      console.error('Error creating conversational project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Generate Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requirements">Project Requirements *</Label>
              <Textarea
                id="requirements"
                placeholder="Describe your project requirements in detail..."
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !formData.requirements || !formData.project_id}
              className="w-[100%] bg-slate-800 hover:bg-slate-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Task...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Project created successfully!
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GenerateRequirements;