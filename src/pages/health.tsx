import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  BackHandler,
  Modal,
  Dimensions,
} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {Constant} from '../utils/constant-base';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {useFocusEffect} from '@react-navigation/native';
const HealthScreen = (route: any) => {
  const [url, setUrl] = useState(
    route.isVN ? Constant.HEALTH_LINK_VI : Constant.HEALTH_LINK_EN,
  );

  const [newUrl, setNewUrl] = useState('');
  const [visible, setVisible] = useState(false);

  function setViewWebView(newUrl: string) {
    setNewUrl(newUrl);
    setVisible(true);
  }

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setVisible(false);
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  if (visible) {
    return (
      <View style={{flex: 1}}>
        <WebView
          source={{uri: newUrl}}
          style={{flex: 1}}
          onShouldStartLoadWithRequest={navState => {
            Linking.openURL(navState.url);

            return false;
          }}
        />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.webviewContainer}>
        <WebView
          nestedScrollEnabled
          domStorageEnabled={true}
          source={{
            uri: url,
          }}
          style={{
            flex: 1,
            width: Dimensions.get('window').width,
            backgroundColor: '#f1efff',
          }}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={navState => {
            setViewWebView(navState.url);
            return false;
          }}
        />
      </View>
    </ScrollView>
  );
};

export default HealthScreen;

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: '#f1efff',
    paddingBottom: 50,
  },
});
