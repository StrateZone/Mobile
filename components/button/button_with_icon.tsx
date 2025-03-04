import React from "react";
import { Button, Icon } from "@rneui/base";

interface ButtonWithIconProps {
  iconName: string;
  title?: string;
  backgroundColor: string;
  iconColor: string;
  onPress?: () => void;
}

export default function ButtonWithIcon({
  iconName,
  title,
  backgroundColor,
  iconColor,
  onPress,
}: ButtonWithIconProps) {
  return (
    <Button radius="sm" color={backgroundColor} onPress={onPress}>
      <Icon
        name={iconName}
        color={iconColor}
        type="font-awesome"
        style={{ marginRight: 8 }}
      />
      {title}
    </Button>
  );
}
