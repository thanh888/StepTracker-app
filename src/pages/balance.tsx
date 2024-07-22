import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ToastAndroid,
  Linking,
} from 'react-native';
import StorageService from '../common/storage-service';
import {Constant} from '../utils/constant-base';
import Loader from '../components/loader';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BalanceActivity = () => {
  const [userInfo, setUserInfo] = useState<any>({});
  const [money, setMoney] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVN, setIsVN] = useState(true);
  const [spurlus, setCoin] = useState(0);

  const {t, i18n} = useTranslation();

  async function getCoin() {
    const value = await StorageService.getCoinLocal();
    if (value) {
      if (isVN) {
        setCoin(parseFloat(value));
      } else {
        setCoin(parseFloat((parseFloat(value) / 20000).toFixed(3)));
      }
    }
  }

  useEffect(() => {
    getCoin();
  }, [isVN]);

  useEffect(() => {
    AsyncStorage.getItem('isVN').then((value: any) => {
      if (JSON.parse(value)) {
        setIsVN(true);
      } else {
        setIsVN(false);
      }
    });
  }, []);

  async function handleWithdraw() {
    if (money > userInfo.spurlus) {
      ToastAndroid.show(t('insufficient_balance'), ToastAndroid.SHORT);
      return;
    }
    if (!money) {
      ToastAndroid.show(t('enter_withdraw_amount'), ToastAndroid.SHORT);
      return;
    }

    if (!isVN) {
      Linking.openURL(Constant.BALEN_LINK_EN);
    } else {
      Linking.openURL(Constant.BALEN_LINK_VI);
    }
    ToastAndroid.show(t('withdraw_success'), ToastAndroid.LONG);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Loader loading={loading} />
      <View style={styles.centerContainer}>
        <Text style={styles.myWalletText}>{t('my_wallet')}</Text>
        <Text style={styles.balanceText}>{t('balance_with_conversion')}</Text>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceAmount}>{spurlus ? spurlus : 0}</Text>
          <Text style={styles.currencyText}>{t('currency_vnd')}</Text>
        </View>

        <Text style={styles.enterMoneyText}>{t('enter_money_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          value={money && money > 0 ? money.toString() : ''}
          keyboardType="decimal-pad"
          onChangeText={value => setMoney(parseFloat(value))}
        />

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => handleWithdraw()}>
          <Text style={styles.confirmButtonText}>{t('withdraw_button')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00c2cb',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 30,
    height: 30,
    objectFit: 'fill',
    tintColor: 'white',
  },
  headerText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  centerContainer: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  myWalletText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  currencyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enterMoneyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    elevation: 10,
    marginBottom: 16,
  },
  confirmButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ca9848',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BalanceActivity;
