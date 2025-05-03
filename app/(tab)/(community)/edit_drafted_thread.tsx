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
import { Button, Input, Avatar, Chip, Divider, Icon } from "@rneui/themed";
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
import { Fold } from "react-native-animated-spinkit";
import BackButton from "@/components/BackButton";
import LoadingForButton from "@/components/loading/loading_button";

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
      Alert.alert("Lỗi", "Nội dung (ít nhất 500 ký tự) là bắt buộc.");
      return;
    }

    if (!title.trim())
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tiêu đề.",
      });

    if (titleCharCount > 100)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Tiêu đề không được vượt quá 100 ký tự.",
      });

    if (!thumbnail)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ảnh cho bài viết.",
      });

    if (selectedTagIds.length === 0)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ít nhất 1 thể loại.",
      });

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" /* neutral */ }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BackButton customAction={() => navigation.goBack()} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#212529" /* neutral-900 */,
            }}
          >
            Chỉnh sửa bài nháp
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          style={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E293B",
                marginBottom: 8,
              }}
            >
              Tiêu đề
            </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                color: titleCharCount > 100 ? "#EF4444" : "#64748B",
                fontSize: 12,
              }}
            >
              {titleCharCount}/100 ký tự
            </Text>
            <Input
              style={{ fontSize: 16 }}
              placeholder="Nhập tiêu đề"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setTitleCharCount(text.length);
              }}
              containerStyle={{ paddingHorizontal: 0 }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E293B",
                marginBottom: 8,
              }}
            >
              Ảnh cho bài viết
            </Text>
            <Button
              title="Chọn ảnh cho bài viết"
              onPress={pickImage}
              icon={
                <Ionicons
                  name="image-outline"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
              }
              buttonStyle={{ backgroundColor: "#3B82F6", borderRadius: 8 }}
            />
            {thumbnail && (
              <Avatar
                size={200}
                source={{ uri: thumbnail }}
                containerStyle={{ marginVertical: 16, alignSelf: "center" }}
                rounded
              />
            )}
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E293B",
                marginBottom: 8,
              }}
            >
              Thể loại
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.tagId}
                  title={tag.tagName}
                  onPress={() => handleToggleTag(tag.tagId)}
                  type={
                    selectedTagIds.includes(tag.tagId) ? "solid" : "outline"
                  }
                  color={
                    selectedTagIds.includes(tag.tagId) ? "primary" : "default"
                  }
                  containerStyle={{ margin: 4 }}
                  titleStyle={{
                    color: selectedTagIds.includes(tag.tagId)
                      ? "#FFFFFF"
                      : "#1E293B",
                    fontSize: 14,
                  }}
                  buttonStyle={{
                    backgroundColor: selectedTagIds.includes(tag.tagId)
                      ? tag.tagColor
                      : "#F1F5F9",
                    borderColor: selectedTagIds.includes(tag.tagId)
                      ? tag.tagColor
                      : "#E2E8F0",
                  }}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1E293B",
                marginBottom: 8,
              }}
            >
              Nội dung
            </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                color: contentCharCount < 500 ? "#EF4444" : "#64748B",
                fontSize: 12,
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
                borderColor: "#E2E8F0",
                borderRadius: 8,
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
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
              marginBottom: 32,
            }}
          >
            <Button
              title={isDraftLoading ? "Đang lưu..." : "Lưu nháp"}
              loading={isDraftLoading}
              disabled={isDraftLoading || isUpdateLoading}
              onPress={() => handleUpdate(true)}
              icon={
                isDraftLoading ? (
                  <LoadingForButton />
                ) : (
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                )
              }
              buttonStyle={{
                backgroundColor: "#64748B",
                borderRadius: 8,
                flex: 1,
                marginRight: 8,
                paddingVertical: 12,
              }}
              titleStyle={{ fontSize: 16, fontWeight: "600" }}
            />
            <Button
              title={isUpdateLoading ? "Đang lưu..." : "Cập nhật nháp"}
              loading={isUpdateLoading}
              disabled={isDraftLoading || isUpdateLoading}
              onPress={() => handleUpdate(false)}
              icon={
                isUpdateLoading ? (
                  <LoadingForButton />
                ) : (
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                )
              }
              buttonStyle={{
                backgroundColor: "#10B981",
                borderRadius: 8,
                flex: 1,
                marginLeft: 8,
                paddingVertical: 12,
              }}
              titleStyle={{ fontSize: 16, fontWeight: "600" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
