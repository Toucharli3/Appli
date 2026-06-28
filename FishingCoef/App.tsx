import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';

import { getSolunarData, getWeekForecast, SolunarData } from './src/utils/solunar';
import { getTideInfo, getTideForecast, TideInfo } from './src/utils/tides';
import { getMoonIllumination, getMoonTimes, MoonIllumination, MoonTimes } from './src/utils/astronomy';
import { colors } from './src/theme/colors';
import Header from './src/components/Header';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import InfoScreen from './src/screens/InfoScreen';

// ─── Default location: Brest (French Atlantic coast — classique pour les marées) ──
const DEFAULT_LOCATION = { lat: 48.3904, lng: -4.4861, name: 'Brest, Bretagne' };

type Tab = 'home' | 'calendar' | 'info';

interface AppData {
  solunar:      SolunarData;
  tideInfo:     TideInfo;
  moonIllum:    MoonIllumination;
  moonTimes:    MoonTimes;
  weekForecast: ReturnType<typeof getWeekForecast>;
  tideForecast: ReturnType<typeof getTideForecast>;
}

function computeData(date: Date, lat: number, lng: number): AppData {
  return {
    solunar:      getSolunarData(date, lat, lng),
    tideInfo:     getTideInfo(date),
    moonIllum:    getMoonIllumination(date),
    moonTimes:    getMoonTimes(date, lat, lng),
    weekForecast: getWeekForecast(date, 7, lat, lng),
    tideForecast: getTideForecast(date, 7),
  };
}

export default function App() {
  const [tab, setTab]           = useState<Tab>('home');
  const [now, setNow]           = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [data, setData]         = useState<AppData>(() =>
    computeData(new Date(), DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng)
  );

  // Tick every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Recompute when time or location changes
  useEffect(() => {
    setData(computeData(now, location.lat, location.lng));
  }, [now, location]);

  // Request GPS on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [geo] = await Location.reverseGeocodeAsync({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        const city   = geo?.city || geo?.region || 'Ma position';
        const region = geo?.region || '';
        const name   = region && region !== city ? `${city}, ${region}` : city;

        setLocation({
          lat:  pos.coords.latitude,
          lng:  pos.coords.longitude,
          name,
        });
      } catch {
        // Keep default location silently
      }
    })();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    const fresh = new Date();
    setNow(fresh);
    setData(computeData(fresh, location.lat, location.lng));
    setTimeout(() => setRefreshing(false), 600);
  }, [location]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgCard} />

      {/* App header */}
      <Header
        locationName={location.name}
        date={now}
        onRefresh={handleRefresh}
      />

      {/* Screen content */}
      <View style={styles.screenContainer}>
        {tab === 'home' && (
          <HomeScreen
            solunar={data.solunar}
            tideInfo={data.tideInfo}
            moonIllum={data.moonIllum}
            moonTimes={data.moonTimes}
            currentTime={now}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        {tab === 'calendar' && (
          <CalendarScreen
            forecast={data.weekForecast}
            today={now}
            tideForecast={data.tideForecast}
          />
        )}
        {tab === 'info' && <InfoScreen />}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        <TabButton icon="🎣" label="Coefficient" active={tab === 'home'}    onPress={() => setTab('home')}     />
        <TabButton icon="📅" label="Calendrier"  active={tab === 'calendar'} onPress={() => setTab('calendar')} />
        <TabButton icon="ℹ️" label="À propos"    active={tab === 'info'}    onPress={() => setTab('info')}     />
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  icon, label, active, onPress,
}: {
  icon: string; label: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: colors.bg,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection:    'row',
    backgroundColor:  colors.bgCard,
    borderTopWidth:   1,
    borderTopColor:   colors.border,
    paddingBottom:    Platform.OS === 'ios' ? 16 : 8,
    paddingTop:       8,
  },
  tabBtn: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    gap:             2,
  },
  tabIcon: {
    fontSize: 22,
    opacity:  0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize:   10,
    color:      colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color:      colors.cyan,
    fontWeight: '700',
  },
  tabIndicator: {
    position:        'absolute',
    top:             -8,
    width:           32,
    height:          2,
    backgroundColor: colors.cyan,
    borderRadius:    1,
  },
});
