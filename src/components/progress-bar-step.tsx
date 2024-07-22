import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

const ProgressBar = (steps: any) => {
  const stepWidth = Dimensions.get('window').width * 0.8; // Adjust the width as needed
  const progress = steps.steps / 10000; // Assuming the maximum steps is 11000
  const progressWidth = stepWidth * progress;
  const {t, i18n} = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('earning_money_by_walking_title')}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, {width: progressWidth}]} />
        <View style={styles.stepMarker}>
          <Text style={styles.stepText}></Text>
          <Text style={styles.stepLabel}>0</Text>
        </View>
        <View style={[styles.stepMarker, {left: '30%'}]}>
          <Text style={styles.stepText}>3000</Text>
          <Text style={styles.stepLabel}>{t('steps_label')}</Text>
        </View>
        <View style={[styles.stepMarker, {left: '60%'}]}>
          <Text style={styles.stepText}>6000</Text>
          <Text style={styles.stepLabel}>{t('steps_label')}</Text>
        </View>
        <View style={[styles.stepMarker, {right: 0}]}>
          <Text style={styles.stepText}>10000</Text>
          <Text style={styles.stepLabel}>{t('steps_label')}</Text>
        </View>
      </View>
      <View style={styles.xuContainer}>
        <View style={styles.stepXu}>
          <Text style={styles.stepLabel}>0</Text>
          <Text style={styles.stepText}></Text>
        </View>
        <View style={[styles.stepXu, {left: '30%'}]}>
          <Text style={styles.stepText}>3000</Text>
          <Text style={styles.stepLabel}>{t('coin_label')}</Text>
        </View>
        <View style={[styles.stepXu, {left: '60%'}]}>
          <Text style={styles.stepText}>6000</Text>
          <Text style={styles.stepLabel}>{t('coin_label')}</Text>
        </View>
        <View style={[styles.stepXu, {right: 0}]}>
          <Text style={styles.stepText}>10000</Text>
          <Text style={styles.stepLabel}>{t('coin_label')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#000000',
  },
  progressContainer: {
    width: '80%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    height: '90%',
    backgroundColor: '#00c3ff',
    borderRadius: 10,
  },
  stepMarker: {
    position: 'absolute',
    alignItems: 'center',
    top: -30,
  },
  stepXu: {
    position: 'absolute',
    alignItems: 'center',
    // top: -30,
  },
  stepText: {
    fontSize: 10,
    color: '#00c3ff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#8b9cb5',
  },
  xuContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 4,
  },
  xuText: {
    fontSize: 10,
    color: '#8b9cb5',
  },
});

export default ProgressBar;
