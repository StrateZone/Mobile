import { ThreadTag } from "./thread_tag";

export type Thread = {
  threadId: number;
  title: string;
  thumbnailUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  threadsTags?: ThreadTag[];
  createdByNavigation: {
    userId: number;
    fullName: string;
    avatarUrl: string;
  };
  likes?: Array<{ id: number; userId: number | null }>;
};
