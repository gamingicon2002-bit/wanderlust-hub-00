import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

const db = (table: string) => (supabase as any).from(table);

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data } = await db("pages").select("*").eq("slug", slug).eq("is_active", true).single();
      return data;
    },
    enabled: !!slug,
  });

  return (
    <Layout>
      <div className="container-wide section-padding">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !page ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Page not found</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">{page.title}</h1>
            <div
              className="prose prose-lg max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
            <p className="text-xs text-muted-foreground mt-12 border-t border-border pt-4">
              Last updated: {new Date(page.updated_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaticPage;
