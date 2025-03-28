import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import CourseCard from "@/components/dashboard/CourseCard";
import OpportunityCard from "@/components/dashboard/OpportunityCard";
import MentorCard from "@/components/dashboard/MentorCard";
import ArticleCard from "@/components/dashboard/ArticleCard";
import { ArrowRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getTranslation } from "@/lib/translations";
import { Link } from "wouter";
import { Course, Opportunity, Mentor, Article, Stats } from "@shared/schema";
import { ApiError } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { language } = useTheme();

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load stats",
        variant: "destructive",
      });
    },
  });

  // Fetch user courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/user/courses'],
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load courses",
        variant: "destructive",
      });
    },
  });

  // Fetch opportunities
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery<Opportunity[]>({
    queryKey: ['/api/opportunities'],
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load opportunities",
        variant: "destructive",
      });
    },
  });

  // Fetch mentors
  const { data: mentors, isLoading: isLoadingMentors } = useQuery<Mentor[]>({
    queryKey: ['/api/mentors'],
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load mentors",
        variant: "destructive",
      });
    },
  });

  // Fetch articles
  const { data: articles, isLoading: isLoadingArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load articles",
        variant: "destructive",
      });
    },
  });

  return (
    <AppLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {getTranslation('dashboard.welcome', language)}, {user?.firstName || user?.username || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{getTranslation('dashboard.portfolioDesc', language)}</p>
        </div>
        
        {/* Announcements Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {getTranslation('dashboard.announcement.title', language)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {getTranslation('dashboard.announcement.details', language)}
            </p>
            
            <div className="space-y-3">
              {/* New Course Announcement */}
              <div 
                className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onClick={() => window.location.href = '/courses'}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1 text-blue-500 dark:text-blue-400">
                    <i className="ri-book-open-line text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {getTranslation('dashboard.announcement.newCourse', language)}
                    </p>
                    <button 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/courses/new';
                      }}
                    >
                      {getTranslation('dashboard.announcement.viewDetails', language)}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Competition Announcement */}
              <div 
                className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-md cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                onClick={() => window.location.href = '/opportunities'}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1 text-purple-500 dark:text-purple-400">
                    <i className="ri-trophy-line text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {getTranslation('dashboard.announcement.competition', language)}
                    </p>
                    <button 
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/opportunities/competition';
                      }}
                    >
                      {getTranslation('dashboard.announcement.viewDetails', language)}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Scholarship Announcement */}
              <div 
                className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => window.location.href = '/opportunities'}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1 text-green-500 dark:text-green-400">
                    <i className="ri-graduation-cap-line text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {getTranslation('dashboard.announcement.scholarship', language)}
                    </p>
                    <button 
                      className="text-xs text-green-600 dark:text-green-400 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/opportunities/scholarship';
                      }}
                    >
                      {getTranslation('dashboard.announcement.viewDetails', language)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <Skeleton className="h-8 w-8 rounded-md mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))
          ) : (
            <>
              <StatCard 
                title={getTranslation('dashboard.coursesInProgress', language)} 
                value={stats?.coursesInProgress || 0} 
                icon="book-mark-line" 
                color="primary" 
              />
              <StatCard 
                title={getTranslation('dashboard.certificatesEarned', language)} 
                value={stats?.certificatesEarned || 0} 
                icon="award-line" 
                color="secondary" 
              />
              <StatCard 
                title={getTranslation('dashboard.mentorSessions', language)} 
                value={stats?.mentorSessions || 0} 
                icon="group-line" 
                color="accent" 
              />
              <StatCard 
                title={getTranslation('dashboard.opportunitiesSaved', language)} 
                value={stats?.opportunitiesSaved || 0} 
                icon="briefcase-line" 
                color="purple" 
              />
            </>
          )}
        </div>

        {/* Continue Learning Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getTranslation('dashboard.continueLearning', language)}</h2>
            <Link href="/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center dark:text-primary-400 dark:hover:text-primary-300">
              {getTranslation('dashboard.viewAllCourses', language)} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingCourses ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-2 w-full mb-3" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              ))
            ) : courses && courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{getTranslation('dashboard.noCourses', language)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Opportunities Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getTranslation('dashboard.recommendedOpportunities', language)}</h2>
            <Link href="/opportunities" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center dark:text-primary-400 dark:hover:text-primary-300">
              {getTranslation('dashboard.viewAllOpportunities', language)} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingOpportunities ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-10 flex-1 rounded-md" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                  </div>
                </div>
              ))
            ) : opportunities && opportunities.length > 0 ? (
              opportunities.slice(0, 3).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{getTranslation('dashboard.noOpportunities', language)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Featured Mentors Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getTranslation('dashboard.featuredMentors', language)}</h2>
            <Link href="/mentors" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center dark:text-primary-400 dark:hover:text-primary-300">
              {getTranslation('dashboard.viewAllMentors', language)} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {isLoadingMentors ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-4 text-center">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-1" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                    <div className="flex justify-center mb-3">
                      <Skeleton className="h-6 w-16 rounded-full mx-1" />
                      <Skeleton className="h-6 w-16 rounded-full mx-1" />
                      <Skeleton className="h-6 w-16 rounded-full mx-1" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              ))
            ) : mentors && mentors.length > 0 ? (
              mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{getTranslation('dashboard.noMentors', language)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Advice Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getTranslation('dashboard.recentAdvice', language)}</h2>
            <Link href="/advice" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center dark:text-primary-400 dark:hover:text-primary-300">
              {getTranslation('dashboard.viewAllArticles', language)} <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingArticles ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <div className="md:flex">
                    <Skeleton className="md:w-1/3 h-40" />
                    <div className="p-4 md:w-2/3">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : articles && articles.length > 0 ? (
              articles.slice(0, 2).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{getTranslation('dashboard.noArticles', language)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
