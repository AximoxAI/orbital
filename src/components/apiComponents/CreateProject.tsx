'use client';

import { useState } from 'react';
import { ProjectsApi, Configuration } from '../../api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const CreateProject = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '',
    repoUrl: '',
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Get session token from Clerk
      const sessionToken = await getToken();
      // Create API instance with token
      const config = new Configuration({
        basePath: import.meta.env.VITE_BACKEND_API_KEY,
        accessToken: sessionToken || undefined,
      });
      const api = new ProjectsApi(config);

      const result = await api.projectsControllerCreate(form);
      setResponse(result.data);
      setLoading(false);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch {
      setError('Error creating project');
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4 p-4">
      <CardHeader>
        <CardTitle>Create a New Project</CardTitle>
        <CardDescription>Fill out the form below to create a project</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Project Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <Input
            name="type"
            placeholder="Type"
            value={form.type}
            onChange={handleChange}
            required
          />
          <Input
            name="repoUrl"
            placeholder="Repository URL"
            value={form.repoUrl}
            onChange={handleChange}
          />
          <Button type="submit" className="w-[100%] bg-slate-800 hover:bg-slate-600" >
             Create Project
          </Button>
        </form>
        {error && (
          <div className="text-red-600 mt-2">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateProject;