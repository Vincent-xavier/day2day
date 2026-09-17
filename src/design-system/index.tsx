import React from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, type PressableProps, type TextInputProps } from 'react-native';
export const Screen = ({ children }: { children: React.ReactNode }) => <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
export const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => <View style={[styles.card, style]}>{children}</View>;
export const Button = ({ title, variant = 'primary', accessibilityLabel, ...props }: PressableProps & { title: string; variant?: 'primary' | 'secondary' | 'ghost' }) => <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondary, variant === 'ghost' && styles.ghost, pressed && styles.pressed]} {...props}><Text style={[styles.buttonText, variant === 'ghost' && styles.ghostText]}>{title}</Text></Pressable>;
export const Field = (props: TextInputProps & { label: string }) => <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput accessibilityLabel={props.label} {...props} placeholderTextColor="#8d91a7" style={styles.input} /></View>;
export const BottomSheet = ({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) => <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalRoot}><Pressable accessibilityRole="button" accessibilityLabel="Close filter sheet" style={styles.modalBackdrop} onPress={onClose} /><View accessibilityViewIsModal style={styles.sheet}><View style={styles.sheetHandle} /><View style={styles.listHeader}><Text style={styles.heading}>{title}</Text><Button title="Done" variant="ghost" onPress={onClose} /></View>{children}</View></View></Modal>;
export type ActionSheetOption = { label: string; description?: string; destructive?: boolean; onPress: () => void };
export const ActionSheet = ({ visible, title, message, options, onClose }: { visible: boolean; title: string; message?: string; options: ActionSheetOption[]; onClose: () => void }) => <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalRoot}><Pressable accessibilityRole="button" accessibilityLabel="Close action sheet" style={styles.modalBackdrop} onPress={onClose} /><View accessibilityViewIsModal style={styles.sheet}><View style={styles.sheetHandle} /><Text style={styles.heading}>{title}</Text>{message ? <Text style={[styles.muted, { marginTop: 6 }]}>{message}</Text> : null}<View style={{ marginTop: 14 }}>{options.map((option) => <Pressable key={option.label} accessibilityRole="button" accessibilityLabel={option.label} onPress={() => { option.onPress(); onClose(); }} style={({ pressed }) => [styles.actionOption, pressed && styles.pressed]}><Text style={[styles.actionLabel, option.destructive && styles.destructiveText]}>{option.label}</Text>{option.description ? <Text style={styles.muted}>{option.description}</Text> : null}</Pressable>)}</View><Button title="Cancel" variant="ghost" onPress={onClose} /></View></View></Modal>;
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0d16', paddingHorizontal: 20 },
  card: { backgroundColor: '#151827', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#23273b' },
  button: { backgroundColor: '#8b7dff', borderRadius: 15, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center', marginTop: 10, shadowColor: '#8b7dff', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  secondary: { backgroundColor: '#1b1f31', borderWidth: 1, borderColor: '#303650', shadowOpacity: 0 },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#303650', shadowOpacity: 0 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  ghostText: { color: '#b8b1ff' },
  field: { marginBottom: 16 },
  label: { color: '#aeb2c7', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  input: { color: '#f7f7fb', backgroundColor: '#151827', borderColor: '#303650', borderWidth: 1, borderRadius: 15, padding: 15, fontSize: 16 },
  title: { color: '#f7f7fb', fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.8, marginBottom: 7 },
  subtitle: { color: '#969bb2', fontSize: 15, lineHeight: 22, marginBottom: 22 },
  heading: { color: '#f7f7fb', fontSize: 19, fontWeight: '800' },
  muted: { color: '#969bb2', lineHeight: 21 },
  metric: { color: '#b8b1ff', fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  eyebrow: { color: '#9e94ff', fontSize: 11, fontWeight: '800', letterSpacing: 2.2, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  stat: { flex: 1, marginBottom: 14, padding: 15 },
  statValue: { color: '#f7f7fb', fontSize: 26, fontWeight: '800', marginTop: 8 },
  choice: { flex: 1, borderRadius: 15, borderWidth: 1, borderColor: '#303650', padding: 15, alignItems: 'center' },
  choiceActive: { backgroundColor: '#8b7dff', borderColor: '#8b7dff' },
  choiceText: { color: '#fff', fontWeight: '800' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  success: { color: '#72dfad', fontWeight: '800' },
  completedText: { color: '#676c83', textDecorationLine: 'line-through' },
  progressTrack: { height: 8, backgroundColor: '#272b40', borderRadius: 8, marginVertical: 14, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#f2b97f', borderRadius: 8 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.58)' },
  sheet: { backgroundColor: '#151827', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: '#303650', padding: 20, paddingBottom: 30 },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 4, backgroundColor: '#515873', marginBottom: 16 },
  actionOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#282d43' },
  actionLabel: { color: '#f7f7fb', fontSize: 16, fontWeight: '800' },
  destructiveText: { color: '#fda4af' },
});
