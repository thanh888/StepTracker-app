import {Image, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './home';
import HealthScreen from './health';
import CommunityScreen from './community';
import ProfileScreen from './profile';
import {useCallback, useEffect, useRef, useState} from 'react';
import StorageService from '../common/storage-service';

import TopNavBar from '../components/navbar';
import {useFocusEffect} from '@react-navigation/native';

import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

import moment from 'moment';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constant} from '../utils/constant-base';
import WebView from 'react-native-webview';
import PracticeScreen from './practice';

const Tab = createBottomTabNavigator();

const MET_WALKING = 3.5; // MET value for walking
const WEIGHT_KG = 75; // Weight in kg (Adjust based on user input)
const CALORIES_PER_MINUTE = (MET: number, weight: number) => {
  return (MET * weight * 3.5) / 200;
};

export function MenuNavigation() {
  const [userInfo, setUserInfo] = useState<any>([]);
  const [isVN, setIsVN] = useState(true);
  const [spurlus, setSpurlus] = useState(0);
  const {t, i18n} = useTranslation();
  const [testValue, setTestValue] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('isVN').then((value: any) => {
      if (JSON.parse(value)) {
        setIsVN(true);
      } else {
        setIsVN(false);
      }
    });
  }, []);

  async function getUser() {
    const value: any = await StorageService.getUser();
    setUserInfo(value);
  }

  useEffect(() => {
    getUser();
    getStep();
    getCoin();
    checkDate();
  }, []);

  useEffect(() => {
    getCoin();
  }, [isVN]);

  useFocusEffect(
    useCallback(() => {
      getUser();
      getCoin();
      getStep();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getCoin();
    }, [isVN]),
  );

  async function checkDate() {
    const today = moment(new Date()).format('DD/MM/YYYY');
    const dateStep = await StorageService.getDateStep();
    if (dateStep && today.toString() !== dateStep.toString()) {
      setSteps(0);
      StorageService.saveStep(0);
      StorageService.saveDateStep(today);
    }
  }

  async function getCoin() {
    if (!userInfo) {
      setSpurlus(0);
      return;
    }
    const value = await StorageService.getCoinLocal();
    if (value) {
      if (isVN) {
        setSpurlus(parseInt(value));
      } else {
        setTestValue(parseInt(value));
        setSpurlus(parseFloat((parseFloat(value) / 20000).toFixed(3)));
      }
    }
  }

  async function getStep() {
    if (!userInfo) return;
    const result = await StorageService.getStep();
    if (result) {
      setSteps(parseFloat(result) || 0);
    }
  }

  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); // distance in meters
  const magnitudePreviousRef = useRef<number>(0);
  const [calories, setCalories] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [heartRate, setHeartRate] = useState(75); // Base heart rate

  useEffect(() => {
    if (userInfo) {
      setUpdateIntervalForType(SensorTypes.accelerometer, 100); // Set update interval for accelerometer

      const subscription = accelerometer.subscribe(({x, y, z}) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const magnitudeDelta = magnitude - magnitudePreviousRef.current;
        magnitudePreviousRef.current = magnitude; // Update magnitudePrevious using useRef

        if (magnitudeDelta > 1.2) {
          // Change threshold if needed
          setSteps(prevCount => {
            if (isVN) {
              setSpurlus(prevCoin => {
                StorageService.saveCoinLocal(prevCoin + 1);
                return prevCoin + 1;
              });
            } else {
              setTestValue(prevCoin => {
                StorageService.saveCoinLocal(prevCoin + 1);
                setSpurlus(preSpu => {
                  return parseFloat(
                    (parseFloat(prevCoin.toString()) / 20000 + 0.001).toFixed(
                      3,
                    ),
                  );
                });
                return prevCoin + 1;
              });
            }

            const newSteps = prevCount + 1;
            setDistance(newSteps * 0.6);
            setCalories(
              (CALORIES_PER_MINUTE(MET_WALKING, WEIGHT_KG) * (prevCount + 1)) /
                10,
            );
            setHeartRate(prevHeartRate => Math.min(200, prevHeartRate + 0.1)); // Cap heart rate at 200 BPM
            StorageService.saveStep(prevCount + 1);
            return newSteps;
          });
        }
      });

      intervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);

      return () => {
        subscription.unsubscribe();
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [userInfo]);

  const menuWebview = [
    {
      link: isVN ? Constant.HOME_LINK_VI : Constant.HOME_LINK_EN,
      name: 'homepage',
    },
    {
      link: isVN ? Constant.HEALTH_LINK_VI : Constant.HEALTH_LINK_EN,
      name: 'healthpage',
    },
    {
      link: isVN ? Constant.COMMUNITY_LINK_VI : Constant.COMMUNITY_LINK_EN,
      name: 'communitypage',
    },
    {
      link: isVN ? Constant.PRACTICE_LINK_VI : Constant.PRACTICE_LINK_EN,
      name: 'practicepage',
    },
    {
      link: isVN ? Constant.PROFILE_LINK_VI : Constant.PROFILE_LINK_EN,
      name: 'profilepage',
    },
  ];

  const [webViewHeights, setWebViewHeights] = useState({
    homepage: 0,
    healthpage: 0,
    communitypage: 0,
    practicepage: 0,
    profilepage: 0,
  });

  const handleWebViewHeight = (height: number, name: string) => {
    console.log(height);

    setWebViewHeights(prevHeights => ({
      ...prevHeights,
      [name]: height,
    }));
  };

  const handleMessage = (event: any, value: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    handleWebViewHeight(height, value.name);
  };

  const injectedJavaScript = `
    (function() {
      var body = document.body,
          html = document.documentElement;
      var height = Math.max( body.scrollHeight, body.offsetHeight, 
                             html.clientHeight, html.scrollHeight, html.offsetHeight );
      window.ReactNativeWebView.postMessage(height.toString());
    })();
    true; // note: this is required for the injectedJavaScript to work
  `;

  return (
    <View style={{flex: 1}}>
      <TopNavBar spurlus={spurlus} />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size}) => {
            if (route.name === 'Home') {
              return (
                <Image
                  source={require('../../assets/images/icon/home.png')}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    // marginBottom: 5,
                  }}
                />
              );
            } else if (route.name === 'Health') {
              return (
                <Image
                  source={require('../../assets/images/icon/health.png')}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    marginBottom: 5,
                  }}
                />
              );
            } else if (route.name === 'Community') {
              return (
                <Image
                  source={require('../../assets/images/icon/commu.png')}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    marginBottom: 5,
                  }}
                />
              );
            } else if (route.name === 'Practice') {
              return (
                <Image
                  source={require('../../assets/images/icon/prac.png')}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'cover',
                    marginBottom: 5,
                  }}
                />
              );
            } else if (route.name === 'Profile') {
              return (
                <Image
                  source={require('../../assets/images/icon/Vector.png')}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    marginBottom: 5,
                  }}
                />
              );
            }
          },
          tabBarActiveTintColor: '#00FFEA',
          tabBarInactiveTintColor: '#9F89C8',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#8B72B1',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 5,
            paddingTop: 10,
            position: 'absolute',
            bottom: 0,
          },
        })}>
        <Tab.Screen
          name="Home"
          children={() => (
            <HomeScreen
              steps={steps}
              calories={calories}
              elapsedTime={elapsedTime}
              heartRate={heartRate}
              isVN={isVN}
              webviewHeight={webViewHeights.homepage}
            />
          )}
          options={{
            tabBarLabel: t('home_section'),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Health"
          children={() => <HealthScreen isVN={isVN} />}
          options={{
            tabBarLabel: t('health_section'),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Community"
          children={() => (
            <CommunityScreen
              userInfo={userInfo}
              spurlus={spurlus}
              testValue={testValue}
              getCoin={getCoin}
              isVN={isVN}
              webviewHeight={webViewHeights.communitypage}
            />
          )}
          options={{
            tabBarLabel: t('community_section'),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Practice"
          children={() => (
            <PracticeScreen
              steps={steps}
              calories={calories}
              elapsedTime={elapsedTime}
              heartRate={heartRate}
              isVN={isVN}
              webviewHeight={webViewHeights.practicepage}
            />
          )}
          options={{
            tabBarLabel: t('practice_section'),
            unmountOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Profile"
          children={() => (
            <ProfileScreen
              userInfo={userInfo}
              getUser={getUser}
              isVN={isVN}
              spurlus={spurlus}
              getCoin={getCoin}
              setSpurlus={setSpurlus}
              setSteps={setSteps}
              webviewHeight={webViewHeights.profilepage}
            />
          )}
          options={{
            tabBarLabel: t('profile_section'),
            unmountOnBlur: true,
          }}
        />
      </Tab.Navigator>
      <View style={{flex: 1, display: 'none'}}>
        {menuWebview.map((value, key) => {
          return (
            <WebView
              key={key}
              style={{flex: 1, backgroundColor: '#f1efff'}}
              domStorageEnabled={true}
              javaScriptEnabled={true}
              onMessage={event => handleMessage(event, value)}
              injectedJavaScript={injectedJavaScript}
              source={{
                uri: value.link,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
