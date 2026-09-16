import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { appModules } from '@/modules/registry';
import { Card, Screen, styles } from '@/design-system';

export default function HomeScreen() { return <Screen><ScrollView><Text style={styles.title}>Your day, organized</Text><Text style={styles.subtitle}>A personal command center that grows with you.</Text><Card><Text style={styles.heading}>Quick actions</Text><Link href="/accounts" style={{ color: '#a5b4fc', marginTop: 14 }}>Open Accounts →</Link><Link href="/lending" style={{ color: '#86efac', marginTop: 14 }}>Open Lending →</Link></Card>{appModules.map((module) => <Link key={module.id} href={module.route as any} asChild><View><Card><Text style={{ fontSize: 28 }}>{module.icon}</Text><Text style={styles.heading}>{module.title}</Text><Text style={styles.muted}>{module.description}</Text></Card></View></Link>)}</ScrollView></Screen>; }
