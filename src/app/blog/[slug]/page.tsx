"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ChevronLeft, Clock, Calendar, User, ArrowRight } from "lucide-react";
import { blogService } from "@/lib/blog/blogService";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogTagList } from "@/components/blog/BlogTagList";
import { BlogRelatedPosts } from "@/components/blog/BlogRelatedPosts";
import { BlogPost, BlogCategory, BlogTag } from "@/types/blog";
import { routes } from "@/lib/routes";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentPost = blogService.getPostBySlug(slug);
    if (!currentPost) {
      setIsLoaded(true);
      return;
    }

    setPost(currentPost);

    const cats = blogService.getCategories();
    setAllCategories(cats);
    const cat = cats.find((c) => c.id === currentPost.categoryId) || null;
    setCategory(cat);

    const allTags = blogService.getTags();
    const postTags = allTags.filter((t) => currentPost.tagIds.includes(t.id));
    setTags(postTags);

    const related = blogService.getRelatedPosts(currentPost.id, 3);
    setRelatedPosts(related);

    setIsLoaded(true);
  }, [slug]);

  if (isLoaded && !post) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-3">مقاله مورد نظر یافت نشد</h1>
        <p className="text-neutral-600 text-sm mb-6">
          ممکن است این مقاله حذف شده یا آدرس وارد شده اشتباه باشد.
        </p>
        <Link
          href={routes.blog.list}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به وبلاگ</span>
        </Link>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500 text-xs">در حال بارگذاری مقاله...</p>
      </Container>
    );
  }

  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="py-8 md:py-12">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500 mb-6 font-medium"
          aria-label="مسیر صفحه"
        >
          <Link href={routes.home} className="hover:text-primary transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          <Link href={routes.blog.list} className="hover:text-primary transition-colors">
            وبلاگ
          </Link>
          {category && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
              <Link
                href={routes.blog.category(category.slug)}
                className="hover:text-primary transition-colors"
              >
                {category.title}
              </Link>
            </>
          )}
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-800 font-bold truncate max-w-[200px] md:max-w-[300px]">
            {post.title}
          </span>
        </nav>

        {/* Article Header Container */}
        <header className="max-w-3xl mx-auto mb-8 text-right">
          {category && (
            <Link
              href={routes.blog.category(category.slug)}
              className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 hover:bg-primary/20 transition-colors"
            >
              {category.title}
            </Link>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-snug">
            {post.title}
          </h1>

          <p className="text-sm md:text-base text-neutral-600 mb-6 leading-relaxed font-normal">
            {post.excerpt}
          </p>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#EEEEEE] text-xs text-neutral-500 font-medium">
            {post.authorName && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-neutral-400" />
                <span>{post.authorName}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>{post.readingTime || 5} دقیقه مطالعه</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-surface-subtle border border-[#EEEEEE]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Article Body Content */}
        <div className="max-w-3xl mx-auto">
          <BlogContentRenderer content={post.content} />

          {/* Tags List */}
          <BlogTagList tags={tags} />

          {/* Related Articles */}
          <BlogRelatedPosts posts={relatedPosts} categories={allCategories} />
        </div>
      </Container>
    </article>
  );
}
