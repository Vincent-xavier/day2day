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

// One accent carries all "create/act" affordances. Color is reserved for meaning
// (money in vs out, overdue vs on-track) rather than decorating each module differently.
export const colors = {
  accent: "#8b7dff",
  accentSoft: "#2a2550",
  positive: "#72dfad",
  negative: "#fda4af",
  warning: "#f2b97f",
  surface: "#151827",
  surfaceMuted: "#1b1f31",
} as const;

export const Screen = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaView style={styles.screen}>{children}</SafeAreaView>
);
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
      placeholderTextColor="#8d91a7"
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
  <Card style={[styles.emptyState, { borderColor: "#5a3540" }]}>
    <View style={[styles.emptyIcon, { backgroundColor: "#3a2230" }]}>
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
      placeholderTextColor="#777d97"
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
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0b0d16", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#151827",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#23273b",
  },
  button: {
    backgroundColor: "#8b7dff",
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#8b7dff",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  secondary: {
    backgroundColor: "#1b1f31",
    borderWidth: 1,
    borderColor: "#303650",
    shadowOpacity: 0,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#303650",
    shadowOpacity: 0,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45, shadowOpacity: 0 },
  disabledText: { color: "#c9cbe0" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  ghostText: { color: "#b8b1ff" },
  field: { marginBottom: 16 },
  label: {
    color: "#aeb2c7",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    color: "#f7f7fb",
    backgroundColor: "#151827",
    borderColor: "#303650",
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
  },
  title: {
    color: "#f7f7fb",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 7,
  },
  subtitle: {
    color: "#969bb2",
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
  backIcon: { color: "#b8b1ff", fontSize: 30, lineHeight: 30, marginRight: 5 },
  backText: { color: "#b8b1ff", fontSize: 14, fontWeight: "700" },
  heading: { color: "#f7f7fb", fontSize: 19, fontWeight: "800" },
  muted: { color: "#969bb2", lineHeight: 21 },
  metric: {
    color: "#b8b1ff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 5,
  },
  eyebrow: {
    color: "#9e94ff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12, marginBottom: 4 },
  stat: { flex: 1, marginBottom: 14, padding: 15 },
  statValue: {
    color: "#f7f7fb",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 8,
  },
  choice: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#303650",
    padding: 15,
    alignItems: "center",
  },
  choiceActive: { backgroundColor: "#8b7dff", borderColor: "#8b7dff" },
  choiceText: { color: "#fff", fontWeight: "800" },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  success: { color: "#72dfad", fontWeight: "800" },
  completedText: { color: "#676c83", textDecorationLine: "line-through" },
  progressTrack: {
    height: 8,
    backgroundColor: "#272b40",
    borderRadius: 8,
    marginVertical: 14,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: "#f2b97f", borderRadius: 8 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  sheet: {
    backgroundColor: "#151827",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#303650",
    padding: 20,
    paddingBottom: 30,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#515873",
    marginBottom: 16,
  },
  destructiveText: { color: "#fda4af" },
  loadingState: { alignItems: "center", paddingVertical: 28 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#151827",
    borderWidth: 1,
    borderColor: "#303650",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: { color: "#f7f7fb", fontSize: 19, fontWeight: "700" },
  searchBar: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#f7f7fb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  searchIcon: {
    color: "#44485d",
    fontSize: 25,
    lineHeight: 25,
    marginRight: 8,
  },
  searchInput: { flex: 1, color: "#1a1c28", fontSize: 15, paddingVertical: 11 },
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
    color: "#f7f7fb",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  quickHint: {
    color: "#777d97",
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },
  headerTitle: {
    color: "#f7f7fb",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionLabel: {
    color: "#777d97",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#f7f7fb",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 10,
  },
  linkText: { color: "#b8b1ff", fontSize: 13, fontWeight: "800" },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#151827",
    borderTopWidth: 1,
    borderTopColor: "#282d43",
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
  bottomIcon: { color: "#969bb2", fontSize: 21, lineHeight: 23 },
  bottomIconActive: { color: "#b8b1ff" },
  bottomLabel: {
    color: "#969bb2",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  bottomLabelActive: { color: "#b8b1ff" },
  drawerItemText: {
    flex: 1,
    color: "#f7f7fb",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#282d43",
  },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#282d43",
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
    color: "#e6e2ff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  lendingTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 6,
  },
  lendingAdd: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  lendingAddText: { color: "#fff", fontSize: 25, lineHeight: 27 },
  lendingHeroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 28,
  },
  lendingCaption: { color: "#c8f5df", fontSize: 11 },
  lendingAmount: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 3,
  },
  lendingHeroMeta: { alignItems: "flex-end" },
  lendingMetaValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
  },
  lendingFootnote: { color: "#d7f9e9", fontSize: 11, marginTop: 18 },
  lendingTabs: {
    flexDirection: "row",
    backgroundColor: "#151827",
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
  lendingTabText: { color: "#969bb2", fontSize: 12, fontWeight: "700" },
  lendingTabTextActive: { color: "#fff" },
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
    backgroundColor: "#e7e0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: { color: "#6747d8", fontSize: 16, fontWeight: "800" },
  lendingCardAmount: {
    color: "#f7f7fb",
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
    borderTopColor: "#282d43",
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
    backgroundColor: "#e7e0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  accountAvatarText: { color: "#6747d8", fontSize: 16, fontWeight: "800" },
  accountGreeting: {
    color: "#f7f7fb",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  accountHero: {
    backgroundColor: "#211d42",
    borderColor: "#403b70",
    padding: 20,
    borderRadius: 24,
  },
  accountHeroLabel: {
    color: "#b8b1ff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  accountHeroAmount: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 8,
  },
  accountHeroChange: { color: "#72dfad", fontSize: 12, marginTop: 5 },
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
    backgroundColor: "#28234d",
    alignItems: "center",
    justifyContent: "center",
  },
  accountTypeIconText: { color: "#b8b1ff", fontSize: 18 },
  accountBalance: { color: "#f7f7fb", fontSize: 17, fontWeight: "800" },
  taskWelcome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingTop: 16,
    paddingBottom: 18,
  },
  taskProgressCard: {
    backgroundColor: "#211d42",
    borderColor: "#403b70",
    padding: 18,
  },
  taskProgressTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 5,
  },
  taskProgressPercent: { color: "#b8b1ff", fontSize: 22, fontWeight: "800" },
  emptyState: { alignItems: "center", paddingVertical: 28, marginTop: 12 },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#28234d",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyIconText: { color: "#b8b1ff", fontSize: 22 },
});
