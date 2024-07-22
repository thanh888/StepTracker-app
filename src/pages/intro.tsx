import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View, StyleSheet, Image, Text} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {Constant} from '../utils/constant-base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {t} from 'i18next';
import {useTranslation} from 'react-i18next';

const IntroScreen = () => {
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

  const [currentLanguage, setLanguage] = useState('en');

  const changeLanguage = (value: string) => {
    console.log(value);

    i18n
      .changeLanguage(value)
      .then(() => setLanguage(value))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    AsyncStorage.getItem('isVN').then((value: any) => {
      console.log(JSON.parse(value));
      if (JSON.parse(value)) {
        changeLanguage('vi');
      } else {
        changeLanguage('en');
      }
    });
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([
    {
      id: 1,
      image: require('../../assets/images/icon/intro1.png'),
      title: 'Health',
      description: 'activity_tracking_support',
    },
    {
      id: 2,
      image: require('../../assets/images/icon/intro2.png'),
      title: 'Fitness',
      description: 'activity_tracking_support',
    },
    {
      id: 3,
      image: require('../../assets/images/icon/intro3.png'),
      title: 'Everyday',
      description: 'activity_tracking_support',
    },
  ]);

  const nextStep = () => {
    setCurrentStep(currentStep >= 2 ? 2 : currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep <= 0 ? 0 : currentStep - 1);
  };

  const doneStep = () => {
    AsyncStorage.setItem('isNotFirst', 'true');
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <Image
        source={steps[currentStep].image}
        style={styles.stepImage}
        resizeMode="cover"
      />
      <View style={styles.stepIndicatorView}>
        {steps.map((step, index) => (
          <View
            key={step.id} // Adding unique key
            style={{
              ...styles.stepIndicator,
              width: currentStep === index ? 40 : 30,
              backgroundColor: currentStep === index ? '#A838D7' : 'gray',
            }}
          />
        ))}
      </View>
      <Text style={styles.title}>{steps[currentStep].title}</Text>
      <Text style={styles.description}>
        {t(steps[currentStep].description)}
      </Text>
      {currentStep === 2 ? (
        <View style={styles.navigationDoneView}>
          <TouchableOpacity onPress={doneStep} style={styles.buttonLetGo}>
            <Text style={styles.navigationBtnLetGoTxt}>{t('let_go')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={doneStep} style={styles.buttonLetStarted}>
            <Text style={styles.navigationBtnLetStartedTxt}>
              {t('let_start')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.navigationView}>
          {currentStep > 0 ? (
            <TouchableOpacity
              onPress={prevStep}
              style={{
                ...styles.navigationBtn,
                borderTopEndRadius: 20,
                borderBottomEndRadius: 20,
              }}>
              <Text style={styles.navigationBtnTxt}>{t('back')}</Text>
            </TouchableOpacity>
          ) : (
            <View></View>
          )}
          <TouchableOpacity
            onPress={nextStep}
            style={{
              ...styles.navigationBtn,
              borderTopStartRadius: 20,
              borderBottomStartRadius: 20,
            }}>
            <Text style={styles.navigationBtnTxt}>{t('next')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1efff',
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
    marginTop: 20,
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
