import React from "react";
import { ButtonGroup } from "@rneui/base";
import { useTheme } from "@rneui/themed";

interface ButtonGroupProps {
  data: { name: string }[];
  selectedDataIndex: number;
  setSelectedDataIndex: (index: number) => void;
  setSelectedDataName: (name: string) => void;
}

export default function GroupButton({
  data,
  selectedDataIndex,
  setSelectedDataIndex,
  setSelectedDataName,
}: ButtonGroupProps) {
  const { theme } = useTheme();

  return (
    <ButtonGroup
      buttons={data.map((item) => item.name)}
      selectedIndex={selectedDataIndex}
      onPress={(index) => {
        if (index === selectedDataIndex) {
          setSelectedDataIndex(-1);
          setSelectedDataName("");
        } else {
          setSelectedDataIndex(index);
          setSelectedDataName(data[index]?.name || "");
        }
      }}
      containerStyle={{ marginVertical: 0, marginBottom: 0, borderWidth: 0 }}
      buttonStyle={{
        padding: 10,
      }}
      selectedButtonStyle={{
        backgroundColor: "white",
        borderBottomColor: theme.colors.primary,
        borderBottomWidth: 2,
      }}
      selectedTextStyle={{
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: "bold",
      }}
      textStyle={{
        fontSize: 16,
        fontWeight: "bold",
      }}
      innerBorderStyle={{ color: "white", width: 0 }}
    />
  );
}
