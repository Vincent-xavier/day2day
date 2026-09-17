import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, Screen, styles, colors } from "@/design-system";
export default function HomeScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync("day2day_onboarding_complete")
      .then((complete) => {
        if (mounted) router.replace(complete ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        if (mounted)
          setError("We could not read your setup. Please try again.");
      });
    return () => {
      mounted = false;
    };
  }, [router]);
  if (error)
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.heading}>Day2Day could not start</Text>
          <Text style={[styles.muted, { marginTop: 8 }]}>{error}</Text>
          <Button
            title="Try again"
            onPress={() => {
              setError(null);
              router.replace("/");
            }}
          />
        </View>
      </Screen>
    );
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    </Screen>
  );
}
