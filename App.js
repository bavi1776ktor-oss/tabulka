import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
const TRIAL_DURATION_SECONDS = 7 * 24 * 60 * 60;
const MY_TARGET_EMAIL = "kluh2026@gmail.com"; 
const FIREBASE_REST_URL = "https://my-apk-protection-default-rtdb.firebaseio.com";

const translations = {
  ru: {
    locale: 'ru-RU',
    trialExpiredTitle: "Срок пробного тестирования (7 дней) окончен",
    requestFullVersion: "Запросить полную версию:",
    placeholderName: "Ваше Имя",
    placeholderPhone: "Телефон",
    btnSendRequest: "Отправить запрос",
    noticeText: "Введите Ваше имя и телефон. Ожидайте, Вам перезвонят.",
    enterKeyTitle: "Ввести постоянный ключ:",
    placeholderKey: "Постоянный ключ активации",
    btnActivate: "Активировать",
    btnExit: "Выход",
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    statsWorkDays: "Рабочих дней",
    statsWeekendDays: "Выходных дней",
    statsTotalSum: "Сумма",
    btnArchive: "Архив",
    btnSavePdf: "Сохранить PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Часы",
    btnSave: "Сохранить",
    btnCancel: "Отмена",
    toastTrialActive: "⏱ АКТИВЕН ТЕСТОВЫЙ ПЕРИОД (ОСТАЛОСЬ {days} ДН.)",
    errorTitle: "Ошибка",
    networkErrorTitle: "Ошибка сети",
    networkErrorMsg: "Не удалось обновить данные",
    hourUnit: "ч."
  },
  uk: {
    locale: 'uk-UA',
    trialExpiredTitle: "Термін дії пробного періоду (7 днів) закінчився",
    requestFullVersion: "Надіслати запит на повну версію:",
    placeholderName: "Ваше Ім'я",
    placeholderPhone: "Телефон",
    btnSendRequest: "Надіслати запит",
    noticeText: "Введіть Ваше ім'я та телефон. Очікуйте, Вам зателефонують.",
    enterKeyTitle: "Ввести ключ активації:",
    placeholderKey: "Ключ активації (постійний)",
    btnActivate: "Активувати",
    btnExit: "Вихід",
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    statsWorkDays: "Робочих днів",
    statsWeekendDays: "Вихідних днів",
    statsTotalSum: "Сума",
    btnArchive: "Архів",
    btnSavePdf: "Зберегти PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Години",
    btnSave: "Зберегти",
    btnCancel: "Скасувати",
    toastTrialActive: "⏱ АКТИВНИЙ ТЕСТОВИЙ ПЕРІОД (ЗАЛИШИЛОСЯ {days} ДН.)",
    errorTitle: "Помилка",
    networkErrorTitle: "Помилка мережі",
    networkErrorMsg: "Не вдалося оновити дані",
    hourUnit: "год."
  }
};

export default function App() {
  const [lang, setLang] = useState('ru');
  const [password, setPassword] = useState(null); 
  const [isAuthChecking, setIsAuthChecking] = useState(true); 
  const [trialNotice, setTrialNotice] = useState(false); 
  const [daysLeft, setDaysLeft] = useState(0);

  const t = translations[lang || 'ru'];

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const savedLang = await AsyncStorage.getItem('@tabulka_lang');
    if (savedLang) setLang(savedLang);
    
    await checkAuth();
  };

  const checkAuth = async () => {
    const deviceId = 'dev_test_id'; // Для примера
    try {
      const trialResponse = await fetch(`${FIREBASE_REST_URL}/trial_devices/${deviceId}.json`);
      const trialData = await trialResponse.json();
      
      if (trialData) {
        const timePassed = Math.floor(Date.now() / 1000) - trialData.startedAt;
        const remainingSeconds = TRIAL_DURATION_SECONDS - timePassed;
        
        if (remainingSeconds > 0) {
          const dLeft = Math.ceil(remainingSeconds / (24 * 60 * 60));
          setDaysLeft(dLeft);
          setTrialNotice(true); // Включаем показ
          setTimeout(() => setTrialNotice(false), 5000); // Автоскрытие через 5 сек
        }
      }
    } catch (e) {
      console.log("Auth error");
    } finally {
      setIsAuthChecking(false);
    }
  };

  if (isAuthChecking) return <ActivityIndicator style={{flex: 1}} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {trialNotice && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            {t.toastTrialActive.replace('{days}', daysLeft)}
          </Text>
        </View>
      )}
      <View style={styles.container}>
        <Text>Приложение загружено</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  toast: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    right: 20, 
    backgroundColor: '#F59E0B', 
    padding: 15, 
    borderRadius: 10, 
    zIndex: 999 
  },
  toastText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' }
});
