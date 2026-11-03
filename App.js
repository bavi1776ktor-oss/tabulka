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

const parseTimeToMinutes = (str) => {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  if (isNaN(h) || isNaN(mi) || h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return h * 60 + mi;
};

const calculateDurationHours = (startStr, endStr) => {
  const s = parseTimeToMinutes(startStr);
  const e = parseTimeToMinutes(endStr);
  if (s === null || e === null) return null;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60;
  return diff / 60;
};

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
    placeholderStartTime: "Начало (08:00)",
    placeholderEndTime: "Конец (17:00)",
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
    networkErrorMsg: "Не удалось загрузить данные",
    activationErrorTitle: "Ошибка активации",
    lockTitle: "Блокировка",
    noticeTitle: "Уведомление",
    networkSendError: "Не удалось сохранить данные",
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
    clockModalTitle: "Время работы",
    clockStartLabel: "Начало работы",
    clockEndLabel: "Конец работы",
    clockAddInterval: "+ Добавить интервал",
    clockTotalDay: "Итого за день",
    clockTotalMonth: "Часов за месяц",
    clockEmpty: "Нет записей времени"
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
    placeholderStartTime: "Початок (08:00)",
    placeholderEndTime: "Кінець (17:00)",
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
    networkErrorMsg: "Не вдалося завантажити дані",
    activationErrorTitle: "Помилка активації",
    lockTitle: "Блокування",
    noticeTitle: "Сповіщення",
    networkSendError: "Не вдалося зберегти дані",
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
    clockModalTitle: "Час роботи",
    clockStartLabel: "Початок роботи",
    clockEndLabel: "Кінець роботи",
    clockAddInterval: "+ Додати інтервал",
    clockTotalDay: "Разом за день",
    clockTotalMonth: "Годин за місяць",
    clockEmpty: "Немає записів часу"
  }
};export default function App() {
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

  const [clockData, setClockData] = useState({});
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [selectedClockDate, setSelectedClockDate] = useState(null);
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');

  const [adminMessageModalVisible, setAdminMessageModalVisible] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [adminMessageLink, setAdminMessageLink] = useState('');
  const [adminMessageId, setAdminMessageId] = useState(null);
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

  useEffect(() => {
    if (password) {
      fetchWorkData(password);
      fetchArchiveData(password);
      loadShiftData();
      loadShoppingList();
      loadClockData();
      checkAndShowHint();
    } else {
      setWorkData({});
    }
  }, [password, currentMonth]);

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

  const closeHint = async () => {
    setHintModalVisible(false);
  };

  const checkAndShowHint = () => {
    const hasData = Object.keys(shiftData).length > 0;
    if (!hasData && activeMode === 'schedule') {
      setHintModalVisible(true);
    } else {
      setHintModalVisible(false);
    }
  };

  // ==================== СПИСОК ПОКУПОК ====================
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
    } catch (e) {}
  };

  const saveShoppingList = async (buy, bought) => {
    if (!password) return;
    try {
      const key = `@shopping_${password}`;
      await AsyncStorage.setItem(key, JSON.stringify({ buy, bought }));
    } catch (e) {}
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

  // ==================== ГРАФИК ====================
  const loadShiftData = async () => {
    if (!password) return;
    try {
      const key = `@shift_schedule_${password}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) setShiftData(JSON.parse(saved));
    } catch (e) {}
  };

  const saveShiftData = async (newData) => {
    if (!password) return;
    try {
      const key = `@shift_schedule_${password}`;
      await AsyncStorage.setItem(key, JSON.stringify(newData));
      setShiftData(newData);
    } catch (e) {}
  };

  const calculateFromPattern = (dateStr) => {
    if (!shiftPattern || shiftPattern.length === 0 || !shiftStartDate) return null;
    const targetDate = new Date(dateStr);
    const startDate = new Date(shiftStartDate);
    if (targetDate < startDate) return null;
    const diffDays = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
    return shiftPattern[diffDays % shiftPattern.length];
  };

  const calculateYear = async () => {
    const allDates = Object.keys(shiftData).sort();
    if (allDates.length === 0) { Alert.alert(t.errorTitle, t.fillAllDays); return; }

    const startDate = allDates[0];
    const pattern = [];
    const startDateObj = new Date(startDate);
    let currentDate = new Date(startDate);
    let maxDays = 365;

    while (maxDays > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (shiftData[dateStr]) pattern.push(shiftData[dateStr]);
      else break;
      currentDate.setDate(currentDate.getDate() + 1);
      maxDays--;
    }

    if (pattern.length === 0) { Alert.alert(t.errorTitle, t.fillAllDays); return; }

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
        newData[dayKey] = pattern[diffDays % pattern.length];
      }
    }
    await saveShiftData(newData);
    Alert.alert(t.noticeTitle, t.yearCalculated);
  };

  const clearSchedule = async () => {
    Alert.alert(t.clearSchedule, t.clearScheduleMessage, [
      { text: t.btnCancel, style: "cancel" },
      { text: t.shoppingClear, style: "destructive",
        onPress: async () => {
          await saveShiftData({});
          setShiftPattern([]);
          setShiftStartDate(null);
          Alert.alert(t.noticeTitle, t.scheduleCleared);
        }
      }
    ]);
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
    const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d);
  };
  const goToNextMonth = () => {
    const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d);
  };

  // ==================== ТАБЕЛЬ — LOCAL STORAGE ====================
  const fetchWorkData = async (currentPassword) => {
    if (!currentPassword) return;
    setIsLoadingData(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      const key = `@tabulka_work_${currentPassword}_${y}_${m}`;
      const saved = await AsyncStorage.getItem(key);
      setWorkData(saved ? JSON.parse(saved) : {});
    } catch (error) {
      Alert.alert(t.networkErrorTitle, t.networkErrorMsg);
    } finally {
      setIsLoadingData(false);
    }
  };

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
              monthSum += dayContent.records.reduce((s, rec) => s + (rec.rate * rec.hours), 0);
            }
          });
        }
        summary[`${d.getFullYear()}_${d.getMonth()}`] = monthSum;
      }
      setArchiveData(summary);
    } catch (e) {}
  };

  const saveWorkForCurrentMonth = async (newData) => {
    if (!password) return;
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      const key = `@tabulka_work_${password}_${y}_${m}`;
      await AsyncStorage.setItem(key, JSON.stringify(newData));
    } catch (e) {
      Alert.alert(t.networkErrorTitle, t.networkSendError);
    }
  };

  // ==================== ЧАСЫ — LOCAL STORAGE ====================
  const getClockStorageKey = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return `@clock_data_${password}_${y}_${m}`;
  };

  const loadClockData = async () => {
    if (!password) return;
    try {
      const saved = await AsyncStorage.getItem(getClockStorageKey());
      setClockData(saved ? JSON.parse(saved) : {});
    } catch (e) {}
  };

  const saveClockData = async (newData) => {
    if (!password) return;
    try {
      await AsyncStorage.setItem(getClockStorageKey(), JSON.stringify(newData));
      setClockData(newData);
    } catch (e) {}
  };

  const getClockDayTotal = (dayData) => {
    if (!dayData || !Array.isArray(dayData.intervals)) return 0;
    return dayData.intervals.reduce((s, iv) => s + (iv.hours || 0), 0);
  };

  const getClockMonthTotal = () => {
    let total = 0;
    Object.keys(clockData).forEach(day => { total += getClockDayTotal(clockData[day]); });
    return total;
  };

  const addClockInterval = () => {
    if (!selectedClockDate) return;
    const startOk = parseTimeToMinutes(startTimeInput) !== null;
    const endOk = parseTimeToMinutes(endTimeInput) !== null;
    const dur = calculateDurationHours(startTimeInput, endTimeInput);
    if (!startOk || !endOk || dur === null || dur <= 0) {
      Alert.alert(t.errorTitle, t.alertTimeError);
      return;
    }
    const existing = clockData[selectedClockDate] || { intervals: [] };
    const updated = {
      ...clockData,
      [selectedClockDate]: {
        intervals: [...existing.intervals, { start: startTimeInput.trim(), end: endTimeInput.trim(), hours: dur }]
      }
    };
    saveClockData(updated);
    setStartTimeInput('');
    setEndTimeInput('');
  };

  const deleteClockInterval = (idx) => {
    if (!selectedClockDate) return;
    const existing = clockData[selectedClockDate];
    if (!existing) return;
    const newIntervals = existing.intervals.filter((_, i) => i !== idx);
    const updated = { ...clockData };
    if (newIntervals.length === 0) delete updated[selectedClockDate];
    else updated[selectedClockDate] = { intervals: newIntervals };
    saveClockData(updated);
  };

  const closeClockModal = () => {
    setClockModalVisible(false);
    setSelectedClockDate(null);
    setStartTimeInput('');
    setEndTimeInput('');
  };

  // ==================== СООБЩЕНИЯ ====================
  const checkAdminReply = async (deviceId) => {
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/support_replies/${deviceId}.json`);
      const data = await response.json();
      if (data && data.text) {
        setAdminReplyText(data.text || '');
        setAdminReplyId(deviceId);
        setAdminReplyModalVisible(true);
      }
    } catch (e) {}
  };

  const markReplyAsRead = async () => {
    if (!adminReplyId) return;
    try {
      await fetch(`${FIREBASE_REST_URL}/support_replies/${adminReplyId}.json`, { method: 'DELETE' });
    } catch (e) {}
    setAdminReplyModalVisible(false);
  };

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
    } catch (e) {}
  };

  const markMessageAsRead = async () => {
    if (!adminMessageId) { setAdminMessageModalVisible(false); return; }
    try {
      const readMessages = await AsyncStorage.getItem('@tabulka_read_messages');
      const readList = readMessages ? JSON.parse(readMessages) : [];
      if (!readList.includes(adminMessageId)) {
        readList.push(adminMessageId);
        await AsyncStorage.setItem('@tabulka_read_messages', JSON.stringify(readList));
      }
    } catch (e) {}
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
        `От: ${clientName || 'Пользователь'}\nТелефон: ${clientPhone || '---'}\nDevice ID: ${deviceId}\n\nСообщение:\n${devMessage.trim()}`
      );
      const mailtoUrl = `mailto:${MY_TARGET_EMAIL}?subject=${subjectEncoded}&body=${bodyEncoded}`;
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) await Linking.openURL(mailtoUrl);
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
        if (trialData && trialData.startedAt) startTimestamp = trialData.startedAt;
        else {
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

          if (currentStatus === "blocked") { Alert.alert(t.lockTitle, t.alertKeyBlock); return; }

          if (currentDeviceCount < maxAllowed) {
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
      if (supported) await Linking.openURL(mailtoUrl);
      else Alert.alert(t.alertSuccessTitle, t.alertRequestSaved);
    } catch (e) {
      setRequestModalVisible(false);
      Alert.alert(t.noticeTitle, t.alertMailError);
    }
  };

  const handleLogout = () => {
    Alert.alert(t.alertExitTitle, t.alertExitMessage, [
      { text: t.alertExitCancel, style: "cancel" },
      { text: t.btnExit, style: "destructive",
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
    return dayData.records.reduce((s, r) => s + (r.rate * r.hours), 0);
  };

  const getDayHours = (dayData) => {
    if (!dayData || !dayData.records) return 0;
    return dayData.records.reduce((s, r) => s + r.hours, 0);
  };

  const handleDayPress = (dateStr) => {
    if (activeMode === 'schedule') {
      setSelectedShiftDate(dateStr);
      setShiftModalVisible(true);
      return;
    }
    if (activeMode === 'clock') {
      setSelectedClockDate(dateStr);
      setStartTimeInput('');
      setEndTimeInput('');
      setClockModalVisible(true);
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
    const newRecord = { id: Date.now().toString() + '_' + Math.random(), rate: numRate, hours: numHours };
    const updatedDayData = { ...currentDayData, records: [...(currentDayData.records || []), newRecord] };
    setWorkData({ ...workData, [selectedDate]: updatedDayData });
    setRate('');
    setHours('');
  };

  const handleDeleteRecord = (recordId) => {
    const currentDayData = workData[selectedDate];
    if (!currentDayData || !currentDayData.records) return;
    const updatedRecords = currentDayData.records.filter(r => r.id !== recordId);
    setWorkData({ ...workData, [selectedDate]: { ...currentDayData, records: updatedRecords } });
  };

  const saveDayAndClose = async () => {
    if (!selectedDate) return;
    const newWorkData = { ...workData };
    if (!newWorkData[selectedDate] || newWorkData[selectedDate].records.length === 0) {
      delete newWorkData[selectedDate];
    }
    await saveWorkForCurrentMonth(newWorkData);
    setModalVisible(false);
    setSelectedDate(null);
    fetchArchiveData(password);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    });
  };

  const calculateStatsForPeriod = (daysList) => {
    let wDays = 0, wkDays = 0, tSum = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const active = daysList.filter(day => workData[day] && getDayTotal(workData[day]) > 0);
    if (active.length === 0) return { workDays: 0, weekendDays: 0, totalSum: 0 };
    const first = Math.min(...active.map(d => parseInt(d.split('-')[2])));
    let last = Math.max(...active.map(d => parseInt(d.split('-')[2])));
    const sample = daysList[0];
    const [vy, vm] = sample.split('-').map(Number);
    if (vy === today.getFullYear() && (vm - 1) === today.getMonth()) {
      if (today.getDate() > last) last = today.getDate();
    }
    daysList.forEach(day => {
      const n = parseInt(day.split('-')[2]);
      const total = getDayTotal(workData[day]);
      if (total > 0) { wDays++; tSum += total; }
      else if (n >= first && n <= last) wkDays++;
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
      if (totalSum > 0) tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWork}</td><td>-</td><td>${totalHours}</td><td>${totalSum}</td></tr>`;
      else tableRows += `<tr><td>${dayNum}</td><td>${t.pdfStatusWeekend}</td><td>-</td><td>-</td><td>-</td></tr>`;
    });
    const formattedTitle = t.pdfTitle.replace('{month}', monthStr);
    const htmlContent = `<html><head><style>body{font-family:'Helvetica';padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:center;}</style></head><body><h1
