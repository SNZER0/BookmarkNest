'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Upload, Search, Grid, List, Download, Folder, FolderOpen, ChevronRight, ChevronDown, BookOpen, Sparkles, Star, FolderTree, Instagram, Moon, Sun, BookmarkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { parseBookmarksHTML, type BookmarkFolder, type Bookmark } from '@/lib/bookmark-parser'

export default function BookmarksViewer() {
  const [bookmarks, setBookmarks] = useState<BookmarkFolder | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'url' | 'original'>('original')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const parsed = parseBookmarksHTML(text)
      setBookmarks(parsed)
      // Only expand the root "Bookmarks" folder by default
      setExpandedFolders(new Set([parsed.id]))
    } catch (error) {
      console.error('Error parsing bookmarks:', error)
      alert('Error parsing bookmarks file. Please make sure it\'s a valid Chrome bookmarks HTML file.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const filteredBookmarks = useMemo(() => {
    if (!bookmarks || !searchTerm) return bookmarks

    const filterFolder = (folder: BookmarkFolder): BookmarkFolder => {
      const filteredChildren = folder.children
        .map(child => {
          if (child.type === 'folder') {
            return filterFolder(child)
          } else {
            return child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   child.url.toLowerCase().includes(searchTerm.toLowerCase()) ? child : null
          }
        })
        .filter(Boolean) as (Bookmark | BookmarkFolder)[]

      return {
        ...folder,
        children: filteredChildren
      }
    }

    return filterFolder(bookmarks)
  }, [bookmarks, searchTerm])

  const exportBookmarks = useCallback(() => {
    if (!bookmarks) return
    
    const dataStr = JSON.stringify(bookmarks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bookmarks-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [bookmarks])

  if (!bookmarks) {
    return <LandingPage onFileUpload={handleFileUpload} isLoading={isLoading} mousePosition={mousePosition} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-background text-text' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-background via-background to-primary/5'
            : 'bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50'
        }`}></div>
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              isDarkMode ? 'bg-accent/20' : 'bg-blue-400/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}>
              Your Digital Library
            </h1>
            <p className={`text-lg ${
              isDarkMode ? 'text-text/80' : 'text-gray-600'
            }`}>
              Explore your beautifully organized bookmark collection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={isDarkMode 
                ? 'border-primary/30 hover:border-primary hover:bg-primary/10' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
              }
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={exportBookmarks} 
              className={isDarkMode 
                ? 'border-primary/30 hover:border-primary hover:bg-primary/10' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Export Collection
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                isDarkMode ? 'text-text/60' : 'text-gray-400'
              }`} />
              <Input
                placeholder="Search your digital treasures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 h-12 ${
                  isDarkMode 
                    ? 'bg-background/50 border-primary/30 focus:border-accent text-text placeholder:text-text/60'
                    : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-500'
                }`}
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={(value: 'name' | 'url' | 'original') => setSortBy(value)}>
            <SelectTrigger className={`w-48 h-12 ${
              isDarkMode 
                ? 'bg-background/50 border-primary/30'
                : 'bg-white border-gray-300'
            }`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={isDarkMode 
              ? 'bg-background border-primary/30' 
              : 'bg-white border-gray-300'
            }>
              <SelectItem value="original">Original Order</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="url">Sort by URL</SelectItem>
            </SelectContent>
          </Select>
          <div className={`flex border rounded-lg overflow-hidden ${
            isDarkMode ? 'border-primary/30' : 'border-gray-300'
          }`}>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="lg"
              onClick={() => setViewMode('grid')}
              className="rounded-none h-12"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="lg"
              onClick={() => setViewMode('list')}
              className="rounded-none h-12"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Bookmarks Display */}
        <BookmarkFolderComponent
          folder={filteredBookmarks}
          viewMode={viewMode}
          sortBy={sortBy}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          level={0}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Footer */}
      <footer className={`relative z-10 mt-20 py-8 border-t ${
        isDarkMode ? 'border-primary/20' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className={isDarkMode ? 'text-text/70' : 'text-gray-600'}>
            Created by <span className={`font-semibold ${isDarkMode ? 'text-primary' : 'text-blue-600'}`}>Sazzy</span>
          </p>
          <a 
            href="https://instagram.com/naimsazzad" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 mt-2 transition-colors duration-200 ${
              isDarkMode 
                ? 'text-accent hover:text-accent/80' 
                : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            <Instagram className="h-4 w-4" />
            @naimsazzad
          </a>
        </div>
      </footer>
    </div>
  )
}

function LandingPage({ onFileUpload, isLoading, mousePosition, isDarkMode, setIsDarkMode }: {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isLoading: boolean
  mousePosition: { x: number, y: number }
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              <BookOpen className="w-8 h-8 text-primary animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
            </div>
          ))}
        </div>

        {/* Mouse follower glow */}
        <div
          className="absolute w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Theme Toggle */}
        <div className="absolute top-8 right-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Digital Library
                <br />
                <span className="text-5xl md:text-7xl">Sanctuary</span>
              </h1>
              <p className="text-xl md:text-2xl text-text/80 max-w-3xl mx-auto leading-relaxed">
                Transform your chaotic bookmark collection into a beautifully organized digital library. 
                Discover hidden treasures and rediscover forgotten gems.
              </p>
            </div>

            {/* Upload Vault */}
            <div className="max-w-2xl mx-auto mb-16">
              <div
                className={`relative group transition-all duration-500 ${
                  isHovering ? 'scale-105' : 'scale-100'
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-accent via-primary to-accent rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <Card className="relative bg-background/20 backdrop-blur-xl border border-primary/30 rounded-2xl overflow-hidden">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent mb-6 transition-all duration-500 ${
                        isHovering ? 'scale-110 shadow-2xl shadow-accent/50' : 'scale-100'
                      }`}>
                        <Upload className="w-12 h-12 text-background" />
                      </div>
                      
                      <h3 className="text-3xl font-bold mb-4 text-primary">
                        Open Your Book Vault
                      </h3>
                      <p className="text-text/70 mb-8 text-lg">
                        Upload your Chrome bookmarks and watch them transform into an elegant, searchable library
                      </p>
                      
                      <input
                        type="file"
                        accept=".html"
                        onChange={onFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isLoading}
                      />
                      <label htmlFor="file-upload">
                        <Button 
                          asChild 
                          disabled={isLoading}
                          size="lg"
                          className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-background font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/30"
                        >
                          <span className="cursor-pointer flex items-center gap-3">
                            {isLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                Processing Your Library...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                Choose Your Bookmarks File
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  title: "Magical Organization",
                  description: "Transform chaos into beauty with intelligent folder structures and visual hierarchy"
                },
                {
                  icon: Search,
                  title: "Instant Discovery",
                  description: "Find any bookmark in seconds with powerful search and filtering capabilities"
                },
                {
                  icon: Star,
                  title: "Premium Experience",
                  description: "Enjoy a luxurious interface that makes browsing bookmarks a delightful experience"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-background/10 backdrop-blur-sm border border-primary/20 hover:border-accent/50 transition-all duration-300 hover:scale-105 group">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">{feature.title}</h3>
                    <p className="text-text/70">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-text/70 mb-2">Created by <span className="text-primary font-semibold">Sazzy</span></p>
          <a 
            href="https://instagram.com/naimsazzad" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors duration-200"
          >
            <Instagram className="h-4 w-4" />
            @naimsazzad
          </a>
        </div>
      </footer>
    </div>
  )
}

interface BookmarkFolderComponentProps {
  folder: BookmarkFolder
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'url' | 'original'
  expandedFolders: Set<string>
  onToggleFolder: (folderId: string) => void
  level: number
  isDarkMode: boolean
}

function BookmarkFolderComponent({
  folder,
  viewMode,
  sortBy,
  expandedFolders,
  onToggleFolder,
  level,
  isDarkMode
}: BookmarkFolderComponentProps) {
  const isExpanded = expandedFolders.has(folder.id)
  
  const organizedChildren = useMemo(() => {
    const bookmarks: Bookmark[] = []
    const subfolders: BookmarkFolder[] = []
    
    folder.children.forEach(child => {
      if (child.type === 'bookmark') {
        bookmarks.push(child)
      } else {
        subfolders.push(child)
      }
    })
    
    const sortedBookmarks = sortBy === 'name' 
      ? [...bookmarks].sort((a, b) => a.name.localeCompare(b.name))
      : sortBy === 'url'
      ? [...bookmarks].sort((a, b) => a.url.localeCompare(b.url))
      : bookmarks
    
    const sortedSubfolders = sortBy === 'name'
      ? [...subfolders].sort((a, b) => a.name.localeCompare(b.name))
      : subfolders
    
    return { bookmarks: sortedBookmarks, subfolders: sortedSubfolders }
  }, [folder.children, sortBy])

  const getFolderIcon = (currentLevel: number, folderName: string) => {
    if (currentLevel === 0 && folderName === 'Bookmarks') return BookmarkIcon; // Root container
    if (currentLevel === 1) return Folder; // Main folders (e.g., "Other Bookmarks", and flattened "Bookmarks Bar" folders)
    if (currentLevel === 2) return Folder; // Subfolders of horizontal cards (also horizontal)
    return FolderTree; // Deeper nested subfolders (vertical)
  };

  const FolderIcon = getFolderIcon(level, folder.name);

  // Case 1: Root "Bookmarks" folder (level 0)
  if (level === 0 && folder.name === 'Bookmarks') {
    return (
      <div className="space-y-8"> {/* Vertical spacing for root content */}
        {/* Display direct bookmarks of the root (including flattened Bookmarks Bar links) */}
        {organizedChildren.bookmarks.length > 0 && (
          <div className="mb-6">
            <BookmarkGrid bookmarks={organizedChildren.bookmarks} viewMode={viewMode} isDarkMode={isDarkMode} />
          </div>
        )}
        
        {/* Display main folders (Other Bookmarks, and flattened Bookmarks Bar folders) horizontally */}
        <div className="flex flex-wrap gap-4"> {/* Horizontal layout for main folders */}
          {organizedChildren.subfolders.map(subfolder => (
            <BookmarkFolderComponent
              key={subfolder.id}
              folder={subfolder}
              viewMode={viewMode}
              sortBy={sortBy}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              level={level + 1} // Pass level 1 to these main folders
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    );
  }

  // Case 2: Level 1 or Level 2 folders (these should be horizontal cards)
  // Level 1: Main folders (e.g., "Other Bookmarks", or any folder that was originally in "Bookmarks Bar")
  // Level 2: Subfolders of Level 1 horizontal cards (also displayed as horizontal cards)
  if (level === 1 || level === 2) {
    return (
      <Card className={`group transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
        isDarkMode 
          ? 'hover:shadow-2xl hover:shadow-accent/20 bg-background/30 backdrop-blur-sm border border-primary/20 hover:border-accent/50'
          : 'hover:shadow-xl hover:shadow-blue-200/50 bg-white border border-gray-200 hover:border-blue-300'
    }`}>
      <CardContent className="p-4">
        <div 
          className="flex flex-col items-center text-center space-y-3"
          onClick={() => onToggleFolder(folder.id)} // Make the whole card clickable
        >
          <div className={`w-16 h-16 flex items-center justify-center rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-primary/10 to-accent/10'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}>
            <FolderIcon className={`w-8 h-8 ${isDarkMode ? 'text-primary' : 'text-blue-600'}`} />
          </div>
          <h3 className={`font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors duration-200 ${
            isDarkMode 
              ? 'text-text'
              : 'text-gray-900'
          }`}>
            {folder.name}
          </h3>
          <Badge 
            variant="secondary" 
            className={`text-xs px-2 py-0.5 ${
              isDarkMode 
                ? 'bg-secondary/20 text-secondary border-secondary/30'
                : 'bg-gray-200 text-gray-600 border-gray-300'
            }`}
          >
            {folder.children.length}
          </Badge>
        </div>
        
        {/* Contents of the expanded horizontal folder (bookmarks and subfolders) */}
        {isExpanded && (
          <div className="mt-4 space-y-4"> {/* Vertical layout for contents within this card */}
            {organizedChildren.bookmarks.length > 0 && (
              <div>
                <BookmarkGrid bookmarks={organizedChildren.bookmarks} viewMode={viewMode} isDarkMode={isDarkMode} />
              </div>
            )}
            {organizedChildren.subfolders.length > 0 && (
              <div className="flex flex-wrap gap-4"> {/* Horizontal layout for nested folders (Level 2) */}
                {organizedChildren.subfolders.map(subfolder => (
                  <BookmarkFolderComponent
                    key={subfolder.id}
                    folder={subfolder}
                    viewMode={viewMode}
                    sortBy={sortBy}
                    expandedFolders={expandedFolders}
                    onToggleFolder={onToggleFolder}
                    level={level + 1} // Pass level 2 or 3 to these subfolders
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Case 3: Level 3+ folders (these should be vertical list items)
return (
  <div className="mb-2">
    {/* Folder Header - Clickable */}
    <div 
      className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
        isDarkMode 
          ? 'hover:bg-primary/5' 
          : 'hover:bg-gray-100'
      }`}
      onClick={() => onToggleFolder(folder.id)}
      style={{ marginLeft: `${(level - 2) * 20}px` }} // Adjust indentation for level 3+
    >
      <ChevronRight 
        className={`h-4 w-4 transition-all duration-200 flex-shrink-0 ${
          isDarkMode 
            ? 'text-text/60 group-hover:text-accent' 
            : 'text-gray-500 group-hover:text-blue-600'
        } ${isExpanded ? 'rotate-90' : 'rotate-0'}`} 
      />
      <div className={`p-1.5 rounded-md ${
        isDarkMode
          ? 'bg-gradient-to-br from-secondary/20 to-primary/20'
          : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        <FolderIcon className={`h-5 w-5 ${
          isDarkMode ? 'text-primary' : 'text-blue-600'
        }`} />
      </div>
      <h2 className={`text-lg font-semibold transition-colors duration-200 ${
        isDarkMode 
          ? 'text-primary group-hover:text-accent' 
          : 'text-gray-800 group-hover:text-blue-600'
      }`}>
        {folder.name}
      </h2>
      <Badge 
        variant="secondary" 
        className={`text-xs px-2 py-0.5 ${
          isDarkMode 
            ? 'bg-secondary/20 text-secondary border-secondary/30'
            : 'bg-gray-200 text-gray-600 border-gray-300'
        }`}
      >
        {folder.children.length}
      </Badge>
    </div>
    
    {/* Folder Contents - Vertical Layout */}
    {isExpanded && (
      <div className="mt-2">
        {/* Bookmarks */}
        {organizedChildren.bookmarks.length > 0 && (
          <div className="mb-4" style={{ marginLeft: `${(level - 1) * 20}px` }}>
            <BookmarkGrid bookmarks={organizedChildren.bookmarks} viewMode={viewMode} isDarkMode={isDarkMode} />
          </div>
        )}
        
        {organizedChildren.subfolders.length > 0 && (
          <div className="space-y-1">
            {organizedChildren.subfolders.map(subfolder => (
              <BookmarkFolderComponent
                key={subfolder.id}
                folder={subfolder}
                viewMode={viewMode}
                sortBy={sortBy}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                level={level + 1}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);
}

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  viewMode: 'grid' | 'list'
  isDarkMode: boolean
}

function BookmarkGrid({ bookmarks, viewMode, isDarkMode }: BookmarkGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {bookmarks.map(bookmark => (
          <BookmarkListItem key={bookmark.id} bookmark={bookmark} isDarkMode={isDarkMode} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
      {bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} isDarkMode={isDarkMode} />
      ))}
    </div>
  )
}

interface BookmarkCardProps {
  bookmark: Bookmark
  isDarkMode: boolean
}

function BookmarkCard({ bookmark, isDarkMode }: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false)
  const domain = new URL(bookmark.url).hostname

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(bookmark.url)

  return (
    <Card className={`group transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
      isDarkMode 
        ? 'hover:shadow-2xl hover:shadow-accent/20 bg-background/30 backdrop-blur-sm border border-primary/20 hover:border-accent/50'
        : 'hover:shadow-xl hover:shadow-blue-200/50 bg-white border border-gray-200 hover:border-blue-300'
    }`}>
      <CardContent className="p-4">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-primary/10 to-accent/10'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}>
              {faviconUrl && !imageError ? (
                <img
                  src={faviconUrl || "/placeholder.svg"}
                  alt=""
                  className="w-8 h-8"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-secondary to-accent text-background'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                }`}>
                  {domain.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className={`font-semibold text-xs line-clamp-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-text group-hover:text-accent'
                  : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                {bookmark.name}
              </h3>
              <p className={`text-xs mt-1 truncate ${
                isDarkMode ? 'text-text/60' : 'text-gray-500'
              }`}>
                {domain}
              </p>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}

function BookmarkListItem({ bookmark, isDarkMode }: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false)
  const domain = new URL(bookmark.url).hostname

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(bookmark.url)

  return (
    <Card className={`transition-all duration-200 ${
      isDarkMode 
        ? 'hover:shadow-lg hover:shadow-accent/10 bg-background/20 backdrop-blur-sm border border-primary/20 hover:border-accent/30'
        : 'hover:shadow-md hover:shadow-blue-100 bg-white border border-gray-200 hover:border-blue-300'
    }`}>
      <CardContent className="p-4">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 group"
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-primary/10 to-accent/10'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}>
            {faviconUrl && !imageError ? (
              <img
                src={faviconUrl || "/placeholder.svg"}
                alt=""
                className="w-6 h-6"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-secondary to-accent text-background'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
              }`}>
                {domain.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate transition-colors duration-200 ${
              isDarkMode 
                ? 'text-text group-hover:text-accent'
                : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {bookmark.name}
            </h3>
            <p className={`text-xs truncate mt-1 ${
              isDarkMode ? 'text-text/60' : 'text-gray-500'
            }`}>
              {domain}
            </p>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}
