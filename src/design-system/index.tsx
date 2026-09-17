import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  darkPalette,
  getActivePalette,
  type ThemePalette,
} from "@/design-system/theme";

export { colors, ThemeProvider, useTheme } from "@/design-system/theme";
export type { ThemeMode, ThemePalette } from "@/design-system/theme";

export const Screen = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => <View style={[styles.card, style]}>{children}</View>;
export const Button = ({
  title,
  variant = "primary",
  accessibilityLabel,
  ...props
}: PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? title}
    style={({ pressed }) => [
      styles.button,
      variant === "secondary" && styles.secondary,
      variant === "ghost" && styles.ghost,
      props.disabled && styles.disabled,
      pressed && !props.disabled && styles.pressed,
    ]}
    {...props}
  >
    <Text
      style={[
        styles.buttonText,
        variant === "secondary" && styles.secondaryText,
        variant === "ghost" && styles.ghostText,
        props.disabled && styles.disabledText,
      ]}
    >
      {title}
    </Text>
  </Pressable>
);
export const Field = (props: TextInputProps & { label: string }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{props.label}</Text>
    <TextInput
      accessibilityLabel={props.label}
      {...props}
      placeholderTextColor={colors.muted}
      style={styles.input}
    />
  </View>
);
export const ScreenHeader = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.screenHeader}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);
export const BackButton = ({
  onPress,
  label = "Go back",
}: {
  onPress: () => void;
  label?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
  >
    <Text style={styles.backIcon}>‹</Text>
    <Text style={styles.backText}>{label}</Text>
  </Pressable>
);
export const EmptyState = ({
  title,
  message,
  action,
  onAction,
}: {
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) => (
  <Card style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <Text style={styles.emptyIconText}>✦</Text>
    </View>
    <Text style={styles.heading}>{title}</Text>
    <Text style={[styles.muted, { textAlign: "center", marginTop: 6 }]}>
      {message}
    </Text>
    {action && onAction ? (
      <Button title={action} variant="secondary" onPress={onAction} />
    ) : null}
  </Card>
);
export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <Card style={styles.loadingState}>
    <ActivityIndicator color={colors.accent} />
    <Text style={[styles.muted, { marginTop: 10 }]}>{label}</Text>
  </Card>
);
export const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <Card style={[styles.emptyState, { borderColor: colors.negative }]}>
    <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
      <Text style={[styles.emptyIconText, { color: colors.negative }]}>!</Text>
    </View>
    <Text style={styles.heading}>We couldn&apos;t load this</Text>
    <Text style={[styles.muted, { textAlign: "center", marginTop: 6 }]}>
      {message}
    </Text>
    {onRetry ? (
      <Button title="Try again" variant="secondary" onPress={onRetry} />
    ) : null}
  </Card>
);
export const IconButton = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
  >
    <Text style={styles.iconButtonText}>{icon}</Text>
  </Pressable>
);
export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search your space",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) => (
  <View style={styles.searchBar}>
    <Text style={styles.searchIcon}>⌕</Text>
    <TextInput
      accessibilityLabel={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      style={styles.searchInput}
    />
  </View>
);
export const QuickTile = ({
  icon,
  label,
  hint,
  color = colors.accent,
  onPress,
}: {
  icon: string;
  label: string;
  hint?: string;
  color?: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
  >
    <View style={[styles.quickIcon, { backgroundColor: `${color}22` }]}>
      <Text style={{ color, fontSize: 19 }}>{icon}</Text>
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
    {hint ? <Text style={styles.quickHint}>{hint}</Text> : null}
  </Pressable>
);
export type NavigationTab = "home" | "money" | "lending" | "tasks" | "settings";
const TABS: { key: NavigationTab; icon: string; label: string }[] = [
  { key: "home", icon: "⌂", label: "Home" },
  { key: "money", icon: "₿", label: "Money" },
  { key: "lending", icon: "🤝", label: "Ledgers" },
  { key: "tasks", icon: "✓", label: "Tasks" },
  { key: "settings", icon: "⚙", label: "Settings" },
];
// A single flat bottom bar is the only navigation surface: every destination is one tap away,
// so there is no second (drawer/menu) system competing with it.
export const BottomBar = ({
  active = "home",
  onNavigate,
}: {
  active?: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}) => (
  <View style={styles.bottomBar}>
    {TABS.map((tab) => (
      <Pressable
        key={tab.key}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active === tab.key }}
        onPress={() => onNavigate(tab.key)}
        style={({ pressed }) => [styles.bottomTab, pressed && styles.pressed]}
      >
        <Text
          style={[
            styles.bottomIcon,
            active === tab.key && styles.bottomIconActive,
          ]}
        >
          {tab.icon}
        </Text>
        <Text
          style={[
            styles.bottomLabel,
            active === tab.key && styles.bottomLabelActive,
          ]}
        >
          {tab.label}
        </Text>
      </Pressable>
    ))}
  </View>
);
export const BottomSheet = ({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalRoot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close filter sheet"
        style={styles.modalBackdrop}
        onPress={onClose}
      />
      <View accessibilityViewIsModal style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.listHeader}>
          <Text style={styles.heading}>{title}</Text>
          <Button title="Done" variant="ghost" onPress={onClose} />
        </View>
        {children}
      </View>
    </View>
  </Modal>
);
const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: palette.border,
    },
    button: {
      backgroundColor: palette.accent,
      borderRadius: 15,
      paddingVertical: 16,
      paddingHorizontal: 18,
      alignItems: "center",
      marginTop: 10,
      shadowColor: palette.accent,
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    secondary: {
      backgroundColor: palette.surfaceMuted,
      borderWidth: 1,
      borderColor: palette.border,
      shadowOpacity: 0,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: palette.border,
      shadowOpacity: 0,
    },
    pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
    disabled: { opacity: 0.45, shadowOpacity: 0 },
    disabledText: { color: palette.muted },
    buttonText: { color: palette.onAccent, fontSize: 15, fontWeight: "800" },
    secondaryText: { color: palette.text, fontSize: 15, fontWeight: "800" },
    ghostText: { color: palette.accentText },
    field: { marginBottom: 16 },
    label: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    input: {
      color: palette.text,
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 15,
      padding: 15,
      fontSize: 16,
    },
    title: {
      color: palette.text,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "800",
      letterSpacing: -0.8,
      marginBottom: 7,
    },
    subtitle: {
      color: palette.muted,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 22,
    },
    screenHeader: { paddingTop: 22, marginBottom: 4 },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      minHeight: 48,
      paddingVertical: 6,
      paddingRight: 14,
      marginTop: 8,
      marginBottom: 4,
    },
    backIcon: {
      color: palette.accentText,
      fontSize: 30,
      lineHeight: 30,
      marginRight: 5,
    },
    backText: { color: palette.accentText, fontSize: 14, fontWeight: "700" },
    heading: { color: palette.text, fontSize: 19, fontWeight: "800" },
    muted: { color: palette.muted, lineHeight: 21 },
    metric: {
      color: palette.accentText,
      fontSize: 36,
      fontWeight: "800",
      letterSpacing: -1,
      marginTop: 5,
    },
    eyebrow: {
      color: palette.accent,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 2.2,
      marginBottom: 10,
    },
    row: { flexDirection: "row", gap: 12, marginBottom: 4 },
    stat: { flex: 1, marginBottom: 14, padding: 15 },
    statValue: {
      color: palette.text,
      fontSize: 26,
      fontWeight: "800",
      marginTop: 8,
    },
    choice: {
      flex: 1,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 15,
      alignItems: "center",
    },
    choiceActive: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    choiceText: { color: palette.text, fontWeight: "800" },
    choiceTextActive: { color: palette.onAccent, fontWeight: "800" },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    success: { color: palette.positive, fontWeight: "800" },
    completedText: { color: palette.muted, textDecorationLine: "line-through" },
    progressTrack: {
      height: 8,
      backgroundColor: palette.surfaceMuted,
      borderRadius: 8,
      marginVertical: 14,
      overflow: "hidden",
    },
    progressFill: {
      height: 8,
      backgroundColor: palette.warning,
      borderRadius: 8,
    },
    modalRoot: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0,0,0,0.58)",
    },
    sheet: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 20,
      paddingBottom: 30,
    },
    sheetHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 4,
      backgroundColor: palette.muted,
      marginBottom: 16,
    },
    destructiveText: { color: palette.negative },
    loadingState: { alignItems: "center", paddingVertical: 28 },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonText: { color: palette.text, fontSize: 19, fontWeight: "700" },
    searchBar: {
      minHeight: 48,
      borderRadius: 24,
      backgroundColor: palette.surface,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 18,
      marginTop: 8,
    },
    searchIcon: {
      color: palette.muted,
      fontSize: 25,
      lineHeight: 25,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: palette.text,
      fontSize: 15,
      paddingVertical: 11,
    },
    quickTile: {
      width: 84,
      alignItems: "center",
      marginRight: 12,
      paddingVertical: 4,
    },
    quickIcon: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
    },
    quickLabel: {
      color: palette.text,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    quickHint: {
      color: palette.muted,
      fontSize: 10,
      marginTop: 3,
      textAlign: "center",
    },
    headerTitle: {
      color: palette.text,
      fontSize: 23,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    sectionLabel: {
      color: palette.muted,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.6,
      marginBottom: 10,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 8,
      marginBottom: 10,
    },
    linkText: { color: palette.accentText, fontSize: 13, fontWeight: "800" },
    bottomBar: {
      flexDirection: "row",
      backgroundColor: palette.surface,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      borderRadius: 22,
      marginBottom: 10,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    bottomTab: {
      flex: 1,
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
    },
    bottomIcon: { color: palette.muted, fontSize: 21, lineHeight: 23 },
    bottomIconActive: { color: palette.accentText },
    bottomLabel: {
      color: palette.muted,
      fontSize: 10,
      fontWeight: "700",
      marginTop: 3,
    },
    bottomLabelActive: { color: palette.accentText },
    drawerItemText: {
      flex: 1,
      color: palette.text,
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 10,
    },
    preferenceRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    netRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: palette.border,
      marginTop: 16,
      paddingTop: 14,
    },
    lendingHero: {
      borderRadius: 24,
      padding: 18,
      marginTop: 10,
      marginBottom: 12,
    },
    lendingEyebrow: {
      color: palette.accentText,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.8,
    },
    lendingTitle: {
      color: palette.onAccent,
      fontSize: 21,
      fontWeight: "800",
      marginTop: 6,
    },
    lendingAdd: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: palette.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    lendingAddText: { color: palette.accent, fontSize: 25, lineHeight: 27 },
    lendingHeroRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginTop: 28,
    },
    lendingCaption: { color: palette.accentText, fontSize: 11 },
    lendingAmount: {
      color: palette.onAccent,
      fontSize: 34,
      fontWeight: "800",
      marginTop: 3,
    },
    lendingHeroMeta: { alignItems: "flex-end" },
    lendingMetaValue: {
      color: palette.onAccent,
      fontSize: 22,
      fontWeight: "800",
      marginTop: 3,
    },
    lendingFootnote: { color: palette.accentText, fontSize: 11, marginTop: 18 },
    lendingTabs: {
      flexDirection: "row",
      backgroundColor: palette.surface,
      borderRadius: 15,
      padding: 4,
      marginBottom: 18,
    },
    lendingTab: {
      flex: 1,
      paddingVertical: 11,
      alignItems: "center",
      borderRadius: 11,
    },
    lendingTabActive: { backgroundColor: colors.accent },
    lendingTabText: { color: palette.muted, fontSize: 12, fontWeight: "700" },
    lendingTabTextActive: { color: palette.onAccent },
    lendingToolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    lendingCard: { padding: 16 },
    contactIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    contactAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    contactAvatarText: {
      color: palette.accentText,
      fontSize: 16,
      fontWeight: "800",
    },
    lendingCardAmount: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 12,
    },
    lendingMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    accountWelcome: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingTop: 16,
      paddingBottom: 14,
    },
    accountAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    accountAvatarText: {
      color: palette.accentText,
      fontSize: 16,
      fontWeight: "800",
    },
    accountGreeting: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 2,
    },
    accountHero: {
      backgroundColor: palette.surfaceRaised,
      borderColor: palette.borderStrong,
      padding: 20,
      borderRadius: 24,
    },
    accountHeroLabel: {
      color: palette.accentText,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    accountHeroAmount: {
      color: palette.onAccent,
      fontSize: 34,
      fontWeight: "800",
      marginTop: 8,
    },
    accountHeroChange: { color: palette.positive, fontSize: 12, marginTop: 5 },
    accountRowIdentity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    accountTypeIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    accountTypeIconText: { color: palette.accentText, fontSize: 18 },
    accountBalance: { color: palette.text, fontSize: 17, fontWeight: "800" },
    taskWelcome: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingTop: 16,
      paddingBottom: 18,
    },
    taskProgressCard: {
      backgroundColor: palette.surfaceRaised,
      borderColor: palette.borderStrong,
      padding: 18,
    },
    taskProgressTitle: {
      color: palette.onAccent,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 5,
    },
    taskProgressPercent: {
      color: palette.accentText,
      fontSize: 22,
      fontWeight: "800",
    },
    emptyState: { alignItems: "center", paddingVertical: 28, marginTop: 12 },
    emptyIcon: {
      width: 52,
      height: 52,
      borderRadius: 18,
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    emptyIconText: { color: palette.accentText, fontSize: 22 },
  });

let activeStyles = createStyles(darkPalette);
let activeStylePalette = darkPalette;

export const styles = new Proxy(activeStyles, {
  get: (_, property: string | symbol) => {
    const palette = getActivePalette();
    if (palette !== activeStylePalette) {
      activeStylePalette = palette;
      activeStyles = createStyles(palette);
    }
    return activeStyles[property as keyof typeof activeStyles];
  },
});
