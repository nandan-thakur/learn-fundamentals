import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, BookMarked, Sun, Moon, Menu, X, 
  Layout, CheckCircle2, Copy, Check, Terminal, 
  Network, ArrowRightLeft, Lightbulb, Server, 
  Code, Globe, Coffee, List, Sparkles, Zap, 
  BookOpen, Languages, Home, Loader2
} from 'lucide-react';

// --- CONFIGURATION ---
const FILE_LIST = [
  'corejava.json',
  'collections.json',
  'springboot.json',
  'javascript.json',
  'react.json',
];

// --- UTILITY COMPONENTS ---

const DotPattern = ({ darkMode }) => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.4]">
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dot-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className={darkMode ? "fill-gray-700" : "fill-gray-300"} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  </div>
);

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
      const parts = line.split(/(@\w+|public|class|void|static|return|new|private|final|const|function|import|from|=>|let|var|\/\/.*)/g);
      return (
        <div key={i} className="table-row group hover:bg-white/5 transition-colors">
          <span className="table-cell text-right pr-4 select-none text-gray-600 dark:text-gray-600 w-8 text-xs group-hover:text-gray-400">{i + 1}</span>
          <span className="table-cell break-all whitespace-pre-wrap font-code text-[13px] sm:text-sm">
            {parts.map((part, index) => {
              if (part.startsWith('//')) return <span key={index} className="text-gray-500 italic">{part}</span>;
              if (part.startsWith('@')) return <span key={index} className="text-yellow-600 dark:text-yellow-400">{part}</span>;
              if (['public', 'class', 'void', 'static', 'return', 'new', 'private', 'final', 'const', 'function', 'import', 'from', 'let', 'var'].includes(part)) 
                return <span key={index} className="text-purple-600 dark:text-purple-400 font-semibold">{part}</span>;
              if (['=>'].includes(part)) return <span key={index} className="text-blue-500 font-bold">{part}</span>;
              return part;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden my-6 shadow-xl transition-all ${darkMode ? 'bg-[#1e1e2e] border border-gray-800' : 'bg-gray-900 border border-gray-800'}`}>
      <div className="flex justify-between items-center px-4 py-3 bg-[#181825] border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-gray-300 font-mono">
        <div className="table w-full">
          {highlightCode(code)}
        </div>
      </div>
    </div>
  );
};

const ComparisonTable = ({ data, darkMode }) => {
  if (!data || typeof data !== 'string') return null;
  const parseRow = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
  const rows = data.trim().split('\n').filter(r => r.trim() !== '');
  if (rows.length === 0) return null;
  const headers = parseRow(rows[0]);
  const bodyRows = rows.slice(rows.length > 1 && rows[1].includes('---') ? 2 : 1).map(parseRow);

  return (
    <div className={`overflow-x-auto my-6 rounded-xl border shadow-sm ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
      <table className="w-full text-sm text-left">
        <thead className={`text-xs uppercase tracking-wider ${darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
          <tr>{headers.map((h, i) => <th key={i} className="px-6 py-4 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {bodyRows.map((row, i) => (
            <tr key={i} className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
              {row.map((cell, j) => <td key={j} className={`px-6 py-4 font-medium whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getIconComponent = (iconName) => {
  const iconMap = {
    'Server': <Server className="w-5 h-5" />, 'Code': <Code className="w-5 h-5" />,
    'Globe': <Globe className="w-5 h-5" />, 'Coffee': <Coffee className="w-5 h-5" />,
    'Users': <CheckCircle2 className="w-5 h-5" />, 'Star': <Sparkles className="w-5 h-5" />,
    'Layout': <Layout className="w-5 h-5" />, 'List': <List className="w-5 h-5" />
  };
  return iconMap[iconName] || <Zap className="w-5 h-5" />;
};

// --- MAIN APPLICATION ---

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  
  // FIX 1: Initialize based on screen width so desktop starts open
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [completedTopics, setCompletedTopics] = useState([]);
  
  const [dataCache, setDataCache] = useState({});
  const [courseList, setCourseList] = useState([]); 
  const [activeCourseId, setActiveCourseId] = useState('');
  const [appLanguage, setAppLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. INITIAL LOAD (Metadata) ---
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const promises = FILE_LIST.map(file => fetch(`/learn-fundamentals/data/english/${file}`).then(res => res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        const validCourses = results.flat().filter(Boolean);
        setCourseList(validCourses);
        
        const savedId = localStorage.getItem('activeCourseId');
        if (savedId && validCourses.find(c => c.id === savedId)) {
          setActiveCourseId(savedId);
        } else if (validCourses.length > 0) {
          setActiveCourseId(validCourses[0].id);
        }
      } catch (e) {
        console.error("Meta load failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetadata();
  }, []);

  // --- 2. ACTIVE COURSE FETCHING (Dual Language) ---
  useEffect(() => {
    if (!activeCourseId) return;

    const fetchDataForCourse = async () => {
        if (dataCache[activeCourseId]) return;

        setIsLoading(true);
        try {
            const engRes = await Promise.all(FILE_LIST.map(f => fetch(`/learn-fundamentals/data/english/${f}`).then(r=>r.json())));
            const engFlat = engRes.flat();
            const engCourse = engFlat.find(c => c.id === activeCourseId);

            const hinRes = await Promise.all(FILE_LIST.map(f => fetch(`/learn-fundamentals/data/hinglish/${f}`).then(r => r.ok ? r.json() : null)));
            const hinFlat = hinRes.flat().filter(Boolean);
            const hinCourse = hinFlat.find(c => c.id === activeCourseId);

            if (engCourse) {
                setDataCache(prev => ({
                    ...prev,
                    [activeCourseId]: {
                        english: engCourse,
                        hinglish: hinCourse || null 
                    }
                }));
            }
        } catch (e) {
            console.error("Content load failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    fetchDataForCourse();
    localStorage.setItem('activeCourseId', activeCourseId);
  }, [activeCourseId]);


  // --- 3. MERGE LOGIC ---
  const currentContent = useMemo(() => {
    if (!activeCourseId || !dataCache[activeCourseId]) return null;
    
    const { english, hinglish } = dataCache[activeCourseId];
    
    if (appLanguage === 'english' || !hinglish) return english;
    
    return {
      ...english,
      title: hinglish.title || english.title,
      subtitle: hinglish.subtitle || english.subtitle,
      sections: english.sections.map(engSec => {
        const hinSec = hinglish.sections?.find(s => s.id === engSec.id);
        if (!hinSec) return engSec;

        return {
          ...engSec,
          title: hinSec.title || engSec.title,
          intro: hinSec.intro || engSec.intro,
          topics: engSec.topics.map(engTop => {
            const hinTop = hinSec.topics?.find(t => t.id === engTop.id);
            if (!hinTop) return engTop;

            return {
              ...engTop,
              title: hinTop.title || engTop.title,
              explanations: hinTop.explanations || engTop.explanations,
              keyPoints: hinTop.keyPoints || engTop.keyPoints,
              extras: hinTop.extras || engTop.extras, 
              codeExplanations: hinTop.codeExplanations || engTop.codeExplanations,
              code: engTop.code 
            };
          })
        };
      })
    };
  }, [activeCourseId, dataCache, appLanguage]);


  // --- STANDARD EFFECTS ---
  useEffect(() => {
    // Handle resize to auto-open sidebar on desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) setDarkMode(JSON.parse(savedMode));
    
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedCompleted = localStorage.getItem('completedTopics');
    if (savedCompleted) setCompletedTopics(JSON.parse(savedCompleted));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  // --- ACTIONS ---
  const toggleBookmark = (topicId) => {
    setBookmarks(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
  };

  const toggleComplete = (topicId) => {
    setCompletedTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
  };

  const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }
  };

  const filteredSections = currentContent?.sections ? currentContent.sections.map(section => ({
    ...section,
    topics: section.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.explanations?.english || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.topics.length > 0) : [];

  return (
    <div className={`flex flex-col h-dvh font-sans antialiased transition-colors duration-500 ${darkMode ? 'bg-[#0B1120] text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      <DotPattern darkMode={darkMode} />

      {/* --- DESKTOP NAVBAR --- */}
      <nav className={`flex-none h-16 border-b backdrop-blur-xl z-30 transition-all duration-300 ${darkMode ? 'bg-[#0B1120]/80 border-white/5' : 'bg-white/80 border-gray-200/60'}`}>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg hidden sm:block tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {currentContent?.title || "DevGuide"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
             <div className={`hidden lg:flex items-center p-1 rounded-full border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => setAppLanguage('english')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                    appLanguage === 'english' 
                      ? (darkMode ? 'bg-gray-700 text-white shadow' : 'bg-gray-100 text-slate-900 shadow') 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setAppLanguage('hinglish')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                    appLanguage === 'hinglish' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Hinglish
                </button>
             </div>

            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-full transition-all ${darkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN LAYOUT (Flex Row) --- */}
      <div className="flex-1 flex overflow-hidden relative max-w-[1600px] mx-auto w-full">
        
        {/* --- SIDEBAR --- */}
        <aside 
          className={`
            absolute lg:static inset-y-0 left-0 z-40
            w-[280px] flex-shrink-0 
            transform transition-transform duration-300 ease-in-out
            /* FIX 2: Added lg:translate-x-0 so it is always visible on desktop */
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${darkMode ? 'bg-[#0B1120] lg:bg-transparent border-r border-gray-800' : 'bg-white lg:bg-transparent border-r border-gray-200'}
            lg:border-none flex flex-col h-full
          `}
        >
           {/* Sidebar Header (Mobile Only) */}
           <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5">
              <span className="font-bold">Courses</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <div className="space-y-1 mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Modules</h3>
                {courseList.map(course => (
                   <button 
                     key={course.id}
                     onClick={() => { setActiveCourseId(course.id); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                     className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                       activeCourseId === course.id 
                       ? 'bg-blue-600/10 text-blue-500' 
                       : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {getIconComponent(course.icon)}
                     <span>{course.title}</span>
                   </button>
                ))}
              </div>

              {currentContent && (
                <div className="mb-20 lg:mb-0">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Filter topics..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-gray-200'} focus:outline-none focus:border-blue-500`} 
                    />
                  </div>
                  <div className="space-y-6">
                    {filteredSections.map(section => (
                      <div key={section.id}>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2">{section.title}</h4>
                        <div className="space-y-0.5 border-l border-gray-700/50 ml-2">
                          {section.topics.map(topic => (
                            <button
                              key={topic.id}
                              onClick={() => scrollToElement(topic.id)}
                              className={`w-full text-left pl-3 pr-2 py-1.5 text-[12px] border-l -ml-px transition-colors block truncate ${
                                completedTopics.includes(topic.id) ? 'text-green-500 border-green-500/50' : 'text-gray-400 hover:text-blue-400 hover:border-blue-500'
                              }`}
                            >
                              {topic.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </aside>

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <main className="flex-1 overflow-y-auto relative w-full scroll-smooth">
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="max-w-4xl mx-auto px-4 py-8 pb-32 lg:pb-12">
            {isLoading && !currentContent ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                 <Loader2 className="w-8 h-8 animate-spin mb-2" />
                 <p>Loading Course...</p>
               </div>
            ) : currentContent ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-2xl p-6 sm:p-10 border mb-12 relative overflow-hidden ${darkMode ? 'bg-[#131b2e] border-white/5' : 'bg-white border-gray-200'}`}>
                   <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 text-blue-500">
                        {getIconComponent(currentContent.icon)}
                        <span className="text-xs font-bold uppercase">{currentContent.category}</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{currentContent.title}</h1>
                      <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentContent.subtitle}</p>
                   </div>
                   <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                </div>

                <div className="space-y-16">
                  {filteredSections.map(section => (
                    <div key={section.id} id={section.id}>
                      <div className="flex items-center gap-4 mb-8">
                         <span className="h-px flex-1 bg-gray-700/50"></span>
                         <h2 className="text-xl font-bold">{section.title}</h2>
                         <span className="h-px flex-1 bg-gray-700/50"></span>
                      </div>

                      <div className="space-y-8">
                        {section.topics.map(topic => {
                           const isCompleted = completedTopics.includes(topic.id);
                           const isBookmarked = bookmarks.includes(topic.id);
                           const explanations = topic.explanations || { english: "Coming soon" };
                           const codeExplanations = topic.codeExplanations || {};

                           return (
                             <div key={topic.id} id={topic.id} className="group">
                                <div className="flex justify-between items-start mb-4">
                                   <div className="flex gap-3">
                                      <button onClick={() => toggleComplete(topic.id)} className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-600 hover:border-green-500 text-transparent'}`}>
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <h3 className={`text-xl font-bold ${isCompleted ? 'text-gray-500 line-through decoration-gray-700' : ''}`}>{topic.title}</h3>
                                   </div>
                                   <button onClick={() => toggleBookmark(topic.id)} className={`${isBookmarked ? 'text-blue-500' : 'text-gray-600 hover:text-white'}`}><BookMarked className="w-5 h-5" /></button>
                                </div>

                                <div className={`pl-8 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'} ml-2.5 pb-8`}>
                                   <div className={`prose max-w-none mb-6 text-base leading-7 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {explanations.english?.split('\n').map((p,i) => <p key={i} className="mb-3">{p}</p>)}
                                   </div>

                                   {topic.extras?.flowDiagram && (
                                     <div className={`p-4 rounded-lg border mb-6 overflow-x-auto ${darkMode ? 'bg-[#0f141f] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                        <pre className={`text-xs font-mono whitespace-pre ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{topic.extras.flowDiagram}</pre>
                                     </div>
                                   )}

                                   {topic.extras?.comparisonTable && <ComparisonTable data={topic.extras.comparisonTable} darkMode={darkMode} />}

                                   {topic.code && (
                                     <div className="my-6">
                                        <CodeBlock code={topic.code.content} language={topic.code.language} darkMode={darkMode} />
                                        {codeExplanations.english && (
                                           <div className={`mt-3 pl-3 border-l-2 ${darkMode ? 'border-blue-500/50 text-gray-500' : 'border-blue-500 text-gray-600'} text-sm italic`}>
                                              <span className="font-bold not-italic mr-1 text-blue-500">Note:</span> {codeExplanations.english}
                                           </div>
                                        )}
                                     </div>
                                   )}

                                   {topic.keyPoints && (
                                     <div className={`p-4 rounded-lg border-l-4 ${darkMode ? 'bg-gray-800/30 border-green-500' : 'bg-gray-50 border-green-600'}`}>
                                        <h4 className="text-xs font-bold uppercase text-green-500 mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Key Takeaways</h4>
                                        <ul className="space-y-2">
                                           {topic.keyPoints.map((pt, i) => (
                                              <li key={i} className="text-sm flex gap-2">
                                                 <span className="text-green-500">•</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{pt}</span>
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

              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* --- FIXED MOBILE BOTTOM BAR --- */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t backdrop-blur-xl z-50 flex items-center justify-around px-2 ${darkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/90 border-gray-200'}`}>
         
         <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-blue-500">
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Courses</span>
         </button>

         <button 
           onClick={() => setAppLanguage(prev => prev === 'english' ? 'hinglish' : 'english')}
           className="flex flex-col items-center gap-1 p-2"
         >
           <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${appLanguage === 'hinglish' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
             {appLanguage === 'english' ? 'EN' : 'HI'}
           </div>
           <span className="text-[10px] font-medium text-gray-400">Language</span>
         </button>

         <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-blue-500">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Top</span>
         </button>
      </div>

    </div>
  );
};

export default App;