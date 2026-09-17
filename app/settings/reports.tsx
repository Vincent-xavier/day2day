import { useFocusEffect, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import {
  BackButton,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Screen,
  ScreenHeader,
  styles,
} from "@/design-system";
import {
  SQLiteAccountRepository,
  SQLiteTransactionRepository,
} from "@/db/repositories";
import type { Account, Transaction } from "@/db/types";
import { formatMoney } from "@/utils/money";

const accountsRepository = new SQLiteAccountRepository();
const transactionsRepository = new SQLiteTransactionRepository();

const csvCell = (value: string | number | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function ReportsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedAccounts, loadedTransactions] = await Promise.all([
        accountsRepository.list(),
        transactionsRepository.list(),
      ]);
      setAccounts(loadedAccounts);
      setTransactions(loadedTransactions);
    } catch {
      Alert.alert(
        "Could not load reports",
        "Please return to Settings and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReports();
    }, [loadReports]),
  );

  const report = useMemo(() => {
    const incomeMinor = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountMinor, 0);
    const expenseMinor = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountMinor, 0);
    const transferMinor = transactions
      .filter((transaction) => transaction.type === "transfer")
      .reduce((total, transaction) => total + transaction.amountMinor, 0);
    const openingBalanceMinor = accounts.reduce(
      (total, account) => total + account.openingBalanceMinor,
      0,
    );

    return {
      incomeMinor,
      expenseMinor,
      transferMinor,
      netPositionMinor: openingBalanceMinor + incomeMinor - expenseMinor,
    };
  }, [accounts, transactions]);

  const exportCsv = async () => {
    if (!transactions.length && !accounts.length) {
      Alert.alert(
        "Nothing to export",
        "Add an account or transaction before creating a report export.",
      );
      return;
    }

    setExporting(true);
    try {
      const accountNameById = new Map(
        accounts.map((account) => [account.id, account.name]),
      );
      const rows = [
        ["Date", "Type", "Account", "Description", "Amount", "Currency"],
        ...transactions.map((transaction) => [
          transaction.transactionDate.slice(0, 10),
          transaction.type,
          accountNameById.get(transaction.accountId) ?? "Unknown account",
          transaction.description ?? "",
          (transaction.amountMinor / 100).toFixed(2),
          transaction.currency,
        ]),
      ];
      const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
      const file = new FileSystem.File(
        FileSystem.Paths.cache,
        `day2day-report-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      file.create({ overwrite: true });
      file.write(csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: "Export Day2Day report",
        });
      } else {
        Alert.alert(
          "Sharing unavailable",
          "This device cannot share files, so the report could not be exported.",
        );
      }
    } catch {
      Alert.alert("Could not export report", "Please try again in a moment.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}>
        <BackButton onPress={() => router.back()} label="Settings" />
        <ScreenHeader
          eyebrow="SETTINGS"
          title="Reports"
          subtitle="A clear view of your money activity and account position."
        />

        {loading ? (
          <LoadingState label="Preparing your reports..." />
        ) : (
          <>
            <Card style={styles.accountHero}>
              <Text style={styles.accountHeroLabel}>NET POSITION</Text>
              <Text style={styles.accountHeroAmount}>
                {formatMoney(report.netPositionMinor)}
              </Text>
              <Text style={styles.accountHeroChange}>
                Across your accounts and recorded money activity
              </Text>
            </Card>

            <Text style={styles.sectionLabel}>AVAILABLE REPORTS</Text>
            <View style={styles.row}>
              <Card style={{ flex: 1, marginRight: 7 }}>
                <Text style={styles.muted}>Money in</Text>
                <Text style={styles.statValue}>
                  {formatMoney(report.incomeMinor)}
                </Text>
              </Card>
              <Card style={{ flex: 1, marginLeft: 7 }}>
                <Text style={styles.muted}>Money out</Text>
                <Text style={styles.statValue}>
                  {formatMoney(report.expenseMinor)}
                </Text>
              </Card>
            </View>

            <Card>
              <Text style={styles.heading}>Transfer activity</Text>
              <Text style={[styles.muted, { marginTop: 6 }]}>
                Total moved between your accounts.
              </Text>
              <Text style={styles.statValue}>
                {formatMoney(report.transferMinor)}
              </Text>
            </Card>

            <Card>
              <Text style={styles.heading}>Account balances</Text>
              {accounts.length ? (
                accounts.map((account) => (
                  <View key={account.id} style={styles.preferenceRow}>
                    <Text style={[styles.drawerItemText, { marginLeft: 0 }]}>
                      {account.name}
                    </Text>
                    <Text style={styles.accountBalance}>
                      {formatMoney(
                        account.openingBalanceMinor,
                        account.currency,
                      )}
                    </Text>
                  </View>
                ))
              ) : (
                <EmptyState
                  title="No accounts yet"
                  message="Add an account to see your account balance report."
                  action="Add account"
                  onAction={() => router.push("/accounts/new")}
                />
              )}
            </Card>

            <Card>
              <Text style={styles.heading}>Export</Text>
              <Text style={[styles.muted, { marginTop: 6 }]}>
                Download a CSV of all recorded transactions to keep or analyze
                elsewhere.
              </Text>
              <Button
                title={
                  exporting ? "Preparing export..." : "Export transactions CSV"
                }
                onPress={() => void exportCsv()}
                disabled={exporting}
              />
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
