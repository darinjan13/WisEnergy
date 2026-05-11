import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, SafeAreaView, Dimensions, Image } from 'react-native';

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
  LIGHT_GREEN: '#DCFCE7',
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

// Bar Chart (match main app style)
const BarChart = ({ data, showLabels = true, height = 100, barWidth = 20 }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  
  return (
    <View style={[styles.barChartContainer, { height }]}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barTrack}>
            <View 
              style={[
                styles.barFill, 
                { height: `${(item.value / maxVal) * 100}%`, width: barWidth }
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

// Card Component (exact match main app)
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

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
      
      {/* Header - Exact Match Main App */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Placeholder for Logo - would be an Image in main app */}
          <Text style={styles.logoPlaceholder}>🏠</Text>
          <Text style={styles.headerTitle}>WisEnergy</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setScreen('settings')}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
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

      {/* Tab Bar - Exact Match Main App Icons */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('dashboard')}>
          <Text style={[styles.tabIcon, screen === 'dashboard' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, screen === 'dashboard' && styles.tabLabelActive]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('devices')}>
          <Text style={[styles.tabIcon, screen === 'devices' && styles.tabIconActive]}>⚡</Text>
          <Text style={[styles.tabLabel, screen === 'devices' && styles.tabLabelActive]}>Devices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('budget')}>
          <Text style={[styles.tabIcon, screen === 'budget' && styles.tabIconActive]}>💰</Text>
          <Text style={[styles.tabLabel, screen === 'budget' && styles.tabLabelActive]}>Budget</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('reports')}>
          <Text style={[styles.tabIcon, screen === 'reports' && styles.tabIconActive]}>📊</Text>
          <Text style={[styles.tabLabel, screen === 'reports' && styles.tabLabelActive]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ----- LOGIN SCREEN (Exact Match Main App) -----

const LoginScreen = ({ onLogin }) => (
  <View style={styles.loginContainer}>
    {/* Top Header with Logo - Exact Match Main App */}
    <View style={styles.loginTop}>
      <View style={styles.loginLogoContainer}>
        <Text style={styles.loginLogo}>🏠</Text>
        <Text style={styles.loginAppName}>WisEnergy</Text>
      </View>
    </View>
    
    {/* Bottom Form - Exact Match Main App */}
    <View style={styles.loginFormContainer}>
      <Text style={styles.loginWelcome}>Welcome Back!</Text>
      <Text style={styles.loginSubtitle}>Login to continue monitoring your energy</Text>
      
      <Text style={styles.inputLabel}>Email Address</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>📧</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your email" 
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <Text style={styles.inputLabel}>Password</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your password" 
          placeholderTextColor="#9CA3AF"
          secureTextEntry
        />
      </View>

      {/* Remember Me Checkbox - Exact Match Main App */}
      <View style={styles.rememberRow}>
        <TouchableOpacity style={styles.checkbox}>
          <Text style={styles.checkboxTick}>✓</Text>
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember Me</Text>
        <TouchableOpacity style={styles.forgotContainer}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.loginDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerLink}>Register</Text></Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ----- DASHBOARD SCREEN (Exact Match Main App) -----

const DashboardScreen = () => (
  <View style={styles.screen}>
    {/* Header */}
    <View style={styles.dashboardHeader}>
      <Text style={styles.dashboardGreeting}>Hello, John! 👋</Text>
      <Text style={styles.dashboardDate}>Today, May 11</Text>
    </View>

    {/* Energy Efficiency Card - Exact Match Main App */}
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Energy Efficiency Index</Text>
        <TouchableOpacity>
          <Text style={styles.cardAction}>ℹ️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.efficiencyRow}>
        <View style={styles.efficiencyCircleLarge}>
          <Text style={styles.efficiencyPercent}>{mockData.efficiency}%</Text>
          <Text style={styles.efficiencyLabel}>Efficiency</Text>
        </View>
        
        <View style={styles.efficiencyInfo}>
          <View style={styles.efficiencyBadge}>
            <Text style={styles.efficiencyBadgeIcon}>🏆</Text>
            <Text style={styles.efficiencyBadgeText}>Outstanding</Text>
          </View>
          <Text style={styles.efficiencyDesc}>
            You're using 15% less energy than last month. Great job!
          </Text>
        </View>
      </View>
    </Card>

    {/* Budget Card - Exact Match Main App */}
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Monthly Budget</Text>
        <TouchableOpacity>
          <Text style={styles.cardAction}>✏️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.budgetRow}>
        <View>
          <Text style={styles.budgetLabel}>Monthly Budget</Text>
          <Text style={styles.budgetValue}>₱2,500.00</Text>
        </View>
        <View style={styles.budgetDivider} />
        <View>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text style={[styles.budgetValue, { color: COLORS.SUCCESS }]}>₱875.00</Text>
        </View>
      </View>
      
      <View style={styles.budgetProgressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '65%' }]} />
        </View>
        <Text style={styles.progressLabel}>65% used</Text>
      </View>
    </Card>

    {/* Today's Usage Chart */}
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today's Usage</Text>
        <Text style={styles.cardSubtitle}>kWh</Text>
      </View>
      <BarChart data={mockData.hourlyUsage.slice(0, 6)} height={80} barWidth={18} showLabels={false} />
    </Card>

    {/* Connected Devices Summary */}
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Connected Devices</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllLink}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {mockData.devices.slice(0, 2).map(device => (
        <View key={device.id} style={styles.deviceRow}>
          <View style={styles.deviceLeft}>
            <View style={styles.deviceIcon}>
              <Text style={styles.deviceIconText}>⚡</Text>
            </View>
            <View>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>{device.room}</Text>
            </View>
          </View>
          <View style={styles.deviceRight}>
            <Text style={styles.deviceKwh}>{device.kwh} kWh</Text>
            <View style={[
              styles.deviceStatusBadge,
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
        </View>
      ))}
    </Card>
  </View>
);

// ----- DEVICES SCREEN (Exact Match Main App) -----

const DevicesScreen = ({ devices, toggleStates, toggleDevice }) => (
  <View style={styles.screen}>
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>My Devices</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>
    </View>
    
    <Text style={styles.deviceCount}>{devices.length} devices connected</Text>
    
    {devices.map(device => (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => toggleDevice(device.id)}
      >
        <View style={styles.deviceCardLeft}>
          <View style={styles.deviceCardIcon}>
            <Text style={styles.deviceCardIconText}>⚡</Text>
          </View>
          <View style={styles.deviceCardInfo}>
            <Text style={styles.deviceCardName}>{device.name}</Text>
            <Text style={styles.deviceCardMeta}>{device.nickname}</Text>
            <View style={styles.deviceCardDetails}>
              <Text style={styles.deviceCardRoom}>{device.room}</Text>
              <Text style={styles.deviceCardDot}>•</Text>
              <Text style={styles.deviceCardKw}>{device.kwh} kWh</Text>
            </View>
          </View>
        </View>
        <View style={[
          styles.deviceCardToggle,
          toggleStates[device.id] ? styles.deviceCardToggleOn : styles.deviceCardToggleOff
        ]}>
          <Text style={[
            styles.deviceCardToggleText,
            toggleStates[device.id] ? styles.deviceCardToggleTextOn : styles.deviceCardToggleTextOff
          ]}>
            {toggleStates[device.id] ? 'ON' : 'OFF'}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

// ----- BUDGET SCREEN (Exact Match Main App) -----

const BudgetScreen = ({ budget }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Monthly Budget</Text>
    
    {/* Budget Overview Card */}
    <Card>
      <View style={styles.budgetOverview}>
        <View style={styles.budgetPieContainer}>
          <View style={styles.budgetPie}>
            <Text style={styles.budgetPiePercent}>65%</Text>
            <Text style={styles.budgetPieLabel}>Used</Text>
          </View>
        </View>
        
        <View style={styles.budgetStats}>
          <View style={styles.budgetStat}>
            <View style={styles.budgetStatDotUsed} />
            <View>
              <Text style={styles.budgetStatLabel}>Used</Text>
              <Text style={styles.budgetStatValue}>₱1,625.00</Text>
            </View>
          </View>
          <View style={styles.budgetStat}>
            <View style={styles.budgetStatDotRemaining} />
            <View>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
              <Text style={[styles.budgetStatValue, { color: COLORS.SUCCESS }]}>₱875.00</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>

    {/* Weekly Budget Usage */}
    <Card>
      <Text style={styles.cardTitle}>Weekly Budget Usage</Text>
      <BarChart data={[
        { value: 80, label: 'W1' },
        { value: 65, label: 'W2' },
        { value: 90, label: 'W3' },
        { value: 75, label: 'W4' },
      ]} height={100} barWidth={25} />
    </Card>
  </View>
);

// ----- REPORTS SCREEN (Exact Match Main App) -----

const ReportsScreen = ({ data }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Usage Reports</Text>
    
    {/* Month Selector */}
    <View style={styles.monthSelector}>
      <TouchableOpacity style={styles.monthArrow}>
        <Text>‹</Text>
      </TouchableOpacity>
      <Text style={styles.monthText}>January - May 2024</Text>
      <TouchableOpacity style={styles.monthArrow}>
        <Text>›</Text>
      </TouchableOpacity>
    </View>
    
    {/* Monthly Consumption Chart */}
    <Card>
      <Text style={styles.cardTitle}>Monthly Consumption (kWh)</Text>
      <BarChart data={data} height={120} barWidth={28} />
    </Card>

    {/* Summary */}
    <Card>
      <Text style={styles.cardTitle}>Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Consumption</Text>
        <Text style={styles.summaryValue}>651 kWh</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Average</Text>
        <Text style={styles.summaryValue}>130 kWh/month</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Estimated Cost</Text>
        <Text style={[styles.summaryValue, { color: COLORS.SUCCESS }]}>₱9,765.00</Text>
      </View>
    </Card>

    {/* AI Recommendations */}
    <Card style={styles.recommendCard}>
      <View style={styles.recommendHeader}>
        <Text style={styles.recommendTitle}>💡 Smart Recommendations</Text>
      </View>
      <View style={styles.recommendItem}>
        <Text style={styles.recommendIcon}>💡</Text>
        <Text style={styles.recommendText}>
          Your Bedroom Fan uses 40% less energy when run from 10PM-6AM
        </Text>
      </View>
      <View style={styles.recommendItem}>
        <Text style={styles.recommendIcon}>💡</Text>
        <Text style={styles.recommendText}>
          Consider using your Living Room AC at 25°C for optimal savings
        </Text>
      </View>
    </Card>
  </View>
);

// ----- SETTINGS SCREEN (Exact Match Main App) -----

const SettingsScreen = ({ onLogout, user }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>Settings</Text>

    {/* Profile Card with Avatar */}
    <Card>
      <View style={styles.profileCard}>
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

    {/* Account Settings */}
    <Text style={styles.settingsSection}>ACCOUNT</Text>
    <Card>
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Edit Profile</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Notifications</Text>
        <View style={styles.settingToggleOn}>
          <Text style={styles.settingToggleText}>ON</Text>
        </View>
      </TouchableOpacity>
    </Card>

    {/* App Settings */}
    <Text style={styles.settingsSection}>APP</Text>
    <Card>
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Privacy Policy</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Terms of Service</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingText}>Contact Support</Text>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
    </Card>

    {/* Premium Subscription */}
    <Card style={styles.premiumCard}>
      <View style={styles.premiumBadge}>
        <Text style={styles.premiumBadgeText}>⚡ PREMIUM ACTIVE</Text>
      </View>
      <Text style={styles.premiumText}>
        You're subscribed to WisEnergy Premium. Enjoy unlimited devices and full analytics!
      </Text>
    </Card>

    {/* Logout Button */}
    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
      <Text style={styles.logoutBtnText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

// ----- STYLES (Exact Match Main App) -----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { fontSize: 24, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.PRIMARY },
  settingsButton: { padding: 8 },
  settingsIcon: { fontSize: 20 },

  // Content
  content: { flex: 1 },
  screen: { padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: COLORS.TEXT, marginBottom: 16 },
  screenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

  // Card - Exact Match
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.SUBTEXT },
  cardAction: { fontSize: 16 },
  cardSubtitle: { fontSize: 12, color: COLORS.SUBTEXT },

  // Tab Bar - Exact Match Main App
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: COLORS.SUBTEXT, marginTop: 2 },
  tabLabelActive: { color: COLORS.PRIMARY, fontWeight: '700' },

  // ----- LOGIN SCREEN STYLES -----
  loginContainer: { flex: 1, backgroundColor: '#fff' },
  loginTop: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  loginLogoContainer: { alignItems: 'center' },
  loginLogo: { fontSize: 56, marginBottom: 8 },
  loginAppName: { fontSize: 28, fontWeight: '700', color: '#fff' },
  loginFormContainer: { padding: 24 },
  loginWelcome: { fontSize: 24, fontWeight: '700', color: COLORS.TEXT, marginBottom: 4 },
  loginSubtitle: { fontSize: 14, color: COLORS.SUBTEXT, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: 'bold' },
  rememberText: { flex: 1, fontSize: 14, color: COLORS.TEXT },
  forgotContainer: {},
  forgotText: { color: COLORS.PRIMARY, fontSize: 14, fontWeight: '600' },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.BORDER },
  dividerText: { paddingHorizontal: 16, color: COLORS.SUBTEXT, fontSize: 12 },
  registerButton: { alignItems: 'center' },
  registerText: { color: COLORS.SUBTEXT, fontSize: 14 },
  registerLink: { color: COLORS.PRIMARY, fontWeight: '700' },

  // ----- DASHBOARD STYLES -----
  dashboardHeader: { marginBottom: 16 },
  dashboardGreeting: { fontSize: 24, fontWeight: '700', color: COLORS.TEXT },
  dashboardDate: { fontSize: 14, color: COLORS.SUBTEXT },
  efficiencyRow: { flexDirection: 'row', alignItems: 'center' },
  efficiencyCircleLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  efficiencyPercent: { fontSize: 22, fontWeight: '700', color: '#fff' },
  efficiencyLabel: { fontSize: 10, color: '#fff' },
  efficiencyInfo: { flex: 1, marginLeft: 16 },
  efficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  efficiencyBadgeIcon: { fontSize: 12, marginRight: 4 },
  efficiencyBadgeText: { fontSize: 12, fontWeight: '600', color: '#B45309' },
  efficiencyDesc: { fontSize: 13, color: COLORS.SUBTEXT, lineHeight: 18 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetValue: { fontSize: 20, fontWeight: '700', color: COLORS.TEXT },
  budgetDivider: { width: 1, backgroundColor: COLORS.BORDER },
  budgetProgressContainer: {},
  progressBar: { height: 10, backgroundColor: COLORS.BORDER, borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.SUCCESS, borderRadius: 5 },
  progressLabel: { fontSize: 12, color: COLORS.SUBTEXT, textAlign: 'right' },
  seeAllLink: { color: COLORS.PRIMARY, fontSize: 14, fontWeight: '600' },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  deviceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deviceIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  deviceIconText: { fontSize: 18 },
  deviceRight: { alignItems: 'flex-end' },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceMeta: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceKwh: { fontSize: 12, color: COLORS.SUBTEXT, marginBottom: 4 },
  deviceStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  deviceStatusOn: { backgroundColor: COLORS.LIGHT_GREEN },
  deviceStatusOff: { backgroundColor: COLORS.BORDER },
  deviceStatusText: { fontSize: 11, fontWeight: '600' },
  deviceStatusTextOn: { color: COLORS.SUCCESS },
  deviceStatusTextOff: { color: COLORS.SUBTEXT },

  // ----- DEVICES STYLES -----
  addButton: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  deviceCount: { fontSize: 14, color: COLORS.SUBTEXT, marginBottom: 16 },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  deviceCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deviceCardIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  deviceCardIconText: { fontSize: 24 },
  deviceCardInfo: { marginLeft: 12, flex: 1 },
  deviceCardName: { fontSize: 16, fontWeight: '600', color: COLORS.TEXT },
  deviceCardMeta: { fontSize: 13, color: COLORS.SUBTEXT },
  deviceCardDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  deviceCardRoom: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceCardDot: { marginHorizontal: 4, color: COLORS.SUBTEXT },
  deviceCardKw: { fontSize: 12, color: COLORS.SUBTEXT },
  deviceCardToggle: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  deviceCardToggleOn: { backgroundColor: COLORS.SUCCESS },
  deviceCardToggleOff: { backgroundColor: COLORS.BORDER },
  deviceCardToggleText: { fontSize: 13, fontWeight: '700' },
  deviceCardToggleTextOn: { color: '#fff' },
  deviceCardToggleTextOff: { color: COLORS.SUBTEXT },

  // ----- BUDGET STYLES -----
  budgetOverview: { flexDirection: 'row', alignItems: 'center' },
  budgetPieContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  budgetPie: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.LIGHT_GREEN, justifyContent: 'center', alignItems: 'center' },
  budgetPiePercent: { fontSize: 24, fontWeight: '700', color: COLORS.SUCCESS },
  budgetPieLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetStats: { flex: 1, marginLeft: 20 },
  budgetStat: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  budgetStatDotUsed: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.SUCCESS, marginRight: 10 },
  budgetStatDotRemaining: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.BORDER, marginRight: 10 },
  budgetStatLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  budgetStatValue: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT },

  // ----- REPORTS STYLES -----
  monthSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  monthArrow: { padding: 12, color: COLORS.PRIMARY, fontSize: 24 },
  monthText: { fontSize: 16, fontWeight: '600', color: COLORS.TEXT, marginHorizontal: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  summaryLabel: { color: COLORS.SUBTEXT },
  summaryValue: { fontWeight: '600' },
  recommendCard: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: COLORS.WARNING },
  recommendHeader: { marginBottom: 8 },
  recommendTitle: { fontSize: 16, fontWeight: '700', color: '#B45309' },
  recommendItem: { flexDirection: 'row', marginTop: 12 },
  recommendIcon: { fontSize: 14, marginRight: 8 },
  recommendText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },

  // ----- SETTINGS STYLES -----
  settingsSection: { fontSize: 12, fontWeight: '600', color: COLORS.SUBTEXT, marginBottom: 8, marginTop: 8, marginLeft: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: { fontSize: 22, fontWeight: '700', color: '#fff' },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileEmail: { fontSize: 14, color: COLORS.SUBTEXT },
  profileLocation: { fontSize: 13, color: COLORS.SUBTEXT, marginTop: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  settingText: { fontSize: 16 },
  settingArrow: { fontSize: 20, color: COLORS.SUBTEXT },
  settingToggleOn: { backgroundColor: COLORS.SUCCESS, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  settingToggleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  premiumCard: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: COLORS.WARNING },
  premiumBadge: { alignSelf: 'flex-start', backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginBottom: 8 },
  premiumBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  premiumText: { fontSize: 13, color: '#92400E' },
  logoutBtn: { backgroundColor: COLORS.DANGER, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  logoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Bar Chart Styles
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingVertical: 8 },
  barItem: { alignItems: 'center' },
  barTrack: { width: 28, height: 80, backgroundColor: COLORS.BORDER, borderRadius: 6, justifyContent: 'flex-end' },
  barFill: { backgroundColor: COLORS.PRIMARY, borderRadius: 6 },
  barLabel: { fontSize: 10, color: COLORS.SUBTEXT, marginTop: 6 },
});

export default App;