import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Input, Icon } from "@rneui/themed";
import { useDebounce } from "@/helpers/debounce";

type SearchInputProps = {
  onSearch: (searchTerm: string) => void;
};

export default function SearchInput({ onSearch }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
  };

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <View className="">
      <Input
        onChangeText={handleInputChange}
        placeholder="Search here..."
        leftIcon={<Icon name="search" size={20} color="#B0B0B0" />}
        containerStyle={{
          backgroundColor: "#fff",
          borderRadius: 12,
          borderWidth: 0,
          height: 45,
        }}
        inputContainerStyle={{
          borderBottomWidth: 0,
        }}
      />
    </View>
  );
}
