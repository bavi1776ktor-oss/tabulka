import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  Alert, 
  Dimensions, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const FIREBASE_REST_URL = "https://tabulkawork-default-rtdb.europe-west1.firebasedatabase.app";

const localization = {
  ru: {
    locale: 'ru-RU',
    weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    statsWorkDays: 'Отработано дней',
    statsWeekendDays: 'Выходных дней',
    statsTotalSum: 'Итого сумма',
    btnArchive: 'АРХИВ МЕСЯЦЕВ',
    btnSavePdf: 'СОХРАНИТЬ В PDF',
    btnToday: 'Сегодня',
    btnExit: 'Выйти',
    modalDayTitle: 'День',
    subSectionTitle: 'Записи за этот day:',
    noRecordsText: 'Нет записей',
    placeholderRate: 'Ставка',
    placeholderHours: 'Часы',
    placeholderName: 'Ваше Имя',
    placeholderPhone: 'Номер телефона',
    placeholderKey: 'КЛЮЧ АКТИВАЦИИ',
    hourUnit: 'ч',
    btnAddRecord: 'ДОБАВИТЬ ЗАПИСЬ',
    btnSave: 'Сохранить',
    btnCancel: 'Отмена',
    btnClose: 'Закрыть',
    archiveTitle: 'Архив заработка',
    networkErrorTitle: 'Ошибка сети',
    networkSendError: 'Не удалось сохранить данные на сервере.',
    errorTitle: 'Ошибка',
    alertPdfError: 'Не удалось сгенерировать или поделиться PDF.',
    pdfTitle: 'Отчет за {month}',
    pdfStatusWork: 'Рабочий',
    pdfStatusWeekend: 'Выходной',
    pdfColDay: 'День',
    pdfColStatus: 'Статус',
    pdfColRate: 'Ставка',
    pdfColHours: 'Часы',
    pdfColSum: 'Сумма',
    trialExpiredTitle: 'СРОК ДЕЙСТВИЯ ТЕСТОВОЙ ВЕРСИИ ИСТЕК',
    requestFullVersionHeader: 'Запросить полную версию',
    btnSendRequest: 'ОТПРАВИТЬ ЗАЯВКУ',
    noticeText: 'Заявка отправлена разработчику',
    btnActivate: 'АКТИВИРОВАТЬ КЛЮЧ',
    toastTrialActive: 'Внимание!\nЭто тестовая версия.\nОсталось дней: {days}'
  },
  uk: {
    locale: 'uk-UA',
    weekDays: ['Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    statsWorkDays: 'Відпрацьовано днів',
    statsWeekendDays: 'Вихідних днів',
    statsTotalSum: 'Всього сума',
    btnArchive: 'АРХІВ МІСЯЦІВ',
    btnSavePdf: 'ЗБЕРЕГТИ В PDF',
    btnToday: 'Сьогодні',
    btnExit: 'Вийти',
    modalDayTitle: 'День',
    subSectionTitle: 'Записи за цей день:',
    noRecordsText: 'Немає записів',
    placeholderRate: 'Ставка',
    placeholderHours: 'Години',
    placeholderName: 'Ваше Ім\'я',
    placeholderPhone: 'Номер телефону',
    placeholderKey: 'КЛЮЧ АКТИВАЦІЇ',
    hourUnit: 'г',
    btnAddRecord: 'ДОДАТИ ЗАПИС',
    btnSave: 'Зберегти',
    btnCancel: 'Скасувати',
    btnClose: 'Закрити',
    archiveTitle: 'Архів заробітку',
    networkErrorTitle: 'Помилка мережі',
    networkSendError: 'Не вдалося зберегти дані на сервері.',
    errorTitle: 'Помилка',
    alertPdfError: 'Не вдалося згенерувати або поділитися PDF.',
    pdfTitle: 'Звіт за {month}',
    pdfStatusWork: 'Робочий',
    pdfStatusWeekend: 'Вихідний',
    pdfColDay: 'День',
    pdfColStatus: 'Статус',
    pdfColRate: 'Ставка',
    pdfColHours: 'Години',
    pdfColSum: 'Сума',
    trialExpiredTitle: 'ТЕРМІН ДІЇ ТЕСТОВОЇ ВЕРСИИ ЗАКІНЧИВСЯ',
    requestFullVersionHeader: 'Запросити повну версію',
    btnSendRequest: 'ВІДПРАВИТИ ЗАЯВКУ',
    noticeText: 'Заявку відправлено розробнику',
    btnActivate: 'АКТИВУВАТИ КЛЮЧ',
    toastTrialActive: 'Увага!\nЦе тестова версія.\nЗалишилось днів: {days}'
  }
};

export default function App() {
  const [lang, setLang] = useState(null);
  const [password, setPassword] = useState(null);
  const [inputPassword, setInputPassword] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workData, setWorkData] = useState({});
  const [archiveData, setArchiveData] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('');

  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [trialNotice, setTrialNotice] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  const t = localization[lang || 'ru'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    checkLocalAuth();
  }, []);

  const checkLocalAuth = async () => {
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_config/activeLanguage.json`);
      const savedLang = await response.json();
      if (savedLang) setLang(savedLang);

      const passResponse = await fetch(`${FIREBASE_REST_URL}/tabulka_config/activePassword.json`);
      const savedPass = await passResponse.json();
      if (savedPass) {
        setPassword(savedPass);
        await validateLicense(savedPass);
      } else {
        setIsAuthChecking(false);
      }
    } catch (e) {
      setIsAuthChecking(false);
    }
  };

  const validateLicense = async (pass) => {
    try {
      if (pass.startsWith("TRIAL_MODE_")) {
        const parts = pass.split("_");
        if (parts.length === 4) {
          const creationTimestamp = parseInt(parts[2], 10);
          const allowedDays = parseInt(parts[3], 10);
          const currentTimestamp = Date.now();
          const msPassed = currentTimestamp - creationTimestamp;
          const daysPassed = msPassed / (1000 * 60 * 60 * 24);
          const remaining = Math.max(0, Math.ceil(allowedDays - daysPassed));
          
          setDaysLeft(remaining);

          if (daysPassed >= allowedDays) {
            setIsTrialExpired(true);
            setTrialNotice(false);
          } else {
            setIsTrialExpired(false);
            setTrialNotice(true);
            setTimeout(() => setTrialNotice(false), 7000);
          }
        } else {
          setIsTrialExpired(true);
        }
      } else {
        setIsTrialExpired(false);
        setTrialNotice(false);
      }
      fetchWorkData(pass);
      fetchArchiveData(pass);
    } catch (err) {
      // Игнорируем ошибки проверки лицензии
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleSelectLanguage = async (selectedLang) => {
    setLang(selectedLang);
    try {
      await fetch(`${FIREBASE_REST_URL}/tabulka_config/activeLanguage.json`, {
        method: 'PUT',
        body: JSON.stringify(selectedLang)
      });
    } catch (e) {}
  };

  const handleLogin = async () => {
    if (!inputPassword.trim()) return;
    const trimmedPass = inputPassword.trim().toUpperCase();
    setIsAuthChecking(true);
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_users/${trimmedPass}.json`);
      const userData = await response.json();
      if (userData && userData.active === true) {
        setPassword(trimmedPass);
        await fetch(`${FIREBASE_REST_URL}/tabulka_config/activePassword.json`, {
          method: 'PUT',
          body: JSON.stringify(trimmedPass)
        });
        setInputPassword('');
        await validateLicense(trimmedPass);
      } else if (trimmedPass.startsWith("TRIAL_MODE_")) {
        setPassword(trimmedPass);
        await fetch(`${FIREBASE_REST_URL}/tabulka_config/activePassword.json`, {
          method: 'PUT',
          body: JSON.stringify(trimmedPass)
        });
        setInputPassword('');
        await validateLicense(trimmedPass);
      } else {
        Alert.alert(t.errorTitle, lang === 'ru' ? 'Неверный ключ активации' : 'Невірний ключ активації');
        setIsAuthChecking(false);
      }
    } catch (e) {
      Alert.alert(t.errorTitle, t.networkSendError);
      setIsAuthChecking(false);
    }
  };

  const handleLogout = async () => {
    setPassword(null);
    setIsTrialExpired(false);
    setTrialNotice(false);
    try {
      await fetch(`${FIREBASE_REST_URL}/tabulka_config/activePassword.json`, { method: 'DELETE' });
    } catch (e) {}
  };

  const fetchWorkData = async (currentPass) => {
    if (!currentPass) return;
    setIsLoadingData(true);
    const viewYear = currentMonth.getFullYear();
    const viewMonth = currentMonth.getMonth();
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPass}/${viewYear}_${viewMonth}.json`);
      const data = await response.json();
      setWorkData(data || {});
    } catch (e) {
      setWorkData({});
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchArchiveData = async (currentPass) => {
    if (!currentPass) return;
    try {
      const response = await fetch(`${FIREBASE_REST_URL}/tabulka_lists/${currentPass}.json`);
      const allMonthsData = await response.json();
      if (allMonthsData) {
        const processedArchive = {};
        Object.keys(allMonthsData).forEach((monthKey) => {
          let monthTotalSum = 0;
          const daysData = allMonthsData[monthKey];
          Object.keys(daysData).forEach((dayKey) => {
            monthTotalSum += getDayTotal(daysData[dayKey]);
          });
          processedArchive[monthKey] = monthTotalSum;
        });
        setArchiveData(processedArchive);
      } else {
        setArchiveData({});
      }
    } catch (e) {
      setArchiveData({});
    }
  };

  useEffect(() => {
    if (password && !isTrialExpired) {
      fetchWorkData(password);
    }
  }, [currentMonth, password, isTrialExpired]);

  const getDayTotal = (dayData) => {
    if (!dayData || !dayData.records || !Array.isArray(dayData.records)) return 0;
    return dayData.records.reduce((sum, rec) => sum + (rec.rate * rec.hours), 0);
  };

  const getDayHours = (dayData) => {
    if (!dayData || !dayData.records || !Array.isArray(dayData.records)) return 0;
    return dayData.records.reduce((sum, rec) => sum + rec.hours, 0);
  };

  const handleDayPress = (dateStr) => {
    setSelectedDate(dateStr);
    setRate('');
    setHours('');
    setModalVisible(true);
  };

  const handleAddRecord = () => {
    const numRate = parseFloat(rate);
    const numHours = parseFloat(hours);
    if (isNaN(numRate) || isNaN(numHours) || numRate <= 0 || numHours <= 0) return;

    const currentDayData = workData[selectedDate] || { records: [] };
    const newRecord = {
      id: Date.now().toString(),
      rate: numRate,
      hours: numHours
    };

    const updatedRecords = [...(currentDayData.records || []), newRecord];
    const updatedWorkData = {
      ...workData,
      [selectedDate]: { ...currentDayData, records: updatedRecords }
    };

    setWorkData(updatedWorkData);
    setRate('');
    setHours('');
  };

  const handleDeleteRecord = (recordId) => {
    if (!selectedDate || !workData[selectedDate]) return;
    const currentDayData = workData[selectedDate];
    const updatedRecords = (currentDayData.records || []).filter(r => r.id !== recordId);
    
    const updatedWorkData = {
      ...workData,
      [selectedDate]: { ...currentDayData, records: updatedRecords }
    };
    setWorkData(updatedWorkData);
  };

  const handleSendSupportRequest = async () => {
    if (!clientName.trim() || !clientPhone.trim()) return;
    try {
      const requestPayload = {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        timestamp: Date.now(),
        lang: lang || 'ru',
        currentPassword: password || 'NONE'
      };
      await fetch(`${FIREBASE_REST_URL}/tabulka_requests.json`, {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      });
      Alert.alert("", t.noticeText);
      setClientName('');
      setClientPhone('');
      setRequestModalVisible(false);
    } catch (e) {
      Alert.alert(t.errorTitle, t.networkSendError);
    }
  };

  const monthSelectorRow = { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
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
      gridCells.push(
        <TouchableOpacity key={dateStr} style={isWorkDay ? styles.workDayCell : styles.weekendCell} onPress={() => handleDayPress(dateStr)}>
          <Text style={isWorkDay ? styles.workDayText : styles.dayText}>{parseInt(dayNum, 10)}</Text>
          {isWorkDay && (<Text style={styles.cellSumSubtext}>{dayTotal}</Text>)}
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

  if (!lang) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.langStartCard}>
          <Text style={styles.langStartTitle}>Выберите язык / Оберіть мову</Text>
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}><Text style={styles.logoutText}>{t.btnExit}</Text></TouchableOpacity>
        </View>

        {isCurrentModeTrial && (
          <TouchableOpacity style={styles.trialTopRequestBtn} onPress={() => setRequestModalVisible(true)}>
            <Text style={styles.trialTopRequestBtnText}>{t.requestFullVersionHeader.toUpperCase()}</Text>
          </TouchableOpacity>
        )}

        <View style={monthSelectorRow}>
          <TouchableOpacity style={lang === 'ru' ? styles.langCircleRu : styles.langCircleRuDimmed} onPress={() => handleSelectLanguage('ru')}><Text style={styles.langCircleText}>Р</Text></TouchableOpacity>
          <View style={styles.monthTitleWrapper}>
            <Text style={styles.monthTitle}>{currentMonth.toLocaleString(t.locale, { month: 'long', year: 'numeric' }).toUpperCase()}</Text>
            <TouchableOpacity style={styles.todayButton} onPress={() => setCurrentMonth(new Date())}><Text style={styles.todayButtonText}>{t.btnToday.toUpperCase()}</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={lang === 'uk' ? styles.langCircleUk : styles.langCircleUkDimmed} onPress={() => handleSelectLanguage('uk')}><Text style={styles.langCircleText}>У</Text></TouchableOpacity>
        </View>
        
        <View style={styles.weekDaysRow}>{t.weekDays.map((day, index) => (<Text key={index} style={(day === 'Сб' || day === 'Вс' || day === 'Нд') ? styles.weekDayTextWeekend : styles.weekDayTextNormal}>{day}</Text>))}</View>
        
        {isLoadingData ? (
          <View style={styles.centerLoading}><ActivityIndicator size="large" color="#0052CC" /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.calendarGrid}>{renderCalendarGrid()}</ScrollView>
        )}

        {isCurrentModeTrial && (
          <View style={styles.inlineActivationBlock}>
            <TextInput 
              placeholder={t.placeholderKey} 
              autoCapitalize="characters" 
              style={styles.inlineActivationInput} 
              value={inputPassword} 
              onChangeText={setInputPassword} 
            />
            <TouchableOpacity style={styles.inlineActivationBtn} onPress={handleLogin}>
              <Text style={styles.inlineActivationBtnText}>{t.btnActivate.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{t.statsWorkDays}: {stats.workDays}</Text>
          <Text style={styles.statsText}>{t.statsWeekendDays}: {stats.weekendDays}</Text>
          <Text style={styles.totalText}>{t.statsTotalSum}: {stats.totalSum}</Text>
        </View>
        
        <TouchableOpacity style={styles.archiveButton} onPress={() => setArchiveModalVisible(true)}><Text style={styles.archiveButtonText}>{t.btnArchive}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.pdfButton} onPress={exportToPDF}><Text style={styles.pdfButtonText}>{t.btnSavePdf}</Text></TouchableOpacity>

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
                <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalVisible(false); setSelectedDate(null); fetchWorkData(password); }}><Text style={styles.btnText}>{t.btnCancel}</Text></TouchableOpacity>
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
              <TouchableOpacity style={[styles.btnCancel, { width: '100%', marginTop: 10 }]} onPress={() => setArchiveModalVisible(false)}>
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
  dateText: { fontSize: 14, color: '#6B7280', fontWeight: 'bold' },
  timeText: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  logoutButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#EF4444', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  trialTopRequestBtn: { backgroundColor: '#10B981', padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  trialTopRequestBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  monthSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthTitleWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', textAlign: 'center', marginRight: 8 },
  todayButton: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#0052CC', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  todayButtonText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  langCircleText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  langCircleRu: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0052CC' },
  langCircleRuDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0052CC', opacity: 0.35 },
  langCircleUk: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10B981' },
  langCircleUkDimmed: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10B981', opacity: 0.35 },
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
  
  inlineActivationBlock: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 10, 
    borderRadius: 12, 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  inlineActivationInput: { 
    flex: 1, 
    borderBottomWidth: 1, 
    borderColor: '#D1D5DB', 
    paddingVertical: 6, 
    paddingHorizontal: 8,
    fontSize: 14, 
    marginRight: 10,
    textAlign: 'center'
  },
  inlineActivationBtn: { 
    backgroundColor: '#0052CC', 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inlineActivationBtnText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },

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
  }
});
