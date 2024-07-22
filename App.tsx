import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import LoginScreen from './src/pages/signin';

import RegisterScreen from './src/pages/signup';
import SplashScreen from './src/pages/splash';
import {createStackNavigator} from '@react-navigation/stack';
import {MenuNavigation} from './src/pages/menu-navigation';
import BalanceActivity from './src/pages/balance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IntroScreen from './src/pages/intro';
import axios from 'axios';
import {Constant} from './src/utils/constant-base';
import {t} from 'i18next';

const Stack = createStackNavigator();

const Auth = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{
          headerShown: false,
          title: 'Đăng ký',
          headerStyle: {
            backgroundColor: '#307ecc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const fetchPublicIp = async () => {
      try {
        const response = await axios.get(Constant.BASE_URL_IP + '/json');
        if (['vn', 'VN'].includes(response.data.countryCode.toString())) {
          await AsyncStorage.setItem('isVN', JSON.stringify(true));
        } else {
          await AsyncStorage.setItem('isVN', JSON.stringify(false));
        }
        return;
      } catch (error) {
        console.error('Error fetching public IP:', error);
      }
    };
    fetchPublicIp();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: backgroundStyle.backgroundColor,
      }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="IntroScreen"
            component={IntroScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Auth"
            component={Auth}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MenuNavigation"
            component={MenuNavigation}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BalanceScreen"
            component={BalanceActivity}
            options={{
              headerShown: true,
              title: '',
              headerBackground(props) {
                return (
                  <View style={{backgroundColor: '#00c2cb', height: 80}} />
                );
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  stepImage: {
    width: '80%',
    height: '50%',
    marginVertical: 20,
    objectFit: 'fill',
  },
  stepIndicatorView: {
    flexDirection: 'row',
  },
  stepIndicator: {
    height: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 30,
    marginVertical: 10,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  navigationView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navigationBtn: {
    backgroundColor: '#A838D7',
    height: 40,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationDoneView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  navigationBtnTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonLetGo: {
    width: 120,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#9E8DC3',
    alignContent: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  buttonLetStarted: {
    width: 120,
    height: 40,
    backgroundColor: '#8BD5E4',
    borderRadius: 50,
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  navigationBtnLetGoTxt: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  navigationBtnLetStartedTxt: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default App;
