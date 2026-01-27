'use client';

import { useState } from 'react';
import { ProjectsApi, Configuration } from '../../api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, FolderPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const CreateProject = ({ onSuccess, open, onOpenChange }: { 
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '',
    repoUrl: '',
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { getToken } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setForm({ ...form, type: value });
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      type: '',
      repoUrl: '',
    });
    setError('');
    setSuccess(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const sessionToken = await getToken();
      const config = new Configuration({
        basePath: import.meta.env.VITE_BACKEND_API_KEY,
        accessToken: sessionToken || undefined,
      });
      const api = new ProjectsApi(config);

      const result = await api.projectsControllerCreate(form);
      setResponse(result.data);
      setSuccess(true);
      setLoading(false);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
        resetForm();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Create a New Project
          </DialogTitle>
          <DialogDescription>
            Fill out the details below to create your project. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description 
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Project Type
            </Label>
            <Select
              value={form.type}
              onValueChange={handleSelectChange}
              disabled={loading}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile Application</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="text-sm font-medium">
              Repository URL
            </Label>
            <Input
              id="repoUrl"
              name="repoUrl"
              placeholder="https://github.com/username/repo"
              value={form.repoUrl}
              onChange={handleChange}
              disabled={loading}
              type="url"
              className="h-10"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Project created successfully!</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="gap-2 bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProject;