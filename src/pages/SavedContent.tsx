import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Copy, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Reply, 
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { getSavedContent, deleteContent } from '@/lib/api';
import { SavedContent as SavedContentType } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SavedContent = () => {
  const [content, setContent] = useState<SavedContentType[]>([]);
  const [filteredContent, setFilteredContent] = useState<SavedContentType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dm' | 'reply' | 'thread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const tabs = [
    { id: 'all', name: 'All', icon: Filter },
    { id: 'dm', name: 'DMs', icon: MessageSquare },
    { id: 'reply', name: 'Replies', icon: Reply },
    { id: 'thread', name: 'Threads', icon: FileText },
  ];

  useEffect(() => {
    if (user) {
      loadContent();
    }
  }, [user]);

  useEffect(() => {
    filterContent();
  }, [content, searchQuery, activeTab]);

  const loadContent = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const savedContent = await getSavedContent(user.id);
      setContent(savedContent);
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast({
        title: "Load failed",
        description: error.message || "Failed to load saved content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredContent(filtered);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id);
      setContent(content.filter(item => item.id !== id));
      toast({
        title: "Deleted!",
        description: "Content removed from your library.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dm': return MessageSquare;
      case 'reply': return Reply;
      case 'thread': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dm': return 'bg-blue-600';
      case 'reply': return 'bg-green-600';
      case 'thread': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Saved Content</h1>
          <p className="text-gray-400">Loading your saved content...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Saved Content</h1>
        <p className="text-gray-400">Manage your saved DMs, replies, and threads</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={activeTab === tab.id ? "bg-blue-600 text-white" : "border-gray-600 text-gray-300 hover:text-white"}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg ${getTypeColor(item.type)} flex items-center justify-center`}>
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-sm font-medium truncate">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {item.content.length > 150 
                        ? `${item.content.substring(0, 150)}...` 
                        : item.content
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(item.content)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery || activeTab !== 'all' 
                  ? 'No content found' 
                  : 'No saved content yet'
                }
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || activeTab !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start creating content to see it here'
                }
              </p>
              {!searchQuery && activeTab === 'all' && (
                <div className="flex justify-center space-x-4">
                  <Button asChild>
                    <a href="/dashboard/dm-generator">Generate DM</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/thread-generator">Create Thread</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedContent;
