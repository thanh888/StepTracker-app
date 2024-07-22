import React, {useState, createRef, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  Image,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

import Loader from '../components/loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constant} from '../utils/constant-base';
import {useNavigation} from '@react-navigation/native';
import StorageService, {statusAttendance} from '../common/storage-service';
import {useTranslation} from 'react-i18next';
import '../common/i18n';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

  const handleSubmitPress = async () => {
    setErrortext('');
    if (!username) {
      setErrortext(t('username_empty_error'));
      return;
    }
    if (!userPassword) {
      setErrortext(t('password_empty_error'));
      return;
    }
    setLoading(true);
    let dataToSend: any = {
      username: username,
      password: userPassword,
    };

    await fetch(Constant.BASE_URL + '/login', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(async responseJson => {
        if (responseJson.token) {
          await AsyncStorage.setItem(Constant.TOKEN, responseJson.token);
          await getUser(responseJson.token.toString());
          return;
        } else {
          setErrortext(t('incorrect_credentials_error'));
          setLoading(false);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  const getUser = async (token: string) => {
    if (!token) return;

    await fetch(Constant.BASE_URL + '/getUser', {
      method: 'POST',
      body: JSON.stringify({token: token}),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(async responseJson => {
        if (responseJson) {
          setLoading(false);
          await StorageService.saveUser(responseJson[0]);
          await StorageService.saveAttendance(statusAttendance, 0, 'today');
          if (responseJson[0].spurlus) {
            await AsyncStorage.setItem(
              Constant.COIN,
              responseJson[0].spurlus.toString(),
            );
          }
          await StorageService.saveDateStep('today');
          navigation.replace('MenuNavigation');
          return;
        }
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  const [currentLanguage, setLanguage] = useState('en');

  const changeLanguage = (value: string) => {
    i18n
      .changeLanguage(value)
      .then(() => setLanguage(value))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    AsyncStorage.getItem('isVN').then((value: any) => {
      if (JSON.parse(value)) {
        changeLanguage('vi');
      } else {
        changeLanguage('en');
      }
    });
  }, []);

  return (
    <View style={styles.mainBody}>
      <Loader loading={loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View>
          <KeyboardAvoidingView enabled>
            <View style={{alignItems: 'center'}}>
              <Image
                source={require('../../assets/images/icon/login.png')}
                style={{
                  width: '60%',
                  height: 140,
                  resizeMode: 'contain',
                  margin: 30,
                  objectFit: 'contain',
                }}
              />
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                style={styles.inputStyle}
                onChangeText={(Username: string) => setUsername(Username)}
                placeholder={t('username')}
                placeholderTextColor="#8b9cb5"
                autoCapitalize="none"
                keyboardType="default"
                returnKeyType="next"
                selectionColor={'#fff'}
                underlineColorAndroid="#f000"
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                style={styles.inputStyle}
                onChangeText={UserPassword => setUserPassword(UserPassword)}
                placeholder={t('password')}
                placeholderTextColor="#8b9cb5"
                keyboardType="default"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={false}
                selectionColor={'#fff'}
                secureTextEntry={true}
                underlineColorAndroid="#f000"
                returnKeyType="next"
              />
            </View>
            {errortext != '' ? (
              <Text style={styles.errorTextStyle}>{errortext}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.buttonStyle}
              activeOpacity={0.5}
              onPress={handleSubmitPress}>
              <Text style={styles.buttonTextStyle}>{t('login_button')} </Text>
            </TouchableOpacity>
            <Text
              style={styles.registerTextStyle}
              onPress={() => navigation.navigate('RegisterScreen')}>
              {t('register_here')}
            </Text>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#307ecc',
    alignContent: 'center',
  },
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#7DE24E',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#7DE24E',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 25,
    justifyContent: 'center',
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  registerTextStyle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'center',
    padding: 10,
  },
  errorTextStyle: {
    color: '#ff0000',
    textAlign: 'center',
    fontSize: 14,
  },
});
