import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Plus, Upload, Share2, BarChart3, Play, Trash2, ArrowLeft } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';

export function ContentStudio() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNav currentPath="/content-studio" />
      <div className="pl-4 md:pl-0 pt-16 md:pt-0">
        <ContentStudioContent />
      </div>
    </div>
  );
}

function ContentStudioContent() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) return;

      // Get current business (from URL or context)
      const response = await fetch('http://localhost:3001/businesses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const businesses = await response.json();
        if (businesses.length > 0) {
          const businessId = businesses[0].id;
          
          const projectsResponse = await fetch(
            `http://localhost:3001/businesses/${businessId}/content-projects`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: any) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await fetch('http://localhost:3001/businesses/1/content-projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowNewProjectForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      processing: 'warning',
      ready: 'success',
      published: 'default',
    };
    return variants[status] || 'info';
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedProject(null)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProject.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Status: <Badge variant={getStatusBadge(selectedProject.status)}>{selectedProject.status}</Badge>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedProject.reels && selectedProject.reels.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-4">Generated Reels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.reels.map((reel: any) => (
                        <div key={reel.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reel.title}</h4>
                            <Badge variant="info">{reel.platform}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{reel.hook}</p>
                          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                            <div>
                              <span className="text-gray-500">Score</span>
                              <p className="font-semibold">{Math.round(reel.prePublishScore)}/100</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration</span>
                              <p className="font-semibold">{reel.duration}s</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status</span>
                              <p className="font-semibold">{reel.status}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Play className="w-4 h-4" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Share2 className="w-4 h-4" />
                              Publish
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No reels generated yet. Processing content...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Content Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Transform your content into engaging social media reels
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => setShowNewProjectForm(true)}
          >
            <Plus className="w-5 h-5" />
            New Project
          </Button>
        </div>

        {/* New Project Form */}
        {showNewProjectForm && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-bold">Create New Project</h2>
            </CardHeader>
            <CardContent>
              <NewProjectForm 
                onSubmit={handleCreateProject}
                onCancel={() => setShowNewProjectForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first content project to get started
              </p>
              <Button 
                variant="primary"
                onClick={() => setShowNewProjectForm(true)}
              >
                <Plus className="w-5 h-5" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                      {project.inputText?.substring(0, 30) || `Project ${project.id.substring(0, 8)}`}
                    </h3>
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Input: {project.inputType}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {project.reels?.length || 0} reels
                    </div>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      View →
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewProjectForm({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    inputType: 'text',
    inputText: '',
    style: 'educational',
    reelsRequested: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Input Type</label>
        <select
          value={formData.inputType}
          onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="text">Text</option>
          <option value="blog">Blog URL</option>
          <option value="video">Video URL</option>
          <option value="voice">Voice/Audio</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <textarea
          value={formData.inputText}
          onChange={(e) => setFormData({ ...formData, inputText: e.target.value })}
          placeholder="Paste your content here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Style</label>
          <select
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="educational">Educational</option>
            <option value="storytelling">Storytelling</option>
            <option value="entertaining">Entertaining</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reels</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.reelsRequested}
            onChange={(e) => setFormData({ ...formData, reelsRequested: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="primary" className="flex-1" type="submit">
          Create Project
        </Button>
        <Button variant="outline" className="flex-1" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
