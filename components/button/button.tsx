import React from "react";
import { Button, Icon } from "@rneui/base";

interface DefaultButtonProps {
  title?: string;
  backgroundColor: string;
  onPress?: () => void;
}

export default function DefaultButton({
  title,
  backgroundColor,
  onPress,
}: DefaultButtonProps) {
  return (
    <Button radius="sm" color={backgroundColor} onPress={onPress}>
      {title}
    </Button>
  );
}
