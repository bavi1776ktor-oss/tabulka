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
    statsTotalHours: "Всего часов",
    btnArchive: "Архив",
    btnSavePdf: "Сохранить PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Часы",
    placeholderStartTime: "Начало (чч:мм)",
    placeholderEndTime: "Конец (чч:мм)",
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
    alertTimeError: "Введите время в формате ЧЧ:ММ (например 08:00 и 17:00)",
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
    modeClock: "Часы",
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
    hintButton: "Понял!",
    clockTitle: "Учёт отработанных часов",
    clockEmpty: "Нет записей времени",
    clockTotalMonth: "Часов за месяц"
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
    statsTotalHours: "Всього годин",
    btnArchive: "Архів",
    btnSavePdf: "Зберегти PDF",
    modalDayTitle: "День",
    placeholderRate: "Ставка",
    placeholderHours: "Години",
    placeholderStartTime: "Початок (гг:хх)",
    placeholderEndTime: "Кінець (гг:хх)",
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
    alertTimeError: "Введіть час у форматі ГГ:ХХ (наприклад 08:00 і 17:00)",
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
    modeClock: "Години",
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
    hintButton: "Зрозумів!",
    clockTitle: "Облік відпрацьованих годин",
    clockEmpty: "Немає записів часу",
    clockTotalMonth: "Годин за місяць"
  }
};

// Парсинг времени "HH:MM" -> минуты от начала суток
const parseTimeToMinutes = (str) => {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  if (isNaN(h) || isNaN(mi) || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return h * 60 + mi;
};

// Длительность между двумя временами (в часах, с учётом перехода через полночь)
const calculateDurationHours = (startStr, endStr) => {
  const s = parseTimeToMinutes(startStr);
  const e = parseTimeToMinutes(endStr);
  if (s === null || e === null) return null;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60; // через полночь
  return diff / 60;
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

  // ==================== ЧАСЫ (НОВЫЙ РЕЖИМ) ====================
  const [clockData, setClockData] = useState({}); 
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [selectedClockDate, setSelectedClockDate] = useState(null);
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');

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

  // ==================== ГРАФИК (AsyncStorage) ====================
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

  // ==================== ЧАСЫ (AsyncStorage) ====================
  const getClockStorageKey = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return `@clock_data_${password}_${y}_${m}`;
  };

  const loadClockData = async () => {
    if (!password) return;
    try {
      const saved = await AsyncStorage.getItem(getClockStorageKey());
      if (saved) {
        setClockData(JSON.parse(saved));
      } else {
        setClockData({});
      }
    } catch (e) {
      console.log('Load clock error:', e);
    }
  };

  const saveClockData = async (newData) => {
    if (!password) return;
    try {
      await AsyncStorage.setItem(getClockStorageKey(), JSON.stringify(newData));
      setClockData(newData);
    } catch (e) {
      console.log('Save clock error:', e);
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

  // ==================== ТАБЕЛЬ — ЛОКАЛЬНОЕ ХРАНЕНИЕ ====================
  const getWorkStorageKey = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return `@tabulka_work_${password}_${y}_${m}`;
  };

  const fetchWorkData = async (currentPassword) => {
    if (!currentPassword) return;
    setIsLoadingData(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      const key = `@tabulka_work_${currentPassword}_${y}_${m}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        setWorkData(JSON.parse(saved));
      } else {
        setWorkData({});
      }
    } catch (error) {
      Alert.alert(t.networkErrorTitle, t.networkErrorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Архив — считаем по локальным данным
  const fetchArchiveData = async (currentPassword) => {
    if (!currentPassword) return;
    try {
      const summary = {};
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `@tabulka_work_${currentPassword}_${d.getFullYear()}_${d.getMonth()}`;
        const saved = await AsyncStorage.getItem(key);
        let monthSum = 0;
        if (saved) {
          const daysData = JSON.parse(saved);
          Object.keys(daysData).forEach(dayKey => {
            const dayContent = daysData[dayKey];
            if (dayContent && dayContent.records) {
              monthSum += dayContent.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
            }
          });
        }
        summary[`${d.getFullYear()}_${d.getMonth()}`] = monthSum;
      }
      setArchiveData(summary);
    } catch (
