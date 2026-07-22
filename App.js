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
  Linking,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');
const TRIAL_DURATION_SECONDS = 5 * 24 * 60 * 60; 
const MY_TARGET_EMAIL = "kluh2026@gmail.com"; 
const FIREBASE_REST_URL = "https://my-apk-protection-default-rtdb.firebaseio.com";

const translations = {
  ru: {
    locale: 'ru-RU',
    trialExpiredTitle: "Срок пробного тестирования (5 дней) окончен",
    requestFullVersion: "Запросить полную версию:",
    requestFullVersionHeader: "Запросить полную версию",
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
    btnClose: "Закрыть",
    archiveEarnings: "Заработок за месяц",
    toastTrialActive: "⏱ АКТИВЕН ТЕСТОВЫЙ ПЕРИОД\n(ОСТАЛОСЬ {days} ДН.)",
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
    alertKeyUsed: "Этот ключ уже заблокирован или исчерпан лимит устройств!",
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
    selectLangTitle: "Выберите язык / Оберіть мову",
    errorTitle: "Ошибка",
    networkErrorTitle: "Ошибка сети",
    networkErrorMsg: "Не удалось обновить данные из базы",
    activationErrorTitle: "Ошибка активации",
    lockTitle: "Блокировка",
    noticeTitle: "Уведомление",
    networkSendError: "Не удалось отправить данные",
    hourUnit: "ч.",
    archiveTitle: "Архив заработка",
    messageFromAdmin: "Сообщение от администратора",
    adminReplyTitle: "Ответ на ваш запрос",
    btnWriteToDev: "Написать разработчику",
    writeToDevTitle: "Сообщение разработчику",
    placeholderSubject: "Тема сообщения",
    placeholderMessageText: "Текст сообщения...",
    btnSendToDev: "Отправить",
    messageSentSuccess: "Сообщение отправлено!",
    messageSentToEmail: "Копия отправлена на почту разработчика.",
    adminMessageClose: "Закрыть",
    adminReplyClose: "Понятно",
    adminMessageLink: "Скачать обновление",
    noMessages: "Нет новых сообщений",
    shiftDay: "День",
    shiftNight: "Ночь",
    shift24: "Сутки",
    shiftOff: "Выходной",
    clearSchedule: "Очистить график",
    clearScheduleMessage: "Удалить все смены во всех месяцах?",
    scheduleCleared: "График очищен",
    modeTimesheet: "Табель",
    modeSchedule: "График",
    modeShopping: "Список",
    selectShift: "Выберите смену",
    calculateYear: "Просчитать на год",
    yearCalculated: "График просчитан на год вперёд",
    fillAllDays: "Сначала отметьте минимум одну полную рабочую смену с выходными в текущем месяце.",
    shoppingTitle: "Что купить",
    shoppingBuy: "Купить",
    shoppingBought: "Куплено",
    shoppingClear: "Очистить",
    shoppingAdd: "Добавить товар...",
    shoppingEmpty: "Список пуст",
    shoppingDelete: "Удалить",
    shoppingMovedToBought: "Перемещено в купленные",
    shoppingMovedToBuy: "Возвращено в список",
    shoppingDeleted: "Товар удалён",
    shoppingCleared: "Список купленных очищен",
    clearAll: "Очистка",
    clearAllMessage: "Удалить все купленные товары?",
    hintTitle: "Как настроить график",
    hintText1: "1. Нажмите на любой день в календаре и выберите тип смены:\n• 🟡 День — рабочая смена\n• 🔵 Ночь — ночная смена\n• 🟣 Сутки — суточная смена\n• ⬜ Выходной — день отдыха",
    hintText2: "2. Введите минимум 2–3 смены подряд, чтобы программа поняла ваш паттерн.\n• Важно: Первая смена должна быть рабочей (День/Ночь/Сутки), последняя — Выходной.\n• Пример: День → День → Выходной → Выходной",
    hintText3: "3. Нажмите зелёную кнопку 📆, и ваш график автоматически просчитается на год вперёд.",
    hintText4: "4. Листайте месяцы стрелками ◀ ▶ и проверяйте свои смены.",
    hintButton: "Понял!"
  },
  uk: {
    locale: 'uk-UA',
    trialExpiredTitle: "Термін дії пробного періоду (5 днів) закінчився",
    requestFullVersion: "Запросити повну версію:",
    requestFullVersionHeader: "Запросити повну версію",
    placeholderName: "Ваше Ім'я",
    placeholderPhone: "Телефон",
    btnSendRequest: "Надіслати запит",
    noticeText: "Введіть Ваше ім'я та телефон. Очікуйте, Вам зателефонують.",
    enterKeyTitle: "Ввести постійний ключ:",
    placeholderKey: "Постійний ключ активації",
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
    archiveEarnings: "Заробіток за місяць",
    toastTrialActive: "⏱ АКТИВНИЙ ТЕСТОВИЙ ПЕРІОД\n(ЗАЛИШИЛОСЯ {days} ДН.)",
    pdfTitle: "Звіт — {month}",
    pdfStatusWork: "Робочий",
    pdfStatusWeekend: "Вихідний",
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
    alertSuccessMessage: "Додаток успішно активовано!",
    alertKeyUsed: "Цей ключ вже заблокований або вичерпано ліміт пристроїв!",
    alertKeyBlock: "Цей ключ заблокований адміністратором.",
    alertKeyNotFound: "Ключ не знайдено в базі даних.",
    alertInputError: "Введіть коректні числа",
    alertPdfError: "Не вдалося створити PDF",
    alertRequestSaved: "Дані записані в базу. На вашому пристрої не знайдено налаштованого поштового додатка для прямої відправки.",
    alertMailError: "Запит успішно збережено в Firebase, але не вдалося запустити поштовий додаток.",
    alertFillFields: "Будь ласка, заповніть Ім'я та Телефон для зв'язку",
    btnToday: "Сьогодні",
    noRecordsText: "Немає записів за цей день",
    subSectionTitle: "Роботи за день:",
    dayTotalText: "Всього за день:",
    btnAddRecord: "+ Додати запис",
    selectLangTitle: "Виберіть мову / Оберіть мову",
    errorTitle: "Помилка",
    networkErrorTitle: "Помилка мережі",
    networkErrorMsg: "Не вдалося оновити дані з бази",
    activationErrorTitle: "Помилка активації",
    lockTitle: "Блокування",
    noticeTitle: "Сповіщення",
    networkSendError: "Не вдалося надіслати дані",
    hourUnit: "год.",
    archiveTitle: "Архів заробітку",
    messageFromAdmin: "Повідомлення від адміністратора",
    adminReplyTitle: "Відповідь на ваш запит",
    btnWriteToDev: "Написати розробнику",
    writeToDevTitle: "Повідомлення розробнику",
    placeholderSubject: "Тема повідомлення",
    placeholderMessageText: "Текст повідомлення...",
    btnSendToDev: "Надіслати",
    messageSentSuccess: "Повідомлення надіслано!",
    messageSentToEmail: "Копію надіслано на пошту розробника.",
    adminMessageClose: "Закрити",
    adminReplyClose: "Зрозуміло",
    adminMessageLink: "Завантажити оновлення",
    noMessages: "Немає нових повідомлень",
    shiftDay: "День",
    shiftNight: "Ніч",
    shift24: "Доба",
    shiftOff: "Вихідний",
    clearSchedule: "Очистити графік",
    clearScheduleMessage: "Видалити всі зміни в усіх місяцях?",
    scheduleCleared: "Графік очищено",
    modeTimesheet: "Табель",
    modeSchedule: "Графік",
    modeShopping: "Список",
    selectShift: "Виберіть зміну",
    calculateYear: "Розрахувати на рік",
    yearCalculated: "Графік розраховано на рік вперед",
    fillAllDays: "Спочатку відзначте щонайменше одну повну робочу зміну з вихідними у поточному місяці.",
    shoppingTitle: "Що купити",
    shoppingBuy: "Купити",
    shoppingBought: "Куплено",
    shoppingClear: "Видалити",
    shoppingAdd: "Додати товар...",
    shoppingEmpty: "Список порожній",
    shoppingDelete: "Видалити",
    shoppingMovedToBought: "Переміщено до куплених",
    shoppingMovedToBuy: "Повернуто до списку",
    shoppingDeleted: "Товар видалено",
    shoppingCleared: "Список куплених очищено",
    clearAll: "Очистка",
    clearAllMessage: "Видалити всі куплені товари?",
    hintTitle: "Як налаштувати графік",
    hintText1: "1. Натисніть на будь-який день у календарі та оберіть тип зміни:\n• 🟡 День — робоча зміна\n• 🔵 Ніч — нічна зміна\n• 🟣 Доба — добова зміна\n• ⬜ Вихідний — день відпочинку",
    hintText2: "2. Введіть мінімум 2–3 зміни поспіль, щоб програма зрозуміла ваш патерн.\n• Важливо: Перша зміна має бути робочою (День/Ніч/Доба), остання — Вихідний.\n• Приклад: День → День → Вихідний → Вихідний",
    hintText3: "3. Натисніть зелену кнопку 📆, і ваш графік автоматично розрахується на рік вперед.",
    hintText4: "4. Гортайте місяці стрілками ◀ ▶ та перевіряйте свої зміни.",
    hintButton: "Зрозумів!"
  }
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [password, setPassword] = useState(null); 
  const [inputPassword, setInputPassword] = useState(''); 
  const [isAuthChecking, setIsAuthChecking] = useState(false); 
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
  const [daysLeft, setDaysLeft] = useState(5);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+38 (');
  const [archiveData, setArchiveData] = useState({});

  // ==================== СООБЩЕНИЯ ====================
  const [adminMessageModalVisible, setAdminMessageModalVisible] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [adminMessageLink, setAdminMessageLink] = useState('');
  const [adminMessageId, setAdminMessageId] = useState(null);
  // ==================== ОТВЕТЫ ====================
  const [adminReplyModalVisible, setAdminReplyModalVisible] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyId, setAdminReplyId] = useState(null);

  const [writeToDevModalVisible, setWriteToDevModalVisible] = useState(false);
  const [devSubject, setDevSubject] = useState('');
  const [devMessage, setDevMessage] = useState('');
  const [sendingDevMessage, setSendingDevMessage] = useState(false);

  const [activeMode, setActiveMode] = useState('timesheet');
  const [shiftData, setShiftData] = useState({});
  const [shiftPattern, setShiftPattern] = useState([]);
  const [shiftStartDate, setShiftStartDate] = useState(null);
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [selectedShiftDate, setSelectedShiftDate] = useState(null);

  const [shoppingBuy, setShoppingBuy] = useState([]);
  const [shoppingBought, setShoppingBought] = useState([]);
  const [shoppingInput, setShoppingInput] = useState('');

  const [hintModalVisible, setHintModalVisible] = useState(false);

  const t = translations[lang || 'ru'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkInitialLanguage();
    return () => clearInterval(timer);
  }, []);

  const checkInitialLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@tabulka_lang');
      if (savedLang === 'ru' || savedLang === 'uk') {
        setLang(savedLang);
        setIsAuthChecking(true);
        checkSavedPassword(savedLang);
      }
    } catch (e) {}
  };

  const getUniqueDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem('@tabulka_device_id');
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Math.floor(Date.now() / 1000);
        await AsyncStorage.setItem('@tabulka_device_id', id);
      }
      return id;
    } catch (e) {
      return "DEVICE_GENERIC";
    }
  };

  const handleSelectLanguage = async (selectedLang) => {
    try {
      await AsyncStorage.setItem('@tabulka_lang', selectedLang);
      setLang(selectedLang);
      setIsAuthChecking(true);
      checkSavedPassword(selectedLang);
    } catch (e) {
      Alert.alert("Error", "Error saving language");
    }
  };

  const loadHintState = () => {
    setHintModalVisible(true);
  };

  const closeHint = async () => {
    setHintModalVisible(false);
  };

  const loadShoppingList = async () => {
    if (!password) return;
    try {
      const key = `@shopping_${password}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setShoppingBuy(parsed.buy || []);
        setShoppingBought(parsed.bought || []);
      }
    } catch (e) {
      console.log('Load shopping error:', e);
    }
  };

  const saveShoppingList = async (buy, bought) => {
    if (!password) return;
    try {
      const key = `@shopping_${password}`;
      await AsyncStorage.setItem(key, JSON.stringify({ buy, bought }));
    } catch (e) {
      console.log('Save shopping error:', e);
    }
  };

  const addShoppingItem = () => {
    const text = shoppingInput.trim();
    if (!text) return;
    const newBuy = [...shoppingBuy, { id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6), text }];
    setShoppingBuy(newBuy);
    saveShoppingList(newBuy, shoppingBought);
    setShoppingInput('');
  };

  const toggleShoppingItem = (item, isBought) => {
    if (isBought) {
      const newBought = shoppingBought.filter(i => i.id !== item.id);
      const newBuy = [...shoppingBuy, item];
      setShoppingBuy(newBuy);
      setShoppingBought(newBought);
      saveShoppingList(newBuy, newBought);
    } else {
      const newBuy = shoppingBuy.filter(i => i.id !== item.id);
      const newBought = [...shoppingBought, { ...item, boughtAt: Date.now() }];
      setShoppingBuy(newBuy);
      setShoppingBought(newBought);
      saveShoppingList(newBuy, newBought);
    }
  };

  const deleteShoppingItem = (item, isBought) => {
    if (isBought) {
      const newBought = shoppingBought.filter(i => i.id !== item.id);
      setShoppingBought(newBought);
      saveShoppingList(shoppingBuy, newBought);
    } else {
      const newBuy = shoppingBuy.filter(i => i.id !== item.id);
      setShoppingBuy(newBuy);
      saveShoppingList(newBuy, shoppingBought);
    }
  };

  const clearShoppingBought = () => {
    if (shoppingBought.length === 0) return;
    Alert.alert(
      t.clearAll,
      t.clearAllMessage,
      [
        { text: t.btnCancel, style: "cancel" },
        { 
          text: t.shoppingClear, 
          style: "destructive",
          onPress: async () => {
            setShoppingBought([]);
            saveShoppingList(shoppingBuy, []);
          }
        }
      ]
    );
  };

  const loadShiftData = async () => {
    if (!password) return;
    try {
      const key = `@shift_schedule_${password}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setShiftData(parsed);
      }
    } catch (e) {
      console.log('Load shift error:', e);
    }
  };

  const saveShiftData = async (newData) => {
    if (!password) return;
    try {
      const key = `@shift_schedule_${password}`;
      await AsyncStorage.setItem(key, JSON.stringify(newData));
      setShiftData(newData);
    } catch (e) {
      console.log('Save shift error:', e);
    }
  };

  const extractPatternAndStart = (data) => {
    const allDates = Object.keys(data).sort();
    if (allDates.length === 0) {
      setShiftPattern([]);
      setShiftStartDate(null);
      return;
    }

    const startDate = allDates[0];
    const pattern = [];
    
    const startDateObj = new Date(startDate);
    let currentDate = new Date(startDate);
    let maxDays = 365;
    
    while (maxDays > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (data[dateStr]) {
        pattern.push(data[dateStr]);
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
      maxDays--;
    }

    if (pattern.length > 0) {
      setShiftPattern(pattern);
      setShiftStartDate(startDate);
    } else {
      setShiftPattern([]);
      setShiftStartDate(null);
    }
  };

  const calculateFromPattern = (dateStr) => {
    if (!shiftPattern || shiftPattern.length === 0 || !shiftStartDate) return null;
    
    const targetDate = new Date(dateStr);
    const startDate = new Date(shiftStartDate);
    
    if (targetDate < startDate) return null;
    
    const diffDays = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
    const patternIndex = diffDays % shiftPattern.length;
    return shiftPattern[patternIndex];
  };

  const calculateYear = async () => {
    const allDates = Object.keys(shiftData).sort();
    if (allDates.length === 0) {
      Alert.alert(t.errorTitle, t.fillAllDays);
      return;
    }

    const startDate = allDates[0];
    const pattern = [];
    
    const startDateObj = new Date(startDate);
    let currentDate = new Date(startDate);
    let maxDays = 365;
    
    while (maxDays > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (shiftData[dateStr]) {
        pattern.push(shiftData[dateStr]);
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
      maxDays--;
    }

    if (pattern.length === 0) {
      Alert.alert(t.errorTitle, t.fillAllDays);
      return;
    }

    setShiftPattern(pattern);
    setShiftStartDate(startDate);

    const newData = { ...shiftData };
    const today = new Date();
    const startYear = today.getFullYear();
    const startMonth = today.getMonth();

    for (let m = 0; m < 24; m++) {
      const targetDate = new Date(startYear, startMonth + m, 1);
      const days = getDaysInMonth(targetDate);
      
      for (const dayKey of days) {
        const targetDateObj = new Date(dayKey);
        if (targetDateObj < startDateObj) continue;
        if (newData[dayKey]) continue;
        
        const diffDays = Math.floor((targetDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        const patternIndex = diffDays % pattern.length;
        newData[dayKey] = pattern[patternIndex];
      }
    }

    await saveShiftData(newData);
    Alert.alert(t.noticeTitle, t.yearCalculated);
  };

  const clearSchedule = async () => {
    Alert.alert(
      t.clearSchedule,
      t.clearScheduleMessage,
      [
        { text: t.btnCancel, style: "cancel" },
        { 
          text: t.shoppingClear, 
          style: "destructive",
          onPress: async () => {
            await saveShiftData({});
            setShiftPattern([]);
            setShiftStartDate(null);
            Alert.alert(t.noticeTitle, t.scheduleCleared);
          }
        }
      ]
    );
  };

  const handleShiftDayPress = (dateStr) => {
    if (activeMode !== 'schedule') return;
    setSelectedShiftDate(dateStr);
    setShiftModalVisible(true);
  };

  const selectShiftType = (type) => {
    if (!selectedShiftDate) return;
    const newData = { ...shiftData };
    newData[selectedShiftDate] = type;
    saveShiftData(newData);
    setShiftModalVisible(false);
    setSelectedShiftDate(null);
  };

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'day': return '#FDE047';
      case 'night': return '#60A5FA';
      case '24': return '#A78BFA';
      case 'off': return '#F3F4F6';
      default: return '#FFFFFF';
    }
  };

  const getShiftLabel = (shiftType) => {
    switch (shiftType) {
      case 'day': return t.shiftDay;
      case 'night': return t.shiftNight;
      case '24': return t.shift24;
      case 'off': return t.shiftOff;
      default: return '';
    }
  };

  const goToPrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
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

  const fetchArchiveData = async (currentPassword) => {
    if (!currentPassword) return;
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPassword}.json`);
      const allData = await response.json();
      
      const summary = {};
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}_${d.getMonth()}`;
        
        let monthSum = 0;
        const daysData = allData ? allData[key] : null;
        if (daysData && typeof daysData === 'object') {
          Object.keys(daysData).forEach(dayKey => {
            const dayContent = daysData[dayKey];
            if (dayContent && dayContent.records) {
              monthSum += dayContent.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
            }
          });
        }
        summary[key] = monthSum;
      }
      setArchiveData(summary);
    } catch (e) {}
  };

  useEffect(() => {
    if (password) {
      fetchWorkData(password);
      fetchArchiveData(password);
      loadShiftData();
      loadShoppingList();
      checkAndShowHint();
    } else {
      setWorkData({});
    }
  }, [password, currentMonth]);

  const checkAndShowHint = () => {
    const hasData = Object.keys(shiftData).length > 0;
    if (!hasData && activeMode === 'schedule') {
      setHintModalVisible(true);
    } else {
      setHintModalVisible(false);
    }
  };

  useEffect(() => {
    checkAndShowHint();
  }, [activeMode, shiftData]);

  // ==================== ПРОВЕРКА ОТВЕТОВ АДМИНИСТРАТОРА ====================
const checkAdminReply = async (deviceId) => {
  try {
    const response = await fetch(`${FIREBASE_REST_URL}/support_replies/${deviceId}.json`);
    const data = await response.json();
    
    if (data && data.text) {
      setAdminReplyText(data.text || '');
      setAdminReplyId(deviceId);
      setAdminReplyModalVisible(true);
    }
  } catch (e) {
    console.log('Check admin reply error:', e);
  }
};

  const markReplyAsRead = async () => {
  if (!adminReplyId) return;
  
  try {
    // Удаляем сообщение из Firebase после прочтения
    await fetch(`${FIREBASE_REST_URL}/support_replies/${adminReplyId}.json`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.log('Delete reply error:', e);
  }
  
  setAdminReplyModalVisible(false);
};

  // ==================== ПРОВЕРКА РАССЫЛОК ====================
  const checkAdminMessages = async (deviceId, currentPassword) => {
    const actualPassword = currentPassword || password;
    if (!actualPassword) return;

    try {
      const response = await fetch(`${FIREBASE_REST_URL}/admin_messages.json`);
      const data = await response.json();
      if (!data) return;

      const readMessages = await AsyncStorage.getItem('@tabulka_read_messages');
      const readList = readMessages ? JSON.parse(readMessages) : [];

      const isTrial = actualPassword.startsWith('TRIAL_MODE_');
      const isActivated = !isTrial;

      for (const [msgId, msgData] of Object.entries(data)) {
        if (msgData.active === false) continue;
        
        let isTarget = false;
        if (msgData.target === 'trials' && isTrial) isTarget = true;
        else if (msgData.target === 'activated' && isActivated) isTarget = true;
        else if (msgData.target === 'selected' && msgData.targetDeviceId === deviceId) isTarget = true;

        if (isTarget && !readList.includes(msgId)) {
          setAdminMessageId(msgId);
          setAdminMessageText(msgData.text || '');
          setAdminMessageLink(msgData.apkLink || '');
          setAdminMessageModalVisible(true);
          return;
        }
      }
    } catch (e) {
      console.log('Check admin messages error:', e);
    }
  };

  const markMessageAsRead = async () => {
    if (!adminMessageId) {
      setAdminMessageModalVisible(false);
      return;
    }
    try {
      const readMessages = await AsyncStorage.getItem('@tabulka_read_messages');
      const readList = readMessages ? JSON.parse(readMessages) : [];
      if (!readList.includes(adminMessageId)) {
        readList.push(adminMessageId);
        await AsyncStorage.setItem('@tabulka_read_messages', JSON.stringify(readList));
      }
    } catch (e) {
      console.log('Mark message as read error:', e);
    }
    setAdminMessageModalVisible(false);
  };

  const handleSendToDev = async () => {
    if (!devSubject.trim() || !devMessage.trim()) {
      Alert.alert(t.errorTitle, "Заполните тему и текст сообщения");
      return;
    }

    setSendingDevMessage(true);
    try {
      const deviceId = await getUniqueDeviceId();
      
      await fetch(`${FIREBASE_REST_URL}/support_requests/${deviceId}.json`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName || 'Пользователь',
          phone: clientPhone || '---',
          deviceId: deviceId,
          subject: devSubject.trim(),
          message: devMessage.trim(),
          createdAt: Math.floor(Date.now() / 1000)
        })
      });

      const subjectEncoded = encodeURIComponent(`Tabulka: ${devSubject.trim()}`);
      const bodyEncoded = encodeURIComponent(
        `От: ${clientName || 'Пользователь'}\n` +
        `Телефон: ${clientPhone || '---'}\n` +
        `Device ID: ${deviceId}\n\n` +
        `Сообщение:\n${devMessage.trim()}`
      );
      const mailtoUrl = `mailto:${MY_TARGET_EMAIL}?subject=${subjectEncoded}&body=${bodyEncoded}`;
      
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      }

      Alert.alert(t.messageSentSuccess, t.messageSentToEmail);
      setWriteToDevModalVisible(false);
      setDevSubject('');
      setDevMessage('');
    } catch (e) {
      Alert.alert(t.errorTitle, "Не удалось отправить сообщение");
    } finally {
      setSendingDevMessage(false);
    }
  };

  const checkSavedPassword = async (currentLang) => {
    const localT = translations[currentLang || 'ru'];
    try {
      const deviceId = await getUniqueDeviceId();
      const savedPass = await AsyncStorage.getItem('@tabulka_password');
      
      if (savedPass) {
        const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${savedPass}.json`);
        const keyData = await response.json();
        if (keyData) {
          if (savedPass.startsWith("FAMILY-")) {
            const registeredDevices = keyData.devices || {};
            if (keyData.status === "used" && registeredDevices[deviceId] === true) {
              setPassword(savedPass);
              setIsAuthChecking(false);
              checkAdminMessages(deviceId, savedPass);
              checkAdminReply(deviceId);
              return;
            }
          } else {
            if (keyData.status === "used" && keyData.deviceId === deviceId) {
              setPassword(savedPass);
              setIsAuthChecking(false);
              checkAdminMessages(deviceId, savedPass);
              checkAdminReply(deviceId);
              return; 
            }
          }
        }
      }
      
      let trialStartStr = await AsyncStorage.getItem('@tabulka_trial_start');
      let startTimestamp = trialStartStr ? parseInt(trialStartStr) : null;
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      if (!startTimestamp) {
        const trialResponse = await fetch(`${FIREBASE_REST_URL}/trial_devices/${deviceId}.json`);
        let trialData = await trialResponse.json();
        
        if (trialData && trialData.startedAt) {
          startTimestamp = trialData.startedAt;
        } else {
          startTimestamp = currentTimeSeconds;
          await fetch(`${FIREBASE_REST_URL}/trial_devices/${deviceId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ startedAt: startTimestamp, deviceId: deviceId })
          });
        }
        await AsyncStorage.setItem('@tabulka_trial_start', startTimestamp.toString());
      }
      
      const timePassed = currentTimeSeconds - startTimestamp;
      const remainingSeconds = TRIAL_DURATION_SECONDS - timePassed;
      
      if (remainingSeconds <= 0) {
        setIsTrialExpired(true);
      } else {
        const calculatedDays = Math.ceil(remainingSeconds / (24 * 60 * 60));
        setDaysLeft(calculatedDays);
        const trialPassword = "TRIAL_MODE_" + deviceId;
        setPassword(trialPassword);
        setTrialNotice(true);
        setTimeout(() => setTrialNotice(false), 4000);
        checkAdminMessages(deviceId, trialPassword);
        checkAdminReply(deviceId);
      }
    } catch (e) {
      Alert.alert(localT.errorTitle, "Auth check failed");
    } finally {
      setIsAuthChecking(false);
    }
  };

  // ==================== ОБНОВЛЕННАЯ ФУНКЦИЯ handleLogin С ПЕРЕНОСОМ ====================
  const handleLogin = async () => {
    const trimmed = inputPassword.trim();
    if (trimmed.length < 3) {
      Alert.alert(t.alertFormatError, t.alertFormatShort);
      return;
    }
    setIsAuthChecking(true);
    try {
      const deviceId = await getUniqueDeviceId(); 
      const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`);
      const keyData = await response.json();
      if (keyData) {
        const currentStatus = keyData.status || "free";
        
        if (trimmed.startsWith("FAMILY-")) {
          const registeredDevices = keyData.devices || {};
          const currentDeviceCount = Object.keys(registeredDevices).length;
          const maxAllowed = keyData.maxDevices || 5;

          if (registeredDevices[deviceId] === true) {
            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false);
            setPassword(trimmed);
            setInputPassword('');
            checkAdminMessages(deviceId, trimmed);
            checkAdminReply(deviceId);
            return;
          }

          if (currentStatus === "blocked") {
            Alert.alert(t.lockTitle, t.alertKeyBlock);
            return;
          }

          if (currentDeviceCount < maxAllowed) {
            // ==================== ПЕРЕНОС ДАННЫХ ИЗ ТРИАЛА ====================
            const trialPassword = await AsyncStorage.getItem('@tabulka_password');
            if (trialPassword && trialPassword.startsWith('TRIAL_MODE_')) {
              try {
                const trialResponse = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trialPassword}.json`);
                const trialData = await trialResponse.json();
                
                if (trialData) {
                  for (const [monthKey, monthData] of Object.entries(trialData)) {
                    await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trimmed}/${monthKey}.json`, {
                      method: 'PUT',
                      body: JSON.stringify(monthData)
                    });
                  }
                  
                  await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trialPassword}.json`, {
                    method: 'DELETE'
                  });
                  
                  console.log('✅ Данные триала перенесены и удалены');
                }
              } catch (e) {
                console.log('Ошибка переноса данных:', e);
              }
            }

            await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}/devices/${deviceId}.json`, {
              method: 'PUT',
              body: JSON.stringify(true)
            });
            await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ status: "used" })
            });

            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false); 
            setPassword(trimmed);
            setInputPassword('');
            Alert.alert(t.alertSuccessTitle, t.alertSuccessMessage);
            checkAdminMessages(deviceId, trimmed);
            checkAdminReply(deviceId);
          } else {
            Alert.alert(t.activationErrorTitle, t.alertKeyUsed);
          }
        } else {
          const currentDeviceId = keyData.deviceId || "";
          if (currentStatus === "free" && currentDeviceId === "") {
            // ==================== ПЕРЕНОС ДАННЫХ ИЗ ТРИАЛА ====================
            const trialPassword = await AsyncStorage.getItem('@tabulka_password');
            if (trialPassword && trialPassword.startsWith('TRIAL_MODE_')) {
              try {
                const trialResponse = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trialPassword}.json`);
                const trialData = await trialResponse.json();
                
                if (trialData) {
                  for (const [monthKey, monthData] of Object.entries(trialData)) {
                    await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trimmed}/${monthKey}.json`, {
                      method: 'PUT',
                      body: JSON.stringify(monthData)
                    });
                  }
                  
                  await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${trialPassword}.json`, {
                    method: 'DELETE'
                  });
                  
                  console.log('✅ Данные триала перенесены и удалены');
                }
              } catch (e) {
                console.log('Ошибка переноса данных:', e);
              }
            }

            await fetch(`${FIREBASE_REST_URL}/activation_keys/${trimmed}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ 
                status: "used", 
                deviceId: deviceId,
                startedAt: Math.floor(Date.now() / 1000)
              })
            });
            await AsyncStorage.setItem('@tabulka_password', trimmed);
            setIsTrialExpired(false); 
            setPassword(trimmed);
            setInputPassword('');
            Alert.alert(t.alertSuccessTitle, t.alertSuccessMessage);
            checkAdminMessages(deviceId, trimmed);
            checkAdminReply(deviceId);
          } else if (currentStatus === "used") {
            if (currentDeviceId && currentDeviceId === deviceId) {
              await AsyncStorage.setItem('@tabulka_password', trimmed);
              setIsTrialExpired(false);
              setPassword(trimmed);
              setInputPassword('');
              checkAdminMessages(deviceId, trimmed);
              checkAdminReply(deviceId);
            } else {
              Alert.alert(t.activationErrorTitle, t.alertKeyUsed);
            }
          } else {
            Alert.alert(t.lockTitle, t.alertKeyBlock);
          }
        }
      } else {
        Alert.alert(t.noticeTitle, t.alertKeyNotFound);
      }
    } catch (e) {
      Alert.alert(t.networkErrorTitle, "Database connection failed");
    } finally {
      setIsAuthChecking(false);
    }
  };

  const updateStartedAt = async (password) => {
    if (!password || password.startsWith('TRIAL_MODE_')) return;
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/activation_keys/${password}.json`);
      const keyData = await response.json();
      if (keyData && !keyData.startedAt && keyData.status === 'used') {
        await fetch(`${FIREBASE_REST_URL}/activation_keys/${password}/startedAt.json`, {
          method: 'PUT',
          body: JSON.stringify(Math.floor(Date.now() / 1000))
        });
      }
    } catch (e) {
      console.log('Update startedAt error:', e);
    }
  };

  const handleSendSupportRequest = async () => {
    if (!clientName.trim() || clientPhone.trim() === '+38 (' || clientPhone.trim().length < 8) {
      Alert.alert(t.errorTitle, t.alertFillFields);
      return;
    }
    try {
      const deviceId = await getUniqueDeviceId();
      await fetch(`${FIREBASE_REST_URL}/support_requests/${deviceId}.json`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName.trim(),
          phone: clientPhone.trim(),
          deviceId: deviceId,
          createdAt: Math.floor(Date.now() / 1000)
        })
      });
      const subject = encodeURIComponent("Запрос ключа активации Tabulka");
      const body = encodeURIComponent(`Данные запроса:\n\nИмя: ${clientName.trim()}\nТелефон: ${clientPhone.trim()}\nID устройства: ${deviceId}`);
      const mailtoUrl = `mailto:${MY_TARGET_EMAIL}?subject=${subject}&body=${body}`;
      setRequestModalVisible(false);
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(t.alertSuccessTitle, t.alertRequestSaved);
      }
    } catch (e) {
      setRequestModalVisible(false);
      Alert.alert(t.noticeTitle, t.alertMailError);
    }
  };

  const handleLogout = () => {
    Alert.alert(t.alertExitTitle, t.alertExitMessage, [
      { text: t.alertExitCancel, style: "cancel" },
      { 
        text: t.btnExit, 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('@tabulka_password');
          await AsyncStorage.removeItem('@tabulka_trial_start');
          setIsTrialExpired(false);
          setPassword(null);
          await AsyncStorage.removeItem('@tabulka_lang');
          setLang(null);
        }
      }
    ]);
  };

  const getDayTotal = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
  };

  const getDayHours = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((sum, rec) => sum + rec.hours, 0);
  };

  const handleDayPress = (dateStr) => {
    if (activeMode === 'schedule') {
      setSelectedShiftDate(dateStr);
      setShiftModalVisible(true);
      return;
    }
    setSelectedDate(dateStr);
    setRate('');
    setHours('');
    setModalVisible(true);
  };

  const handleAddRecord = () => {
    const numRate = parseFloat(rate);
    const numHours = parseFloat(hours);
    if (!rate || !hours || isNaN(numRate) || isNaN(numHours) || numRate <= 0 || numHours <= 0) {
      Alert.alert(t.errorTitle, t.alertInputError);
      return;
    }
    const currentDayData = workData[selectedDate] || { records: [] };
    const newRecord = {
      id: Date.now().toString() + '_' + Math.random(),
      rate: numRate,
      hours: numHours
    };
    const updatedDayData = {
      ...currentDayData,
      records: [...(currentDayData.records || []), newRecord]
    };
    setWorkData({ ...workData, [selectedDate]: updatedDayData });
    setRate('');
    setHours('');
  };

  const handleDeleteRecord = (recordId) => {
    const currentDayData = workData[selectedDate];
    if (!currentDayData || !currentDayData.records) return;
    const updatedRecords = currentDayData.records.filter(rec => rec.id !== recordId);
    setWorkData({ ...workData, [selectedDate]: { ...currentDayData, records: updatedRecords } });
  };

  const saveDayAndClose = async () => {
    if (!selectedDate) return;
    const viewYear = currentMonth.getFullYear();
    const viewMonth = currentMonth.getMonth();
    const dayDataToSave = workData[selectedDate] || { records: [] };
    try {
      if (dayDataToSave.records.length === 0) {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${viewYear}_${viewMonth}/${selectedDate}.json`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${password}/${viewYear}_${viewMonth}/${selectedDate}.json`, {
          method: 'PUT',
          body: JSON.stringify(dayDataToSave)
        });
      }
      setModalVisible(false);
      setSelectedDate(null);
      fetchWorkData(password);
      fetchArchiveData(password);
    } catch (e) {
      Alert.alert(t.networkErrorTitle, t.networkSendError);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    });
  };

  const calculateStatsForPeriod = (daysList) => {
    let wDays = 0; 
    let wkDays = 0; 
    let tSum = 0;
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    const activeWorkDaysInMonth = daysList.filter(day => workData[day] && getDayTotal(workData[day]) > 0);
    if (activeWorkDaysInMonth.length === 0) {
      return { workDays: 0, weekendDays: 0, totalSum: 0 };
    }
    const firstWorkDayNum = Math.min(...activeWorkDaysInMonth.map(d => parseInt(d.split('-')[2])));
    let lastWorkDayNum = Math.max(...activeWorkDaysInMonth.map(d => parseInt(d.split('-')[2])));
    const sampleDay = daysList[0]; 
    const [viewYear, viewMonth] = sampleDay.split('-').map(Number);
    if (viewYear === today.getFullYear() && (viewMonth - 1) === today.getMonth()) {
      if (today.getDate() > lastWorkDayNum) {
        lastWorkDayNum = today.getDate();
      }
    }
    daysList.forEach(day => {
      const dayNum = parseInt(day.split('-')[2]);
      const dayTotal = getDayTotal(workData[day]);
      if (dayTotal > 0) { 
        wDays++; 
        tSum += dayTotal; 
      } else { 
        if (dayNum >= firstWorkDayNum && dayNum <= lastWorkDayNum) {
          wkDays++; 
        }
      }
    });
    return { workDays: wDays, weekendDays: wkDays, totalSum: tSum };
  };

  const stats = calculateStatsForPeriod(getDaysInMonth(currentMonth));

  const exportToPDF = async () => {
    const days = getDaysInMonth(currentMonth);
    const monthStr = currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
    let tableRows = '';
    days.forEach(day => {
      const data = workData[day];
      const dayNum = day.split('-')[2];
      const totalSum = getDayTotal(data);
      const totalHours = getDayHours(data);
      if (totalSum > 0) {
        tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWork}</td><td>-</td><td>${totalHours}</td><td>${totalSum}</td></tr>`;
      } else {
        tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWeekend}</td><td>-</td><td>-</td><td>-</td></tr>`;
      }
    });
    const formattedTitle = t.pdfTitle.replace('{month}', monthStr);
    const htmlContent = `<html><head><style>body{font-family:'Helvetica';padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}</style></head><body><h1>${formattedTitle}</h1><table><tr><th>${t.pdfColDay}</th><th>${t.pdfColStatus}</th><th>${t.pdfColRate}</th><th>${t.pdfColHours}</th><th>${t.pdfColSum}</th></tr>${tableRows}</table></body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert(t.errorTitle, t.alertPdfError);
    }
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentMonth);
    if (days.length === 0) return null;
    const firstDayDate = new Date(days[0]);
    let startOfWeekOffset = firstDayDate.getDay(); 
    startOfWeekOffset = startOfWeekOffset === 0 ? 6 : startOfWeekOffset - 1;
    const gridCells = [];
    for (let i = 0; i < startOfWeekOffset; i++) {
      gridCells.push(<View key={`empty-${i}`} style={styles.emptyCell} />);
    }
    days.forEach((dateStr) => {
      const dayData = workData[dateStr];
      const dayTotal = getDayTotal(dayData);
      const isWorkDay = dayTotal > 0;
      const dayNum = dateStr.split('-')[2];
      
      let shiftType = shiftData[dateStr];
      let shiftColor = '#FFFFFF';
      let shiftLabel = '';
      
      if (activeMode === 'schedule') {
        if (!shiftType) {
          shiftType = calculateFromPattern(dateStr);
        }
        shiftColor = getShiftColor(shiftType);
        shiftLabel = getShiftLabel(shiftType);
      }

      gridCells.push(
        <TouchableOpacity 
          key={dateStr} 
          style={[
            activeMode === 'schedule' ? styles.shiftCell : (isWorkDay ? styles.workDayCell : styles.weekendCell),
            { backgroundColor: activeMode === 'schedule' ? shiftColor : (isWorkDay ? '#0052CC' : '#FFF') }
          ]} 
          onPress={() => handleDayPress(dateStr)}
        >
          <Text style={activeMode === 'schedule' ? styles.shiftDayText : (isWorkDay ? styles.workDayText : styles.dayText)}>
            {parseInt(dayNum, 10)}
          </Text>
          {activeMode === 'schedule' && shiftLabel ? (
            <Text style={styles.shiftLabelText}>{shiftLabel}</Text>
          ) : isWorkDay ? (
            <Text style={styles.cellSumSubtext}>{dayTotal}</Text>
          ) : null}
        </TouchableOpacity>
      );
    });
    const rows = [];
    for (let i = 0; i < gridCells.length; i += 7) {
      rows.push(<View key={`row-${i}`} style={styles.calendarRow}>{gridCells.slice(i, i + 7)}</View>);
    }
    return rows;
  };

  const selectMonthFromArchive = (monthKey) => {
    const [year, monthIdx] = monthKey.split('_');
    const targetDate = new Date(parseInt(year), parseInt(monthIdx), 1);
    setCurrentMonth(targetDate);
    setArchiveModalVisible(false);
  };

  // ==================== РЕНДЕР ПОДСКАЗКИ ====================
  const renderHintModal = () => {
    return (
      <Modal
        visible={hintModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHintModalVisible(false)}
      >
        <View style={styles.hintOverlay}>
          <View style={styles.hintContainer}>
            <ScrollView style={styles.hintScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.hintTitle}>{t.hintTitle}</Text>
              <Text style={styles.hintText}>{t.hintText1}</Text>
              <Text style={styles.hintText}>{t.hintText2}</Text>
              <Text style={styles.hintText}>{t.hintText3}</Text>
              <Text style={styles.hintText}>{t.hintText4}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.hintButton} onPress={closeHint}>
              <Text style={styles.hintButtonText}>{t.hintButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ==================== РЕНДЕР СПИСКА ПОКУПОК ====================
  const renderShoppingList = () => {
    const sortedItems = [...shoppingBuy, ...shoppingBought];

    return (
      <KeyboardAvoidingView 
        style={styles.shoppingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.shoppingHeader}>
          <Text style={styles.shoppingTitle}>{t.shoppingTitle}</Text>
          <Text style={styles.shoppingCount}>{t.shoppingBuy} ({shoppingBuy.length})</Text>
        </View>

        {sortedItems.length === 0 ? (
          <Text style={styles.shoppingEmpty}>{t.shoppingEmpty}</Text>
        ) : (
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isBought = shoppingBought.some(i => i.id === item.id);
              return (
                <View style={styles.shoppingItem}>
                  <View style={styles.shoppingItemTextWrap}>
                    <Text style={[
                      styles.shoppingItemText,
                      isBought && styles.shoppingItemTextBought
                    ]}>
                      {item.text}
                    </Text>
                  </View>
                  {!isBought ? (
                    <TouchableOpacity 
                      style={styles.shoppingBuyBtn}
                      onPress={() => toggleShoppingItem(item, false)}
                    >
                      <Text style={styles.shoppingBuyBtnText}>✅</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.shoppingDeleteBtn}
                      onPress={() => deleteShoppingItem(item, true)}
                    >
                      <Text style={styles.shoppingDeleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            style={styles.shoppingList}
            ItemSeparatorComponent={() => (
              <View style={styles.shoppingSeparator} />
            )}
            ListFooterComponent={() => {
              if (shoppingBought.length === 0) return null;
              return (
                <View style={styles.shoppingClearSection}>
                  <View style={styles.shoppingDivider} />
                  <TouchableOpacity 
                    style={styles.shoppingClearBtnWrap} 
                    onPress={clearShoppingBought}
                  >
                    <Text style={styles.shoppingClearBtnText}>{t.shoppingClear}</Text>
                  </TouchableOpacity>
                  <View style={styles.shoppingDivider} />
                </View>
              );
            }}
          />
        )}

        <View style={styles.shoppingInputRow}>
          <TextInput
            style={styles.shoppingInput}
            placeholder={t.shoppingAdd}
            value={shoppingInput}
            onChangeText={setShoppingInput}
            onSubmitEditing={addShoppingItem}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.shoppingAddBtn} onPress={addShoppingItem}>
            <Text style={styles.shoppingAddBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  if (!lang) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.langStartCard}>
          <Text style={styles.langStartTitle}>{t.selectLangTitle}</Text>
          <TouchableOpacity style={styles.langStartBtnRu} onPress={() => handleSelectLanguage('ru')}>
            <Text style={styles.authButtonText}>Русский</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.langStartBtnUk} onPress={() => handleSelectLanguage('uk')}>
            <Text style={styles.authButtonText}>Українська</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isAuthChecking) {
    return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0052CC" /></View>);
  }

  if (isTrialExpired) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authCardExpired}>
          <Text style={styles.authTitleExpired}>{t.trialExpiredTitle}</Text>
          
          <TouchableOpacity style={styles.trialTopRequestBtn} onPress={() => setRequestModalVisible(true)}>
            <Text style={styles.trialTopRequestBtnText}>{t.requestFullVersionHeader.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.separator} />
          <Text style={styles.authSubtitleBold}>{t.enterKeyTitle}</Text>
          <TextInput placeholder={t.placeholderKey} autoCapitalize="characters" style={styles.authInput} value={inputPassword} onChangeText={setInputPassword} />
          <TouchableOpacity style={styles.authBtnActivate} onPress={handleLogin}><Text style={styles.authButtonText}>{t.btnActivate}</Text></TouchableOpacity>
        </View>

        <Modal visible={requestModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#10B981' }]}>{t.requestFullVersionHeader}</Text>
              <TextInput placeholder={t.placeholderName} style={styles.authInputMargin} value={clientName} onChangeText={setClientName} />
              <TextInput placeholder={t.placeholderPhone} keyboardType="phone-pad" style={styles.authInputMarginLarge} value={clientPhone} onChangeText={setClientPhone} />
              <TouchableOpacity style={styles.authBtnSend} onPress={handleSendSupportRequest}><Text style={styles.authButtonText}>{t.btnSendRequest}</Text></TouchableOpacity>
              <View style={styles.noticeContainer}><Text style={styles.noticeSubText}>{t.noticeText}</Text></View>
              <TouchableOpacity style={[styles.btnCancel, { width: '100%', marginTop: 12 }]} onPress={() => setRequestModalVisible(false)}><Text style={styles.btnText}>{t.btnCancel}</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const isCurrentModeTrial = password && password.startsWith("TRIAL_MODE_");

  return (
    <SafeAreaView style={styles.safeArea}>
      {trialNotice && (
        <View style={styles.toastOverlay}>
          <View style={styles.toastCard}>
            <Text style={styles.toastText}>{t.toastTrialActive.replace('{days}', daysLeft)}</Text>
          </View>
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTimeBlock}>
            <Text style={styles.dateText}>{currentTime.toLocaleDateString(t.locale)}</Text>
            <Text style={styles.timeText}>{currentTime.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.writeToDevButton} onPress={() => setWriteToDevModalVisible(true)}>
              <Text style={styles.writeToDevButtonText}>✉️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>{t.btnExit}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isCurrentModeTrial && (
          <TouchableOpacity style={styles.trialTopRequestBtn} onPress={() => setRequestModalVisible(true)}>
            <Text style={styles.trialTopRequestBtnText}>{t.requestFullVersionHeader.toUpperCase()}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.monthSelectorRow}>
          <TouchableOpacity style={lang === 'ru' ? styles.langCircleRu : styles.langCircleRuDimmed} onPress={() => handleSelectLanguage('ru')}>
            <Text style={styles.langCircleText}>Р</Text>
          </TouchableOpacity>
          
          <View style={styles.monthTitleWrapper}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowButton}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' }).toUpperCase()}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
              <Text style={styles.arrowText}>▶</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={lang === 'uk' ? styles.langCircleUk : styles.langCircleUkDimmed} onPress={() => handleSelectLanguage('uk')}>
            <Text style={styles.langCircleText}>У</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.todayButtonFull} onPress={() => setCurrentMonth(new Date())}>
          <Text style={styles.todayButtonFullText}>{t.btnToday.toUpperCase()}</Text>
        </TouchableOpacity>

        <View style={styles.modeSwitchRow}>
          <TouchableOpacity 
            style={[styles.modeButton, activeMode === 'timesheet' && styles.modeButtonActive]}
            onPress={() => setActiveMode('timesheet')}
          >
            <Text style={[styles.modeButtonText, activeMode === 'timesheet' && styles.modeButtonTextActive]}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, activeMode === 'schedule' && styles.modeButtonActive]}
            onPress={() => setActiveMode('schedule')}
          >
            <Text style={[styles.modeButtonText, activeMode === 'schedule' && styles.modeButtonTextActive]}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, activeMode === 'shopping' && styles.modeButtonActive]}
            onPress={() => setActiveMode('shopping')}
          >
            <Text style={[styles.modeButtonText, activeMode === 'shopping' && styles.modeButtonTextActive]}>🛒</Text>
          </TouchableOpacity>
          {activeMode === 'schedule' && (
            <>
              <TouchableOpacity style={styles.clearScheduleButton} onPress={clearSchedule}>
                <Text style={styles.clearScheduleButtonText}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calcYearButton} onPress={calculateYear}>
                <Text style={styles.calcYearButtonText}>📆</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ==================== РЕЖИМ "ТАБЕЛЬ" ==================== */}
        {activeMode === 'timesheet' && (
          <>
            <View style={styles.weekDaysRow}>{t.weekDays.map((day, index) => (<Text key={index} style={(day === 'Сб' || day === 'Вс' || day === 'Нд') ? styles.weekDayTextWeekend : styles.weekDayTextNormal}>{day}</Text>))}</View>
            
            {isLoadingData ? (
              <View style={styles.centerLoading}><ActivityIndicator size="large" color="#0052CC" /></View>
            ) : (
              <ScrollView contentContainerStyle={styles.calendarGrid}>{renderCalendarGrid()}</ScrollView>
            )}

            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{t.statsWorkDays}: {stats.workDays}</Text>
              <Text style={styles.statsText}>{t.statsWeekendDays}: {stats.weekendDays}</Text>
              <Text style={styles.totalText}>{t.statsTotalSum}: {stats.totalSum}</Text>
            </View>
            
            <TouchableOpacity style={styles.archiveButton} onPress={() => setArchiveModalVisible(true)}><Text style={styles.archiveButtonText}>{t.btnArchive}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}><Text style={styles.pdfButtonText}>{t.btnSavePdf}</Text></TouchableOpacity>
          </>
        )}

        {/* ==================== РЕЖИМ "ГРАФИК" ==================== */}
        {activeMode === 'schedule' && (
          <>
            <View style={styles.weekDaysRow}>{t.weekDays.map((day, index) => (<Text key={index} style={(day === 'Сб' || day === 'Вс' || day === 'Нд') ? styles.weekDayTextWeekend : styles.weekDayTextNormal}>{day}</Text>))}</View>
            <ScrollView contentContainerStyle={styles.calendarGrid}>{renderCalendarGrid()}</ScrollView>
            {shiftPattern.length > 0 && shiftStartDate && (
              <View style={styles.patternInfoContainer}>
                <Text style={styles.patternInfoText}>
                  📋 Лента ({shiftPattern.length} дн.): {shiftPattern.map(s => getShiftLabel(s)).join(' → ')}
                </Text>
                <Text style={styles.patternInfoSubtext}>
                  Старт: {shiftStartDate} · Нажмите 📆 для расчёта на год
                </Text>
              </View>
            )}
          </>
        )}

        {/* ==================== РЕЖИМ "СПИСОК ПОКУПОК" ==================== */}
        {activeMode === 'shopping' && renderShoppingList()}

        {/* ==================== ПОДСКАЗКА ==================== */}
        {renderHintModal()}

        {/* ==================== МОДАЛКА РАССЫЛКИ ==================== */}
        <Modal visible={adminMessageModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.adminMessageModal]}>
              <Text style={[styles.modalTitle, { color: '#10B981' }]}>{t.messageFromAdmin}</Text>
              <ScrollView style={styles.adminMessageScroll}>
                <Text style={styles.adminMessageText}>{adminMessageText}</Text>
                {adminMessageLink && adminMessageLink.trim() !== '' && (
                  <TouchableOpacity 
                    style={styles.adminMessageLinkBtn} 
                    onPress={() => {
                      const url = adminMessageLink.trim();
                      if (url.startsWith('http://') || url.startsWith('https://')) {
                        Linking.openURL(url).catch(() => {});
                      } else {
                        Alert.alert('Ошибка', 'Некорректная ссылка');
                      }
                    }}
                  >
                    <Text style={styles.adminMessageLinkText}>{t.adminMessageLink}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <TouchableOpacity 
                style={styles.adminMessageCloseBtn} 
                onPress={markMessageAsRead}
              >
                <Text style={styles.adminMessageCloseBtnText}>{t.adminMessageClose}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ==================== МОДАЛКА ОТВЕТА ==================== */}
        <Modal visible={adminReplyModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.adminMessageModal]}>
              <Text style={[styles.modalTitle, { color: '#0052CC' }]}>{t.adminReplyTitle}</Text>
              <ScrollView style={styles.adminMessageScroll}>
                <Text style={styles.adminMessageText}>{adminReplyText}</Text>
              </ScrollView>
              <TouchableOpacity 
                style={[styles.adminMessageCloseBtn, { backgroundColor: '#0052CC' }]} 
                onPress={markReplyAsRead}
              >
                <Text style={styles.adminMessageCloseBtnText}>{t.adminReplyClose}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ==================== МОДАЛКА ВЫБОРА СМЕНЫ ==================== */}
        <Modal visible={shiftModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.selectShift}</Text>
              <View style={styles.shiftOptions}>
                <TouchableOpacity 
                  style={[styles.shiftOption, { backgroundColor: '#FDE047' }]} 
                  onPress={() => selectShiftType('day')}
                >
                  <Text style={styles.shiftOptionText}>{t.shiftDay}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.shiftOption, { backgroundColor: '#60A5FA' }]} 
                  onPress={() => selectShiftType('night')}
                >
                  <Text style={[styles.shiftOptionText, { color: '#FFF' }]}>{t.shiftNight}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.shiftOption, { backgroundColor: '#A78BFA' }]} 
                  onPress={() => selectShiftType('24')}
                >
                  <Text style={[styles.shiftOptionText, { color: '#FFF' }]}>{t.shift24}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.shiftOption, { backgroundColor: '#F3F4F6' }]} 
                  onPress={() => selectShiftType('off')}
                >
                  <Text style={styles.shiftOptionText}>{t.shiftOff}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.btnCancel, { width: '100%', marginTop: 10 }]} onPress={() => setShiftModalVisible(false)}>
                <Text style={styles.btnText}>{t.btnCancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={writeToDevModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <Text style={[styles.modalTitle, { color: '#0052CC' }]}>{t.writeToDevTitle}</Text>
              <TextInput 
                placeholder={t.placeholderSubject} 
                style={styles.authInputMargin} 
                value={devSubject} 
                onChangeText={setDevSubject} 
              />
              <TextInput 
                placeholder={t.placeholderMessageText} 
                style={[styles.authInputMarginLarge, { height: 100, textAlignVertical: 'top' }]} 
                value={devMessage} 
                onChangeText={setDevMessage} 
                multiline 
              />
              <TouchableOpacity 
                style={[styles.authBtnSend, { backgroundColor: '#0052CC' }]} 
                onPress={handleSendToDev} 
                disabled={sendingDevMessage}
              >
                <Text style={styles.authButtonText}>{sendingDevMessage ? 'Отправка...' : t.btnSendToDev}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnCancel, { width: '100%', marginTop: 10 }]} 
                onPress={() => { setWriteToDevModalVisible(false); setDevSubject(''); setDevMessage(''); }}
              >
                <Text style={styles.btnText}>{t.btnCancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.modalDayTitle}: {selectedDate ? selectedDate.split('-')[2] : ''}</Text>
              <Text style={styles.subSectionTitle}>{t.subSectionTitle}</Text>
              <ScrollView style={styles.miniRecordsList}>
                {workData[selectedDate]?.records && workData[selectedDate].records.length > 0 ? (
                  workData[selectedDate].records.map((rec) => (
                    <View key={rec.id} style={styles.miniRecordRow}>
                      <Text style={styles.miniRecordText}>{rec.rate} × {rec.hours} {t.hourUnit} = {rec.rate * rec.hours}</Text>
                      <TouchableOpacity onPress={() => handleDeleteRecord(rec.id)} style={styles.miniDeleteBtn}><Text style={styles.miniDeleteBtnText}>🗑</Text></TouchableOpacity>
                    </View>
                  ))
                ) : (<Text style={styles.noRecordsText}>{t.noRecordsText}</Text>)}
              </ScrollView>
              <View style={styles.inputGroupRow}>
                <TextInput placeholder={t.placeholderRate} keyboardType="numeric" style={[styles.inputInline, { marginRight: 15 }]} value={rate} onChangeText={setRate} />
                <TextInput placeholder={t.placeholderHours} keyboardType="numeric" style={styles.inputInline} value={hours} onChangeText={setHours} />
              </View>
              <TouchableOpacity style={styles.btnAddRecordRow} onPress={handleAddRecord}><Text style={styles.btnAddRecordRowText}>{t.btnAddRecord}</Text></TouchableOpacity>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.btnSave} onPress={saveDayAndClose}><Text style={styles.btnText}>{t.btnSave}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => { setModalVisible(false); setSelectedDate(null); fetchWorkData(password); }}><Text style={styles.btnText}>{t.btnCancel}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={archiveModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.archiveTitle}</Text>
              <ScrollView style={[styles.miniRecordsList, { maxHeight: 320 }]}>
                {Object.keys(archiveData).length > 0 ? (
                  Object.keys(archiveData).sort().reverse().map((monthKey) => {
                    const [year, monthIdx] = monthKey.split('_');
                    const dummyDate = new Date(parseInt(year), parseInt(monthIdx), 1);
                    const formattedMonth = dummyDate.toLocaleString(t.locale, { month: 'long', year: 'numeric' });
                    return (
                      <TouchableOpacity key={monthKey} style={styles.miniRecordRow} onPress={() => selectMonthFromArchive(monthKey)}>
                        <Text style={[styles.miniRecordText, { textTransform: 'capitalize', color: '#0052CC' }]}>{formattedMonth}:</Text>
                        <Text style={[styles.miniRecordText, { fontWeight: 'bold' }]}>{archiveData[monthKey]}</Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noRecordsText}>{t.noRecordsText}</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={[styles.btn, styles.btnCancel, { width: '100%', marginTop: 10 }]} onPress={() => setArchiveModalVisible(false)}>
                <Text style={styles.btnText}>{t.btnClose}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={requestModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#10B981' }]}>{t.requestFullVersionHeader}</Text>
              <TextInput placeholder={t.placeholderName} style={styles.authInputMargin} value={clientName} onChangeText={setClientName} />
              <TextInput placeholder={t.placeholderPhone} keyboardType="phone-pad" style={styles.authInputMarginLarge} value={clientPhone} onChangeText={setClientPhone} />
              <TouchableOpacity style={styles.authBtnSend} onPress={handleSendSupportRequest}><Text style={styles.authButtonText}>{t.btnSendRequest}</Text></TouchableOpacity>
              <View style={styles.noticeContainer}><Text style={styles.noticeSubText}>{t.noticeText}</Text></View>
              <TouchableOpacity style={[styles.btnCancel, { width: '100%', marginTop: 12 }]} onPress={() => setRequestModalVisible(false)}><Text style={styles.btnText}>{t.btnCancel}</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  authContainer: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  langStartCard: { width: width * 0.85, backgroundColor: '#FFF', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  langStartTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 20, textAlign: 'center' },
  langStartBtnRu: { width: '100%', padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#0052CC', marginBottom: 12 },
  langStartBtnUk: { width: '100%', padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#10B981' },
  authCardExpired: { width: width * 0.9, backgroundColor: '#FFF', padding: 22, borderRadius: 16, borderWidth: 1.5, borderColor: '#EF4444' },
  authTitleExpired: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginBottom: 15, textAlign: 'center' },
  authSubtitleBold: { fontSize: 14, color: '#4B5563', marginBottom: 8, textAlign: 'left', fontWeight: 'bold' },
  authInput: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  authInputMargin: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 10, textAlign: 'center' },
  authInputMarginLarge: { borderBottomWidth: 1, borderColor: '#D1D5DB', paddingVertical: 6, fontSize: 16, marginBottom: 15, textAlign: 'center' },
  authBtnSend: { padding: 13, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', marginBottom: 10 },
  authBtnActivate: { padding: 13, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0052CC' },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  separator: { marginVertical: 15, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 30 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTimeBlock: { flex: 1.2 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 14, color: '#6B7280', fontWeight: 'bold' },
  timeText: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  logoutButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#EF4444', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  logoutText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  writeToDevButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#0052CC', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  writeToDevButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  trialTopRequestBtn: { backgroundColor: '#10B981', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  trialTopRequestBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  monthSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthTitleWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', textAlign: 'center', marginHorizontal: 10 },
  arrowButton: { paddingHorizontal: 12, paddingVertical: 4 },
  arrowText: { fontSize: 18, color: '#0052CC', fontWeight: 'bold' },
  todayButtonFull: { backgroundColor: '#0052CC', paddingVertical: 6, borderRadius: 8, alignItems: 'center', marginBottom: 10, marginHorizontal: 20 },
  todayButtonFullText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  langCircleText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  langCircleRu: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0052CC' },
  langCircleRuDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0052CC', opacity: 0.35 },
  langCircleUk: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10B981' },
  langCircleUkDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10B981', opacity: 0.35 },
  modeSwitchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  modeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  modeButtonActive: { backgroundColor: '#0052CC' },
  modeButtonText: { fontSize: 18, color: '#6B7280' },
  modeButtonTextActive: { color: '#FFF' },
  clearScheduleButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EF4444', marginLeft: 4 },
  clearScheduleButtonText: { fontSize: 16, color: '#FFF' },
  calcYearButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#10B981', marginLeft: 4 },
  calcYearButtonText: { fontSize: 16, color: '#FFF' },
  shiftCell: { width: (width - 32) / 7 - 8, height: 46, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  shiftDayText: { fontSize: 15, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  shiftLabelText: { fontSize: 9, fontWeight: 'bold', color: '#4B5563', textAlign: 'center', marginTop: 1 },
  shiftOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginVertical: 10 },
  shiftOption: { width: '45%', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  shiftOptionText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  patternInfoContainer: { backgroundColor: '#E0F2FE', padding: 8, borderRadius: 8, marginVertical: 6 },
  patternInfoText: { fontSize: 13, fontWeight: 'bold', color: '#0369A1', textAlign: 'center' },
  patternInfoSubtext: { fontSize: 11, color: '#0369A1', textAlign: 'center' },
  weekDaysRow: { flexDirection: 'row', marginBottom: 8 },
  weekDayTextNormal: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontWeight: 'bold', color: '#6B7280' },
  weekDayTextWeekend: { width: (width - 32) / 7 - 8, marginHorizontal: 4, textAlign: 'center', fontWeight: 'bold', color: '#EF4444' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarRow: { flexDirection: 'row', justifyContent: 'flex-start', width: '100%' },
  emptyCell: { width: (width - 32) / 7 - 8, height: 46, margin: 4 },
  weekendCell: { width: (width - 32) / 7 - 8, height: 46, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: '#FFF', borderColor: '#E5E7EB' },
  workDayCell: { width: (width - 32) / 7 - 8, height: 46, margin: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, backgroundColor: '#0052CC', borderColor: '#0052CC' },
  dayText: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  workDayText: { fontSize: 15, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  cellSumSubtext: { fontSize: 11, color: '#A3E635', fontWeight: 'bold', marginTop: -2, textAlign: 'center' },
  statsContainer: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  statsText: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  totalText: { fontSize: 16, fontWeight: 'bold', marginTop: 4, color: '#111827' },
  archiveButton: { backgroundColor: '#0052CC', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  archiveButtonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  pdfButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  pdfButtonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, backgroundColor: '#FFF', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#4B5563', marginBottom: 5 },
  miniRecordsList: { maxHeight: 200, backgroundColor: '#F3F4F6', borderRadius: 8, padding: 8, marginBottom: 12 },
  miniRecordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  miniRecordText: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  miniDeleteBtn: { paddingHorizontal: 8, paddingVertical: 2 },
  miniDeleteBtnText: { fontSize: 14, color: '#EF4444', fontWeight: 'bold' },
  noRecordsText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginVertical: 10, fontWeight: 'bold' },
  inputGroupRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputInline: { flex: 1, borderBottomWidth: 1, borderColor: '#0052CC', paddingVertical: 10, fontSize: 16, textAlign: 'center' },
  btnAddRecordRow: { backgroundColor: '#0052CC', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  btnAddRecordRowText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 12, borderRadius: 8, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
  btnSave: { backgroundColor: '#0052CC', flex: 1, marginRight: 5, alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  btnCancel: { backgroundColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, minWidth: 80 },
  btnText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  noticeContainer: { backgroundColor: '#0052CC', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeSubText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  toastOverlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 99999,
    backgroundColor: 'rgba(0,0,0,0.1)' 
  },
  toastCard: { 
    width: width * 0.8,
    backgroundColor: '#F3F4F6', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  toastText: { 
    color: '#EF4444', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontSize: 15,
    lineHeight: 22
  },
  adminMessageModal: { 
    maxHeight: '85%', 
    paddingVertical: 20,
    paddingHorizontal: 20 
  },
  adminMessageScroll: { 
    maxHeight: 350, 
    marginBottom: 15,
    marginTop: 5,
  },
  adminMessageText: { 
    fontSize: 16, 
    lineHeight: 24, 
    color: '#1a1a1a',
    paddingBottom: 10,
  },
  adminMessageLinkBtn: { 
    backgroundColor: '#10B981', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 8,
    marginBottom: 5,
  },
  adminMessageLinkText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
  adminMessageCloseBtn: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  adminMessageCloseBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // ==================== СПИСОК ПОКУПОК ====================
  shoppingContainer: { flex: 1, paddingHorizontal: 4 },
  shoppingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  shoppingTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  shoppingCount: { fontSize: 16, fontWeight: 'bold', color: '#6B7280' },
  shoppingList: { flex: 1 },
  shoppingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  shoppingItemTextWrap: { flex: 1 },
  shoppingItemText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  shoppingItemTextBought: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', textDecorationLine: 'line-through' },
  shoppingBuyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  shoppingBuyBtnText: { fontSize: 20 },
  shoppingDeleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  shoppingDeleteBtnText: { fontSize: 18, color: '#EF4444', fontWeight: 'bold' },
  shoppingEmpty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginVertical: 20 },
  shoppingSeparator: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  shoppingClearSection: { marginVertical: 8, alignItems: 'center' },
  shoppingDivider: { height: 1, backgroundColor: '#D1D5DB', width: '100%' },
  shoppingClearBtnWrap: { paddingVertical: 8, paddingHorizontal: 16 },
  shoppingClearBtnText: { fontSize: 14, color: '#EF4444', fontWeight: 'bold' },
  shoppingInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  shoppingInput: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, backgroundColor: '#FFF' },
  shoppingAddBtn: { backgroundColor: '#0052CC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  shoppingAddBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  // ==================== ПОДСКАЗКА ====================
  hintOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  hintContainer: { 
    width: width * 0.9, 
    maxHeight: height * 0.85, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  hintScroll: { 
    marginBottom: 16 
  },
  hintTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111827', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  hintText: { 
    fontSize: 15, 
    lineHeight: 22, 
    color: '#374151', 
    marginBottom: 10 
  },
  hintButton: { 
    backgroundColor: '#10B981', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  hintButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
