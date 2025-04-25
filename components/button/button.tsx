import React from "react";
import { Button } from "@rneui/base";

interface DefaultButtonProps {
  title?: string;
  backgroundColor: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: any;
}

export default function DefaultButton({
  title,
  backgroundColor,
  onPress,
  disabled = false,
  icon,
}: DefaultButtonProps) {
  return (
    <Button
      radius="sm"
      color={backgroundColor}
      onPress={onPress}
      disabled={disabled}
      icon={icon}
      buttonStyle={{
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {title}
    </Button>
  );
}
