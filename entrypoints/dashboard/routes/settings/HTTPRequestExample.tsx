import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

const HACKER_NEWS_STORIES_BASE_URL = "https://hacker-news.firebaseio.com/v0";
const STORIES_LIMIT = 10;

interface Story {
  id: number;
  url: string;
  title: string;
}

export function HTTPRequestExample() {
  const [storiesType, setStoriesType] = useState<"top" | "new">("top");
  const storiesByFetch = useStoriesByFetch(storiesType);
  const storiesByUseQuery = useStoriesByUseQuery(storiesType);

  return (
    <div>
      <div className="flex flex-row justify-between mb-4 gap-4">
        <Button
          onClick={() => {
            storiesByFetch.refresh();
            storiesByUseQuery.refresh();
          }}
        >
          Refresh
        </Button>
        <Select
          value={storiesType}
          onValueChange={(v) => setStoriesType(v as "top" | "new")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top Stories</SelectItem>
            <SelectItem value="new">New Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row w-full">
        <div className="flex-1">
          <h1 className="text-lg">By Fetch</h1>
          <StoriesList
            isLoading={storiesByFetch.isLoading}
            stories={storiesByFetch.stories}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-lg">By useQuery</h1>
          <StoriesList
            isLoading={storiesByUseQuery.isLoading}
            stories={storiesByUseQuery.stories}
          />
        </div>
      </div>
    </div>
  );
}

function StoriesList(props: { isLoading: boolean; stories: Story[] }) {
  const { isLoading, stories } = props;
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <ul>
      {stories.map((story) => (
        <li key={story.id}>
          <a href={story.url} className="underline hover:text-blue-500">
            {story.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function useStoriesByFetch(type: string) {
  const [topStoryIDs, setTopStoryIDs] = useState<number[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshToken, setRefreshToken] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${HACKER_NEWS_STORIES_BASE_URL}/${type}stories.json`)
      .then((response) => response.json())
      .then((data) => setTopStoryIDs(data.slice(0, STORIES_LIMIT)));
  }, [type, refreshToken]);

  useEffect(() => {
    let isCurrent = true;

    async function effect() {
      const stories = new Array<Story>(STORIES_LIMIT);
      await Promise.all(
        topStoryIDs.map(async (storyID, index) => {
          const response = await fetch(
            `${HACKER_NEWS_STORIES_BASE_URL}/item/${storyID}.json`
          );
          const data = await response.json();
          stories[index] = data;
        })
      );
      if (isCurrent) {
        setStories(stories);
        setIsLoading(false);
      }
    }
    effect();

    return () => {
      isCurrent = false;
    };
  }, [topStoryIDs]);

  return { isLoading, stories, refresh: () => setRefreshToken({}) };
}

// See https://tanstack.com/query/latest/docs/framework/react/overview for more information on how to use `useQuery` and `useQueries`.
function useStoriesByUseQuery(type: string) {
  const topStoryIDs = useQuery<number[]>({
    queryKey: ["topStoriesID", type],
    queryFn: async () => {
      const res = await fetch(
        `${HACKER_NEWS_STORIES_BASE_URL}/${type}stories.json`
      );
      const data: number[] = await res.json();
      return data.slice(0, STORIES_LIMIT);
    },
    initialData: [],
  });

  const stories = useQueries({
    queries: topStoryIDs.data.map((id) => ({
      queryKey: ["story", id],
      queryFn: async () => {
        const res = await fetch(
          `${HACKER_NEWS_STORIES_BASE_URL}/item/${id}.json`
        );
        const data: Story = await res.json();
        return data;
      },
    })),
  });

  const isLoading =
    topStoryIDs.isLoading || stories.some((story) => story.isLoading);

  return {
    isLoading,
    stories: stories.map(
      (story) => story.data as NonNullable<typeof story.data>
    ),
    refresh: topStoryIDs.refetch,
  };
}
