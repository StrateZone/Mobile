import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Avatar, Chip, Card } from "@rneui/themed";
import Toast from "react-native-toast-message";
import { getRequest, postRequest, patchRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import { Tag } from "@/constants/types/tag";
import { config } from "@/config";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@/context/auth-context";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomQuillToolbar = ({ editor, options, theme }: any) => {
  return <QuillToolbar editor={editor} options={options} theme={theme} />;
};

export default function CreateThread() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const editorRef = useRef<QuillEditor>(null);

  const { authState } = useAuth();
  const user = authState?.user;
  const draftThread = route.params?.draftThread;

  const [title, setTitle] = useState(draftThread?.title || "");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    draftThread?.threadsTags?.map((item: any) => item.tagId) || [],
  );
  const [thumbnail, setThumbnail] = useState<any>(
    draftThread?.thumbnailUrl || null,
  );
  const [content, setContent] = useState(draftThread?.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [titleCharCount, setTitleCharCount] = useState(title.length);
  const [contentCharCount, setContentCharCount] = useState(
    content.replace(/<[^>]+>/g, "").trim().length,
  );

  const fetchTags = async () => {
    try {
      const response = await getRequest(`/tags/by-role`, {
        role: "Member",
      });
      setTags(response);
    } catch (error) {
      console.error("Error fetching tags", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagSelect = (tagId: number) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (prev.length < 5) return [...prev, tagId];
      return prev;
    });
  };

  const compressImageToUnder5MB = async (uri: string): Promise<string> => {
    let quality = 0.9;
    let compressedUri = uri;

    while (quality > 0.1) {
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (fileInfo.size && fileInfo.size <= 5 * 1024 * 1024) {
        return result.uri;
      }

      quality -= 0.1;
    }

    return compressedUri;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      let selected = result.assets[0];
      let fileInfo = await FileSystem.getInfoAsync(selected.uri);

      if (fileInfo.size && fileInfo.size <= 5 * 1024 * 1024) {
        setThumbnail(selected.uri);
      } else {
        let compressed = await compressImageToUnder5MB(selected.uri);
        setThumbnail(compressed);
      }
    }
  };

  const uploadImage = async (threadId: number, image: any) => {
    const formData = new FormData();
    formData.append("Type", "thread");
    formData.append("EntityId", threadId.toString());
    formData.append("ImageFile", {
      uri: image,
      type: image.type || "image/jpeg",
      name: image.fileName || "image.jpg",
    } as any);
    formData.append("Width", "1200");
    formData.append("Height", "630");
    try {
      const response = await fetch(`${config.BACKEND_API}/api/images/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      if (response.status === 201) {
        return data.url;
      } else {
        console.error("BE Error:", data);
        throw new Error(data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (isDrafted = false) => {
    if (!title.trim())
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tiêu đề.",
      });

    if (!thumbnail && !isDrafted)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ảnh đại diện.",
      });

    if (selectedTagIds.length === 0 && !isDrafted)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ít nhất 1 thể loại.",
      });

    const plainText = content.replace(/<[^>]+>/g, "").trim();
    if (!plainText || (plainText.length < 500 && !isDrafted)) {
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Nội dung bài viết phải có ít nhất 500 ký tự.",
      });
    }

    if (isDrafted) {
      setIsDraftLoading(true);
    } else {
      setIsPublishLoading(true);
    }

    try {
      const threadRes = await postRequest("/threads", {
        createdBy: user?.userId,
        title,
        content,
        tagIds: selectedTagIds,
        isDrafted,
      });
      const threadId = threadRes.data.threadId;

      if (thumbnail) {
        await uploadImage(threadId, thumbnail);
      }

      Toast.show({
        type: "success",
        text1: isDrafted
          ? "Đã lưu nháp!"
          : "Bài đăng đã được gửi cho quản trị viên xét duyệt!",
      });
      navigation.goBack();
    } catch (err: any) {
      console.error("Error during thread submission:", err);
    } finally {
      if (isDrafted) {
        setIsDraftLoading(false);
      } else {
        setIsPublishLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
            Tạo Bài Viết
          </Text>

          <Card containerStyle={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Tiêu đề *</Text>
            <Text
              style={{
                alignSelf: "flex-end",
                color: titleCharCount > 100 ? "red" : "gray",
              }}
            >
              {titleCharCount}/100 ký tự
            </Text>

            <Input
              placeholder="Nhập tiêu đề bài viết"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setTitleCharCount(text.length);
              }}
              containerStyle={{ marginBottom: 16 }}
            />

            <Text style={{ fontSize: 16, fontWeight: "600" }}>Thể loại *</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {tags.map((tag) => (
                <Chip
                  className="p-1"
                  key={tag.tagId}
                  title={tag.tagName}
                  onPress={() => handleTagSelect(tag.tagId)}
                  type={
                    selectedTagIds.includes(tag.tagId) ? "solid" : "outline"
                  }
                  color={
                    selectedTagIds.includes(tag.tagId) ? "primary" : "default"
                  }
                />
              ))}
            </View>

            <Button title="Chọn ảnh đại diện" onPress={pickImage} />
            {thumbnail && (
              <Avatar
                size={200}
                source={{ uri: thumbnail }}
                containerStyle={{ marginVertical: 16 }}
              />
            )}
          </Card>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Nội dung * (tối thiểu 500 ký tự)
          </Text>
          <Text
            style={{
              alignSelf: "flex-end",
              color: contentCharCount < 500 ? "red" : "gray",
            }}
          >
            {contentCharCount}/500 ký tự
          </Text>

          <View style={{ marginBottom: 16 }}>
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
          </View>
          <View
            style={{
              height: 300,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <QuillEditor
              ref={editorRef}
              style={{ flex: 1, padding: 8 }}
              initialHtml={content}
              onHtmlChange={(html) => {
                setContent(html.html);
                const plainText = html.html.replace(/<[^>]+>/g, "").trim();
                setContentCharCount(plainText.length);
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <Button
              title={isDraftLoading ? "Đang lưu..." : "Lưu nháp"}
              loading={isDraftLoading}
              disabled={isDraftLoading || isPublishLoading}
              onPress={() => handleSubmit(true)}
              buttonStyle={{
                backgroundColor: "#6B7280",
                borderRadius: 8,
                flex: 1,
                marginRight: 8,
              }}
            />
            <Button
              title={isPublishLoading ? "Đang đăng..." : "Đăng bài"}
              loading={isPublishLoading}
              disabled={isDraftLoading || isPublishLoading}
              onPress={() => handleSubmit(false)}
              buttonStyle={{
                backgroundColor: "#007BFF",
                borderRadius: 8,
                flex: 1,
                marginLeft: 8,
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
