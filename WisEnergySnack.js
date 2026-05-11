import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, SafeAreaView, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// MATCH MAIN APP COLORS EXACTLY
const COLORS = {
  PRIMARY: '#095333',
  ACCENT: '#22c55e',
  BACKGROUND: '#F9FAFB',
  CARD: '#FFFFFF',
  BORDER: '#E5E7EB',
  TEXT: '#111827',
  SUBTEXT: '#6B7280',
  SUCCESS: '#22c55e',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
};

// MOCK DATA - Same structure as main app
const mockData = {
  devices: [
    { id: '1', name: 'Living Room AC', nickname: 'AC Unit 1', status: true, kwh: 2.4, room: 'Living Room' },
    { id: '2', name: 'Kitchen Fridge', nickname: 'Refrigerator', status: true, kwh: 1.2, room: 'Kitchen' },
    { id: '3', name: 'Bedroom Fan', nickname: 'Bed Fan', status: false, kwh: 0.8, room: 'Bedroom' },
  ],
  budget: { total: 2500, used: 1625 },
  monthlyUsage: [
    { value: 120, label: 'Jan' },
    { value: 145, label: 'Feb' },
    { value: 132, label: 'Mar' },
    { value: 98, label: 'Apr' },
    { value: 156, label: 'May' },
  ],
  hourlyUsage: Array.from({ length: 12 }, (_, i) => ({ value: Math.floor(Math.random() * 50) })),
  efficiency: 85,
  user: { name: 'John Doe', email: 'john@example.com', location: 'Cebu City' },
};

// ----- CUSTOM COMPONENTS (Match Main App) -----

// Pie Chart (simulated like main app)
const PieChart = ({ data, radius = 60, showLabel = true }) => {
  const usedPercent = Math.round((data[0].value / (data[0].value + data[1].value)) * 100);
  
  return (
    <View style={[styles.pieContainer, { width: radius * 2, height: radius * 2 }]}>
      <View style={[styles.pieBackground, { width: radius * 2, height: radius * 2, borderRadius: radius }]} />
      <View style={[
        styles.pieHalf,
        { width: radius * 2, height: radius * 2, borderRadius: radius }
      ]}>
        <View style={[styles.pieQuarter, { backgroundColor: COLORS.SUCCESS }]} />
      </View>
      <View style={styles.pieCenterLabel}>
        <Text style={styles.piePercentText}>{usedPercent}%</Text>
        <Text style={styles.pieLabel}>Used</Text>
      </View>
    </View>
  );
};

// Bar Chart (simulated like main app)
const BarChart = ({ data, showLabels = true, height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  
  return (
    <View style={[styles.barChartContainer, { height }]}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.barFill, 
                { height: `${(item.value / maxVal) * 100}%` }
              ]} 
            />
          </View>
          {showLabels && (
            <Text style={styles.barLabel}>{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

// Card Component (match main app style)
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Icon Components (fallback to text since no icon library)
const HomeIcon = ({ focused }) => <Text style={styles.iconText}>{focused ? '🏠' : '🏠'}</Text>;
const BoltIcon = ({ focused }) => <Text style={styles.iconText}>{focused ? '⚡' : '⚡'}</Text>;
const CashIcon = ({ focused }) => <Text style={styles.iconText}>{focused ? '💰' : '💰'}</Text>;
const ChartIcon = ({ focused }) => <Text style={styles.iconText}>{focused ? '📊' : '📊'}</Text>;
const SettingsIcon = ({ focused }) => <Text style={styles.iconText}>{'⚙️'}</Text>;

// ----- MAIN APP -----

const App = () => {
  const [screen, setScreen] = useState('dashboard');
  const [toggleStates, setToggleStates] = useState(
    mockData.devices.reduce((acc, d) => ({ ...acc, [d.id]: d.status }), {})
  );

  const toggleDevice = (id) => {
    setToggleStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Login Screen
  if (screen === 'login') return <LoginScreen onLogin={() => setScreen('dashboard')} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header - Match Main App */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WisEnergy</Text>
        <TouchableOpacity 
          onPress={() => setScreen('settings')}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

      {/* Tab Bar - Match Main App Icons */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('dashboard')}>
          <HomeIcon focused={screen === 'dashboard'} />
          <Text style={[styles.tabLabel, screen === 'dashboard' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('devices')}>
          <BoltIcon focused={screen === 'devices'} />
          <Text style={[styles.tabLabel, screen === 'devices' && styles.tabLabelActive]}>Devices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('budget')}>
          <CashIcon focused={screen === 'budget'} />
          <Text style={[styles.tabLabel, screen === 'budget' && styles.tabLabelActive]}>Budget</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('reports')}>
          <ChartIcon focused={screen === 'reports'} />
          <Text style={[styles.tabLabel, screen === 'reports' && styles.tabLabelActive]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ----- LOGIN SCREEN (Match Main App) -----

const LoginScreen = ({ onLogin }) => (
  <View style={styles.loginContainer}>
    {/* Header Image Area - gradient-like */}
    <View style={styles.loginHeader}>
      <Text style={styles.loginLogoText}>🏠</Text>
      <Text style={styles.loginTitle}>WisEnergy</Text>
      <Text style={styles.loginSubtitle}>Smart Energy Management</Text>
    </View>

    <View style={styles.loginForm}>
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your email" 
        placeholderTextColor={COLORS.SUBTEXT}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your password" 
        placeholderTextColor={COLORS.SUBTEXT}
        secureTextEntry
      />

      {/* Remember Me - Exact Match Main App */}
      <View style={styles.rememberRow}>
        <View style={styles.checkbox}>
          <Text style={styles.checkboxTick}>✓</Text>
        </View>
        <Text style={styles.rememberText}>Remember Me</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ----- DASHBOARD SCREEN -----

const DashboardScreen = () => (
  <View style={styles.screen}>
    {/* Energy Efficiency Card - Match Main App */}
    <Card>
      <Text style={styles.cardTitle}>Energy Efficiency Index</Text>
      <View style={styles.efficiencyContainer}>
        <View style={styles.efficiencyCircle}>
          <Text style={styles.efficiencyValue}>{mockData.efficiency}%</Text>
          <Text style={styles.efficiencyLabel}>Excellent</Text>
        </View>
        <View style={styles.efficiencyInfo}>
          <Text style={styles.efficiencyDesc}>
            You're using 15% less energy than last month!
          </Text>
        </View>
      </View>
    </Card>

    {/* Budget Overview - Match Main App */}
    <Card>
      <Text style={styles.cardTitle}>Monthly Budget</Text>
      <View style={styles.budgetRow}>
        <View>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetValue}>₱{mockData.budget.total.toLocaleString()}</Text>
        </View>
        <View style={styles.budgetDivider} />
        <View>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text style={[styles.budgetValue, { color: COLORS.SUCCESS }]}>
            ₱{(mockData.budget.total - mockData.budget.used).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '65%' }]} />
      </View>
      <Text style={styles.budgetUsed}>65% used</Text>
    </Card>

    {/* Today's Usage */}
    <Card>
      <Text style={styles.cardTitle}>Today's Usage</Text>
      <BarChart data={mockData.hourlyUsage.slice(0, 6)} height={100} showLabels={false} />
    </Card>

    {/* Connected Devices Summary */}
    <Card>
      <View style={styles.devicesSummaryHeader}>
        <Text style={styles.cardTitle}>Connected Devices</Text>
        <Text style={styles.seeAllText}>See All</Text>
      </View>
      {mockData.devices.slice(0, 2).map(device => (
        <View key={device.id} style={styles.deviceRow}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceRoom}>{device.room} • {device.kwh} kWh</Text>
          </View>
          <View style={[
            styles.deviceStatus,
            device.status ? styles.deviceStatusOn : styles.deviceStatusOff
          ]}>
            <Text style={[
              styles.deviceStatusText,
              device.status ? styles.deviceStatusTextOn : styles.deviceStatusTextOff
            ]}>
              {device.status ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  </View>
);

// ----- DEVICES SCREEN -----

const DevicesScreen = ({ devices, toggleStates, toggleDevice }) => (
  <View style={styles.screen}>
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>My Devices</Text>
    </View>
    
    {devices.map(device => (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => toggleDevice(device.id)}
      >
        <View style={styles.deviceIcon}>
          <Text style={styles.deviceIconText}>⚡</Text>
        </View>
        <View style={styles.deviceDetails}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceMeta}>{device.nickname} • {device.room}</Text>
          <Text style={styles.deviceKw}>{device.kwh} kWh</Text>
        </View>
        <View style={[
          styles.deviceToggle,
          toggleStates[device.id] ? styles.deviceToggleOn : styles.deviceToggleOff
        ]}>
          <Text style={styles.deviceToggleText}>
            {toggleStates[device.id] ? 'ON' : 'OFF'}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

// ----- BUDGET SCREEN -----

const BudgetScreen = ({ budget }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Monthly Budget</Text>
    
    <Card>
      <View style={styles.budgetChartContainer}>
        <View style={styles.budgetPieWrapper}>
          <View style={styles.budgetPieLarge}>
            <Text style={styles.budgetPiePercent}>65%</Text>
            <Text style={styles.budgetPieLabel}>Used</Text>
          </View>
        </View>
      </View>

      <View style={styles.budgetStats}>
        <View style={styles.budgetStatItem}>
          <View style={[styles.budgetDot, { backgroundColor: COLORS.SUCCESS }]} />
          <View>
            <Text style={styles.budgetStatLabel}>Used</Text>
            <Text style={styles.budgetStatValue}>₱{budget.used.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.budgetStatItem}>
          <View style={[styles.budgetDot, { backgroundColor: COLORS.BORDER }]} />
          <View>
            <Text style={styles.budgetStatLabel}>Remaining</Text>
            <Text style={[styles.budgetStatValue, { color: COLORS.SUCCESS }]}>
              ₱{(budget.total - budget.used).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Card>

    {/* Budget Usage - New in main app */}
    <Card>
      <Text style={styles.cardTitle}>Budget Usage</Text>
      <BarChart data={[
        { value: 80, label: 'W1' },
        { value: 65, label: 'W2' },
        { value: 90, label: 'W3' },
        { value: 75, label: 'W4' },
      ]} height={100} />
    </Card>
  </View>
);

// ----- REPORTS SCREEN -----

const ReportsScreen = ({ data }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Usage Reports</Text>
    
    <Card>
      <Text style={styles.cardTitle}>Monthly Consumption</Text>
      <BarChart data={data} height={140} />
    </Card>

    <Card>
      <Text style={styles.cardTitle}>Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Consumption</Text>
        <Text style={styles.summaryValue}>651 kWh</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Average/month</Text>
        <Text style={styles.summaryValue}>130 kWh</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Estimated Cost</Text>
        <Text style={[styles.summaryValue, { color: COLORS.SUCCESS }]}>₱9,765</Text>
      </View>
    </Card>

    <Card>
      <Text style={styles.cardTitle}>Smart Recommendations</Text>
      <View style={styles.recommendItem}>
        <Text style={styles.recommendIcon}>💡</Text>
        <Text style={styles.recommendText}>
          Your Bedroom Fan uses 40% less energy when run from 10PM-6AM.
        </Text>
      </View>
      <View style={styles.recommendItem}>
        <Text style={styles.recommendIcon}>💡</Text>
        <Text style={styles.recommendText}>
          Consider using your Living Room AC at 25°C for optimal savings.
        </Text>
      </View>
    </Card>
  </View>
);

// ----- SETTINGS SCREEN -----

const SettingsScreen = ({ onLogout, user }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Settings</Text>

    {/* Profile Card - Match Main App Avatar */}
    <Card>
      <View style={styles.profileContainer}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileLocation}>📍 {user.location}</Text>
        </View>
      </View>
    </Card>

    {/* Settings Options */}
    <Card>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Edit Profile</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Notifications</Text>
        <View style={styles.switch}>
          <Text style={styles.switchOn}>ON</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Privacy Policy</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Terms of Service</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
    </Card>

    {/* Premium Card - Match Main App */}
    <Card style={styles.premiumCard}>
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumIcon}>⚡</Text>
        <Text style={styles.premiumTitle}>Premium Active</Text>
      </View>
      <Text style={styles.premiumText}>
        Unlimited devices, full analytics, smart recommendations every 4 hours
      </Text>
    </Card>

    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

// ----- STYLES (Match Main App EXACTLY) -----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  
  // Header - Exact Match Main App
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },
  screen: { paddingVertical: 16 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16, marginTop: 8 },

  // Card - Exact Match Main App
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.SUBTEXT, marginBottom: 12 },

  // Tab Bar - Exact Match Main App
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: COLORS.SUBTEXT, marginTop: 4 },
  tabLabelActive: { color: COLORS.PRIMARY, fontWeight: '700' },

  // Login Screen - Exact Match Main App
  loginContainer: { flex: 1, backgroundColor: COLORS.CARD },
  loginHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  loginLogoText: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  loginTitle: { fontSize: 28, fontWeight: '700', color: '#fff', textAlign: 'center' },
  loginSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  loginForm: { padding: 24, marginTop: -20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: 'bold' },
  rememberText: { fontSize: 14, color: COLORS.TEXT },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  forgotButton: { alignItems: 'center', padding: 12 },
  forgotText: { color: COLORS.PRIMARY, fontSize: 14 },

  // Dashboard - Efficiency Circle
  efficiencyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  efficiencyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  efficiencyValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  efficiencyLabel: { fontSize: 10, color: '#fff' },
  efficiencyInfo: { flex: 1, marginLeft: 16 },
  efficiencyDesc: { fontSize: 14, color: COLORS.SUBTEXT, lineHeight: 20 },

  // Budget Row
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetValue: { fontSize: 20, fontWeight: '700', color: COLORS.TEXT },
  budgetDivider: { width: 1, backgroundColor: COLORS.BORDER },
  progressBar: { height: 8, backgroundColor: COLORS.BORDER, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.SUCCESS, borderRadius: 4 },
  budgetUsed: { fontSize: 12, color: COLORS.SUBTEXT, marginTop: 8, textAlign: 'right' },

  // Device Row
  devicesSummaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllText: { color: COLORS.PRIMARY, fontSize: 14 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceRoom: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceStatus: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  deviceStatusOn: { backgroundColor: '#DCFCE7' },
  deviceStatusOff: { backgroundColor: COLORS.BORDER },
  deviceStatusText: { fontSize: 12, fontWeight: '600' },
  deviceStatusTextOn: { color: COLORS.SUCCESS },
  deviceStatusTextOff: { color: COLORS.SUBTEXT },

  // Devices Screen
  deviceCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  deviceIconText: { fontSize: 24 },
  deviceDetails: { flex: 1, marginLeft: 12 },
  deviceMeta: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceKw: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceToggle: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  deviceToggleOn: { backgroundColor: COLORS.SUCCESS },
  deviceToggleOff: { backgroundColor: COLORS.BORDER },
  deviceToggleText: { fontSize: 12, fontWeight: '700' },

  // Budget Screen
  budgetChartContainer: { alignItems: 'center', marginBottom: 16 },
  budgetPieWrapper: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  budgetPieLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  budgetPiePercent: { fontSize: 24, fontWeight: '700', color: COLORS.SUCCESS },
  budgetPieLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetStats: { flexDirection: 'row', justifyContent: 'space-around' },
  budgetStatItem: { flexDirection: 'row', alignItems: 'center' },
  budgetDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  budgetStatLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetStatValue: { fontWeight: '700' },

  // Pie Chart Components
  pieContainer: { justifyContent: 'center', alignItems: 'center' },
  pieBackground: { position: 'absolute', backgroundColor: COLORS.BORDER },
  pieHalf: { position: 'absolute', overflow: 'hidden' },
  pieQuarter: { width: '50%', height: '100%', position: 'absolute', right: 0 },
  pieCenterLabel: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  piePercentText: { fontSize: 18, fontWeight: '700' },
  pieLabel: { fontSize: 10, color: COLORS.SUBTEXT },

  // Bar Chart Components
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingVertical: 8 },
  barItem: { alignItems: 'center' },
  barTrack: { width: 24, height: 80, backgroundColor: COLORS.BORDER, borderRadius: 4, justifyContent: 'flex-end' },
  barFill: { backgroundColor: COLORS.PRIMARY, borderRadius: 4 },
  barLabel: { fontSize: 10, color: COLORS.SUBTEXT, marginTop: 4 },

  // Reports Screen
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { color: COLORS.SUBTEXT },
  summaryValue: { fontWeight: '600' },
  recommendItem: { flexDirection: 'row', marginTop: 12 },
  recommendIcon: { fontSize: 16, marginRight: 8 },
  recommendText: { flex: 1, fontSize: 13, color: COLORS.SUBTEXT, lineHeight: 18 },

  // Settings Screen
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileEmail: { fontSize: 14, color: COLORS.SUBTEXT },
  profileLocation: { fontSize: 12, color: COLORS.SUBTEXT, marginTop: 4 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  settingText: { fontSize: 16 },
  settingArrow: { fontSize: 20, color: COLORS.SUBTEXT },
  switch: { backgroundColor: COLORS.SUCCESS, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  switchOn: { color: '#fff', fontSize: 12, fontWeight: '600' },
  premiumCard: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: COLORS.WARNING },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  premiumIcon: { fontSize: 16, marginRight: 8 },
  premiumTitle: { fontSize: 16, fontWeight: '700', color: '#B45309' },
  premiumText: { fontSize: 12, color: '#92400E' },
  logoutButton: { backgroundColor: COLORS.DANGER, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default App;