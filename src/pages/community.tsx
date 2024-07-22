import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
  Clipboard,
  Linking,
  BackHandler,
  Modal,
} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {Constant} from '../utils/constant-base';
import StorageService, {statusAttendance} from '../common/storage-service';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Loader from '../components/loader';
const {width} = Dimensions.get('window');
import Share from 'react-native-share';
import {useTranslation} from 'react-i18next';
const CommunityScreen = (route: any) => {
  const {userInfo} = route;
  const [attendance, setAttendance] = useState<any>();
  const [dayActives, setDayActives] = useState(0);
  const [dayCheck, setDayCheck] = useState('');
  const [loading, setLoading] = useState(false);
  const [introducer, setIntroducer] = useState<any[]>([]);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    getIntroducer();
  }, []);

  const getIntroducer = async () => {
    // console.log(userInfo);

    if (userInfo) {
      await fetch(Constant.BASE_URL_REWARD + '/getFriendIntroduced', {
        method: 'POST',
        body: JSON.stringify({idUser: userInfo.id}),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          if (responseJson && responseJson.msg) {
            setIntroducer(responseJson.msg);
          }
        });
    }
  };
  const [url, setUrl] = useState(
    route.isVN ? Constant.COMMUNITY_LINK_VI : Constant.COMMUNITY_LINK_EN,
  );

  const navigation = useNavigation();

  let date = moment(new Date()).format('DD/MM/YYYY');

  const imageMap = {
    'tatasu-tshirt.png': require('../../assets/images/icon/tatasu-tshirt.png'),
    'pngwing.png': require('../../assets/images/icon/pngwing.png'),
  };

  const getImageSource = (index: number) => {
    return attendance && attendance[index]
      ? imageMap['tatasu-tshirt.png']
      : imageMap['pngwing.png'];
  };

  const getAttendance = async () => {
    const value = await StorageService.getAttendance();
    if (value) {
      setAttendance(value.attendance);
      setDayActives(value.dayActives || 0);
      setDayCheck(value.dayCheck || 'today');
    }
  };

  useEffect(() => {
    getAttendance();
  }, []);

  async function handleAttendance() {
    if (dayCheck.toString() === date.toString()) {
      ToastAndroid.show(t('return_tomorrow_message'), ToastAndroid.SHORT);
      return;
    }
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }

    setLoading(true);

    let dataToSend: any = {
      idUser: userInfo.id,
      spurlus: route.isVN ? route.spurlus + 300 : route.testValue + 300,
    };

    await fetch(Constant.BASE_URL + '/updateSpurlus', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(async responseJson => {
        if (responseJson.msg.toString() === 'Success') {
          setLoading(false);
          attendance[dayActives] = true;
          await StorageService.saveAttendance(
            attendance,
            dayActives + 1,
            date.toString(),
          );
          await StorageService.saveUser({
            ...userInfo,
            spurlus: dataToSend.spurlus,
          });
          await StorageService.saveCoinLocal(dataToSend.spurlus);
          route.getCoin();
          ToastAndroid.show(t('check_in_success_message'), ToastAndroid.SHORT);
          getAttendance();
        }
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  }

  function handleCopyRefCode() {
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }
    Clipboard.setString(userInfo.code);
    ToastAndroid.show(t('copied_message'), ToastAndroid.SHORT);
  }

  function handleCopyLink() {
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }
    const shareAppOptions = {
      title: t('health_and_earning_money_title'),
      message: t('mess_install'),
      url: 'https://play.google.com/store/apps/details?id=com.stptrkertts.steptrackertatasu',
    };
    try {
      Share.open(shareAppOptions)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    } catch {}
  }

  function redirectToWithdraw() {
    if (!userInfo) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('BalanceScreen');
  }

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
    <ScrollView style={{flex: 1, backgroundColor: '#f1efff'}}>
      <Loader loading={loading} />

      <View style={styles.container}>
        <View style={styles.rewardContainer}>
          <Text style={styles.sectionTitle}>{t('check_in_gift')}</Text>
          <View style={styles.daysContainer}>
            {attendance
              ? attendance.map((value: boolean, index: number) => (
                  <TouchableOpacity key={index} style={styles.dayBox}>
                    <Image
                      source={getImageSource(index)}
                      style={{objectFit: 'cover', width: '60%', height: '60%'}}
                    />
                  </TouchableOpacity>
                ))
              : statusAttendance.map((value: boolean, index: number) => (
                  <TouchableOpacity key={index} style={styles.dayBox}>
                    <Image
                      source={require('../../assets/images/icon/pngwing.png')}
                      style={{objectFit: 'cover', width: '60%', height: '60%'}}
                    />
                  </TouchableOpacity>
                ))}
          </View>
          <TouchableOpacity
            onPress={() => handleAttendance()}
            style={styles.attendanceButton}>
            <Text style={styles.attendanceButtonText}>
              {t('check_in_label')}
            </Text>
          </TouchableOpacity>
          <View style={styles.promoContainer}>
            <View style={styles.topPromoInfo}>
              <Text style={styles.promoText}>
                {t('balance_label')}
                {route.isVN ? route.spurlus : route.testValues}{' '}
                {t('currency_vnd')}
              </Text>
              <TouchableOpacity
                onPress={() => redirectToWithdraw()}
                style={styles.withdrawButton}>
                <Text style={styles.withdrawButtonText}>
                  {t('withdraw_now_button')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.promoDetail}>{t('referral_reward_info')}</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{t('referral_code_label')}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text
                  style={styles.copyButtonText}
                  onPress={() => handleCopyRefCode()}>
                  {userInfo && userInfo.code ? userInfo.code : 'JBJP'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>
                {t('app_download_link_label')}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => handleCopyLink()}>
                <Text style={styles.copyButtonText}>{t('share_button')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.note}>{t('referral_code_note')}</Text>
          </View>
          <View style={styles.listButton}>
            <Text style={styles.listButtonText}>
              {t('referred_list_title')}
            </Text>
            {introducer && introducer.length > 0 ? (
              introducer.length > 5 ? (
                <ScrollView
                  style={{flex: 1, width: '100%', height: 180}}
                  nestedScrollEnabled={true}>
                  <View style={styles.introducerContainer}>
                    {introducer.map((item: any, index: number) => (
                      <View style={styles.introducerInfo} key={index}>
                        <Text style={styles.introducerText}>{index + 1}</Text>
                        <Text style={styles.introducerText}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.introducerContainer}>
                  {introducer.map((item: any, index: number) => (
                    <View style={styles.introducerInfo} key={index}>
                      <Text style={styles.introducerText}>{index + 1}</Text>
                      <Text style={styles.introducerText}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              )
            ) : (
              <Text style={styles.subText}>{t('no_referrals_message')}</Text>
            )}
          </View>
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            domStorageEnabled={true}
            source={{
              uri: url,
            }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1efff',
    alignItems: 'center',
    padding: 10,
  },
  rewardContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    alignContent: 'flex-start',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  dayBox: {
    width: (width * 0.9) / 7,
    height: 80,
    backgroundColor: '#c3a8a8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004aad',
  },
  introText: {
    fontSize: 14,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 20,
  },
  promoContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  topPromoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  promoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  attendanceButton: {
    backgroundColor: '#8bd5e4',
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderRadius: 15,
    marginBottom: 10,
  },
  attendanceButtonText: {
    color: '#ca9848',
    fontSize: 16,
    fontWeight: 'bold',
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
  promoDetail: {
    fontSize: 14,
    color: '#545454',
    textAlign: 'center',
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  codeText: {
    fontSize: 14,
    color: '#545454',
  },
  copyButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  copyButtonText: {
    color: '#004aad',
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
  listButton: {
    backgroundColor: '#d3b0e0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'column',
  },
  listButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 12,
    color: '#ffffff',
  },
  introducerContainer: {
    width: '70%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 'auto',
    gap: 5,
    flex: 1,
  },
  introducerInfo: {
    height: 32,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    borderStyle: 'solid',
  },
  introducerText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  webviewContainer: {
    width: '100%',
    backgroundColor: '#f1efff',
    height: Dimensions.get('window').height * 1.5, // Adjust height as needed
    paddingBottom: 350,
    marginBottom: 400,
  },
});

export default CommunityScreen;
