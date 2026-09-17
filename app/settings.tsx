import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  BottomBar,
  Card,
  Screen,
  styles,
  useTheme,
  type ThemeMode,
} from "@/design-system";

type ProfileType = "personal" | "business" | "both";

export default function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<ProfileType>("personal");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const { mode, setMode } = useTheme();

  useEffect(() => {
    SecureStore.getItemAsync("day2day_profile").then((value) => {
      if (!value) return;
      try {
        const stored = JSON.parse(value) as {
          name?: string;
          profile?: ProfileType;
          imageUri?: string;
        };
        setName(stored.name ?? "");
        if (stored.profile) setProfile(stored.profile);
        setImageUri(stored.imageUri);
      } catch {
        // Ignore malformed local profile data and keep the editable defaults.
      }
    });
  }, []);

  const navigate = (
    destination: "home" | "money" | "lending" | "tasks" | "settings",
  ) => {
    if (destination === "settings") return;
    if (destination === "money") return router.push("/transactions");
    if (destination === "lending") return router.push("/lending");
    if (destination === "tasks") return router.push("/tasks");
    router.push("/dashboard");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 18 }}>
        <Text style={styles.eyebrow}>SETTINGS</Text>
        <Text style={styles.title}>Your space</Text>
        <Text style={styles.subtitle}>
          Manage only the parts of Day2Day you use.
        </Text>

        <Card>
          <Text style={styles.heading}>Appearance</Text>
          <Text style={[styles.muted, { marginTop: 6, marginBottom: 14 }]}>
            Follow your device or choose a fixed palette for Day2Day.
          </Text>
          <View style={styles.row}>
            {(
              [
                ["system", "System"],
                ["light", "Light"],
                ["dark", "Dark"],
              ] as [ThemeMode, string][]
            ).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === value }}
                onPress={() => setMode(value)}
                style={[styles.choice, mode === value && styles.choiceActive]}
              >
                <Text
                  style={[
                    styles.choiceText,
                    mode === value && styles.choiceTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.heading}>Profile</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={styles.preferenceRow}
            onPress={() => router.push("/settings/profile")}
          >
            {imageUri ? (
              <Image
                accessibilityLabel="Profile photo"
                source={{ uri: imageUri }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 12,
                }}
              />
            ) : (
              <View style={[styles.accountAvatar, { marginRight: 12 }]}>
                <Text style={styles.accountAvatarText}>
                  {name.trim().slice(0, 1).toUpperCase() || "•"}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.drawerItemText, { marginLeft: 0 }]}>
                {name.trim() || "Set up your profile"}
              </Text>
              <Text style={styles.muted}>
                {profile === "both"
                  ? "Personal and business"
                  : profile[0].toUpperCase() + profile.slice(1)}{" "}
                use
              </Text>
            </View>
            <Text style={styles.linkText}>Edit</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={styles.heading}>Accounts</Text>
          <View style={styles.preferenceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerItemText}>Account management</Text>
              <Text style={styles.muted}>
                Add or review your accounts and wallets.
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Manage accounts"
              onPress={() => router.push("/accounts")}
            >
              <Text style={styles.linkText}>Open</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <Text style={styles.heading}>Reports</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open reports"
            style={styles.preferenceRow}
            onPress={() => router.push("/settings/reports")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerItemText}>Money reports</Text>
              <Text style={styles.muted}>
                Review balances, cash flow, and export your records.
              </Text>
            </View>
            <Text style={styles.linkText}>Open</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <BottomBar active="settings" onNavigate={navigate} />
    </Screen>
  );
}
