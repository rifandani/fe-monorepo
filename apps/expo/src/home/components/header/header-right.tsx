// fallow-ignore-file unused-file
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { ListItem } from "tamagui";

import { BaseButton } from "@/core/components/button/base-button";
import { FitSheet } from "@/core/components/sheet/fit-sheet";
import { useAppStore } from "@/core/hooks/use-app-store";
import { useBaseSheet } from "@/core/hooks/use-base-sheet";
import type { HeaderButtonProps } from "@/core/types/navigation";

export const HeaderRight = (_: HeaderButtonProps) => {
  const router = useRouter();
  const resetUser = useAppStore((state) => state.resetUser);
  const { state, setState, open, close } = useBaseSheet();

  return (
    <>
      <BaseButton
        transparent
        circular
        size="$3"
        icon={<Feather name="more-vertical" size={20} />}
        onPress={open}
      />

      <FitSheet state={state} setState={setState}>
        <FitSheet.Item>
          <ListItem
            pressTheme
            title="Profile"
            icon={<Feather name="user" size={20} />}
            iconAfter={<Feather name="chevron-right" size={20} />}
            onPress={() => {
              close();
              router.push("/profile");
            }}
          />
        </FitSheet.Item>

        <FitSheet.Item>
          <ListItem
            pressStyle={{ bg: "$red5" }}
            icon={<Feather name="log-out" size={20} color="$red10" />}
            onPress={() => {
              close();
              resetUser();
              router.push("/login");
            }}
          >
            <ListItem.Text color="$red10">Logout</ListItem.Text>
          </ListItem>
        </FitSheet.Item>
      </FitSheet>
    </>
  );
};
