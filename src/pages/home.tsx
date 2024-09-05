import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  Linking,
  BackHandler,
  Modal,
} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {Constant} from '../utils/constant-base';
import ProgressBar from '../components/progress-bar-step';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeScreenProps {
  steps: number;
  calories: number;
  elapsedTime: number;
  heartRate: number;
  isVN: boolean;
  webviewHeight: number;
}
const SECONDS_PER_MINUTE = 60;

const HomeScreen: React.FC<HomeScreenProps> = ({
  steps,
  calories,
  elapsedTime,
  heartRate,
  isVN,
  webviewHeight,
}) => {
  const [url, setUrl] = useState(
    isVN ? Constant.HOME_LINK_VI : Constant.HOME_LINK_EN,
  );
  const [visible, setVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const {t, i18n} = useTranslation();

  useEffect(() => {
    AsyncStorage.getItem('isVN').then((value: any) => {
      const isVN = JSON.parse(value);
      if (isVN) {
        i18n.changeLanguage('vi').then(() => {
          setUrl(Constant.HOME_LINK_VI);
        });
      } else {
        i18n.changeLanguage('en').then(() => {
          setUrl(Constant.HOME_LINK_EN);
        });
      }
    });

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleBackPress = useCallback(() => {
    setVisible(false);
    return true;
  }, []);

  const setViewWebView = useCallback((newUrl: string) => {
    setNewUrl(newUrl);
    setVisible(true);
    return false;
  }, []);

  // const [webViewHeight, setWebViewHeight] = useState(webviewHeight);

  // const handleMessage = useCallback((event: any) => {
  //   const height = parseInt(event.nativeEvent.data);
  //   console.log(height);
  //   setVisible(false);

  //   setWebViewHeight(height);
  // }, []);

  // const injectedJavaScript = `
  //   (function() {
  //     var body = document.body,
  //         html = document.documentElement;
  //     var height = Math.max( body.scrollHeight, body.offsetHeight,
  //                            html.clientHeight, html.scrollHeight, html.offsetHeight );
  //     window.ReactNativeWebView.postMessage(height.toString());
  //   })();
  //   true; // note: this is required for the injectedJavaScript to work
  // `;

  if (visible) {
    return (
      <View style={{flex: 1}}>
        <WebView
          source={{uri: newUrl}}
          style={{flex: 1, width: '100%'}}
          onShouldStartLoadWithRequest={navState => {
            Linking.openURL(navState.url);
            return false;
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      style={{flex: 1, backgroundColor: '#f1efff'}}>
      <View style={styles.container}>
        <View style={styles.stepsContainer}>
          <ImageBackground
            style={styles.imageBackground}
            source={require('../../assets/images/icon/round.png')}>
            <Image
              source={require('../../assets/images/icon/step.png')}
              style={styles.stepsIcon}
            />
          </ImageBackground>
          <ProgressBar steps={steps ? steps : 0} />
          <View style={styles.stepInfoContainer}>
            <View style={styles.stepInfoBox}>
              <Image
                source={require('../../assets/images/icon/Group158.png')}
                style={styles.smallIcon}
              />
              <Text style={styles.stepInfoText}>
                {t('today_walked')}: {steps ? steps : 0} {t('steps_label')}
              </Text>
            </View>
            <View style={styles.stepInfoBox}>
              <Image
                source={require('../../assets/images/icon/tatasu-tshirt.png')}
                style={styles.smallIcon}
              />
              <Text style={styles.stepInfoText}>
                {t('coins_earned')} {steps ? steps : 0} {t('coin')}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('daily_walking_reward')}</Text>
        </View>
        <View style={styles.bottomNavigation}>
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/icon/Group191.png')}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>
              {heartRate ? heartRate.toFixed(1) : '__'}
            </Text>
            <Text style={styles.navText}>{t('pace_label')}</Text>
          </View>
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/icon/Group205.png')}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>
              {calories ? calories.toFixed(2) : '0'}
            </Text>
            <Text style={styles.navText}>Cal</Text>
          </View>
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/icon/Group158.png')}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>{steps ? steps : '__'}</Text>
            <Text style={styles.navText}>{t('steps_label')}</Text>
          </View>
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/icon/Group53.png')}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>
              {steps ? (steps * 0.5).toFixed(1) : '__'}
            </Text>
            <Text style={styles.navText}>{t('M')}</Text>
          </View>
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/icon/Group54.png')}
              style={styles.navIcon}
            />
            <Text style={styles.navText}>
              {elapsedTime
                ? (elapsedTime / SECONDS_PER_MINUTE).toFixed(2)
                : '__'}
            </Text>
            <Text style={styles.navText}>{t('minutes_label')}</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.webviewContainer,
          {
            height:
              webviewHeight > 0
                ? webviewHeight
                : Dimensions.get('window').height * 10,
          },
        ]}>
        <WebView
          style={{flex: 1, backgroundColor: '#f1efff'}}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          nestedScrollEnabled={false}
          setSupportMultipleWindows={false}
          scrollEnabled={false}
          source={{
            uri: url,
          }}
          onShouldStartLoadWithRequest={navState => {
            setViewWebView(navState.url);
            return false;
          }}
        />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1efff',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    width: '96%',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  imageBackground: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsIcon: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#004aad',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#00FFEA',
    borderRadius: 5,
  },
  stepInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  stepInfoBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    // flexWrap: 'wrap',
  },
  smallIcon: {
    width: 30,
    height: 30,
    marginRight: 4,
  },
  stepInfoText: {
    fontSize: 12,
    color: '#545454',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#545454',
    textAlign: 'center',
    marginVertical: 20,
  },
  bottomNavigation: {
    width: '96%',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dotted',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    marginTop: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },
  navText: {
    fontSize: 12,
    color: '#545454',
    marginTop: 5,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#f1efff',
    marginBottom: 80,
  },
});
