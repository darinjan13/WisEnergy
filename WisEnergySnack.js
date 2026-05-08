import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

const mockData = {
  devices: [
    { id: '1', name: 'Living Room AC', nickname: 'AC Unit 1', status: true, kwh: 2.4 },
    { id: '2', name: 'Kitchen Fridge', nickname: 'Refrigerator', status: true, kwh: 1.2 },
    { id: '3', name: 'Bedroom Fan', nickname: 'Bed Fan', status: false, kwh: 0.8 },
  ],
  budget: { total: 2500, used: 1625 },
  monthlyUsage: [
    { value: 120, label: 'Jan', frontColor: '#095333' },
    { value: 145, label: 'Feb', frontColor: '#095333' },
    { value: 132, label: 'Mar', frontColor: '#095333' },
    { value: 98, label: 'Apr', frontColor: '#095333' },
    { value: 156, label: 'May', frontColor: '#095333' },
  ],
  hourlyUsage: [
    { value: 12 }, { value: 8 }, { value: 5 }, { value: 3 },
    { value: 15 }, { value: 28 }, { value: 45 }, { value: 52 },
    { value: 48 }, { value: 35 }, { value: 22 }, { value: 18 },
  ],
  efficiency: 85,
  user: { name: 'John Doe', email: 'john@example.com', location: 'Cebu City' },
};

const App = () => {
  const [screen, setScreen] = useState('login');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [toggleStates, setToggleStates] = useState(
    mockData.devices.reduce((acc, d) => ({ ...acc, [d.id]: d.status }), {})
  );

  const toggleDevice = (id) => {
    setToggleStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (screen === 'login') return <LoginScreen onLogin={() => setScreen('dashboard')} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WisEnergy</Text>
        <TouchableOpacity onPress={() => setScreen('settings')}>
          <Text style={styles.headerLink}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {screen === 'dashboard' && <DashboardScreen />}
        {screen === 'devices' && (
          <DevicesScreen
            devices={mockData.devices}
            toggleStates={toggleStates}
            toggleDevice={toggleDevice}
          />
        )}
        {screen === 'budget' && <BudgetScreen budget={mockData.budget} />}
        {screen === 'reports' && <ReportsScreen data={mockData.monthlyUsage} />}
        {screen === 'settings' && (
          <SettingsScreen onLogout={() => setScreen('login')} user={mockData.user} />
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {['dashboard', 'devices', 'budget', 'reports'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setScreen(tab)}
          >
            <Text style={[styles.tabText, screen === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const LoginScreen = ({ onLogin }) => (
  <View style={styles.loginContainer}>
    <Text style={styles.loginLogo}>🏠</Text>
    <Text style={styles.loginTitle}>WisEnergy</Text>
    <Text style={styles.loginSubtitle}>Smart Energy Management</Text>
    
    <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9CA3AF" />
    <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" secureTextEntry />
    
    <TouchableOpacity style={styles.button} onPress={onLogin}>
      <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
    
    <TouchableOpacity>
      <Text style={styles.linkText}>Forgot Password?</Text>
    </TouchableOpacity>
  </View>
);

const DashboardScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.sectionTitle}>Energy Efficiency</Text>
    <View style={styles.efficiencyCard}>
      <PieChart
        donut
        radius={60}
        innerRadius={45}
        data={[
          { value: mockData.efficiency, color: '#22c55e' },
          { value: 100 - mockData.efficiency, color: '#E5E7EB' },
        ]}
        centerLabelComponent={() => (
          <Text style={styles.efficiencyValue}>{mockData.efficiency}%</Text>
        )}
      />
      <Text style={styles.efficiencyLabel}>Energy Index</Text>
    </View>

    <Text style={styles.sectionTitle}>Budget Overview</Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Monthly Budget</Text>
      <Text style={styles.budgetText}>₱{mockData.budget.total.toLocaleString()}</Text>
      <Text style={styles.budgetSubtext}>
        ₱{(mockData.budget.total - mockData.budget.used).toLocaleString()} remaining
      </Text>
    </View>

    <Text style={styles.sectionTitle}>Today's Usage</Text>
    <View style={styles.card}>
      <BarChart
        data={mockData.hourlyUsage.slice(0, 8)}
        barWidth={20}
        spacing={15}
        hideRules
        yAxisThickness={0}
        xAxisThickness={0}
        noOfSections={4}
        maxValue={60}
      />
    </View>

    <Text style={styles.sectionTitle}>Connected Devices</Text>
    <View style={styles.card}>
      {mockData.devices.slice(0, 2).map(d => (
        <View key={d.id} style={styles.deviceRow}>
          <Text style={styles.deviceName}>{d.name}</Text>
          <Text style={styles.deviceStatus}>{d.status ? 'On' : 'Off'}</Text>
        </View>
      ))}
    </View>
  </View>
);

const DevicesScreen = ({ devices, toggleStates, toggleDevice }) => (
  <View style={styles.screen}>
    <Text style={styles.sectionTitle}>My Devices</Text>
    {devices.map(device => (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => toggleDevice(device.id)}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceNickname}>{device.nickname}</Text>
        </View>
        <View style={[
          styles.deviceToggle,
          toggleStates[device.id] && styles.deviceToggleOn,
        ]}>
          <Text style={styles.deviceToggleText}>
            {toggleStates[device.id] ? 'ON' : 'OFF'}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const BudgetScreen = ({ budget }) => (
  <View style={styles.screen}>
    <Text style={styles.sectionTitle}>Monthly Budget</Text>
    <View style={styles.budgetCard}>
      <PieChart
        donut
        radius={70}
        innerRadius={50}
        data={[
          { value: budget.used, color: '#10b981' },
          { value: budget.total - budget.used, color: '#E5E7EB' },
        ]}
        centerLabelComponent={() => (
          <Text style={styles.budgetPercent}>
            {Math.round(budget.used / budget.total * 100)}%
          </Text>
        )}
      />
      <Text style={styles.budgetLabel}>Budget Used</Text>
    </View>

    <View style={styles.card}>
      <View style={styles.budgetRow}>
        <Text>Total Budget</Text>
        <Text style={styles.budgetValue}>₱{budget.total.toLocaleString()}</Text>
      </View>
      <View style={styles.budgetRow}>
        <Text>Used</Text>
        <Text style={styles.budgetValue}>₱{budget.used.toLocaleString()}</Text>
      </View>
      <View style={styles.budgetRow}>
        <Text>Remaining</Text>
        <Text style={[styles.budgetValue, { color: '#22c55e' }]}>
          ₱{(budget.total - budget.used).toLocaleString()}
        </Text>
      </View>
    </View>
  </View>
);

const ReportsScreen = ({ data }) => (
  <View style={styles.screen}>
    <Text style={styles.sectionTitle}>Monthly Usage Report</Text>
    <View style={styles.card}>
      <BarChart
        data={data}
        barWidth={30}
        spacing={20}
        hideRules
        yAxisThickness={0}
        xAxisThickness={1}
        noOfSections={5}
        maxValue={200}
      />
    </View>

    <Text style={styles.sectionTitle}>Summary</Text>
    <View style={styles.card}>
      <View style={styles.budgetRow}>
        <Text>Total kWh</Text>
        <Text style={styles.budgetValue}>651 kWh</Text>
      </View>
      <View style={styles.budgetRow}>
        <Text>Average</Text>
        <Text style={styles.budgetValue}>130 kWh/month</Text>
      </View>
      <View style={styles.budgetRow}>
        <Text>Cost Estimate</Text>
        <Text style={[styles.budgetValue, { color: '#22c55e' }]}>₱9,765</Text>
      </View>
    </View>
  </View>
);

const SettingsScreen = ({ onLogout, user }) => (
  <View style={styles.screen}>
    <Text style={styles.sectionTitle}>Profile</Text>
    <View style={styles.card}>
      <Text style={styles.profileName}>{user.name}</Text>
      <Text style={styles.profileEmail}>{user.email}</Text>
      <Text style={styles.profileLocation}>📍 {user.location}</Text>
    </View>

    <Text style={styles.sectionTitle}>App Settings</Text>
    <View style={styles.card}>
      <TouchableOpacity style={styles.settingsRow}>
        <Text>Notifications</Text>
        <Text style={styles.settingsValue}>On</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingsRow}>
        <Text>Dark Mode</Text>
        <Text style={styles.settingsValue}>Off</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.sectionTitle}>Premium</Text>
    <View style={[styles.card, styles.premiumCard]}>
      <Text style={styles.premiumTitle}>✨ Premium Active</Text>
      <Text style={styles.premiumText}>Unlimited devices, full analytics, smart recommendations</Text>
    </View>

    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#095333' },
  headerLink: { color: '#095333' },
  content: { flex: 1 },
  screen: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#095333', marginBottom: 12, marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 14, color: '#6B7280' },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceStatus: { color: '#6B7280' },
  budgetText: { fontSize: 32, fontWeight: 'bold', color: '#095333', marginVertical: 8 },
  budgetSubtext: { color: '#6B7280' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  budgetValue: { fontWeight: '600' },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  settingsValue: { color: '#6B7280' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#E5E7EB', paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 12, color: '#6B7280' },
  tabTextActive: { color: '#095333', fontWeight: 'bold' },
  loginContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  loginLogo: { fontSize: 64, textAlign: 'center' },
  loginTitle: { fontSize: 32, fontWeight: 'bold', color: '#095333', textAlign: 'center' },
  loginSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#095333', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#095333', textAlign: 'center' },
  efficiencyCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 12 },
  efficiencyValue: { fontSize: 24, fontWeight: 'bold' },
  efficiencyLabel: { marginTop: 8, color: '#6B7280' },
  budgetCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 12 },
  budgetPercent: { fontSize: 24, fontWeight: 'bold' },
  budgetLabel: { marginTop: 8, color: '#6B7280' },
  deviceCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceNickname: { color: '#6B7280', fontSize: 12 },
  deviceToggle: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB' },
  deviceToggleOn: { backgroundColor: '#22c55e' },
  deviceToggleText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  profileName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  profileEmail: { color: '#6B7280', marginBottom: 4 },
  profileLocation: { color: '#6B7280' },
  premiumCard: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B' },
  premiumTitle: { fontSize: 16, fontWeight: 'bold', color: '#B45309' },
  premiumText: { color: '#92400E', fontSize: 14 },
  logoutButton: { backgroundColor: '#EF4444', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default App;