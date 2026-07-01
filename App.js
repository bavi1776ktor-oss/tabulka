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
import * as Application from 'expo-application';

const { width } = Dimensions.get('window');
const TRIAL_DURATION_SECONDS = 7 * 24 * 60 * 60;
const MY_TARGET_EMAIL = "kluh2026@gmail.com"; 

const FIREBASE_REST_URL = "https://my-apk-protection-default-rtdb.firebaseio.com";

const translations = {
  ru: {
    locale: 'ru-RU',
    trialExpiredTitle: "Срок пробного тестирования (7 дней) окончен",
    requestFullVersion: "Запросить полную версию:",
    requestFullVersionHeader: "Запросить полную версию",
    placeholderName: "Ваше Имя",
    placeholderPhone: "Телефон",
    btnSendRequest: "Отправить запрос",
    noticeText: "Введите Ваше имя и телефон. Ожайдайте, Вам перезвонят.",
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
    btnClose: "Закрыть",
    archiveEarnings: "Заработок",
    toastTrialActive: "⏱ АКТИВЕН ТЕСТОВЫЙ ПЕРИОД (ОСТАЛОСЬ {days} ДН.)",
    pdfTitle: "Отчет — {month}",
    pdfStatusWork: "Рабочий",
    pdfStatusWeekend: "Выходной",
    pdfColDay: "День",
    pdfColStatus: "Статус",
    pdfColRate: "Ставка",
    pdfColHours: "Часы",
    pdfColSum: "Сумма",
    alertExitTitle: "Выход",
    alertExitMessage: "Выйти из профиля?",
    alertExitCancel: "Отмена",
    alertFormatError: "Неверный формат",
    alertFormatShort: "Слишком короткий ключ активации.",
    alertSuccessTitle: "Успешно",
    alertSuccessMessage: "Приложение успешно активировано!",
    alertKeyUsed: "Этот ключ уже закреплен за другим устройством!",
    alertKeyBlock: "Этот ключ заблокирован администратором.",
    alertKeyNotFound: "Ключ не найден в базе данных.",
    alertInputError: "Введите корректные числа",
    alertPdfError: "Не удалось создать PDF",
    alertRequestSaved: "Данные записаны в базу. На вашем устройстве не найдено настроенное приложение почты для прямой отправки.",
    alertMailError: "Запрос успешно сохранен в Firebase, но не удалось запустить почтовое приложение.",
    alertFillFields: "Пожалуйста, заполните Имя и Телефон для связи",
    btnToday: "Сегодня",
    noRecordsText: "Нет записей за этот день",
    subSectionTitle: "Работы за день:",
    dayTotalText: "Всего за день:",
    btnAddRecord: "+ Добавить запись",
    selectLangTitle: "Выберите язык (Рус)",
    errorTitle: "Ошибка",
    networkErrorTitle: "Ошибка сети",
    networkErrorMsg: "Не удалось обновить данные из базы",
    activationErrorTitle: "Ошибка активации",
    lockTitle: "Блокировка",
    noticeTitle: "Уведомление",
    networkSendError: "Не удалось отправить данные",
    hourUnit: "ч."
  },
  uk: {
    locale: 'uk-UA',
    trialExpiredTitle: "Термін дії пробного періоду (7 днів) закінчився",
    requestFullVersion: "Надіслати запит на повну версію:",
    requestFullVersionHeader: "Запитувати повну версію",
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
    btnClose: "Закрити",
    archiveEarnings: "Заробіток",
    toastTrialActive: "⏱ АКТИВНИЙ ТЕСТОВИЙ ПЕРИОД (ЗАЛИШИЛОСЯ {days} ДН.)",
    pdfTitle: "Звіт — {month}",
    pdfStatusWork: "Робочий",
    pdfStatusWeekend: "Виходний",
    pdfColDay: "День",
    pdfColStatus: "Статус",
    pdfColRate: "Ставка",
    pdfColHours: "Години",
    pdfColSum: "Сума",
    alertExitTitle: "Вихід",
    alertExitMessage: "Вийти з профілю?",
    alertExitCancel: "Скасувати",
    alertFormatError: "Неправильний формат",
    alertFormatShort: "Занадто короткий ключ активації.",
    alertSuccessTitle: "Успішно",
    alertSuccessMessage: "Додаток успешно активовано!",
    alertKeyUsed: "Цей ключ вже закріплений за іншим пристроєм!",
    alertKeyBlock: "Цей ключ заблокований адміністратором.",
    alertKeyNotFound: "Ключ не знайдено в базі даних.",
    alertInputError: "Введіть коректні числа",
    alertPdfError: "Не вдалося створити PDF",
    alertRequestSaved: "Дані записані в базу. На вашому пристрої не знайдено налаштованого поштового додатка для прямої відправки.",
    alertMailError: "Запит успішно збережено в Firebase, но не вдалося запустити поштовий додаток.",
    alertFillFields: "Будь ласка, заповніть Ім'я та Телефон для зв'язку",
    btnToday: "Сьогодні",
    noRecordsText: "Немає записів за цей день",
    subSectionTitle: "Роботи за день:",
    dayTotalText: "Всього за день:",
    btnAddRecord: "+ Добавить запись",
    selectLangTitle: "Оберіть мову (Укр)",
    errorTitle: "Помилка",
    networkErrorTitle: "Помилка мережі",
    networkErrorMsg: "Не вдалося оновити дані з бази",
    activationErrorTitle: "Помилка активації",
    lockTitle: "Блокування",
    noticeTitle: "Сповіщення",
    networkSendError: "Не вдалося надіслати дані",
    hourUnit: "год."
  }
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const [password, setPassword] = useState(null); 
  const [inputPassword, setInputPassword] = useState(''); 
  const [isAuthChecking, setIsAuthChecking] = useState(true); 
  const [isLoadingData, setIsLoadingData] = useState(false); 

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workData, setWorkData] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false); 
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');

  const [trialNotice, setTrialNotice] = useState(false); 
  const [isTrialExpired, setIsTrialExpired] = useState(false); 
  const [daysLeft, setDaysLeft] = useState(7);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+38 (');

  const t = translations[lang || 'ru'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    initLanguageAndAuth();
    return () => clearInterval(timer);
  }, []);

  const initLanguageAndAuth = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@tabulka_lang');
      if (savedLang === 'ru' || savedLang === 'uk') {
        setLang(savedLang);
      } else {
        setLangModalVisible(true);
      }
    } catch (e) {
      setLang('ru');
    }
    checkSavedPassword();
  };

  const getOrCreateDeviceId = async () => {
    try {
      const nativeId = await Application.getAndroidIdAsync();
      if (nativeId) {
        return nativeId;
      }
      return "DEVICE_FALLBACK_" + Date.now();
    } catch (e) {
      return "DEVICE_FALLBACK_" + Date.now();
    }
  };

  const handleSelectLanguage = async (selectedLang) => {
    try {
      await AsyncStorage.setItem('@tabulka_lang', selectedLang);
      setLang(selectedLang);
      setLangModalVisible(false);
    } catch (e) {
      Alert.alert(translations[selectedLang || 'ru'].errorTitle, "Error saving language");
    }
  };

  const fetchWorkData = async (currentPassword) => {
    if (!currentPassword) return;
    setIsLoadingData(true);
    try {
      const viewYear = currentMonth.getFullYear();
      const viewMonth = currentMonth.getMonth();
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPassword}/${viewYear}_${viewMonth}.json`);
      const data = await response.json();
      
      if (data) {
        const normalized = {};
        Object.keys(data).forEach(dateKey => {
          const dayContent = data[dateKey];
          if (dayContent && typeof dayContent === 'object' && dayContent.records) {
            normalized[dateKey] = dayContent;
          } else if (dayContent && (dayContent.rate || dayContent.hours)) {
            normalized[dateKey] = {
              records: [{
                id: 'legacy_' + Date.now() + '_' + Math.random(),
                rate: parseFloat(dayContent.rate) || 0,
                hours: parseFloat(dayContent.hours) || 0
              }]
            };
          } else {
            normalized[dateKey] = { records: [] };
          }
        });
        setWorkData(normalized);
      } else {
        setWorkData({});
      }
    } catch (error) {
      Alert.alert(t.networkErrorTitle, t.networkErrorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchWorkData(password);
    } else {
      setWorkData({});
    }
  }, [password, currentMonth]);

  const checkSavedPassword = async () => {
    try {
      const deviceId = await getOrCreateDeviceId();
      const savedPass = await AsyncStorage.getItem
