import { Opponents } from "./opponent";

export type Comment = {
  commentId: number;
  replyTo: number | null;
  threadId: number;
  userId: number;
  content: string;
  rating: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string | null;
  inverseReplyToNavigation: any[];
  likes: any[];
  replyToNavigation: any | null;
  user: Opponents;
};
