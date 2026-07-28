import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { BLOG_POSTS } from '../data/blogPosts';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">The TheResume.io Blog</h1>
              <p className="text-sm text-gray-500">Practical, specific guidance on resumes, cover letters, and job applications</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readMinutes} min read</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                  Read article <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
