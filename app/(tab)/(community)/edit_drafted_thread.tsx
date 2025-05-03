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
import { Button, Input, Avatar, Chip } from "@rneui/themed";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/constants/types/root-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { getRequest, putRequest, postRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { config } from "@/config";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "edit_drafted_thread"
>;

const CustomQuillToolbar = ({ editor, options, theme }: any) => {
  return <QuillToolbar editor={editor} options={options} theme={theme} />;
};

export default function EditDraftScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const { thread } = route.params;

  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [thumbnail, setThumbnail] = useState<any>(thread.thumbnailUrl || null);
  const [titleCharCount, setTitleCharCount] = useState(title.length);
  const [contentCharCount, setContentCharCount] = useState(
    content.replace(/<[^>]+>/g, "").trim().length,
  );

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

  const handleUpdate = async (isDrafted = true) => {
    const plainText = content.replace(/<[^>]+>/g, "").trim();
    if (!title.trim() || !plainText || (plainText.length < 500 && !isDrafted)) {
      Alert.alert(
        "Lỗi",
        "Tiêu đề và nội dung (ít nhất 500 ký tự) là bắt buộc.",
      );
      return;
    }

    if (isDrafted) {
      setIsDraftLoading(true);
    } else {
      setIsUpdateLoading(true);
    }

    try {
      if (isDrafted) {
        // Tạo bản nháp mới
        const res = await postRequest("/threads", {
          createdBy: thread.createdBy,
          title,
          content,
          tagIds: selectedTagIds,
          isDrafted: true,
        });
        if (thumbnail) {
          await uploadImage(res.data.threadId, thumbnail);
        }
      } else {
        // Cập nhật bản nháp hiện tại
        const res = await putRequest(`/threads/edit/${thread.threadId}`, {
          title,
          content,
          tagIds: selectedTagIds,
          isDrafted: true,
        });
        if (thumbnail && thumbnail !== thread.thumbnailUrl) {
          await uploadImage(thread.threadId, thumbnail);
        }
      }

      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: isDrafted ? "Đã lưu nháp mới" : "Đã cập nhật bài nháp",
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật bài viết");
      console.error(error);
    } finally {
      if (isDrafted) {
        setIsDraftLoading(false);
      } else {
        setIsUpdateLoading(false);
      }
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
          <Text
            style={{
              alignSelf: "flex-end",
              color: titleCharCount > 100 ? "red" : "gray",
            }}
          >
            {titleCharCount}/100 ký tự
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
              onChangeText={(text) => {
                setTitle(text);
                setTitleCharCount(text.length);
              }}
            />
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Ảnh đại diện
          </Text>
          <Button title="Chọn ảnh đại diện" onPress={pickImage} />
          {thumbnail && (
            <Avatar
              size={200}
              source={{ uri: thumbnail }}
              containerStyle={{ marginVertical: 16 }}
            />
          )}

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Chọn thẻ (Tags)
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {tags.map((tag) => (
              <Chip
                key={tag.tagId}
                title={tag.tagName}
                onPress={() => handleToggleTag(tag.tagId)}
                type={selectedTagIds.includes(tag.tagId) ? "solid" : "outline"}
                color={
                  selectedTagIds.includes(tag.tagId) ? "primary" : "default"
                }
                containerStyle={{ margin: 4 }}
                titleStyle={{
                  color: selectedTagIds.includes(tag.tagId) ? "#fff" : "#000",
                }}
                buttonStyle={{
                  backgroundColor: selectedTagIds.includes(tag.tagId)
                    ? tag.tagColor
                    : "#E5E7EB",
                }}
              />
            ))}
          </View>

          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Nội dung *(tối thiểu 500 ký tự)*
          </Text>
          <Text
            style={{
              alignSelf: "flex-end",
              color: contentCharCount < 500 ? "red" : "gray",
            }}
          >
            {contentCharCount}/500 ký tự
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
              title={isDraftLoading ? "Đang lưu..." : "Lưu nháp mới"}
              loading={isDraftLoading}
              disabled={isDraftLoading || isUpdateLoading}
              onPress={() => handleUpdate(true)}
              buttonStyle={{
                backgroundColor: "#6B7280",
                borderRadius: 8,
                flex: 1,
                marginRight: 8,
              }}
            />
            <Button
              title={isUpdateLoading ? "Đang lưu..." : "Cập nhật nháp"}
              loading={isUpdateLoading}
              disabled={isDraftLoading || isUpdateLoading}
              onPress={() => handleUpdate(false)}
              buttonStyle={{
                backgroundColor: "#10B981",
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
