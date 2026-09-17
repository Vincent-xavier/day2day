import { Component, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, colors } from "@/design-system";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level safety net. Without this, any uncaught render error (a bad date,
 * a null account, a malformed profile blob) crashes the entire app to a
 * blank screen with no recovery path — unacceptable for a screen showing
 * someone's money. This keeps the failure contained and offers a reset.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled app error:", error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            Your data is safe on this device. Restarting this screen usually
            fixes it.
          </Text>
          <Button title="Try again" onPress={this.reset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 21,
  },
});
