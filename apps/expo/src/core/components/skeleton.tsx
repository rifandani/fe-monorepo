/* oxlint-disable eslint/func-style -- function declarations */
import type { ComponentPropsWithoutRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { useSkeletonAnimation } from "@/core/hooks/use-animate-skeleton";

interface Props {
  loaderStyle?: ComponentPropsWithoutRef<typeof Animated.View>["style"];
  numberOfItems?: number;
  direction?: "row" | "column";
  speed?: number;
  targetOpacityValue?: number;
}
export function Skeleton({
  loaderStyle,
  numberOfItems = 3,
  direction = "row",
  speed = 1000,
  targetOpacityValue = 0.2,
}: Props) {
  const animatedStyle = useSkeletonAnimation({ speed, targetOpacityValue });
  return (
    <View style={{ flexDirection: direction }}>
      {Array.from({ length: numberOfItems }, (_, idx) => (
        <Animated.View
          key={`animated-view-${idx}`}
          style={[loaderStyle, animatedStyle]}
        />
      ))}
    </View>
  );
}
