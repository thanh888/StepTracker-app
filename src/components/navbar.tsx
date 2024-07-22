import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface TopNavBarProps {
  spurlus: number;
}

const TopNavBar: React.FC<TopNavBarProps> = ({spurlus}) => {
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

  const redirectToWithdraw = () => {
    if (!spurlus) {
      navigation.navigate('Auth');
      return;
    }
    navigation.navigate('BalanceScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.nameApp}>TATASU</Text>
        <Text style={styles.subNameApp}>
          {t('health_and_earning_money_title')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.rightContent}
        onPress={redirectToWithdraw}>
        <Image
          style={styles.moneyIcon}
          source={require('../../assets/images/icon/icon_money.png')}
        />
        <Text style={styles.moneyText}>
          {spurlus ? spurlus : 0} {t('xu')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1efff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftContent: {
    flexDirection: 'column',
  },
  nameApp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#004aad',
  },
  subNameApp: {
    fontSize: 14,
    color: '#545454',
  },
  rightContent: {
    flexDirection: 'row',
    color: '#ffde59',
  },
  moneyIcon: {
    width: 18,
    height: 25,
    marginRight: 4,
  },
  moneyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ca9848',
  },
});

export default TopNavBar;
