'use client';

import { useState } from 'react';
import { ProjectsApi, Configuration } from '../api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const config = new Configuration({
  basePath: "http://localhost:3000",
});

const api = new ProjectsApi(config);

const CreateProject = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: '',
    repo_url: '',
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await api.projectsControllerCreate(form);
      setResponse(result.data);
    } catch {
      setError('Error creating project');
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
            name="repo_url"
            placeholder="Repository URL"
            value={form.repo_url}
            onChange={handleChange}
            required
          />
          <Button type="submit">Create Project</Button>
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