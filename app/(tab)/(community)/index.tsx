import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { Button, Chip, Icon } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

import CommunityCard from "@/components/card/community_card";
import { getRequest } from "@/helpers/api-requests";

import { Thread } from "@/constants/types/thread";
import { Tag } from "@/constants/types/tag";

const CommunityScreen = () => {
  const navigation = useNavigation();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showTags, setShowTags] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await getRequest("/tags");
      setTags(response);
    } catch (error) {
      console.error("Error fetching tags", error);
    }
  };

  const fetchThreads = async (page = 1, concat = false) => {
    if (page > totalPages && page !== 1) return;

    page === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const response = await getRequest("/threads/filter/statuses-and-tags", {
        statuses: "published",
        TagIds: selectedTags,
        pageNumber: page,
        pageSize,
      });

      setTotalPages(response.totalPages || 1);

      if (concat) {
        setThreads((prev) => [...prev, ...response.pagedList]);
      } else {
        setThreads(response.pagedList);
      }
    } catch (error) {
      console.error("Error fetching threads", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchThreads(1, false);
  }, [selectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const loadMoreThreads = () => {
    if (loadingMore || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchThreads(nextPage, true);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const cleanAndTruncate = (html: string, maxLength = 200) => {
    if (!html) return "";
    const plainText = html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (plainText.length <= maxLength) return plainText;
    const truncated = plainText.substring(0, maxLength);
    return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
  };

  return (
    <View className="bg-white flex-1 px-4 py-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row gap-2">
          <Button type="clear" title="Mới Nhất" />
          <Button type="clear" title="Phổ Biến" />
          <Button type="clear" title="Của Bạn Bè" />
        </View>
      </View>

      {/* Tags */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-semibold text-black">Chủ Đề</Text>
        <Button
          type="clear"
          onPress={() => setShowTags(!showTags)}
          icon={
            <Icon
              name={showTags ? "chevron-up" : "chevron-down"}
              type="feather"
              color="#333"
            />
          }
        />
      </View>

      {showTags && (
        <View className="flex-row flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Chip
              key={tag.tagId}
              title={tag.tagName}
              onPress={() => toggleTag(tag.tagId)}
              type={selectedTags.includes(tag.tagId) ? "solid" : "outline"}
              color={selectedTags.includes(tag.tagId) ? "primary" : "default"}
            />
          ))}
        </View>
      )}

      {/* Thread List */}
      {loading && currentPage === 1 ? (
        <ActivityIndicator size="large" color="#000" className="mt-12" />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item, index) => `${item.threadId}-${index}`}
          renderItem={({ item: thread }) => (
            <CommunityCard
              key={thread.threadId}
              threadId={thread.threadId}
              theme={thread.threadsTags?.[0]?.tag?.tagName || "Chess"}
              title={thread.title}
              thumbnailUrl={thread.thumbnailUrl}
              description={cleanAndTruncate(thread.content)}
              dateTime={thread.createdAt}
              likes={thread.likesCount || 0}
              threadData={{
                likes: (thread.likes || []).map((like) => ({
                  ...like,
                  threadId: thread.threadId,
                })),
              }}
              createdByNavigation={{
                ...thread.createdByNavigation,
                username: thread.createdByNavigation.fullName
                  .replace(/\s+/g, "")
                  .toLowerCase(),
              }}
              tags={thread.threadsTags || []}
            />
          )}
          onEndReached={loadMoreThreads}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#000" className="my-4" />
            ) : null
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-12">
              Không có bài viết nào.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default CommunityScreen;
