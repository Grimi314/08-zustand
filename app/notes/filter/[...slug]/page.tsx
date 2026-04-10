import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function NotesPage({ params }: Props) {
  const queryClient = new QueryClient();

  const { slug } = await params;
  const tag = slug?.[0] ?? "all";
  await queryClient.prefetchQuery({
    queryKey: ["note", slug],
    queryFn: () => fetchNotes(tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
