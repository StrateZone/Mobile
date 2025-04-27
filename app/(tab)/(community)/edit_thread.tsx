import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/constants/types/root-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { getRequest, putRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "edit_thread"
>;

const CustomQuillToolbar = ({ editor, options, theme }: any) => {
  return <QuillToolbar editor={editor} options={options} theme={theme} />;
};

export default function EditThreadScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const { thread } = route.params;

  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const editorRef = useRef<QuillEditor>(null);

  const fetchTags = async () => {
    try {
      const response = await getRequest("/tags/by-role", {
        role: "Member",
      });
      setTags(response);

      const initialSelected = thread.threadsTags.map((item: any) => item.tagId);
      setSelectedTagIds(initialSelected);
    } catch (error) {
      console.error("Error fetching tags", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleUpdate = async () => {
    const plainText = content.replace(/<[^>]+>/g, "").trim();
    if (!title.trim() || !plainText || plainText.length < 500) {
      Alert.alert(
        "Lỗi",
        "Tiêu đề và nội dung (ít nhất 500 ký tự) là bắt buộc.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await putRequest(`/threads/edit/${thread.threadId}`, {
        title,
        content,
        tagIds: selectedTagIds,
      });

      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: `Yêu cầu duyệt chỉnh sửa đã được gửi đi`,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật bài viết");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 10,
              padding: 12,
              backgroundColor: "#E5E7EB",
              borderRadius: 999,
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Chỉnh sửa bài viết
          </Text>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Tiêu đề
          </Text>
          <View
            style={{
              backgroundColor: "#ffffff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Input
              style={{ fontSize: 16 }}
              placeholder="Nhập tiêu đề"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Chọn thẻ (Tags)
          </Text>

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
          >
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.tagId);
              return (
                <TouchableOpacity
                  key={tag.tagId}
                  onPress={() => handleToggleTag(tag.tagId)}
                  style={{
                    backgroundColor: isSelected ? tag.tagColor : "#E5E7EB",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    margin: 4,
                  }}
                >
                  <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                    {tag.tagName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Nội dung *(tối thiểu 500 ký tự)*
          </Text>
          <CustomQuillToolbar
            editor={editorRef}
            options={[
              ["bold", "italic", "underline", "strike"],
              [{ header: [1, 2, 3, false] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ]}
            theme="light"
          />

          <View
            style={{
              height: 300,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <QuillEditor
              ref={editorRef}
              style={{ flex: 1, padding: 8 }}
              initialHtml={content}
              onHtmlChange={(html) => setContent(html.html)}
            />
          </View>

          <Button
            title={isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            loading={isLoading}
            onPress={handleUpdate}
            buttonStyle={{ backgroundColor: "#10B981", borderRadius: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
