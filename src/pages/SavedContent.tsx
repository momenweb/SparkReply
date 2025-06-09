import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Copy, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Reply, 
  FileText,
  Calendar,
  Filter,
  Clock,
  ArrowUpDown,
  LayoutGrid,
  List
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user } = useAuth();
  const { toast } = useToast();

  const tabs = [
    { id: 'all', name: 'All Content', icon: Filter },
    { id: 'dm', name: 'Direct Messages', icon: MessageSquare },
    { id: 'reply', name: 'Replies', icon: Reply },
    { id: 'thread', name: 'Threads', icon: FileText },
  ];

  useEffect(() => {
    if (user) {
      loadContent();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortContent();
  }, [content, searchQuery, activeTab, sortBy, sortOrder]);

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

  const filterAndSortContent = () => {
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

    // Sort content
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'desc' 
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'type':
          return sortOrder === 'desc'
            ? b.type.localeCompare(a.type)
            : a.type.localeCompare(b.type);
        case 'title':
          return sortOrder === 'desc'
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentStats = () => {
    const total = content.length;
    const dms = content.filter(item => item.type === 'dm').length;
    const replies = content.filter(item => item.type === 'reply').length;
    const threads = content.filter(item => item.type === 'thread').length;
    return { total, dms, replies, threads };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
          <p className="text-gray-500">Loading your saved content...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = getContentStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
        <p className="text-gray-500">Manage and organize your saved content</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Direct Messages</p>
                <h3 className="text-2xl font-bold text-blue-600">{stats.dms}</h3>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Replies</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.replies}</h3>
              </div>
              <Reply className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Threads</p>
                <h3 className="text-2xl font-bold text-purple-600">{stats.threads}</h3>
              </div>
              <FileText className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'title')}
                className="bg-white border border-gray-200 rounded-md text-sm px-3 py-2"
              >
                <option value="date">Sort by Date</option>
                <option value="type">Sort by Type</option>
                <option value="title">Sort by Title</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-gray-200"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="border-gray-200"
              >
                {viewMode === 'grid' ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mt-6">
            <TabsList className="bg-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-white"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                    <Badge variant="secondary" className="ml-2 bg-gray-100">
                      {tab.id === 'all' ? stats.total : 
                       tab.id === 'dm' ? stats.dms :
                       tab.id === 'reply' ? stats.replies : stats.threads}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Content Display */}
      {filteredContent.length > 0 ? (
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-4"
        }>
          {filteredContent.map((item) => {
          const TypeIcon = getTypeIcon(item.type);
          return (
              <Card key={item.id} className={`bg-white hover:border-gray-300 transition-colors ${
                viewMode === 'list' ? 'border-l-4' : ''
              } ${
                item.type === 'dm' ? 'border-l-blue-500' :
                item.type === 'reply' ? 'border-l-green-500' :
                'border-l-purple-500'
              }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg ${getTypeColor(item.type)} flex items-center justify-center`}>
                      <TypeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-gray-900 text-sm font-medium line-clamp-1">
                          {item.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                  <ScrollArea className="h-24 rounded-md border p-2 mb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(item.content)}
                      className="flex-1 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="border-gray-200 text-red-600 hover:text-red-700 hover:border-red-200"
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
        <Card className="bg-white">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-gray-100 rounded-full p-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No content found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Start saving content to build your library"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedContent;
