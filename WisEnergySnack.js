import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, SafeAreaView, Dimensions, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Feather, Fontisto } from '@expo/vector-icons';

// NOTE: In Expo Snack, upload these images to assets folder:
// - Login-house.png (from assets/images/Login-house.png)  
// - WisEnergy_LOGO2.png (from assets/images/WisEnergy_LOGO2.png)
const houseImage = require('./assets/Login-house.png');
const logoImage = require('./assets/WisEnergy_LOGO2.png');

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
      
      {/* Global Header */}
      {screen !== 'login' && <Header onSettingsPress={() => setScreen('settings')} />}

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
          <MaterialCommunityIcons name="lightning-bolt" size={24} color={screen === 'devices' ? COLORS.SUCCESS : COLORS.SUBTEXT} />
          <Text style={[styles.tabLabel, screen === 'devices' && styles.tabLabelActive]}>Devices</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('budget')}>
          <Ionicons name="cash-outline" size={24} color={screen === 'budget' ? COLORS.SUCCESS : COLORS.SUBTEXT} />
          <Text style={[styles.tabLabel, screen === 'budget' && styles.tabLabelActive]}>Budget</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setScreen('reports')}>
          <Ionicons name="bar-chart-outline" size={24} color={screen === 'reports' ? COLORS.SUCCESS : COLORS.SUBTEXT} />
          <Text style={[styles.tabLabel, screen === 'reports' && styles.tabLabelActive]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ----- LOGIN SCREEN (Exact Copy from Main App) -----

  const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  return (
    <View style={styles.loginContainer}>
      <AuthHeader />
      <ScrollView 
        style={styles.loginFormScrollView} 
        contentContainerStyle={styles.loginFormContent}
      >
        <Text style={styles.loginTitle}>Login</Text>
        <Text style={styles.loginSubtitleText}>Sign in to continue to your dashboard</Text>

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <MaterialIcons name="email" size={18} color={COLORS.SUBTEXT} />
            <TextInput
              style={styles.loginInput}
              placeholder="Enter Email Address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 16 }}>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Fontisto name="locked" size={18} color={COLORS.SUBTEXT} />
            <TextInput
              style={styles.loginInput}
              placeholder="Enter Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.SUBTEXT} />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {/* Remember Me + Forgot Password */}
        <View style={styles.rememberRow}>
          <TouchableOpacity 
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={onLogin}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Extracted AuthHeader to match Main App structure exactly
const AuthHeader = () => (
  <View style={styles.loginHeader}>
    <View style={styles.loginHeaderBg}>
      <Image source={houseImage} style={styles.loginHeaderHouse} resizeMode="cover" />
    </View>
    <Image source={logoImage} style={styles.loginLogoImg} resizeMode="contain" />
  </View>
);

// Extracted Header for other screens - Match Main App Layout
const Header = ({ onSettingsPress }) => (
  <View style={styles.appHeader}>
    {/* Logo */}
    <View style={styles.appLogoContainer}>
      <MaterialCommunityIcons name="lightning-bolt" size={36} color={COLORS.PRIMARY} />
    </View>

    {/* Right side: Notification + Avatar */}
    <View style={styles.appHeaderRight}>
      <TouchableOpacity onPress={() => console.log('notifications')}>
        <View style={styles.appNotifyButton}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSettingsPress}>
        <View style={styles.appAvatar}>
          <Text style={styles.appAvatarText}>JD</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

// ----- LOGIN SCREEN (Exact Copy from Main App) -----



const DashboardScreen = () => (
  <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}>
    {/* Energy Efficiency Index - Donut Chart - Exact Match Main App */}
    <View style={styles.efficiencyChartCard}>
      <View style={styles.efficiencyPie}>
        <Text style={styles.efficiencyPiePercent}>{mockData.efficiency}%</Text>
        <Text style={styles.efficiencyChartLabel}>Energy Efficiency Index</Text>
        <TouchableOpacity style={styles.efficiencyInfoIcon}>
          <Feather name="info" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.efficiencyChartDesc}>Outstanding! You've used much less energy than last month.</Text>
    </View>

    {/* Welcome Back + Stats Row - Exact Match Main App */}
    <View style={styles.welcomeStatsRow}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome Back, John!</Text>
        <Text style={styles.welcomeSubtitle}>
          Keep tracking your usage to see weekly changes!
        </Text>
      </View>
      <View style={styles.statsColumn}>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialCommunityIcons name="power-plug-outline" size={30} color="gray" />
            <Text style={styles.statValue}>{mockData.devices.length}</Text>
          </View>
          <Text style={styles.statLabel}>Devices</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={30} color="gray" />
            <Text style={styles.statValue}>4.4</Text>
          </View>
          <Text style={styles.statLabelSmall}>Energy Consumption(kWh)</Text>
        </View>
      </View>
    </View>

    {/* Today's Energy Trend - Exact Match Main App */}
    <Card>
      <Text style={styles.cardTitleLarge}>Today's Energy Trend</Text>
      <Text style={styles.cardSubtitle}>Tap a bar to see exact time range & kWh</Text>
      <BarChart data={mockData.hourlyUsage.slice(0, 6)} height={100} barWidth={24} showLabels={true} />
    </Card>

    {/* Monthly Goals - Exact Match Main App */}
    <Card>
      <Text style={styles.cardTitleLarge}>Monthly Goals</Text>
      <Text style={styles.cardSubtitle}>Monitor your estimated monthly energy bills against your set target.</Text>
      <View style={styles.goalsRow}>
        <Text style={styles.goalsLabel}>Current: ₱1,625.00</Text>
        <Text style={styles.goalsLabel}>Goal: ₱2,500.00</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '65%' }]} />
      </View>
    </Card>

    {/* Top Appliances - Exact Match Main App */}
    <Card>
      <Text style={styles.cardTitleLarge}>Top Appliances</Text>
      <Text style={styles.cardSubtitle}>See which appliances are consuming the most energy</Text>
      {mockData.devices.slice(0, 3).map((device, i) => (
        <View key={device.id} style={styles.topApplianceRow}>
          <View style={styles.topApplianceLeft}>
            <MaterialCommunityIcons name={`numeric-${i + 1}-circle`} size={22} color={COLORS.PRIMARY} />
            <Text style={styles.topApplianceName}>{device.name}</Text>
          </View>
          <Text style={styles.topApplianceKw}>{device.kwh} kWh</Text>
        </View>
      ))}
    </Card>

    {/* AI Insights - Exact Match Main App */}
    <Card>
      <Text style={styles.cardTitleLarge}>AI Insights</Text>
      <Text style={styles.aiInsightText}>
        AI will give you personalized tips to save energy when data is available
      </Text>
    </Card>
  </ScrollView>
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
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.WARNING} />
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

  // ----- LOGIN SCREEN STYLES (Exact Copy from Main App) -----
  loginContainer: { flex: 1, backgroundColor: '#fff' },
  loginHeader: {
    height: 208, // h-52 is 208
  },
  loginHeaderBg: {
    position: 'absolute',
    width: '100%',
    height: 240, // h-60 is 240
  },
  loginHeaderHouse: { width: '100%', height: '100%' },
  loginLogoImg: {
    position: 'absolute',
    left: 0,
    width: 160, // w-40 is 160
    height: 144, // h-36 is 144
  },
loginFormScrollView: {
    flex: 1,
    marginTop: -60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 32,
  },
  loginFormContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loginTitle: { fontSize: 24, fontWeight: '700', color: COLORS.TEXT, textAlign: 'center', marginBottom: 4 },
  loginSubtitleText: { fontSize: 14, color: COLORS.SUBTEXT, textAlign: 'center', marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 12,
  },
  inputError: { borderColor: COLORS.DANGER, borderWidth: 2 },
  errorText: { color: COLORS.DANGER, fontSize: 12, marginTop: 4 },
  inputIconText: { fontSize: 16, marginRight: 8 },
  loginInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.TEXT },
  eyeIcon: { padding: 4 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#15803d',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#15803d' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rememberText: { fontSize: 14, color: COLORS.TEXT, marginLeft: 8 },
  forgotLink: { color: '#15803d', fontSize: 14, fontWeight: '500' },
  signInButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    height: 64,
    justifyContent: 'center',
  },
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.BORDER },
  dividerText: { paddingHorizontal: 8, color: COLORS.SUBTEXT, fontSize: 12 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  registerText: { color: COLORS.SUBTEXT, fontSize: 14 },
  registerLink: { color: COLORS.PRIMARY, fontWeight: '700' },

// ----- DASHBOARD STYLES -----
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  appLogoContainer: { width: 40, height: 40, justifyContent: 'center', marginLeft: -8 },
  appHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  appNotifyButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#136B1E', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 5, elevation: 6 },
  appAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center' },
  appAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcomeStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  welcomeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '48%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  welcomeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT, marginBottom: 8 },
  welcomeSubtitle: { fontSize: 12, color: COLORS.SUBTEXT },
  statsColumn: { width: '48%', flexDirection: 'column' },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.SUCCESS, marginLeft: 8 },
  statLabel: { fontSize: 12, color: COLORS.SUBTEXT, marginTop: 4 },
  statLabelSmall: { fontSize: 9, color: COLORS.SUBTEXT, fontStyle: 'italic', marginTop: 4 },
  efficiencyChartCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  efficiencyPie: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.SUCCESS, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  efficiencyPiePercent: { fontSize: 36, fontWeight: '700', color: COLORS.TEXT, position: 'absolute', top: 35 },
  efficiencyChartLabel: { fontSize: 10, color: '#fff', textAlign: 'center', marginTop: 80, width: '80%' },
  efficiencyInfoIcon: { position: 'absolute', top: 105, left: '50%', marginLeft: -8 },
  efficiencyChartDesc: { fontSize: 12, color: COLORS.SUCCESS, textAlign: 'center', marginTop: 16 },
  cardTitleLarge: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: COLORS.SUBTEXT, marginBottom: 16 },
  goalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalsLabel: { fontSize: 12, color: COLORS.SUBTEXT },
  topApplianceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginLeft: 10 },
  topApplianceLeft: { flexDirection: 'row', alignItems: 'center' },
  topApplianceName: { fontSize: 13, fontWeight: '500', color: COLORS.TEXT, marginLeft: 8 },
  topApplianceKw: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT },
  aiInsightText: { fontSize: 13, color: COLORS.SUBTEXT },
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