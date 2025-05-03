import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input, Avatar, Chip, Divider, Icon } from "@rneui/themed";
import Toast from "react-native-toast-message";
import { getRequest, postRequest, patchRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import { Tag } from "@/constants/types/tag";
import { config } from "@/config";
import { useAuth } from "@/context/auth-context";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { Fold } from "react-native-animated-spinkit";
import BackButton from "@/components/BackButton";
import LoadingForButton from "@/components/loading/loading_button";

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

  const handleToggleTag = (tagId: number) => {
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

  const handlePublish = async (isDrafted = false) => {
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

    if (!thumbnail && !isDrafted)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ảnh cho bài viết.",
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
            Tạo bài viết mới
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529" /* neutral-900 */,
                marginBottom: 8,
              }}
            >
              Tiêu đề
            </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                color:
                  titleCharCount > 100
                    ? "#F44336" /* error */
                    : "#495057" /* neutral-700 */,
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
              inputContainerStyle={{
                borderBottomColor: "#DEE2E6" /* neutral-200 */,
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529" /* neutral-900 */,
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
              buttonStyle={{
                backgroundColor: "#4A6FA5" /* primary */,
                borderRadius: 8,
              }}
            />
            {thumbnail && (
              <Avatar
                size={300}
                source={{ uri: thumbnail }}
                containerStyle={{ marginVertical: 16, alignSelf: "center" }}
              />
            )}
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529" /* neutral-900 */,
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
                      : "#212529" /* neutral-900 */,
                    fontSize: 14,
                  }}
                  buttonStyle={{
                    backgroundColor: selectedTagIds.includes(tag.tagId)
                      ? tag.tagColor
                      : "#F4F5F7" /* neutral */,
                    borderColor: selectedTagIds.includes(tag.tagId)
                      ? tag.tagColor
                      : "#DEE2E6" /* neutral-200 */,
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#212529" /* neutral-900 */,
                marginBottom: 8,
              }}
            >
              Nội dung
            </Text>
            <Text
              style={{
                alignSelf: "flex-end",
                color:
                  contentCharCount < 500
                    ? "#F44336" /* error */
                    : "#495057" /* neutral-700 */,
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
                borderColor: "#DEE2E6" /* neutral-200 */,
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
              disabled={isDraftLoading || isPublishLoading}
              onPress={() => handlePublish(true)}
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
                backgroundColor: "#7D83B9",
                borderRadius: 8,
                flex: 1,
                marginRight: 8,
                paddingVertical: 12,
              }}
              titleStyle={{ fontSize: 16, fontWeight: "600" }}
            />
            <Button
              title={isPublishLoading ? "Đang đăng..." : "Đăng bài"}
              loading={isPublishLoading}
              disabled={isDraftLoading || isPublishLoading}
              onPress={() => handlePublish(false)}
              icon={
                isPublishLoading ? (
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
                backgroundColor: "#4CAF50",
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
