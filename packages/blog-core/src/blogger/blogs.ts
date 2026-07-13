import type { BloggerClient } from "./client.js";

export interface BloggerBlogSummary {
  id: string;
  name: string;
  url: string;
}

export async function listBloggerBlogs(
  client: BloggerClient,
): Promise<BloggerBlogSummary[]> {
  const response = await client.blogs.listByUser({
    userId: "self",
  });

  return (response.data.items ?? [])
    .filter((blog) => Boolean(blog.id))
    .map((blog) => ({
      id: blog.id ?? "",
      name: blog.name ?? "(untitled)",
      url: blog.url ?? "",
    }));
}
