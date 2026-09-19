"use client";

import React, { useState, useEffect, use } from "react";
import { blogService } from "@/lib/blog/blogService";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { BlogPost } from "@/types/blog";

interface AdminEditBlogPostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default function AdminEditBlogPostPage({ params }: AdminEditBlogPostPageProps) {
  const resolvedParams = use(params);
  const { postId } = resolvedParams;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const found = blogService.getPostById(postId);
    setPost(found);
    setIsLoaded(true);
  }, [postId]);

  if (!isLoaded) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground">
        در حال بارگذاری اطلاعات مقاله...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-12 text-center text-xs text-error font-bold">
        مقاله مورد نظر یافت نشد.
      </div>
    );
  }

  return <BlogPostForm initialData={post} />;
}
