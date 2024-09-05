// Example of Splash, Login and Sign Up in React Native
// https://aboutreact.com/react-native-login-and-signup/

// Import React and Component
import {useNavigation} from '@react-navigation/native';
import React, {useState, createRef, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {Constant} from '../utils/constant-base';
import Loader from '../components/loader';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = (props: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setRefcode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');

  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

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

  const handleSubmitButton = async () => {
    setErrortext('');
    if (!username || !name || !password || !confirmPassword) {
      setErrortext(t('information_blank_error'));
      return;
    }
    if (password !== confirmPassword) {
      setErrortext(t('password_mismatch_error'));
    }

    //Show Loader
    var dataToSend: any = {
      name,
      username,
      password,
      code,
    };

    setLoading(true);

    fetch(Constant.BASE_URL + '/checkUsername', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(async responseJson => {
        //Hide Loader
        if (responseJson.msg === 'Continue register') {
          await register(dataToSend);
        } else {
          setLoading(false);
          setErrortext(t('username_exists_error'));
        }
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  const register = async (dataToSend: any) => {
    fetch(Constant.BASE_URL + '/register', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //Hide Loader
        setLoading(false);
        if (!responseJson.error) {
          navigation.replace('Auth');
        } else {
          setErrortext(responseJson.msg);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  };

  return (
    <View style={{flex: 1, backgroundColor: '#307ecc'}}>
      <Loader loading={loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View style={{alignItems: 'center'}}>
          <Image
            source={require('../../assets/images/icon/register.png')}
            style={{
              width: '50%',
              height: 150,
              resizeMode: 'contain',
              marginVertical: 20,
            }}
          />
        </View>
        <KeyboardAvoidingView enabled>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={setUsername}
              underlineColorAndroid="#f000"
              placeholder={t('username')}
              selectionColor={'#fff'}
              placeholderTextColor="#8b9cb5"
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={setName}
              underlineColorAndroid="#f000"
              selectionColor={'#fff'}
              placeholder={t('fullname')}
              placeholderTextColor="#8b9cb5"
              keyboardType="default"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={setPassword}
              underlineColorAndroid="#f000"
              placeholder={t('password')}
              placeholderTextColor="#8b9cb5"
              selectionColor={'#fff'}
              returnKeyType="next"
              secureTextEntry={true}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={setConfirmPassword}
              underlineColorAndroid="#f000"
              placeholder={t('confirm_password')}
              selectionColor={'#fff'}
              placeholderTextColor="#8b9cb5"
              secureTextEntry={true}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={setRefcode}
              underlineColorAndroid="#f000"
              selectionColor={'#fff'}
              placeholder={t('referral_code_optional')}
              placeholderTextColor="#8b9cb5"
              keyboardType="default"
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
          {errortext != '' ? (
            <Text style={styles.errorTextStyle}>{errortext}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonStyle}
            activeOpacity={0.5}
            onPress={handleSubmitButton}>
            <Text style={styles.buttonTextStyle}>{t('register_button')}</Text>
          </TouchableOpacity>
          <Text
            style={styles.registerTextStyle}
            onPress={() => navigation.navigate('LoginScreen')}>
            {t('login_here')}
          </Text>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};
export default RegisterScreen;

const styles = StyleSheet.create({
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 10,
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
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    // paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  successTextStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    padding: 30,
  },
  registerTextStyle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'center',
    padding: 10,
  },
});
