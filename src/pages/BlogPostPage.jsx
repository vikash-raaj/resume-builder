import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { getBlogPostBySlug } from '../data/blogPosts';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 px-4 py-14 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Post not found</h1>
          <Link to="/blog" className="text-blue-600 hover:underline text-sm">Back to the blog</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to the blog
          </Link>

          <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span>{formatDate(post.publishedAt)}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {post.readMinutes} min read</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

            <div className="space-y-8">
              {post.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
                  <div className="space-y-3">
                    {section.paragraphs.map((paragraph, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {post.cta && (
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-500">Ready to put this into practice?</p>
                <Link
                  to={post.cta.to}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  {post.cta.text} <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </article>
        </div>
      </div>
    </AppLayout>
  );
}
