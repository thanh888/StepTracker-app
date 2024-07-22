import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constant} from '../utils/constant-base';
import moment from 'moment';

export const statusAttendance: any = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];
export default class StorageService {
  static dayActives: number = 0;
  static date = moment(new Date()).format('DD/MM/YYYY');

  static async saveUser(user: any) {
    await AsyncStorage.setItem(
      Constant.SHARED_PREFERENCES_USER_KEY,
      JSON.stringify(user),
    );
    return;
  }

  static async saveAttendance(
    attendance: any,
    dayActives: number,
    dayCheck: string,
  ) {
    await Promise.all([
      AsyncStorage.setItem(Constant.ATTENDANCE, JSON.stringify(attendance)),
      AsyncStorage.setItem(Constant.DAY_ACTIVE, dayActives.toString()),
      AsyncStorage.setItem(Constant.DAY_CHECK, dayCheck.toString()),
    ]);
  }

  static async getAttendance() {
    const today = moment(new Date()).format('DD/MM/YYYY');
    let attendance;
    let dayActives;
    let dayCheck;
    await Promise.all([
      AsyncStorage.getItem(Constant.ATTENDANCE).then(value => {
        if (value) {
          attendance = JSON.parse(value);
        }
      }),
      AsyncStorage.getItem(Constant.DAY_ACTIVE).then(value => {
        if (value) {
          dayActives = parseInt(value);
        }
      }),
      AsyncStorage.getItem(Constant.DAY_CHECK).then(value => {
        if (value) {
          dayCheck = value;
        }
      }),
    ]);

    if (dayCheck !== today && dayActives === 7) {
      this.getAttendance();
      return;
    }

    return {attendance, dayActives, dayCheck};
  }

  static async getUser() {
    let userInfo;
    await AsyncStorage.getItem(Constant.SHARED_PREFERENCES_USER_KEY).then(
      value => {
        if (value) {
          userInfo = JSON.parse(value);
        }
      },
    );
    return userInfo;
  }

  static async saveStep(step: number) {
    await AsyncStorage.setItem(Constant.STEP, step.toString());
  }
  static async getStep() {
    return await AsyncStorage.getItem(Constant.STEP);
  }

  static async saveCoinLocal(spurlus: number) {
    await AsyncStorage.setItem(Constant.COIN, spurlus.toString());

    StorageService.saveCoinServer(spurlus);
  }

  static async getCoinLocal() {
    return await AsyncStorage.getItem(Constant.COIN);
  }

  static async saveDateStep(date: string) {
    await AsyncStorage.setItem('DATE_STEP', date);
  }
  static async getDateStep() {
    return await AsyncStorage.getItem('DATE_STEP');
  }

  static async saveCoinServer(spurlus: number) {
    const userInfo: any = await this.getUser();

    let dataToSend: any = {
      idUser: userInfo?.id,
      spurlus: parseFloat(spurlus.toString()),
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
        if (responseJson.msg === 'Success') {
          await StorageService.saveUser({
            ...userInfo,
            spurlus: spurlus,
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  static async getCoinServer() {
    const token = await AsyncStorage.getItem(Constant.TOKEN);
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
        if (responseJson[0].spurlus) {
          await AsyncStorage.setItem(
            Constant.COIN,
            responseJson[0].spurlus.toString(),
          );
          return;
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
}
