import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateThread() {
  const navigation = useNavigation<NavigationProp>();

  const { authState } = useAuth();
  const user = authState?.user;

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [content, setContent] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await getRequest("/tags");
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
    console.log("uploadImage", threadId, image);
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
      console.log("last data: ", data);
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

  const handleSubmit = async () => {
    if (!title.trim())
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tiêu đề.",
      });

    if (!thumbnail)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ảnh đại diện.",
      });

    if (selectedTagIds.length === 0)
      return Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ít nhất 1 thể loại.",
      });

    setIsLoading(true);
    try {
      const threadRes = await postRequest("/threads", {
        createdBy: user?.userId,
        title,
        content,
        tagIds: selectedTagIds,
      });
      console.log("Data send", user?.userId, title, content, selectedTagIds);
      const threadId = threadRes.data.threadId;
      console.log("response thread", threadId);
      await uploadImage(threadId, thumbnail);

      Toast.show({
        type: "success",
        text1: "Bài đăng đã được gửi cho quản trị viên xét duyệt!",
      });
      navigation.goBack();
    } catch (err: any) {
      console.error("Error during thread submission:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
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

      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Tạo Bài Viết
        </Text>

        <Card containerStyle={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Tiêu đề *</Text>
          <Input
            placeholder="Nhập tiêu đề bài viết"
            value={title}
            onChangeText={setTitle}
            containerStyle={{ marginBottom: 16 }}
          />

          <Text style={{ fontSize: 16, fontWeight: "600" }}>Thể loại *</Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
          >
            {tags.map((tag) => (
              <Chip
                key={tag.tagId}
                title={tag.tagName}
                onPress={() => handleTagSelect(tag.tagId)}
                type={selectedTagIds.includes(tag.tagId) ? "solid" : "outline"}
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
          Nội dung *
        </Text>
        <Input
          placeholder="Nhập nội dung bài viết"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          containerStyle={{ marginBottom: 16 }}
        />

        <Button
          title={isLoading ? "Đang đăng..." : "Đăng bài"}
          loading={isLoading}
          onPress={handleSubmit}
          buttonStyle={{ backgroundColor: "#007BFF", borderRadius: 8 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
