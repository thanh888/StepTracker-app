import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ToastAndroid,
  Linking,
  BackHandler,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {Constant} from '../utils/constant-base';
import {useTranslation} from 'react-i18next';
const {width} = Dimensions.get('window');

const ProfileScreen = (route: any) => {
  const navigation = useNavigation();
  const {userInfo} = route;
  const [url, setUrl] = useState(
    route.isVN ? Constant.PROFILE_LINK_VI : Constant.PROFILE_LINK_EN,
  );
  const [newUrl, setNewUrl] = useState('');
  const {t, i18n} = useTranslation();

  async function handleRote(key: string) {
    navigation.navigate(key);
  }
  async function handleLogout() {
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }
    ToastAndroid.show(t('logout_success_message'), ToastAndroid.SHORT);
    // await AsyncStorage.clear();
    const keys = await AsyncStorage.getAllKeys();

    // Lọc ra các khóa ngoại trừ khóa mà bạn muốn giữ lại
    const keysToDelete = keys.filter(
      key => !['isVN', 'isNotFirst'].includes(key),
    );

    // Xóa các khóa không cần thiết
    await AsyncStorage.multiRemove(keysToDelete);

    // await AsyncStorage.clear();

    route.getUser();
    route.getCoin();
    route.setSpurlus(0);
    route.setSteps(0);
  }

  async function redirectToWithdraw() {
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('BalanceScreen');
  }

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
     <ScrollView
       contentContainerStyle={{flexGrow: 1}}
       style={{flex: 1, backgroundColor: '#f1efff'}}>
       <View style={styles.container}>
         <ImageBackground
           source={require('../../assets/images/icon/bg_gradient.jpg')}
           resizeMode="cover"
           style={styles.header}>
           <Image
             source={require('../../assets/images/icon/avatar.png')}
             style={styles.profileImage}
           />
           <Text style={styles.username}>
             {userInfo && userInfo.name ? userInfo.name : 'abc123'}
           </Text>
           <Text style={styles.userId}>
             {userInfo && userInfo.code ? userInfo.code : 'abc123'}
           </Text>
           <View style={styles.containerInfo}>
             <View style={styles.balanceContainer}>
               <Text style={styles.balanceText}>{t('balance_coins')}</Text>
               <Text style={styles.balanceAmount}>
                 {route && route.spurlus ? route.spurlus : '0'}
               </Text>
             </View>
             <View style={styles.withdrawContainer}>
               <Text style={styles.withdrawText}>{t('coins_to_vnd')}</Text>
               <TouchableOpacity
                 onPress={() => redirectToWithdraw()}
                 style={styles.withdrawButton}>
                 <Text style={styles.withdrawButtonText}>
                   {t('withdraw_button')}
                 </Text>
               </TouchableOpacity>
             </View>
             <TouchableOpacity onPress={() => handleLogout()}>
               <Image
                 source={require('../../assets/images/icon/logout.png')}
                 style={{width: 50, height: 50}}
               />
             </TouchableOpacity>
           </View>
         </ImageBackground>
         <View style={styles.menuContainer}>
           {menuItems.map((item: any, index) => (
             <TouchableOpacity
               onPress={() => handleRote(item.key)}
               key={index}
               style={styles.menuItem}>
               <Image source={item.image} style={styles.menuIcon} />
               <Text style={styles.menuText}>{t(item.name)}</Text>
             </TouchableOpacity>
           ))}
         </View>
         <View
           style={{
             flex: 1,
             width: '100%',
             height:
               route.webviewHeight > 0
                 ? route.webviewHeight
                 : Dimensions.get('window').height * 5,
             backgroundColor: '#f1efff',
             marginBottom: 80,
           }}>
           <WebView
             domStorageEnabled={true}
             nestedScrollEnabled={false}
             scrollEnabled={false}
             source={{
               uri: url,
             }}
             originWhitelist={['*']}
             style={{flex: 1, backgroundColor: '#f1efff'}}
             onShouldStartLoadWithRequest={navState => {
               setViewWebView(navState.url);

               return false;
             }}
             setSupportMultipleWindows={false}
           />
         </View>
       </View>
     </ScrollView>
   );
};

const menuItems = [
  {
    name: 'earn_money_label',
    image: require('../../assets/images/icon/group39.png'),
    key: 'Home',
  },
  {
    name: 'track_health_label',
    image: require('../../assets/images/icon/Group23.png'),
    key: 'Health',
  },
  {
    name: 'community_section',
    image: require('../../assets/images/icon/Group20.png'),
    key: 'Community',
  },
  {
    name: 'practice_section',
    image: require('../../assets/images/icon/Group13.png'),
    key: 'Practice',
  },
];
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1efff',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#b7e4f9',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004aad',
  },
  userId: {
    fontSize: 14,
    color: '#545454',
    marginBottom: 10,
  },
  containerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    justifyContent: 'center',
  },
  balanceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 16,
    color: '#545454',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ca9848',
    marginLeft: 5,
  },
  withdrawContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  withdrawText: {
    fontSize: 14,
    color: '#545454',
    marginRight: 10,
  },
  withdrawButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuContainer: {
    width: '100%',
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00c2cb',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 30,
  },
  menuIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    objectFit: 'contain',
  },
  menuText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
