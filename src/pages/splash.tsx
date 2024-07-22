import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Image,
  Text,
  ToastAndroid,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {Constant} from '../utils/constant-base';
import StorageService from '../common/storage-service';
import axios from 'axios';

const SplashScreen = () => {
  //State for ActivityIndicator animation
  const [animating, setAnimating] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      setAnimating(false);
      StorageService.getCoinLocal();
      AsyncStorage.getItem('isNotFirst').then(value => {
        if (value) {
          AsyncStorage.getItem(Constant.SHARED_PREFERENCES_USER_KEY).then(
            async (value: any) => {
              if (value) {
                await StorageService.getCoinServer();
              }
              navigation.replace(value === null ? 'Auth' : 'MenuNavigation');
            },
          );
        } else {
          navigation.replace('IntroScreen');
        }
      });
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/icon/splash.png')}
        style={{width: '90%', resizeMode: 'contain', margin: 30}}
      />
      {/* <Text style={{color: '#4E4EA1', fontSize: 40, fontWeight: 'bold'}}>
        TATASU
      </Text> */}
      <ActivityIndicator
        animating={animating}
        color="#FFFFFF"
        size="large"
        style={styles.activityIndicator}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1efff',
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
  },
});
