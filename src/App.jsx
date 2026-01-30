import React, { useState, useEffect } from 'react';
import { 
  Search, BookMarked, Sun, Moon, Menu, X, ChevronRight, 
  Home, Printer, CheckCircle2, Copy, Check, Terminal, 
  Layout, GraduationCap, ChevronDown, Code, Coffee, Globe, Server, FileCode,
  Loader2
} from 'lucide-react';

// API Endpoints for all courses
const API_ENDPOINTS = {
  springBoot: 'https://api.npoint.io/4d8b44f8f3c33fa4b563',
  react: 'https://api.npoint.io/0243e7275bafea437ee5',
  javascript: 'https://api.npoint.io/f676eaa384cd176dd74d',
  coreJava: 'https://api.npoint.io/42092cc403a745c45f3e'
};

// --- UTILITY COMPONENTS ---

const CodeBlock = ({ code, language, darkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(@\w+|public|class|void|static|return|new|private|final|const|function|import|from|=>|let|var)/g);
      return (
        <div key={i} className="table-row">
          <span className="table-cell text-right pr-4 select-none text-gray-500 w-8 text-xs">{i + 1}</span>
          <span className="table-cell break-all whitespace-pre-wrap">
            {parts.map((part, index) => {
              if (part.startsWith('@')) return <span key={index} className="text-yellow-500">{part}</span>;
              if (['public', 'class', 'void', 'static', 'return', 'new', 'private', 'final', 'const', 'function', 'import', 'from', 'let', 'var'].includes(part)) 
                return <span key={index} className="text-purple-400 font-semibold">{part}</span>;
              if (['=>'].includes(part)) return <span key={index} className="text-blue-400 font-bold">{part}</span>;
              return part;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden my-4 border ${darkMode ? 'border-gray-700 bg-gray-950' : 'border-gray-200 bg-gray-900'}`}>
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-sm text-gray-300">
        <div className="table w-full">
          {highlightCode(code)}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-[90vw]">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-gray-700">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

// --- ICON MAPPING ---
const getIconComponent = (iconName) => {
  const iconMap = {
    'Server': <Server className="w-4 h-4" />,
    'Code': <Code className="w-4 h-4" />,
    'Globe': <Globe className="w-4 h-4" />,
    'Coffee': <Coffee className="w-4 h-4" />
  };
  return iconMap[iconName] || <Layout className="w-4 h-4" />;
};

// --- MAIN APPLICATION ---

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [activeTab, setActiveTab] = useState({}); 
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Data State
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState('');

  // Fetch All Courses from APIs
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Fetch all four endpoints in parallel
        const responses = await Promise.all([
          fetch(API_ENDPOINTS.springBoot),
          fetch(API_ENDPOINTS.react),
          fetch(API_ENDPOINTS.javascript),
          fetch(API_ENDPOINTS.coreJava)
        ]);

        // Check if any request failed
        if (responses.some(res => !res.ok)) {
          throw new Error('Failed to fetch one or more courses');
        }

        // Parse all JSON responses
        const [springData, reactData, jsData, javaData] = await Promise.all(
          responses.map(res => res.json())
        );

        // Normalize data (handle single object or array)
        const normalizeData = (data) => Array.isArray(data) ? data : [data];
        
        const allCourses = [
          ...normalizeData(springData),
          ...normalizeData(reactData),
          ...normalizeData(jsData),
          ...normalizeData(javaData)
        ];

        setCourses(allCourses);

        // Set active course: prefer saved, otherwise first available
        const savedCourseId = localStorage.getItem('activeCourseId');
        const savedCourseExists = allCourses.find(c => c.id === savedCourseId);
        
        if (savedCourseExists) {
          setActiveCourseId(savedCourseId);
        } else if (allCourses.length > 0) {
          setActiveCourseId(allCourses[0].id);
        }

      } catch (error) {
        console.error("Error loading course data:", error);
        setToast({ show: true, message: "Failed to load course data. Please refresh the page." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Derive current content based on selection
  const contentData = courses.find(c => c.id === activeCourseId) || courses[0];

  // Handle Resize for Sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persistence
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) setDarkMode(JSON.parse(savedMode));
    
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedCompleted = localStorage.getItem('completedTopics');
    if (savedCompleted) setCompletedTopics(JSON.parse(savedCompleted));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  useEffect(() => {
    if (activeCourseId) {
      localStorage.setItem('activeCourseId', activeCourseId);
    }
  }, [activeCourseId]);

  // Actions
  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const toggleBookmark = (topicId) => {
    setBookmarks(prev => {
      const isBookmarked = prev.includes(topicId);
      showToast(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
      return isBookmarked ? prev.filter(id => id !== topicId) : [...prev, topicId];
    });
  };

  const toggleComplete = (topicId) => {
    setCompletedTopics(prev => {
      const isComplete = prev.includes(topicId);
      if (!isComplete) showToast("Topic marked as complete! 🎉");
      return isComplete ? prev.filter(id => id !== topicId) : [...prev, topicId];
    });
  };

  const setTopicTab = (topicId, lang) => {
    setActiveTab(prev => ({ ...prev, [topicId]: lang }));
  };

  const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }
  };

  // Calculations
  const totalTopics = contentData?.sections ? contentData.sections.reduce((acc, section) => acc + section.topics.length, 0) : 0;
  
  const currentCourseCompleted = contentData?.sections ? completedTopics.filter(id => 
    contentData.sections.some(s => s.topics.some(t => t.id === id))
  ).length : 0;
  
  const progressPercentage = totalTopics === 0 ? 0 : Math.round((currentCourseCompleted / totalTopics) * 100);

  const filteredSections = contentData?.sections ? contentData.sections.map(section => ({
    ...section,
    topics: section.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.explanations.english.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.topics.length > 0) : [];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Toast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block tracking-tight">
                {isLoading && !contentData ? "Loading..." : contentData?.title || "Loading..."}
              </span>
              <span className="font-bold text-lg sm:hidden tracking-tight truncate max-w-[150px]">
                {isLoading && !contentData ? "Loading..." : contentData?.title || "Loading..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Progress Widget */}
             {!isLoading && contentData && (
               <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase hidden sm:inline">Progress</span>
                  <div className="w-16 md:w-24 h-1.5 md:h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] md:text-xs font-mono">{progressPercentage}%</span>
               </div>
             )}

            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-all ${darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-slate-600 hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex pt-4 lg:pt-6 px-4 gap-6 relative">
        
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:sticky top-0 lg:top-24 
            h-full lg:h-[calc(100vh-8rem)] 
            z-40 w-72 lg:w-72 flex-shrink-0 
            transition-transform duration-300 ease-in-out
            bg-white dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent
            ${sidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'}
            left-0 pt-0 border-r lg:border-none border-gray-200 dark:border-gray-800
          `}
        >
          <div className={`h-full overflow-y-auto rounded-none lg:rounded-2xl border-none lg:border lg:shadow-sm p-4 ${darkMode ? 'lg:bg-gray-900 lg:border-gray-800' : 'lg:bg-white lg:border-gray-200'}`}>
            
            {/* Close button mobile */}
            <div className="lg:hidden flex justify-end mb-4 pt-4">
               <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Course Selector */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Select Guide</h3>
              <div className="space-y-1">
                {isLoading ? (
                   <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span>Loading courses...</span>
                   </div>
                ) : (
                  courses.map(course => (
                    <button 
                      key={course.id}
                      onClick={() => {
                        setActiveCourseId(course.id);
                        setSearchQuery(''); 
                        if (window.innerWidth < 1024) setSidebarOpen(false); 
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                        (contentData && contentData.id === course.id)
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={(contentData && contentData.id === course.id) ? 'text-white' : 'text-gray-400'}>
                        {getIconComponent(course.icon)}
                      </div>
                      {course.title}
                    </button>
                  ))
                )}
              </div>
            </div>

            {!isLoading && contentData && (
              <>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${contentData.title}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode ? 'bg-gray-800 border-gray-700 placeholder-gray-500' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>

                <div className="space-y-6 pb-20 lg:pb-0">
                  {filteredSections.map(section => (
                    <div key={section.id}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-2">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.topics.map(topic => (
                          <button
                            key={topic.id}
                            onClick={() => scrollToElement(topic.id)}
                            className={`w-full text-left px-3 py-2.5 lg:py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                              completedTopics.includes(topic.id) 
                                ? 'opacity-75' 
                                : ''
                            } ${
                              darkMode 
                                ? 'hover:bg-gray-800 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {completedTopics.includes(topic.id) && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                              <span className="truncate">{topic.title}</span>
                            </div>
                            {bookmarks.includes(topic.id) && <BookMarked className="w-3 h-3 text-blue-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {filteredSections.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No topics found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 w-full">
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading course content...</p>
            </div>
          ) : contentData ? (
            <>
              {/* Welcome Card */}
              <div className={`rounded-2xl p-6 lg:p-8 mb-8 border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-800' : 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500'}`}>
                <div className="relative z-10 text-white">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                       {getIconComponent(contentData.icon)}
                     </div>
                     <h1 className="text-2xl lg:text-3xl font-bold">{contentData.title}</h1>
                  </div>
                  <p className="text-blue-100 mb-6 max-w-xl text-sm lg:text-base">{contentData.subtitle}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-fit">
                    {contentData.stats && contentData.stats.map((stat, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 flex items-center sm:block gap-3 sm:gap-0">
                        <div className="text-xl lg:text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-blue-200">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
              </div>

              <div className="space-y-8 lg:space-y-12">
                {filteredSections.map(section => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <div className="flex items-start lg:items-center gap-3 mb-4 lg:mb-6">
                      <div className={`p-2 rounded-lg shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                        <Layout className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold">{section.title}</h2>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{section.intro}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:gap-6">
                      {section.topics.map(topic => {
                        const currentLang = activeTab[topic.id] || 'english';
                        const isBookmarked = bookmarks.includes(topic.id);
                        const isCompleted = completedTopics.includes(topic.id);

                        return (
                          <div 
                            key={topic.id} 
                            id={topic.id} 
                            className={`rounded-xl lg:rounded-2xl border transition-all duration-300 scroll-mt-28 ${
                              darkMode 
                                ? 'bg-gray-900 border-gray-800 hover:border-gray-700' 
                                : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                            } ${isCompleted ? 'opacity-90 grayscale-[30%]' : ''}`}
                          >
                            {/* Card Header */}
                            <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <button 
                                  onClick={() => toggleComplete(topic.id)}
                                  className={`mt-1 p-1 rounded-full border-2 shrink-0 transition-colors ${
                                    isCompleted 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-gray-300 text-transparent hover:border-green-400'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <h3 className={`text-lg lg:text-xl font-bold leading-tight ${isCompleted ? 'text-gray-500 line-through decoration-gray-500/50' : ''}`}>
                                  {topic.title}
                                </h3>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => toggleBookmark(topic.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isBookmarked 
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <BookMarked className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            <div className="p-4 lg:p-6">
                              {/* Language Tabs */}
                              <div className={`inline-flex p-1 rounded-lg mb-4 w-full sm:w-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <button
                                  onClick={() => setTopicTab(topic.id, 'english')}
                                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    currentLang === 'english'
                                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                  }`}
                                >
                                  🇬🇧 English
                                </button>
                                <button
                                  onClick={() => setTopicTab(topic.id, 'hinglish')}
                                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    currentLang === 'hinglish'
                                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white'
                                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                  }`}
                                >
                                  🇮🇳 Hinglish
                                </button>
                              </div>

                              {/* Explanation Content */}
                              <div className="min-h-[60px] lg:min-h-[80px]">
                                <p className={`text-base lg:text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {topic.explanations[currentLang]}
                                </p>
                              </div>

                              {/* Code Section */}
                              {topic.code && (
                                <div className="mt-6">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Terminal className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">{topic.code.title}</span>
                                  </div>
                                  <CodeBlock code={topic.code.content} language={topic.code.language} darkMode={darkMode} />
                                  
                                  {/* New Code Explanation Section */}
                                  {topic.codeExplanations && (
                                    <div className={`mt-4 p-4 rounded-lg border-l-4 ${darkMode ? 'bg-gray-800 border-purple-500' : 'bg-blue-50 border-purple-500'}`}>
                                      <h5 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                         <FileCode className="w-4 h-4" />
                                         Code Explanation ({currentLang === 'english' ? 'English' : 'Hinglish'})
                                      </h5>
                                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {topic.codeExplanations[currentLang]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Key Points */}
                              {topic.keyPoints && (
                                <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-blue-900/10 border border-blue-900/30' : 'bg-blue-50 border border-blue-100'}`}>
                                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                    <GraduationCap className="w-4 h-4" />
                                    Key Takeaways
                                  </h4>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {topic.keyPoints.map((point, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center text-gray-500 text-sm py-8 border-t border-gray-200 dark:border-gray-800">
                 Keep learning and building! 🚀
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p>Failed to load courses. Please check your connection and refresh.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;